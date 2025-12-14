# Phonics Adventure – Current Roadmap

_Last updated: December 2025_

This roadmap reflects the **actual implementation in the repo** (React + Web Audio) and replaces older “Phase A–E” and mini‑phase planning docs.

For full design detail, see:
- `phonics-adventure-mvp-spec.md` – game + interaction design
- `phonics-adventure-implementation-handoff.md` – architecture + assets
- `sound-engine-strategy.md` – audio/phoneme details
- `enhanced-phonics-syllabus.md` – curriculum

---

## 1. Current State (Implemented)

- **Content**
  - 2 habitats: Farm (`farm`), Pond (`pond`)
  - 8 animals: Pig, Cow, Cat, Hen, Frog, Duck, Fish, Turtle (`src/data/animals.ts`)
  - 50 CVC words across phases 1–2 (`src/data/words.ts`)
- **Core loop**
  - Lesson flow per animal: scrub word → full‑word playback → comprehension check → celebration (`LessonScreen`, `ComprehensionCheckScreen`, `CelebrationScreen`)
  - Progress: localStorage set of completed word IDs (`lib/progressStorage.ts`, `useGameStore` in `src/stores/gameStore.ts`)
- **Scrubbing model**
  - `ScrubTrack` (`src/components/ScrubTrack.tsx`) renders a single scrub timeline with a handle and letter anchors.
  - `useWordScrubber` (`src/hooks/useWordScrubber.ts`) maps handle position to **phoneme zones** (continuous vs stop consonant handling) and plays phoneme audio with crossfades.
  - `useWordBlendAudio` (`src/hooks/useWordBlendAudio.ts`) builds whole‑word playback, preferring prerecorded `/audio/words/{wordId}.mp3` and falling back to blended phonemes. Used on scrub completion and in comprehension checks.
  - This phoneme‑zone model is the current canonical implementation. The “continuous single‑buffer scrub” documents are treated as future experiments.
- **Audio**
  - Web Audio–based engine (`src/hooks/useAudioEngine.ts`) with phoneme library mapped in `src/data/phonemeMap.ts`.
  - Word‑level audio supported when available; otherwise blended phoneme output.
- **Comprehension check**
  - Per‑word distractors defined in `src/data/comprehensionChecks.ts` (phonetically similar).
  - UI: text‑based options with visual feedback; word audio via `useWordAudio`.
- **UX + scaffolding**
  - Animal avatar that reacts to scrub progress (`AnimalAvatar`, `useAnimalState`).
  - Simple first‑run tutorial overlay for scrubbing (`TutorialOverlay`, `useTutorialState`).

---

## 2. Phase 1 – Lock the 2‑Habitat Loop

Goal: Treat Farm + Pond with all 8 animals and 50 words as a **solid, shippable learning loop** with no obvious rough edges.

- Verify for every word:
  - Phoneme parsing and audio coverage are correct (`parseWordToPhonemes`).
  - Scrubbing feels natural, with correct stop/continuous behavior.
  - Comprehension check is defined with sensible distractors.
  - Full‑word playback works (prerecorded or blended) in both the lesson and check.
- Tighten error handling:
  - Friendly UI when audio is missing or fails to load.
  - No crashes if a word/check entry is missing.
- Small UX paper cuts:
  - Progress indicators and navigation feel consistent between Home, Habitat, Animal, Lesson, and Celebration screens.
  - Tutorial overlay timing/dismissal feels good on device.

_Status: In progress – core behaviors largely implemented; ongoing tuning and QA._

---

## 3. Phase 2 – Mastery & Gating (Lightweight)

Goal: Move from “did this word once” to a **minimal mastery model** and use it to control what unlocks next.

- Extend progress model:
  - Per‑word stats: times presented, times correct in comprehension, simple streak counter.
  - Aggregate counts per animal/habitat for display.
- Mastery rules (simplified from `phonics-adventure-mvp-spec.md`):
  - Track `status: 'new' | 'learning' | 'mastered'` per word.
  - Use a small streak + “seen across sessions” heuristic; avoid heavy SRS.
- Gating:
  - Lock Pond until a configurable amount of Farm progress (e.g., N mastered or completed words) is reached.
  - Optionally gate animals within a habitat based on prior animals’ completion.
- UX:
  - Use subtle lock states on Habitat/Animal cards.
  - Show high‑level “words mastered / total” on Home and selection screens.

_Status: Not started – design spec exists; requires data schema + UI work._

---

## 4. Phase 3 – Visual & Audio Richness

Goal: Replace placeholder visuals/audio with the **phonics adventure fantasy**: pictures, animals, and delightful feedback.

- Word images for comprehension:
  - Generate or source 50 word images and store them as `images/words/{wordId}.png` (or similar).
  - Extend `ComprehensionCheckScreen` to show image + word label in each option card.
  - Maintain the existing distractor logic; only the visuals change.
- Animal & celebration polish:
  - Refine AnimalAvatar states and animations to better match the wake‑up / celebration beats from the spec.
  - Increase juice on the Celebration screen (stars, confetti, “Play again” affordance).
- Voice‑over:
  - Define a minimal VO set (intros, “Which one is…?”, correct/incorrect feedback, session start/end).
  - Wire VO playback around key events (enter lesson, enter check, correct/incorrect choice).

_Status: Not started – blocked mainly on asset decisions/creation._

---

## 5. Phase 4 – Parent View, Settings, Analytics

Goal: Support parents and iteration with **basic insight and controls**.

- Parent dashboard:
  - Simple summary: sessions count, time played, words practiced/mastered, current phase.
  - Optional breakdown by vowel/phoneme category as per spec (short vowels vs consonants).
- Settings:
  - Daily time limits and break prompts.
  - Sound effects / VO toggles.
  - Difficulty tweaks (e.g., 2 vs 3 options in comprehension).
- Analytics (local and/or remote):
  - Instrument the core events from the MVP spec (scrub start/completion, comprehension correct/incorrect, phase unlocks).
  - Ensure analytics code respects offline‑first design and can be disabled for local dev.

_Status: Not started – dependent on Phase 2 data structures._

---

## 6. “Future Experiments” (Out of Current Scope)

These are explicitly **not** on the current roadmap but are documented for later exploration:

- **Continuous single‑buffer scrubbing** using whole‑word audio and timestamp anchors (see `scrub-engine-phase1.md`, `scrub-engine-phase2-plan.md`).
- Additional habitats beyond Farm + Pond and more advanced phonics patterns (digraphs, welded sounds beyond the MVP set).
- Multi‑child profiles, cloud sync, and richer achievements/badges.

