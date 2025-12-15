# Speech recognizer feature (SlideSounds)

## Overview

This document captures the design and known limitations of the speech‑recognizer feature added in the current branch, including the iOS‑specific work and provisioning issues encountered while testing.

- Goal: let learners tap a mic, say the current word, and unlock the scrub slider once they pronounce it correctly.
- Platforms:
  - **Browser / desktop:** use the Web Speech API when available.
  - **iOS (Tauri mobile):** use native `SFSpeechRecognizer` via a small Swift + Rust bridge.

---

## Frontend architecture

### `useSpeechRecognizer` hook (`src/hooks/useSpeechRecognizer.ts`)

- Exposes a unified API:
  - `supportsSpeech`, `status` (`idle | starting | listening | processing | error | unavailable`)
  - `partialTranscript`, `finalTranscript`
  - `matchStatus` (`none | close | match`) via `evaluatePhonicsMatch`
  - `errorMessage`
  - `startListening`, `stopListening`, `reset`
- Runtime selection:
  - Detects Tauri at runtime (`useIsTauriRuntime` checks `window.__TAURI_IPC__` / `__TAURI_INTERNALS__`).
  - If Tauri is available, prefers the **native** recognizer; otherwise falls back to the **browser** recognizer.

#### Browser path

- Uses `window.SpeechRecognition` / `window.webkitSpeechRecognition` (types in `src/types/speech.d.ts`).
- Handles:
  - Immediate state transitions (`starting → listening → processing → idle/error`).
  - Partial / final transcripts.
  - Basic error handling when the API is unavailable or fails.

#### Native Tauri path

- Uses `@tauri-apps/api/event` to communicate with the Rust backend:
  - Emission:
    - `emit('phonics://speech:start', { expectedUtterances })`
    - `emit('phonics://speech:stop')`
  - Listening:
    - `listen('phonics://speech', handler)` for native events.
- Interprets native events:
  - `type: "status"` with `status: "starting" | "listening" | "processing" | "unavailable" | "permission_denied" | "error" | "idle"`.
  - `type: "partial"` / `"final"` with a transcription string.
  - `type: "error"` with an error message.
- Maps `permission_denied` to `status = 'error'` and a user‑facing message about microphone / speech permissions.
- Still uses `evaluatePhonicsMatch` on the combined transcript to decide when the word is a match.

### UI integration

#### `SpeakPromptCard` (`src/components/SpeakPromptCard.tsx`)

- New mic‑centric card that:
  - Displays the current word and its recognition status.
  - Shows status copy derived from the hook:
    - `"Tap the mic and say it out loud."`
    - `"Hold on..."` while status is `starting` / `processing`.
    - `"Listening..."` while actively capturing audio.
    - `"You said it!"` / `"So close—try one more time."` based on `matchStatus`.
    - Error messages from the recognizer.
  - Emits callbacks:
    - `onStartListening`, `onStopListening`, `onSkip`.
  - Visual states:
    - Base, **listening**, **almost**, and **success** styles (see `global.css` `.speak-card*` rules).
- Skip button:
  - Shown when speech is unsupported, in an error state, or the word is still locked and has not matched yet.

#### `ScrubWord` (`src/components/ScrubWord.tsx`) and scrub locking

- `ScrubWord` now supports:
  - `isLocked?: boolean`
  - `lockMessage?: string`
- When locked:
  - Ignores scrub start / move / end callbacks.
  - Applies `scrub-word--locked` class:
    - Dimmed, non‑interactive track.
    - Optional lock banner (`scrub-word__lock-banner`) with a message such as “Say the word to unlock the slider”.
- The lock is controlled by `LessonScreen` via a `lessonPhase` state.

#### `LessonScreen` (`src/screens/LessonScreen.tsx`)

- New state machine for the lesson:
  - `lessonPhase: 'listen' | 'scrub'`.
  - Initial phase:
    - `'listen'` when `supportsSpeech` is true.
    - `'scrub'` otherwise (no speech available).
- Behavior:
  - While in `'listen'`, the scrub slider is locked (`isScrubLocked = true`).
  - When `matchStatus` reaches `'match'`, the screen automatically:
    - Switches to `'scrub'`.
    - Stops the speech recognizer.
  - A “Skip for now” action can also transition directly to `'scrub'`.
- `SpeakPromptCard` is rendered above the scrub component and wired into `useSpeechRecognizer`.

### Styling

- `src/styles/global.css`:
  - Adds `.lesson-screen__listen-section` to position the speak card.
  - Adds the full `.speak-card*` visual system.
  - Adds `.scrub-word--locked` and the lock banner styles.
  - Adjusts `.scrub-word` container to support the overlayed lock UI (`position: relative; overflow: hidden`).

---

## Backend architecture (Tauri + iOS)

### Rust side (`src-tauri/src/lib.rs` and `src-tauri/src/ios.rs`)

- Dependencies:
  - Added `once_cell` to `Cargo.toml` to manage a global `AppHandle`.
  - Frontend dependency `@tauri-apps/api` added to `package.json` to use the event API.

#### Event wiring (`src-tauri/src/lib.rs`)

- On iOS builds (`#[cfg(target_os = "ios")]`):
  - Calls `ios::initialize(&app.handle())` to register the callback into the Swift recognizer.
  - Registers global listeners:
    - `"phonics://speech:start"`:
      - Expects JSON payload `{ "expectedUtterances": string[] }`.
      - Parses into `SpeechStartPayload`.
      - Invokes `ios::start(expected_utterances)`.
      - If an error occurs (e.g., no utterances), emits `"phonics://speech"` with `{ type: "error", message }`.
    - `"phonics://speech:stop"`:
      - Calls `ios::stop()` to tear down the session.
  - Stores the event handler guards in `SpeechEventGuards` so they stay alive for the life of the app.

#### iOS bridge (`src-tauri/src/ios.rs`)

- FFI to Swift:
  - `phonics_set_callback(handler: extern "C" fn(*const c_char))`
  - `phonics_start_listening(expected_json: *const c_char)`
  - `phonics_stop_listening()`
- Global handle:
  - `APP_HANDLE: OnceCell<Mutex<Option<AppHandle>>>` caches the app handle so events can be emitted from the C callback.
- Callback flow:
  - `initialize`:
    - Stores the `AppHandle`.
    - Registers `handle_native_event` as the C callback (`phonics_set_callback`), once.
  - `handle_native_event`:
    - Receives UTF‑8 JSON from Swift.
    - Parses into `serde_json::Value`.
    - Emits `"phonics://speech"` with the raw JSON payload back to the frontend.
  - `start`:
    - Validates non‑empty utterances.
    - Serializes the utterance list to JSON and passes it down to Swift via `phonics_start_listening`.
  - `stop`:
    - Calls `phonics_stop_listening` to tear down audio / recognition.

### Swift side (`src-tauri/gen/apple/Sources/app/PhonicsSpeechRecognizer.swift`)

- `PhonicsSpeechRecognizer` is a singleton wrapping:
  - `AVAudioEngine` for live audio capture.
  - `SFSpeechRecognizer` for on‑device recognition.
  - A C callback (`SpeechEventCallback`) to report events to Rust.
- Key behavior:
  - `startListening(expectedUtterances:)`:
    - Validates input and recognizer availability.
    - Emits `"status": "starting"`.
    - Calls `requestPermissions`, which in turn:
      - Requests **Speech Recognition** authorization (`SFSpeechRecognizer.requestAuthorization`).
      - Requests **Microphone** access (`AVAudioSession.requestRecordPermission`).
      - Only proceeds if both are granted.
    - On grant, configures the `AVAudioSession`, sets up the audio engine, and starts an `SFSpeechAudioBufferRecognitionRequest`.
    - Emits:
      - Partial transcripts (`{ type: "partial", transcript }`).
      - Final transcripts (`{ type: "final", transcript }`) and stops listening.
  - `stopListening`:
    - Tears down the audio engine, recognition task, and audio session, optionally emitting `"status": "idle"`.
  - Emits errors with `{ type: "error", message }` for configuration or runtime failures.
  - Also reacts to `speechRecognizer(_:availabilityDidChange:)` to emit `"status": "idle"` / `"unavailable"`.
- C entry points:
  - `phonics_set_callback` → wires the callback into the singleton.
  - `phonics_start_listening` → decodes JSON utterances and calls `startListening`.
  - `phonics_stop_listening` → calls `stopListening`.

### iOS Info.plist and entitlements

- `src-tauri/gen/apple/app_iOS/Info.plist`:
  - Declares usage strings:
    - `NSMicrophoneUsageDescription` — “SlideSounds needs the microphone to listen to your sounds.”
    - `NSSpeechRecognitionUsageDescription` — “SlideSounds runs on-device speech recognition to understand your words.”
- `src-tauri/gen/apple/app_iOS/app_iOS.entitlements`:
  - Declares the Speech Recognition entitlement:
    - `com.apple.developer.speech-recognition = true`.

---

## iOS provisioning & entitlement issues

### Symptom in Xcode

When building the iOS target in Xcode with a **Personal Team** (no paid Apple Developer Program enrollment), signing fails with:

- `Automatic signing failed`
- `Provisioning profile "iOS Team Provisioning Profile: com.phonicsreader.app" doesn't include the com.apple.developer.speech-recognition entitlement.`

This happens even though:

- The Xcode target has the **Speech Recognition** capability enabled.
- The entitlement file (`app_iOS.entitlements`) includes `com.apple.developer.speech-recognition`.
- `Info.plist` includes the appropriate usage descriptions for microphone and speech recognition.

### Root cause

- Apple’s **Speech framework** (`SFSpeechRecognizer`) requires the entitlement `com.apple.developer.speech-recognition`.
- That entitlement must be present on the **App ID** and on the **provisioning profile** used to sign the build.
- For free accounts (Personal Team), Xcode’s automatically managed profiles for an app like `com.phonicsreader.app` do **not** include this entitlement and cannot be upgraded automatically without an App ID that has the capability enabled in the Apple Developer portal.
- Without a profile that includes the entitlement, Xcode refuses to sign the app, even though the code itself is correct.

### Practical implications

- **Microphone access alone** (via `AVAudioSession` and `NSMicrophoneUsageDescription`) does **not** require this entitlement or a paid Developer account; it is allowed with a Personal Team.
- **Speech recognition** using `SFSpeechRecognizer` **does require** the entitlement and thus a properly configured App ID and provisioning profile, which in practice means enrolling in the **Apple Developer Program**.
- As long as the Swift bridge uses `SFSpeechRecognizer` and the entitlements file requests `com.apple.developer.speech-recognition`, the app cannot be signed with a profile that does not contain that entitlement.

### Current status / trade‑offs

- The codebase is wired end‑to‑end for **on‑device speech recognition on iOS** via Tauri:
  - TS → Tauri Events → Rust → Swift Speech → Rust → TS.
- On development machines using a **free Apple account (Personal Team)**:
  - iOS builds fail at the signing step due to the missing speech entitlement in the provisioning profile.
- To build and run this exact design on physical devices:
  - The app owner must:
    - Enroll in the **Apple Developer Program**.
    - Enable **Speech Recognition** on the App ID `com.phonicsreader.app` in the Apple Developer portal.
    - Regenerate a development provisioning profile for that App ID and use it in Xcode (or allow Xcode’s automatic signing to do so).

---

## Possible future work / mitigations

These are not implemented yet, but are worth considering:

- **Configurable feature flag for speech:**
  - Build‑time toggle to compile the Swift `PhonicsSpeechRecognizer` and Tauri bridge only when speech is enabled.
  - Allows Personal Team builds that:
    - Skip the speech phase entirely on iOS, or
    - Use a different, non‑entitlement‑gated recognizer (if one is adopted).
- **Runtime fallback on iOS:**
  - Detect signing / entitlement failures at startup and:
    - Mark `supportsSpeech = false` on iOS, forcing the lesson into a scrub‑only mode.
- **Developer documentation:**
  - A short “iOS speech setup” guide that explains:
    - You need a paid Developer account to use Speech Recognition.
    - Steps to enable the capability and regenerate provisioning profiles.

For now, the key takeaway is:

> The current implementation is functionally complete, but shipping or testing the speech recognizer on iOS requires a provisioning profile that includes `com.apple.developer.speech-recognition`, which in practice means using an Apple Developer Program account. Personal Team accounts can still build the app if the speech feature is removed or conditionally compiled out for iOS. 

