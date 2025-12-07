# PHONICS ADVENTURE: IMPLEMENTATION HANDOFF

## Wireframes, Asset Briefs, and AI Generation Prompts

**Tech Stack:** Tauri + React  
**Audio Generation:** TTS (ElevenLabs/Azure Neural/OpenAI)  
**Image Generation:** DALL-E 2/3  

---

# CRITICAL: READ THIS FIRST

## Related Documentation

This handoff document is part of a 4-document specification suite. **Before implementing any phase, review the relevant sections of these companion documents:**

| Document | Location | Contains |
|----------|----------|----------|
| **Enhanced Phonics Syllabus** | `enhanced-phonics-syllabus.md` | Curriculum phases, phoneme introduction order, mastery criteria, pedagogical rationale, articulation guides |
| **Sound Engine Strategy** | `sound-engine-strategy.md` | Complete audio asset list (95 files), word-to-phoneme parsing algorithm, lookup tables, crossfade specs, exception dictionaries |
| **MVP Game Design Spec** | `phonics-adventure-mvp-spec.md` | Core gameplay loop, session flow, progression system, touch mechanics, visual feedback system, comprehension check logic |

**How to use these documents:**
- This handoff doc provides **implementation structure** (wireframes, file organization, AI prompts)
- The syllabus provides **what to teach and in what order**
- The sound engine doc provides **how audio parsing and blending works**
- The game design doc provides **interaction details and game logic**

When implementing a specific feature, cross-reference the relevant companion doc for detailed specifications.

---

## ⚠️ IMPORTANT: Code Examples Are Pseudocode

**All Python code in this document and the companion documents (especially `sound-engine-strategy.md`) should be treated as PSEUDOCODE and LOGIC INSPIRATION only.**

These code examples:
- ✅ Illustrate the **algorithm and logic flow**
- ✅ Show **data structures and their relationships**
- ✅ Demonstrate **the intended behavior**
- ❌ Are NOT meant to be copied verbatim
- ❌ Are NOT production Python code to integrate
- ❌ Should NOT be translated line-by-line to TypeScript/Rust

**Your task:** Understand the **intent** behind each code example, then implement equivalent logic in TypeScript (React frontend) or Rust (Tauri backend) using idiomatic patterns for those languages.

For example, when you see:
```python
def parse_word_to_phonemes(word):
    # ... algorithm details
```

You should implement this as a TypeScript function:
```typescript
function parseWordToPhonemes(word: string): PhonemeUnit[] {
    // Implement the same LOGIC, not the same code
}
```

The lookup tables (like `SHORT_VOWELS`, `DIGRAPHS`, `WELDED_SOUNDS`) should be converted to TypeScript objects or JSON data files, following the structure shown but adapted for your actual implementation.

---

## Implementation Phases

This document is organized for **phase-by-phase implementation**. Work through these sections in order:

| Phase | Section | Deliverable |
|-------|---------|-------------|
| **A: Foundation** | Section 1 (Architecture) | Project setup, audio engine, touch handling |
| **B: Core Loop** | Section 2 (Wireframes: Lesson Screen) | Scrub interaction working for one word |
| **C: Game Layer** | Section 2 (All Wireframes) | Full UI flow with animals and habitats |
| **D: Content** | Section 3-4 (TTS/DALL-E) | Generate all audio and image assets |
| **E: Polish** | Section 5-6 (Manifest/Checklist) | Complete asset integration, testing |

Start with Phase A. Do not proceed to the next phase until the current phase is working.

---

# SECTION 1: TECHNICAL ARCHITECTURE

## 1.1 Tauri + React Considerations

### Why This Stack Works

| Concern | Tauri Advantage |
|---------|-----------------|
| Audio latency | Rust backend can handle audio buffering with <50ms latency |
| Offline storage | Built-in SQLite via `tauri-plugin-sql` |
| File system | Direct access to bundled assets |
| Touch handling | Web standards work well; React handles gesture state |
| App size | Much smaller than Electron (~10MB vs ~150MB) |

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TAURI SHELL                          │
├─────────────────────────────────────────────────────────────┤
│  RUST BACKEND                                               │
│  ├── audio_engine.rs    ← Phoneme loading, buffer building  │
│  ├── word_parser.rs     ← Grapheme-to-phoneme mapping       │
│  ├── progress_store.rs  ← SQLite read/write                 │
│  └── commands.rs        ← IPC bridge to frontend            │
├─────────────────────────────────────────────────────────────┤
│  REACT FRONTEND                                             │
│  ├── /components                                            │
│  │   ├── ScrubWord.tsx       ← Core scrubbing interaction   │
│  │   ├── LetterZone.tsx      ← Individual letter/unit       │
│  │   ├── AnimalCharacter.tsx ← Animated animal              │
│  │   ├── ComprehensionCheck.tsx                             │
│  │   └── HabitatMap.tsx                                     │
│  ├── /screens                                               │
│  │   ├── HomeScreen.tsx                                     │
│  │   ├── HabitatScreen.tsx                                  │
│  │   ├── LessonScreen.tsx                                   │
│  │   ├── CelebrationScreen.tsx                              │
│  │   └── ParentDashboard.tsx                                │
│  ├── /hooks                                                 │
│  │   ├── useScrubGesture.ts  ← Touch tracking               │
│  │   ├── useAudioEngine.ts   ← Tauri audio commands         │
│  │   └── useProgress.ts      ← Progress state               │
│  └── /stores                                                │
│      └── gameStore.ts        ← Zustand for UI state         │
└─────────────────────────────────────────────────────────────┘
```

### Critical Path: Audio Latency

The scrub-to-sound latency is make-or-break. Two approaches:

> **Note:** The code examples below illustrate the approach conceptually. Implement using idiomatic TypeScript/Rust patterns.

**Option A: Web Audio API (Simpler)**
```typescript
// Preload all phonemes into Web Audio buffers
const audioContext = new AudioContext();
const buffers: Map<string, AudioBuffer> = new Map();

// On lesson start, preload
async function preloadLesson(words: string[]) {
  const phonemes = getUniquePhonemes(words);
  await Promise.all(phonemes.map(async (p) => {
    const response = await fetch(`/assets/audio/${p}.wav`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    buffers.set(p, audioBuffer);
  }));
}
```

**Option B: Rust Audio Backend (Lower Latency)**
```rust
// In Rust, use rodio or cpal for audio playback
// This is ILLUSTRATIVE — adapt to your actual Tauri setup
use rodio::{Decoder, OutputStream, Sink};

#[tauri::command]
fn play_phoneme(phoneme: String) -> Result<(), String> {
    // Pre-loaded in memory, plays immediately
    let source = AUDIO_CACHE.get(&phoneme)?;
    sink.append(source.clone());
    Ok(())
}
```

**Recommendation:** Start with Web Audio API. Only move to Rust if latency >80ms.

### File Structure

```
/src-tauri
  /src
    main.rs
    audio_engine.rs
    word_parser.rs
    progress_store.rs
  /assets              ← Bundled with app
    /audio
      /phonemes        ← 95 .wav files
      /sfx             ← Sound effects
      /vo              ← Voice-over lines
    /images
      /animals         ← 8 character sets
      /words           ← 50 word images
      /ui              ← Buttons, backgrounds
      /habitats        ← Background scenes

/src
  /components
  /screens
  /hooks
  /stores
  /styles
  /data
    words.json         ← Word definitions + phoneme mappings
    progression.json   ← Phase unlock requirements
```

---

# SECTION 2: SCREEN WIREFRAMES

## 2.1 Screen Map

```
                         ┌──────────────┐
                         │    SPLASH    │
                         │    SCREEN    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │     HOME     │
                         │    SCREEN    │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  HABITAT   │   │  ANIMAL    │   │  PARENT    │
       │   SELECT   │   │ COLLECTION │   │ DASHBOARD  │
       └─────┬──────┘   └────────────┘   └────────────┘
             │
             ▼
       ┌────────────┐
       │   ANIMAL   │
       │   SELECT   │
       └─────┬──────┘
             │
             ▼
       ┌────────────┐
       │   LESSON   │◄────────────────┐
       │   SCREEN   │                 │
       └─────┬──────┘                 │
             │                        │
             ▼                        │
       ┌────────────┐                 │
       │   SCRUB    │                 │
       │   WORD     │─────► (next word)
       └─────┬──────┘                 │
             │                        │
             ▼                        │
       ┌────────────┐                 │
       │COMPREHENSION                 │
       │   CHECK    │─────────────────┘
       └─────┬──────┘
             │
             ▼ (lesson complete)
       ┌────────────┐
       │ CELEBRATION│
       │   SCREEN   │
       └────────────┘
```

---

## 2.2 Home Screen

```
┌─────────────────────────────────────────────────────────────────┐
│ [?]                    PHONICS ADVENTURE                   [⚙]  │
│ Help                                                    Settings│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     ┌─────────────────┐                         │
│                     │                 │                         │
│                     │   [CHILD'S      │                         │
│                     │    AVATAR]      │                         │
│                     │                 │                         │
│                     │    "Emma"       │                         │
│                     └─────────────────┘                         │
│                                                                 │
│         ┌─────────────────────────────────────────┐             │
│         │                                         │             │
│         │           ★ ★ ★ ★ ☆ ☆ ☆ ☆ ☆ ☆          │             │
│         │           12 animals collected          │             │
│         │                                         │             │
│         └─────────────────────────────────────────┘             │
│                                                                 │
│    ┌──────────────────┐          ┌──────────────────┐          │
│    │                  │          │                  │          │
│    │   🏠 PLAY! 🏠    │          │   🐷 MY ANIMALS  │          │
│    │                  │          │                  │          │
│    │  (large button)  │          │  (large button)  │          │
│    │                  │          │                  │          │
│    └──────────────────┘          └──────────────────┘          │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │  👨‍👩‍👧 PARENTS     │                         │
│                    │  (smaller text)  │                         │
│                    └──────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

COMPONENTS:
- Logo/Title: Static image or styled text
- Avatar: Circular image with name below
- Progress indicator: Star display or progress bar
- Primary CTA: "PLAY!" button (largest, most prominent)
- Secondary CTA: "My Animals" collection view
- Tertiary: "Parents" link (intentionally smaller)
- Corner buttons: Help (tutorial), Settings (gear icon)
```

### React Component Structure

```tsx
// HomeScreen.tsx
<HomeScreen>
  <Header>
    <HelpButton />
    <Logo />
    <SettingsButton />
  </Header>
  
  <AvatarSection>
    <Avatar src={child.avatar} />
    <ChildName>{child.name}</ChildName>
  </AvatarSection>
  
  <ProgressDisplay>
    <StarBar current={12} total={40} />
    <ProgressLabel>12 animals collected</ProgressLabel>
  </ProgressDisplay>
  
  <ButtonGroup>
    <PrimaryButton onClick={goToPlay}>
      🏠 PLAY! 🏠
    </PrimaryButton>
    <SecondaryButton onClick={goToCollection}>
      🐷 MY ANIMALS
    </SecondaryButton>
  </ButtonGroup>
  
  <ParentLink onClick={goToParentDashboard}>
    👨‍👩‍👧 PARENTS
  </ParentLink>
</HomeScreen>
```

---

## 2.3 Habitat Select Screen

```
┌─────────────────────────────────────────────────────────────────┐
│ [←]                  CHOOSE A PLACE                        [🏠] │
│ Back                                                       Home │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌─────────────────────────┐  ┌─────────────────────────┐    │
│    │                         │  │                         │    │
│    │      🌾 THE FARM 🌾     │  │      🌊 THE POND 🌊     │    │
│    │                         │  │                         │    │
│    │    [Barn illustration]  │  │   [Pond illustration]   │    │
│    │                         │  │                         │    │
│    │    ★★★★☆ 4/5 animals   │  │    ★★☆☆☆ 2/5 animals   │    │
│    │                         │  │                         │    │
│    │      [ ENTER ]          │  │      [ ENTER ]          │    │
│    └─────────────────────────┘  └─────────────────────────┘    │
│                                                                 │
│    ┌─────────────────────────┐  ┌─────────────────────────┐    │
│    │                         │  │                         │    │
│    │     🌲 THE FOREST 🌲    │  │     🌴 THE JUNGLE 🌴    │    │
│    │                         │  │                         │    │
│    │    [Forest - LOCKED]    │  │    [Jungle - LOCKED]    │    │
│    │         🔒              │  │         🔒              │    │
│    │                         │  │                         │    │
│    │   "Master 15 more       │  │   "Unlock the Forest    │    │
│    │    words to unlock!"    │  │    first!"              │    │
│    └─────────────────────────┘  └─────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STATES:
- Unlocked + Active: Full color, tap to enter
- Unlocked + Complete: Full color, checkmark badge
- Locked: Grayscale, lock icon, unlock hint
- Current: Subtle pulsing border or glow
```

---

## 2.4 Animal Select Screen

```
┌─────────────────────────────────────────────────────────────────┐
│ [←]                    THE FARM                            [🏠] │
│ Back                                                       Home │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│            "Who needs help today?"                              │
│                                                                 │
│    ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│    │           │ │           │ │           │ │           │     │
│    │    🐷     │ │    🐄     │ │    🐱     │ │    🐔     │     │
│    │   PIG     │ │   COW     │ │   CAT     │ │   HEN     │     │
│    │           │ │           │ │           │ │           │     │
│    │  ★★★★★   │ │  ★★★☆☆   │ │  ★☆☆☆☆   │ │  🔒 NEW   │     │
│    │ COMPLETE  │ │  3/5      │ │  1/5      │ │           │     │
│    │           │ │           │ │           │ │           │     │
│    │ [REVIEW]  │ │[CONTINUE] │ │ [START]   │ │ [LOCKED]  │     │
│    └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │                                                     │     │
│    │            [Background: Farm scene]                 │     │
│    │                                                     │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

ANIMAL CARD STATES:
- NEW: Grayed silhouette, "NEW" badge, unlocked after previous animal
- IN PROGRESS: Full color, progress stars, "CONTINUE" button
- COMPLETE: Full color, all stars filled, "REVIEW" button, checkmark
- LOCKED: Grayed, lock icon, shows unlock requirement

INTERACTION:
- Tap animal card → Go to lesson with that animal
- Animal has subtle idle animation (breathing, blinking)
```

---

## 2.5 Lesson Screen (Core Scrub Interaction)

```
┌─────────────────────────────────────────────────────────────────┐
│ [✕]                                              Word 2 of 5 ●●○○○│
│ Exit                                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │                     │                      │
│                    │     [SLEEPING       │                      │
│                    │       PIG]          │                      │
│                    │                     │                      │
│                    │     (gray, eyes     │                      │
│                    │      closed)        │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                     "Help Pig say..."                           │
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │                                                     │     │
│    │                                                     │     │
│    │         ┌─────┐   ┌─────┐   ┌─────┐               │     │
│    │         │     │   │     │   │     │               │     │
│    │         │  s  │   │  a  │   │  t  │               │     │
│    │         │     │   │     │   │     │               │     │
│    │         └─────┘   └─────┘   └─────┘               │     │
│    │                                                     │     │
│    │     ════════════════════════════════════           │     │
│    │     ▲                                               │     │
│    │     Slide zone indicator                            │     │
│    │                                                     │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
│              👆 "Slide your finger across!"                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DURING SCRUB (finger at "a"):
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │     [PIG STIRRING]  │                      │
│                    │     (some color,    │                      │
│                    │      eyes opening)  │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│         ┌─────┐   ┌─────┐   ┌─────┐                            │
│         │█████│   │▓▓▓▓▓│   │     │                            │
│         │  s  │   │  a  │   │  t  │                            │
│         │done │   │ACTIVE│   │     │                            │
│         └─────┘   └─────┘   └─────┘                            │
│                                                                 │
│         ════●═══════════════════════════                        │
│              ▲                                                  │
│         Finger position indicator                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

ZONE VISUAL STATES:
- Inactive:  Background: transparent, Text: gray (#9E9E9E)
- Active:    Background: yellow glow, Text: black, Scale: 105%
- Complete:  Background: light green, Text: dark green (#2D5A27)

DIGRAPH EXAMPLE ("ship"):
         ┌───────────┐   ┌─────┐   ┌─────┐
         │           │   │     │   │     │
         │    sh     │   │  i  │   │  p  │
         │           │   │     │   │     │
         └───────────┘   └─────┘   └─────┘
         ↑ Double-width zone, letters connected
```

### React Component: ScrubWord

```tsx
// ScrubWord.tsx
interface ScrubWordProps {
  word: string;
  phonemes: PhonemeUnit[];
  onComplete: () => void;
  onProgress: (percent: number) => void;
}

<ScrubWord word="sat" phonemes={phonemes} onComplete={handleComplete}>
  <LetterZoneContainer
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    {phonemes.map((phoneme, index) => (
      <LetterZone
        key={index}
        grapheme={phoneme.grapheme}
        state={zoneStates[index]}  // 'inactive' | 'active' | 'complete'
        isDigraph={phoneme.isUnit}
        width={phoneme.isUnit ? 'double' : 'single'}
      />
    ))}
  </LetterZoneContainer>
  
  <ProgressTrack>
    <ProgressIndicator position={scrubPercent} />
  </ProgressTrack>
  
  <Prompt>{getPromptText()}</Prompt>
</ScrubWord>
```

---

## 2.6 Comprehension Check Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                    Word 2 of 5 ●●○○○│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │     [PIG AWAKE!]    │                      │
│                    │     (full color,    │                      │
│                    │      happy face)    │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                                                                 │
│                     "Which one is 'sat'?"                       │
│                                                                 │
│                                                                 │
│       ┌───────────┐     ┌───────────┐     ┌───────────┐        │
│       │           │     │           │     │           │        │
│       │   [BOY    │     │  [HAT     │     │  [BASEBALL │       │
│       │  SITTING] │     │  IMAGE]   │     │    BAT]   │        │
│       │           │     │           │     │           │        │
│       │           │     │           │     │           │        │
│       └───────────┘     └───────────┘     └───────────┘        │
│           sat               hat               bat               │
│                                                                 │
│                                                                 │
│                        ┌─────────┐                              │
│                        │   🔊    │                              │
│                        │  Hear   │                              │
│                        │  Again  │                              │
│                        └─────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CORRECT ANSWER FEEDBACK:
┌───────────────────────────────────────────────────────────────┐
│       ┌───────────┐                                           │
│       │  ✓ ✓ ✓ ✓  │  ← Green border, checkmark overlay        │
│       │   [BOY    │                                           │
│       │  SITTING] │  ← Bounces, glows                         │
│       │           │                                           │
│       └───────────┘                                           │
│                                                                │
│                    "Yes! That's 'sat'!"                        │
│                    [Confetti particles]                        │
└───────────────────────────────────────────────────────────────┘

WRONG ANSWER FEEDBACK:
┌───────────────────────────────────────────────────────────────┐
│                         ┌───────────┐                          │
│                         │    ✗      │ ← Dims, subtle shake     │
│                         │  [HAT]    │                          │
│                         │  (dimmed) │                          │
│                         └───────────┘                          │
│                                                                │
│                    "Hmm, try another one!"                     │
│           (Wrong option stays visible but dimmed)              │
└───────────────────────────────────────────────────────────────┘
```

---

## 2.7 Celebration Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│               ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨                      │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │     [PIG JUMPING    │                      │
│                    │      HAPPILY]       │                      │
│                    │                     │                      │
│                    │     "OINK OINK!"    │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                                                                 │
│                   🎉  AMAZING JOB!  🎉                          │
│                                                                 │
│                  "Pig can talk now!"                            │
│                                                                 │
│                                                                 │
│               Words Learned: sat mat pat map tap                │
│                                                                 │
│                        ★ ★ ★ ★ ★                               │
│                                                                 │
│                                                                 │
│       ┌──────────────────┐      ┌──────────────────┐           │
│       │                  │      │                  │           │
│       │   KEEP PLAYING   │      │   GO TO BARN     │           │
│       │                  │      │                  │           │
│       └──────────────────┘      └──────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

ANIMATION SEQUENCE:
1. Screen fades in (300ms)
2. Confetti particles start falling
3. Animal bounces into frame (400ms spring animation)
4. Animal makes its sound
5. "AMAZING JOB!" text scales up with bounce
6. Stars animate in one by one (100ms each)
7. Buttons fade in (after 2s delay)
```

---

## 2.8 Parent Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ [←]                   PARENT DASHBOARD                          │
│ Back                                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  EMMA'S PROGRESS                              This Week  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Sessions:        ████████░░░░  5 sessions              │   │
│  │  Time:            ████████████░  42 minutes             │   │
│  │  Words Practiced: ████████░░░░  34 words                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SKILL BREAKDOWN                                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Short A:  ██████████  100%  ✓                         │   │
│  │  Short E:  ████████░░   80%                            │   │
│  │  Short I:  ██████░░░░   65%                            │   │
│  │  Short O:  ████░░░░░░   45%   ← Needs practice         │   │
│  │  Short U:  ██░░░░░░░░   20%   ← Just started           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │                      │  │                      │           │
│  │      SETTINGS        │  │    PRACTICE MODE     │           │
│  │                      │  │    (for parents)     │           │
│  │                      │  │                      │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# SECTION 3: TTS PHONEME GENERATION

## 3.1 The Challenge

Standard TTS is designed for fluent speech, not isolated phonemes. Common issues:
- Adds schwa to consonants ("puh" instead of /p/)
- Inconsistent durations
- Unnatural prosody on isolated sounds

## 3.2 Recommended Approach: SSML + Careful Prompting

### Option A: Azure Neural TTS with SSML

Azure's Neural TTS supports phoneme-level control:

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <phoneme alphabet="ipa" ph="s">s</phoneme>
  </voice>
</speak>
```

### Option B: ElevenLabs with Voice Design

ElevenLabs allows more natural speech. Use carrier words and trim:

```
Generate: "sssssss" (stretched consonant)
Then: Trim to isolate clean /s/
```

### Option C: OpenAI TTS with Prompting

OpenAI's TTS doesn't support SSML but can follow careful prompts:

---

## 3.3 TTS Generation Prompts

### Master Prompt for Voice Style

```
VOICE CHARACTERISTICS:
- Warm, nurturing female voice (like a kind kindergarten teacher)
- Clear articulation, slightly slower than conversational pace
- Gentle and encouraging, never condescending
- American English, General American accent
- Age impression: 30-40 years old
- Consistent energy level across all recordings
```

### Phoneme Recording Prompts

For each phoneme, use the following prompt structure:

---

#### SHORT VOWELS

```
=== v_short_a.wav ===
Say ONLY the vowel sound "ah" as in "cat" - NOT the letter name.
Hold the sound for about a quarter second.
Pure vowel, no consonants before or after.
Mouth open wide, tongue flat.
Like a doctor asking you to say "ahh" but shorter.
DO NOT say "ay" (letter name). Say "ahhh" (sound).

=== v_short_e.wav ===
Say ONLY the vowel sound "eh" as in "bed" - NOT the letter name.
Short, crisp sound.
Mouth slightly open, tongue mid-height.
Like the beginning of "elephant" without the "l".
DO NOT say "ee" (letter name). Say "ehh" (sound).

=== v_short_i.wav ===
Say ONLY the vowel sound "ih" as in "sit" - NOT the letter name.
Very short, quick sound.
Mouth barely open, tongue high.
Like the middle of "itch" without the "tch".
DO NOT say "eye" (letter name). Say "ih" (sound).

=== v_short_o.wav ===
Say ONLY the vowel sound "ah" as in "hot" - NOT the letter name.
Mouth open and round, tongue low and back.
Like saying "aw" in "awning" but shorter.
American pronunciation, not British "oh".
DO NOT say "oh" (letter name). Say "ahh" (sound).

=== v_short_u.wav ===
Say ONLY the vowel sound "uh" as in "cup" - NOT the letter name.
Short, neutral sound.
Mouth relaxed, tongue in middle.
Like the sound of hesitation "uh..." but cleaner.
DO NOT say "you" (letter name). Say "uh" (sound).
```

---

#### LONG VOWELS

```
=== v_long_a.wav ===
Say the long "a" sound as in "cake" - this IS the letter name "ay".
A diphthong: starts in the middle and glides up.
Hold for about 400 milliseconds.
Clear transition from "eh" to "ee".
Say: "aaaay" (like naming the letter A)

=== v_long_e.wav ===
Say the long "e" sound as in "see" - this IS the letter name "ee".
High front vowel, sustained.
Hold for about 350 milliseconds.
Say: "eeee" (like naming the letter E)

=== v_long_i.wav ===
Say the long "i" sound as in "bike" - this IS the letter name "eye".
A diphthong: starts low and glides up.
Hold for about 400 milliseconds.
Say: "iiiii" (like naming the letter I, or saying "eye")

=== v_long_o.wav ===
Say the long "o" sound as in "home" - this IS the letter name "oh".
A diphthong: starts mid-back and rounds further.
Hold for about 400 milliseconds.
Say: "ooooh" (like naming the letter O)

=== v_long_u.wav ===
Say the long "u" sound as in "blue" - a pure "oo" sound.
High back rounded vowel.
Hold for about 400 milliseconds.
Say: "oooo" (like "boo" without the b)
NOT "you" - just the "oo" part.
```

---

#### CONTINUOUS CONSONANTS

```
=== c_m.wav ===
Say ONLY the "mmm" sound - lips together, humming through nose.
CRITICAL: NO vowel after. NOT "muh". Just "mmmm" then stop.
Sustain for about 350 milliseconds.
Like humming with your mouth closed.
End by simply stopping the hum - no release sound.

=== c_n.wav ===
Say ONLY the "nnn" sound - tongue behind top teeth, humming through nose.
CRITICAL: NO vowel after. NOT "nuh". Just "nnnn" then stop.
Sustain for about 350 milliseconds.
Like humming but with your tongue touching the roof of your mouth.
End by simply stopping - no release sound.

=== c_s.wav ===
Say ONLY the "sss" sound - teeth together, air hissing through.
CRITICAL: NO vowel after. NOT "suh". Just pure hissing "sssss".
Sustain for about 400 milliseconds.
Like a snake hissing or a leaking tire.
End by simply stopping the airflow.

=== c_f.wav ===
Say ONLY the "fff" sound - top teeth on lower lip, air flowing.
CRITICAL: NO vowel after. NOT "fuh". Just pure "ffff" friction.
Sustain for about 350 milliseconds.
Like blowing out birthday candles very gently.
End by simply stopping the airflow.

=== c_v.wav ===
Say ONLY the "vvv" sound - like "fff" but with voice.
CRITICAL: NO vowel after. NOT "vuh". Just "vvvv".
Sustain for about 350 milliseconds.
Feel your throat vibrate while your teeth touch your lip.
End by simply stopping.

=== c_z.wav ===
Say ONLY the "zzz" sound - like "sss" but with voice.
CRITICAL: NO vowel after. NOT "zuh". Just pure buzzing "zzzz".
Sustain for about 400 milliseconds.
Like a bee buzzing.
End by simply stopping.

=== c_l.wav ===
Say ONLY the "lll" sound - tongue tip up, air around sides.
CRITICAL: NO vowel after. NOT "luh" or "ul". Just "llll".
Sustain for about 350 milliseconds.
The sound should be continuous, with voice.
End by simply stopping - no release.

=== c_r.wav ===
Say ONLY the "rrr" sound - tongue curled back, growling quality.
CRITICAL: NO vowel after. NOT "ruh". Just "rrrr".
Sustain for about 400 milliseconds.
Like a dog growling or a car engine.
American R, tongue doesn't touch anything.
End by simply stopping.

=== c_h.wav ===
Say ONLY the "hhh" sound - open throat, breathy exhale.
CRITICAL: NO vowel after. NOT "huh". Just breathy air.
Duration about 250 milliseconds.
Like breathing on glasses to clean them, or a quiet pant.
Very light, almost whispered.

=== c_w.wav ===
Say ONLY the "w" glide sound - rounded lips moving toward openness.
CRITICAL: NO vowel after. NOT "wuh". Just the lip movement with voice.
Duration about 250 milliseconds.
Start with tight rounded lips like kissing, then release slightly.
Stop before any vowel forms.

=== c_y.wav ===
Say ONLY the "y" glide sound - tongue high, moving down.
CRITICAL: NO vowel after. NOT "yuh". Just the glide.
Duration about 250 milliseconds.
Like starting to say "yes" but stopping immediately.
Stop before any vowel forms.
```

---

#### STOP CONSONANTS (CRITICAL - MOST LIKELY TO HAVE SCHWA)

```
=== c_p.wav ===
Say ONLY the "p" sound - JUST the lip pop and puff of air.
THIS IS CRITICAL: absolutely NO "uh" after. NOT "puh".
Duration should be 50-70 milliseconds MAXIMUM.
Just the burst: lips pressed together, then release with a tiny puff.
If it sounds like "puh", it's WRONG. Record again.
Think: the sound a bubble makes when it pops. Just "p." and stop.

=== c_b.wav ===
Say ONLY the "b" sound - lip pop with voice, no vowel.
CRITICAL: NO "uh" after. NOT "buh".
Duration should be 60-80 milliseconds MAXIMUM.
Like "p" but you feel your throat vibrate briefly.
Just the voiced burst, then immediate silence.

=== c_t.wav ===
Say ONLY the "t" sound - tongue tap and air release.
CRITICAL: NO "uh" after. NOT "tuh".
Duration should be 60-80 milliseconds MAXIMUM.
Tongue tip taps behind top teeth, releases with a tiny click.
Just the crisp "t" and immediate stop. Like a typewriter key.

=== c_d.wav ===
Say ONLY the "d" sound - tongue tap with voice, no vowel.
CRITICAL: NO "uh" after. NOT "duh".
Duration should be 70-90 milliseconds MAXIMUM.
Like "t" but with throat vibration.
Just the voiced tap, then immediate silence.

=== c_k.wav ===
Say ONLY the "k" sound - back of tongue clicking.
CRITICAL: NO "uh" after. NOT "kuh".
Duration should be 60-80 milliseconds MAXIMUM.
Back of tongue touches soft palate, releases with a click.
Like a quiet cough but JUST the initial click.

=== c_g.wav ===
Say ONLY the "g" sound - back tongue click with voice.
CRITICAL: NO "uh" after. NOT "guh".
Duration should be 70-90 milliseconds MAXIMUM.
Like "k" but with throat vibration.
Just the voiced click, then immediate silence.
```

---

#### DIGRAPHS

```
=== d_sh.wav ===
Say ONLY the "sh" sound - lips forward, hushing sound.
Like telling someone to be quiet: "shhhh"
Sustain for about 400 milliseconds.
NO vowel after. Just the hushing, then stop.
Lips should be pushed forward slightly, like a kiss.

=== d_ch.wav ===
Say ONLY the "ch" sound - a single unit, not "c" then "h".
Like a train: "ch" - but just once.
Duration about 120 milliseconds.
It's a stop releasing into "sh" - one gesture.
NOT "chuh". Just "ch" and stop.

=== d_th_unvoiced.wav ===
Say ONLY the unvoiced "th" sound - tongue between teeth, blow air.
Like in "think" or "math".
Sustain for about 350 milliseconds.
Tongue tip sticks out slightly between teeth, air flows over it.
NO voice, NO vowel after. Just the friction sound.

=== d_th_voiced.wav ===
Say ONLY the voiced "th" sound - tongue between teeth, voice ON.
Like in "this" or "that".
Sustain for about 350 milliseconds.
Same tongue position as unvoiced, but feel throat vibrate.
Buzzy sound. NO vowel after.

=== d_wh.wav ===
Say ONLY the "wh" sound - breathy "w".
A puff of air through rounded lips before voice starts.
Duration about 250 milliseconds.
Like whispering "w" then adding voice.
Some accents don't distinguish this from "w" - that's okay.

=== d_ng.wav ===
Say ONLY the "ng" sound - back of tongue up, nasal.
Like the end of "sing" without the "si-".
Sustain for about 300 milliseconds.
Tongue presses against soft palate, air through nose.
NOT "nuh-guh". One continuous nasal sound.

=== d_ck.wav ===
Same as c_k.wav - just the "k" click sound.
This spelling (ck) only appears after short vowels.

=== d_ph.wav ===
Same as c_f.wav - just the "fff" sound.
This spelling (ph) makes the same sound as "f".
```

---

#### WELDED SOUNDS

```
=== w_am.wav ===
Say the welded sound "am" as one unit - like in "ham".
Start with mouth open for "a", smoothly transition to closed "m".
The vowel should be slightly nasalized (air through nose).
Duration about 300 milliseconds total.
It should sound like one connected sound, not "a" then "m".

=== w_an.wav ===
Say the welded sound "an" as one unit - like in "can".
Open "a" smoothly flowing into "n".
Nasalized vowel connecting to nasal consonant.
Duration about 300 milliseconds.
One fluid sound, not separated.

=== w_all.wav ===
Say the welded sound "all" as one unit - like in "ball".
The vowel is slightly different (more "aw").
Dark L at the end (tongue back, not crisp).
Duration about 350 milliseconds.
One flowing sound: "awl" as a single unit.

=== w_ang.wav ===
Say "ang" as one unit - like in "bang".
Nasalized "a" flowing into "ng".
Duration about 320 milliseconds.
Feel the back of your tongue rise as the vowel connects to "ng".

=== w_ing.wav ===
Say "ing" as one unit - like the ending of "sing".
High front vowel "i" connecting to "ng".
Duration about 280 milliseconds.
Very common word ending - should sound natural and fluid.

=== w_ong.wav ===
Say "ong" as one unit - like in "song".
Back rounded vowel connecting to "ng".
Duration about 300 milliseconds.
The vowel should be the "ah" of "hot" (American), not "oh".

=== w_ung.wav ===
Say "ung" as one unit - like in "sung".
Central vowel "uh" connecting to "ng".
Duration about 280 milliseconds.
Natural and fluid, one gesture.

=== w_ank.wav ===
Say "ank" as one unit - like in "bank".
Nasalized "a" + "ng" + "k" release.
Duration about 320 milliseconds.
The "n" and "k" are actually "ng" + "k" pronounced together.

=== w_ink.wav ===
Say "ink" as one unit - like in "sink".
"ing" + "k" release at the end.
Duration about 280 milliseconds.
Quick "k" release at the end.

=== w_onk.wav ===
Say "onk" as one unit - like in "honk".
"ong" + "k" release at the end.
Duration about 300 milliseconds.

=== w_unk.wav ===
Say "unk" as one unit - like in "junk".
"ung" + "k" release at the end.
Duration about 290 milliseconds.
```

---

#### R-CONTROLLED VOWELS

```
=== r_ar.wav ===
Say "ar" as one unit - like in "car" or "star".
Open "ah" vowel with strong R coloring.
Duration about 350 milliseconds.
The R changes the vowel - they blend together.
American R-colored vowel.

=== r_or.wav ===
Say "or" as one unit - like in "for" or "corn".
Rounded vowel with R coloring.
Duration about 350 milliseconds.
Lips slightly rounded, R blends with vowel.

=== r_er.wav ===
Say "er" as one unit - like in "her" or "fern".
Central vowel with R coloring - the "schwa-R" sound.
Duration about 300 milliseconds.
Very common sound in English - neutral and R-colored.

=== r_ir.wav ===
Say "ir" as one unit - like in "bird" or "first".
SAME SOUND as "er" - just different spelling.
Duration about 300 milliseconds.
The phoneme is identical to r_er.wav.

=== r_ur.wav ===
Say "ur" as one unit - like in "fur" or "burn".
SAME SOUND as "er" and "ir" - just different spelling.
Duration about 300 milliseconds.
The phoneme is identical to r_er.wav.
```

---

#### BLENDS

```
=== For all blends, use this format: ===

Say "[blend]" as a smooth combination of both sounds.
The two consonants flow together quickly but BOTH are audible.
NOT separated like "s" pause "t". 
NOT merged into one sound like a digraph.
Both sounds present, rapid transition between them.

Example for "st":
Say "st" as heard at the beginning of "stop".
Both "s" and "t" are present.
Duration about 350 milliseconds.
The "s" hiss flows quickly into the "t" release.
NO vowel after - just "st" and stop.

[Apply this pattern to all blends:
bl, cl, fl, gl, pl, sl,
br, cr, dr, fr, gr, pr, tr,
sc, sk, sm, sn, sp, st, sw,
ft, lt, mp, nd, sk, st (end positions)]
```

---

#### VOWEL TEAMS

```
=== For vowel teams, most use the long vowel sounds: ===

vt_ai.wav: Say long "a" as in "rain" - same as v_long_a.wav
vt_ay.wav: Say long "a" as in "day" - same as v_long_a.wav
vt_ee.wav: Say long "e" as in "see" - same as v_long_e.wav
vt_ea.wav: Say long "e" as in "sea" - same as v_long_e.wav
vt_ey.wav: Say long "e" as in "key" - same as v_long_e.wav
vt_oa.wav: Say long "o" as in "boat" - same as v_long_o.wav
vt_ow_long.wav: Say long "o" as in "snow" - same as v_long_o.wav
vt_oe.wav: Say long "o" as in "toe" - same as v_long_o.wav
vt_ie.wav: Say long "i" as in "pie" - same as v_long_i.wav
vt_igh.wav: Say long "i" as in "high" - same as v_long_i.wav
vt_ue.wav: Say long "oo" as in "blue" - same as v_long_u.wav
vt_ew.wav: Say long "oo" as in "new" - same as v_long_u.wav
vt_oo_long.wav: Say long "oo" as in "moon" - same as v_long_u.wav

=== Special vowel team variants: ===

vt_ow_diphthong.wav:
Say "ow" as in "cow" - a diphthong.
Starts with "ah" and glides to "oo".
Duration about 350 milliseconds.
Like saying "ow!" when something hurts.

vt_oo_short.wav:
Say short "oo" as in "book" - NOT "moon".
Shorter, more relaxed, less rounded.
Duration about 250 milliseconds.
Like "put" or "good" - the shorter oo sound.

vt_ou.wav:
Say "ou" as in "out" - same as vt_ow_diphthong.
Diphthong from "ah" to "oo".
Duration about 350 milliseconds.
```

---

#### VOICE-OVER LINES

```
=== VO Recording Style ===

Character: Warm, encouraging kindergarten teacher
Pace: Slightly slower than conversational, clear articulation
Energy: Upbeat but not hyper, genuinely kind
Consistency: Same energy and tone across ALL lines

=== Lines to Record ===

[Intro/Tutorial]
VO_001: "Welcome to Phonics Adventure!"
VO_002: "Slide your finger across the letters to help animals talk!"
VO_003: "Let's try it! Slide across to wake up Pig."

[Animal Intros - say [ANIMAL] naturally]
VO_PIG: "Help Pig say this word!"
VO_COW: "Help Cow say this word!"
VO_CAT: "Help Cat say this word!"
VO_HEN: "Help Hen say this word!"
VO_FROG: "Help Frog say this word!"
VO_DUCK: "Help Duck say this word!"
VO_FISH: "Help Fish say this word!"
VO_TURTLE: "Help Turtle say this word!"

[Encouragement - warm, supportive]
VO_KEEP_GOING: "Keep sliding!"
VO_TRY_AGAIN: "Try again! You can do it!"
VO_ALMOST: "Almost there! Keep going!"

[Comprehension - clear question]
VO_WHICH_ONE: "Which one is..."  (word will be appended separately)
VO_HEAR_AGAIN: "Tap to hear it again!"

[Feedback - genuinely happy or gently redirecting]
VO_CORRECT_1: "Yes! Great job!"
VO_CORRECT_2: "That's right!"
VO_CORRECT_3: "You got it!"
VO_INCORRECT: "Hmm, try another one!"

[Celebrations - excited but not over the top]
VO_ANIMAL_AWAKE: "can talk now! Great work!" (animal name prepended)
VO_LESSON_DONE: "Amazing! You helped so many animals!"
VO_NEW_HABITAT: "Wow! You unlocked a new place!"

[Session Management]
VO_TAKE_BREAK: "Great job! Want to take a break?"
VO_WELCOME_BACK: "Welcome back! Your animals missed you!"
```

---

## 3.4 Post-Processing Pipeline

After TTS generation, apply these processing steps:

```
1. TRIM SILENCE
   - Remove silence from beginning (threshold: -40dB)
   - Remove silence from end (threshold: -40dB)
   - Leave 10ms fade at end for continuous sounds

2. NORMALIZE
   - Peak normalize to -3dB
   - Loudness normalize to -16 LUFS
   - Apply across ALL phoneme files for consistency

3. VERIFY STOP CONSONANTS
   - Listen to p, b, t, d, k, g
   - If ANY have audible vowel after, REGENERATE
   - Should sound like clicks, not "puh"

4. DURATION CHECK
   - Short vowels: 180-300ms
   - Long vowels: 300-420ms
   - Continuous consonants: 250-450ms
   - Stop consonants: 50-90ms (CRITICAL)
   - Digraphs: 100-450ms (varies)
   - Welded sounds: 250-400ms
   - Blends: 300-500ms

5. EXPORT
   - Format: WAV, 44.1kHz, 16-bit, Mono
   - Naming convention: as specified in asset list
```

---

# SECTION 4: IMAGE GENERATION (DALL-E)

## 4.1 Master Style Prompt

Use this as a **prefix** for ALL image generations to ensure consistency:

```
STYLE PREFIX (prepend to every prompt):

"Digital illustration in a soft, rounded children's book style 
similar to Sago Mini or Toca Boca games. Simple shapes, 
thick outlines, friendly and approachable. Bright but not 
garish colors with a warm, inviting palette. Suitable for 
toddlers ages 2-5. Clean white or transparent background 
unless otherwise specified. No text in image."
```

## 4.2 Animal Character Prompts

Each animal needs multiple states. Generate these as separate images:

### PIG

```
=== pig_sleeping.png ===
[STYLE PREFIX]
A cute cartoon pig lying down asleep. Eyes closed peacefully, 
small smile. Pink with darker pink spots. Round body, curly tail.
Lying on side in restful pose. Slight "zzz" visual optional.
Grayscale/muted version as if "turned off" or dreaming.

=== pig_waking.png ===
[STYLE PREFIX]
A cute cartoon pig in mid-wake-up pose. Eyes half open, stretching.
Pink coloring starting to show through gray. Yawning expression.
Front legs stretching forward. Transitional state between sleep and awake.

=== pig_awake.png ===
[STYLE PREFIX]
A happy, energetic cartoon pig standing on all fours. Bright pink 
with darker pink spots. Big friendly eyes, wide smile. Curly tail 
bouncing. Alert ears. Looks excited and ready to play. Full color,
vibrant and alive.

=== pig_celebrating.png ===
[STYLE PREFIX]
An overjoyed cartoon pig jumping in the air with glee. All four 
legs off the ground. Eyes squeezed shut with happiness, huge smile.
Bright pink, full of energy. Motion lines suggesting bounce.
The happiest pig you've ever seen.
```

### COW

```
=== cow_sleeping.png ===
[STYLE PREFIX]
A cute cartoon cow lying down asleep in grass. Black and white 
spotted pattern. Eyes closed, peaceful expression. Round body.
Lying down with legs tucked under. Grayscale/muted coloring.

=== cow_waking.png ===
[STYLE PREFIX]
A cute cartoon cow mid-wake-up. Lifting head, eyes half open.
Black and white spots starting to show. Stretching slightly.
Transitional state with some color emerging.

=== cow_awake.png ===
[STYLE PREFIX]
A happy cartoon cow standing in grass. Classic black and white 
spots, pink nose and ears. Friendly bell around neck. Big brown 
eyes, gentle smile. Tail swishing. Warm, friendly expression.

=== cow_celebrating.png ===
[STYLE PREFIX]
A joyful cartoon cow jumping with delight. All four legs in air.
Black and white spots, bell jingling. Huge happy expression.
Tail wagging, ears bouncing. Pure joy.
```

### CAT

```
=== cat_sleeping.png ===
[STYLE PREFIX]
A cute cartoon orange tabby cat curled up asleep. Eyes closed,
content expression. Tail wrapped around body. Round, fluffy.
Grayscale/muted coloring as if dreaming.

=== cat_waking.png ===
[STYLE PREFIX]
A cute cartoon orange tabby cat stretching awake. Arched back,
extending paws. Eyes half open, yawning. Orange color emerging.
Classic cat wake-up stretch pose.

=== cat_awake.png ===
[STYLE PREFIX]
A friendly cartoon orange tabby cat sitting upright. Bright
orange with darker stripes. Big green eyes, whiskers, pink nose.
Tail curled around paws. Alert and curious expression.

=== cat_celebrating.png ===
[STYLE PREFIX]
An ecstatic cartoon orange tabby cat leaping playfully. Paws
outstretched, tail up high. Big happy eyes, open-mouth smile.
Full of playful energy and joy.
```

### HEN

```
=== hen_sleeping.png ===
[STYLE PREFIX]
A cute cartoon hen sitting/roosting asleep. Brown and white
feathers, red comb. Eyes closed, tucked position. Wings folded.
Grayscale/muted coloring.

=== hen_waking.png ===
[STYLE PREFIX]
A cute cartoon hen waking up, ruffling feathers. Head lifting,
eyes opening. Brown coloring emerging. One wing slightly extended.

=== hen_awake.png ===
[STYLE PREFIX]
A friendly cartoon hen standing alert. Brown feathers with white
accents. Bright red comb and wattle. Orange beak and feet.
Plump, round body. Cheerful expression.

=== hen_celebrating.png ===
[STYLE PREFIX]
A delighted cartoon hen flapping wings joyfully. Feathers ruffled
with excitement. Beak open in happy cluck. Feet doing a little
dance. Red comb bouncing. Pure chicken joy.
```

### FROG

```
=== frog_sleeping.png ===
[STYLE PREFIX]
A cute cartoon frog sitting on lily pad, asleep. Eyes closed,
peaceful. Classic frog sitting pose. Grayscale/muted green.

=== frog_waking.png ===
[STYLE PREFIX]
A cute cartoon frog stretching awake on lily pad. Eyes opening,
legs extending. Green color emerging. Mid-wake pose.

=== frog_awake.png ===
[STYLE PREFIX]
A happy cartoon frog on lily pad. Bright green with lighter
belly. Big round eyes with horizontal pupils. Wide friendly
smile. Classic frog pose, ready to hop.

=== frog_celebrating.png ===
[STYLE PREFIX]
An ecstatic cartoon frog mid-leap from lily pad. Legs fully
extended, arms out. Huge happy expression, tongue maybe visible.
Splash effects optional. Maximum frog joy.
```

### DUCK

```
=== duck_sleeping.png ===
[STYLE PREFIX]
A cute cartoon duck floating asleep on water. Yellow with
orange bill. Head tucked into feathers. Peaceful. Grayscale/muted.

=== duck_waking.png ===
[STYLE PREFIX]
A cute cartoon duck waking up on water. Lifting head, eyes
opening. Ruffling feathers. Yellow emerging.

=== duck_awake.png ===
[STYLE PREFIX]
A friendly cartoon duck floating happily. Bright yellow feathers,
orange bill and feet. Blue eyes, cheerful expression. Maybe
water ripples around it.

=== duck_celebrating.png ===
[STYLE PREFIX]
A joyful cartoon duck splashing and flapping wings. Water
droplets flying. Bill open in happy quack. Wings spread wide.
Maximum duck excitement.
```

### FISH

```
=== fish_sleeping.png ===
[STYLE PREFIX]
A cute cartoon goldfish floating still, asleep. Eyes closed.
Orange with lighter belly. Flowing fins still. Grayscale/muted.

=== fish_waking.png ===
[STYLE PREFIX]
A cute cartoon goldfish waking up. Eyes opening, fins starting
to move. Orange color emerging. Some bubbles.

=== fish_awake.png ===
[STYLE PREFIX]
A happy cartoon goldfish swimming. Bright orange/gold color.
Big friendly eyes, small smile. Flowing fins and tail.
A few bubbles around it. Graceful and cheerful.

=== fish_celebrating.png ===
[STYLE PREFIX]
An excited cartoon goldfish doing a happy spin or jump. Tail
swishing energetically. Lots of bubbles. Eyes squeezed with joy.
Maximum fish happiness.
```

### TURTLE

```
=== turtle_sleeping.png ===
[STYLE PREFIX]
A cute cartoon turtle with head retracted into shell, asleep.
Green shell with pattern. Eyes closed (just visible in shell).
Grayscale/muted coloring.

=== turtle_waking.png ===
[STYLE PREFIX]
A cute cartoon turtle with head emerging from shell. Eyes
opening, looking around. Green color appearing. Legs starting
to poke out.

=== turtle_awake.png ===
[STYLE PREFIX]
A friendly cartoon turtle fully out of shell. Green shell with
brown/tan pattern. Green head and legs. Big gentle eyes, small
smile. Calm but happy expression.

=== turtle_celebrating.png ===
[STYLE PREFIX]
A happy cartoon turtle doing excited turtle dance. For a turtle,
this is quite animated! All legs visible, maybe slightly lifted.
Big smile, eyes happy. Turtle-level celebration.
```

---

## 4.3 Word Image Prompts

For comprehension check images. Each word needs ONE clear illustration.

### Prompt Template

```
[STYLE PREFIX]
A simple, clear illustration of [WORD] that a toddler would 
immediately recognize. Single subject, centered, no background 
distractions. Child-friendly depiction.
```

### Phase 0-1 Words (Farm)

```
=== sat ===
A child or simple character sitting down on a small chair or 
cushion. Clear sitting pose, side view preferred. Simple and 
immediately recognizable as "sitting."

=== mat ===
A simple welcome mat or floor mat. Rectangular, maybe with a 
simple pattern. Clear, recognizable as a mat/rug.

=== pat ===
A gentle hand patting something soft, like a dog or pillow.
Show the patting action clearly. Motion lines optional.

=== map ===
A simple treasure-style map or colorful world map. Rolled at 
edges or flat. Clearly a map with simple markings.

=== tap ===
A finger tapping on something, or a water tap/faucet. Clear
tapping action or recognizable faucet.

=== sap ===
Tree sap dripping from a tree trunk, or a bucket collecting
maple sap. Sticky, golden liquid clearly visible.

=== nap ===
A child or animal taking a nap. Lying down peacefully with
eyes closed, maybe a small pillow. Clear sleeping pose.

=== cap ===
A simple baseball cap or winter cap. Clear hat shape, colorful.
No person wearing it, just the cap itself.

=== cat ===
[Use cat_awake.png or similar simple orange tabby illustration]

=== can ===
A simple tin can or aluminum can. Classic cylinder shape.
Maybe a soup can or soda can. Clear and recognizable.

=== man ===
A simple, friendly cartoon man. Standing, waving, or in neutral
pose. Generic "man" that a toddler would recognize. Diverse 
representation welcome.

=== fan ===
An electric fan or handheld fan. Clear recognizable fan shape.
Maybe showing motion lines for spinning.

=== ran ===
A person or animal running. Clear running motion with legs
extended. Motion lines showing speed.

=== pan ===
A cooking pan or frying pan. Simple handle, round pan. Maybe
showing it from above or slight angle.

=== tan ===
Something tan/brown colored - like a tan dog, tan sand, or 
tan colored clothing. Clear association with the color.

=== rat ===
A cute, child-friendly cartoon rat or mouse. Gray with pink
ears and tail. Friendly expression, not scary.

=== fat ===
Something pleasantly plump - a chubby cat, round pillow, or
full balloon. Positive, round, full representation.

=== hat ===
A simple hat - top hat, sun hat, or party hat. Clear hat shape
sitting alone. Colorful and fun.

=== am ===
This is abstract - consider skip or use "I am" with pointing 
gesture. Or morning sun for "a.m." Child pointing to themselves.

=== at ===
Also abstract - could show "at" as position - cat at window,
ball at feet. Show positional relationship.
```

### Phase 2 Words (Pond)

```
=== pet ===
A hand gently petting a small animal like a dog or rabbit.
Clear petting motion, gentle and kind.

=== set ===
A matching set of things - tea set, block set, matching items.
Show multiple items that clearly go together.

=== net ===
A simple net - butterfly net, fishing net, or tennis net.
Clear net pattern with holes visible.

=== met ===
Two characters meeting/greeting each other. Waving or shaking
hands. Clear interaction between two beings.

=== wet ===
Something clearly wet - water drops on surface, wet dog shaking,
puddle splashing. Visible wetness.

=== sit ===
[Similar to "sat" - character in sitting position]

=== pit ===
A hole in the ground (pit), or a fruit pit like from a cherry.
Clear pit/hole or seed representation.

=== fin ===
A fish fin clearly visible, or shark fin. Clear fin shape
sticking up or out.

=== pin ===
A safety pin or push pin. Clear pin shape with point.
Simple, recognizable.

=== win ===
A character celebrating winning - trophy, medal, or crossing
finish line. Clear victory pose.

=== pot ===
A cooking pot with lid, or a flower pot. Round pot shape,
clearly a container.

=== not ===
This is abstract - could show "not" sign or X mark over 
something. Red X or "no" symbol.

=== mop ===
A mop cleaning a floor. Long handle with mop head.
Clear cleaning tool.

=== top ===
A spinning top toy, or something at the top of a stack.
Clear "top" position or toy top.

=== hot ===
Something hot - steam rising, sun blazing, cup with steam.
Clear heat indication with wavy lines.

=== cup ===
A simple cup or mug. Child-friendly cup with handle.
Clear drinking vessel.

=== sun ===
A bright, happy sun. Yellow with rays. Maybe a friendly face.
Classic sun representation.

=== fun ===
Children or animals having fun - playground, balloons, jumping.
Clear joy and play depicted.

=== nut ===
A simple nut - acorn, peanut, or walnut. Clear nut shape.
Maybe with shell visible.

=== cut ===
Scissors cutting paper, or something being cut clearly.
Safe depiction of cutting action.

=== run ===
A person or animal running fast. Motion lines, legs extended.
Clear running action.

=== pup ===
A cute puppy. Young dog with big eyes, small body. Adorable
and clearly a baby dog.

=== mud ===
A mud puddle or muddy ground. Brown, squishy-looking.
Maybe footprints in mud.

=== hut ===
A small, simple hut or cabin. Basic shelter with door and
roof. Child-friendly cottage.

=== bus ===
A school bus or public bus. Classic bus shape, yellow or
colorful. Clear vehicle.
```

---

## 4.4 UI Element Prompts

```
=== Habitat Backgrounds ===

farm_background.png:
[STYLE PREFIX]
A warm, sunny farm scene background. Rolling green hills, red 
barn in distance, white fence, blue sky with fluffy clouds. No 
animals or characters - just the environment. Soft, inviting,
suitable as a background with elements in foreground.

pond_background.png:
[STYLE PREFIX]
A peaceful pond scene background. Calm blue water with lily pads,
cattails at edges, soft green vegetation around. Blue sky, maybe
a willow tree. Serene and inviting. No animals.

=== UI Buttons ===

button_play.png:
[STYLE PREFIX]
A large, friendly play button. Rounded rectangle shape, bright
yellow or green. Perhaps with subtle 3D effect. Could have small
house or forward arrow icon. Text "PLAY!" area. Child-friendly.

button_collection.png:
[STYLE PREFIX]
A barn or house icon representing "My Animals" collection.
Friendly, rounded, colorful. Suggests a home where animals live.

=== Misc UI ===

lock_icon.png:
[STYLE PREFIX]
A cute, friendly padlock icon. Not scary, maybe with a sleepy
or patient expression. Suggesting "not yet" rather than "forbidden."

star_filled.png:
[STYLE PREFIX]
A bright, golden-yellow star. Filled, slightly 3D, maybe with
sparkle. Represents achievement and progress. Classic star shape.

star_empty.png:
[STYLE PREFIX]
An empty star outline. Same shape as filled star but just the
outline, light gray or white. Waiting to be earned.

confetti_particles.png (sprite sheet):
[STYLE PREFIX]
Colorful confetti pieces - various shapes (circles, squares,
ribbons). Multiple colors (red, blue, yellow, green, pink).
Various sizes for particle effects. Celebration elements.
```

---

## 4.5 Image Post-Processing

After DALL-E generation:

```
1. BACKGROUND REMOVAL (for characters and objects)
   - Remove background for transparent PNG
   - Clean edges, no artifacts

2. CONSISTENCY CHECK
   - Compare all animals - similar style?
   - Compare all word images - similar style?
   - If inconsistent, regenerate outliers

3. SIZE STANDARDIZATION
   - Animal characters: 1024x1024 (scale down in app)
   - Word images: 512x512
   - UI elements: as needed

4. COLOR ADJUSTMENT (if needed)
   - Ensure colors aren't too saturated
   - Match warmth across all images
   - Accessibility: sufficient contrast

5. EXPORT
   - Format: PNG with transparency
   - Naming: lowercase_with_underscores.png
```

---

# SECTION 5: COMPLETE ASSET MANIFEST

## 5.1 Audio Assets

### Phonemes (95 files)

```
/assets/audio/phonemes/
├── v_short_a.wav
├── v_short_e.wav
├── v_short_i.wav
├── v_short_o.wav
├── v_short_u.wav
├── v_long_a.wav
├── v_long_e.wav
├── v_long_i.wav
├── v_long_o.wav
├── v_long_u.wav
├── c_m.wav
├── c_n.wav
├── c_s.wav
├── c_f.wav
├── c_v.wav
├── c_z.wav
├── c_l.wav
├── c_r.wav
├── c_h.wav
├── c_w.wav
├── c_y.wav
├── c_p.wav
├── c_b.wav
├── c_t.wav
├── c_d.wav
├── c_k.wav
├── c_g.wav
├── d_sh.wav
├── d_ch.wav
├── d_th_unvoiced.wav
├── d_th_voiced.wav
├── d_wh.wav
├── d_ng.wav
├── d_ck.wav
├── d_ph.wav
├── w_am.wav
├── w_an.wav
├── w_all.wav
├── w_ang.wav
├── w_ing.wav
├── w_ong.wav
├── w_ung.wav
├── w_ank.wav
├── w_ink.wav
├── w_onk.wav
├── w_unk.wav
├── r_ar.wav
├── r_or.wav
├── r_er.wav
├── r_ir.wav
├── r_ur.wav
├── vt_ai.wav
├── vt_ay.wav
├── vt_ee.wav
├── vt_ea.wav
├── vt_ey.wav
├── vt_oa.wav
├── vt_ow_long.wav
├── vt_ow_diphthong.wav
├── vt_oe.wav
├── vt_ie.wav
├── vt_igh.wav
├── vt_ue.wav
├── vt_ew.wav
├── vt_oo_long.wav
├── vt_oo_short.wav
├── vt_ou.wav
├── bl_bl.wav
├── bl_cl.wav
├── bl_fl.wav
├── bl_gl.wav
├── bl_pl.wav
├── bl_sl.wav
├── bl_br.wav
├── bl_cr.wav
├── bl_dr.wav
├── bl_fr.wav
├── bl_gr.wav
├── bl_pr.wav
├── bl_tr.wav
├── bl_sc.wav
├── bl_sk.wav
├── bl_sm.wav
├── bl_sn.wav
├── bl_sp.wav
├── bl_st.wav
├── bl_sw.wav
├── bl_ft.wav
├── bl_lt.wav
├── bl_mp.wav
├── bl_nd.wav
├── bl_sk_end.wav
├── bl_st_end.wav
├── x_silence.wav
└── x_schwa.wav
```

### Voice-Over (30 files)

```
/assets/audio/vo/
├── vo_welcome.wav
├── vo_tutorial_slide.wav
├── vo_tutorial_try.wav
├── vo_help_pig.wav
├── vo_help_cow.wav
├── vo_help_cat.wav
├── vo_help_hen.wav
├── vo_help_frog.wav
├── vo_help_duck.wav
├── vo_help_fish.wav
├── vo_help_turtle.wav
├── vo_keep_going.wav
├── vo_try_again.wav
├── vo_almost.wav
├── vo_which_one.wav
├── vo_hear_again.wav
├── vo_correct_1.wav
├── vo_correct_2.wav
├── vo_correct_3.wav
├── vo_incorrect.wav
├── vo_animal_awake.wav
├── vo_lesson_done.wav
├── vo_new_habitat.wav
├── vo_take_break.wav
└── vo_welcome_back.wav
```

### Sound Effects (15 files)

```
/assets/audio/sfx/
├── sfx_touch_start.wav
├── sfx_scrub_complete.wav
├── sfx_correct.wav
├── sfx_incorrect.wav
├── sfx_lesson_complete.wav
├── sfx_level_up.wav
├── sfx_button_tap.wav
├── sfx_animal_pig.wav
├── sfx_animal_cow.wav
├── sfx_animal_cat.wav
├── sfx_animal_hen.wav
├── sfx_animal_frog.wav
├── sfx_animal_duck.wav
├── sfx_animal_fish.wav
└── sfx_animal_turtle.wav
```

## 5.2 Image Assets

### Animal Characters (32 files - 8 animals × 4 states)

```
/assets/images/animals/
├── pig_sleeping.png
├── pig_waking.png
├── pig_awake.png
├── pig_celebrating.png
├── cow_sleeping.png
├── cow_waking.png
├── cow_awake.png
├── cow_celebrating.png
├── cat_sleeping.png
├── cat_waking.png
├── cat_awake.png
├── cat_celebrating.png
├── hen_sleeping.png
├── hen_waking.png
├── hen_awake.png
├── hen_celebrating.png
├── frog_sleeping.png
├── frog_waking.png
├── frog_awake.png
├── frog_celebrating.png
├── duck_sleeping.png
├── duck_waking.png
├── duck_awake.png
├── duck_celebrating.png
├── fish_sleeping.png
├── fish_waking.png
├── fish_awake.png
├── fish_celebrating.png
├── turtle_sleeping.png
├── turtle_waking.png
├── turtle_awake.png
└── turtle_celebrating.png
```

### Word Images (50 files)

```
/assets/images/words/
├── am.png
├── at.png
├── sat.png
├── mat.png
├── pat.png
├── map.png
├── tap.png
├── sap.png
├── nap.png
├── cap.png
├── cat.png
├── can.png
├── man.png
├── fan.png
├── ran.png
├── pan.png
├── tan.png
├── rat.png
├── fat.png
├── hat.png
├── pet.png
├── set.png
├── net.png
├── met.png
├── wet.png
├── sit.png
├── pit.png
├── fin.png
├── pin.png
├── win.png
├── pot.png
├── not.png
├── mop.png
├── top.png
├── hot.png
├── cup.png
├── sun.png
├── fun.png
├── nut.png
├── cut.png
├── run.png
├── pup.png
├── mud.png
├── hut.png
└── bus.png
```

### UI Elements (20 files)

```
/assets/images/ui/
├── logo.png
├── button_play.png
├── button_collection.png
├── button_settings.png
├── button_help.png
├── button_back.png
├── button_home.png
├── button_sound.png
├── icon_lock.png
├── icon_star_filled.png
├── icon_star_empty.png
├── icon_checkmark.png
├── icon_x.png
├── particles_confetti.png
├── avatar_default.png
├── progress_bar_empty.png
├── progress_bar_fill.png
├── card_frame.png
├── speech_bubble.png
└── touch_indicator.png
```

### Backgrounds (4 files for MVP)

```
/assets/images/backgrounds/
├── bg_farm.png
├── bg_pond.png
├── bg_home.png
└── bg_celebration.png
```

---

## 5.3 Data Files

```
/src/data/

=== words.json ===
{
  "sat": {
    "phonemes": ["c_s", "v_short_a", "c_t"],
    "animal": "pig",
    "habitat": "farm",
    "phase": 1,
    "distractors": ["hat", "mat", "bat"]
  },
  // ... all 50 words
}

=== animals.json ===
{
  "pig": {
    "name": "Pig",
    "habitat": "farm",
    "sound": "sfx_animal_pig.wav",
    "words": ["am", "at", "sat", "mat", "pat"],
    "unlockRequirement": null
  },
  // ... all 8 animals
}

=== progression.json ===
{
  "phases": [
    {
      "id": 0,
      "name": "Phase 0",
      "habitat": "farm",
      "unlockRequirement": null,
      "masteryTarget": 5
    },
    {
      "id": 1,
      "name": "Phase 1",
      "habitat": "farm",
      "unlockRequirement": { "phase": 0, "wordsMastered": 5 },
      "masteryTarget": 15
    },
    {
      "id": 2,
      "name": "Phase 2",
      "habitat": "pond",
      "unlockRequirement": { "phase": 1, "wordsMastered": 15 },
      "masteryTarget": 25
    }
  ]
}
```

---

# SECTION 6: DEVELOPMENT CHECKLIST

## Before You Start

1. **Read the companion documents** (see "Related Documentation" at top of this file)
2. **Remember: All Python/pseudocode shows LOGIC, not literal implementation**
3. **Work phase by phase** — do not skip ahead

## Pre-Development

- [ ] Review all 4 specification documents:
  - [ ] This handoff doc (implementation structure)
  - [ ] `enhanced-phonics-syllabus.md` (curriculum)
  - [ ] `sound-engine-strategy.md` (audio architecture) — **NOTE: Python code here is pseudocode**
  - [ ] `phonics-adventure-mvp-spec.md` (game design)
- [ ] Set up Tauri + React project
- [ ] Configure audio handling (Web Audio API)
- [ ] Generate phoneme audio via TTS (use prompts in Section 3) -- FOR NOW, USE EXISTING PHENOMES
- [x] Generate images via DALL-E (use prompts in Section 4) -- SKIP THIS STEP
- [x] Process and verify all assets - SKIP THIS STEP


## Phase A: Foundation (Week 1-2)

- [ ] Implement audio engine (load, cache, play)
- [ ] Implement word parser (grapheme → phoneme)
- [ ] Build ScrubWord component with touch handling
- [ ] Test scrub → audio with single word "cat"

## Phase B: Core Loop (Week 3-4)

- [ ] Add visual feedback (zone states, highlighting)
- [ ] Build ComprehensionCheck component
- [ ] Wire up success/failure flows
- [ ] Implement basic progress storage (SQLite)
- [ ] Test full loop: scrub → comprehension → next word

## Phase C: Game Layer (Week 5-6)

- [ ] Build AnimalCharacter with state animations
- [ ] Create HabitatScreen and AnimalSelect
- [ ] Implement lesson flow (word sets)
- [ ] Add celebration screen
- [ ] Integrate voice-over

## Phase D: Polish (Week 7-8)

- [ ] Add all 50 words and 8 animals
- [ ] Implement phase unlock system
- [ ] Build parent dashboard (basic)
- [ ] Settings screen
- [ ] Sound effects and juice
- [ ] Bug fixes

## Phase E: Launch Prep (Week 9-10)

- [ ] User testing with 5-10 families
- [ ] Iterate based on feedback
- [ ] Performance optimization
- [ ] App store assets
- [ ] Launch!

---

# DOCUMENT SUMMARY

## This Is Your Primary Implementation Guide

Point your coding agent to **this document** (`phonics-adventure-implementation-handoff.md`) as the entry point. This doc references three companion documents that provide deeper detail:

| Companion Doc | When to Reference |
|---------------|-------------------|
| `enhanced-phonics-syllabus.md` | When implementing curriculum progression, phase unlocks, mastery criteria |
| `sound-engine-strategy.md` | When implementing the word parser, audio blending, phoneme lookup tables |
| `phonics-adventure-mvp-spec.md` | When implementing touch handling, visual feedback, game loop, comprehension checks |

## What This Handoff Doc Contains

1. **Technical Architecture** - Tauri + React structure, audio handling approach
2. **Screen Wireframes** - ASCII layouts for all screens with component breakdowns
3. **TTS Prompts** - Detailed prompts for generating all 95 phoneme files + voice-over
4. **DALL-E Prompts** - Style guide and individual prompts for all images
5. **Complete Asset Manifest** - Every file name, organized by folder
6. **Development Checklist** - Week-by-week implementation guide

## Critical Reminders

⚠️ **All Python code in the spec documents is PSEUDOCODE.** It demonstrates logic and algorithm flow. Implement equivalent logic in TypeScript/Rust using idiomatic patterns — do not copy-paste or translate line-by-line.

⚠️ **Work phase by phase.** Complete Phase A (Foundation) before starting Phase B (Core Loop), and so on.

⚠️ **Cross-reference companion docs** when you need detail on:
- Phoneme order and curriculum → `enhanced-phonics-syllabus.md`
- Word parsing and audio specs → `sound-engine-strategy.md`
- Interaction and game logic → `phonics-adventure-mvp-spec.md`

## Questions for the Engineer to Resolve

1. Web Audio API vs Rust audio backend? (Start with Web Audio)
2. SQLite plugin choice for Tauri?
3. Animation library for React? (Framer Motion recommended)
4. State management? (Zustand recommended for simplicity)

---

*Document Version: 1.0*
*Stack: Tauri + React*
*Audio: TTS-generated*
*Images: DALL-E-generated*
