# PHONICS ADVENTURE: MVP GAME DESIGN + INTERACTION SPEC

## Combined Design Document for iPad Reading App

---

> **📌 COMPANION DOCUMENT**  
> This is a companion document to `phonics-adventure-implementation-handoff.md`, which serves as the primary implementation guide.  
> **All code examples (Python, JavaScript) in this document are PSEUDOCODE** — they demonstrate logic and algorithms. Implement equivalent functionality in TypeScript/Rust using idiomatic patterns.

---

# SECTION 1: GAME CONCEPT

## 1.1 Core Fantasy

**"Help animal friends find their voices"**

Each animal has "lost" the ability to make sounds. By sliding across letters, the child helps the animal "speak" the word — and when they succeed, the animal comes to life, makes its sound, and joins their collection.

**Why this works for toddlers:**
- Animals are universally appealing (no gender/cultural bias)
- "Helping" taps into toddler prosocial motivation
- Collection mechanic provides tangible progress
- Animal sounds are inherently fun (oink, moo, roar)

## 1.2 Metaphor Mapping

| Phonics Concept | Game Metaphor |
|-----------------|---------------|
| Phoneme | Animal's "voice piece" |
| Blending | "Waking up" the animal |
| Mastering a word | Animal joins your barn/zoo |
| Phase progression | New habitats unlock |
| Review/spaced repetition | Animals "need attention" |

## 1.3 World Structure

The game is organized into **Habitats** that map to curriculum phases:

| Habitat | Phase | Theme | Animals | Color Palette |
|---------|-------|-------|---------|---------------|
| **The Farm** | 0-1 | Barnyard | Pig, Cow, Cat, Sheep, Hen | Warm yellows, barn red |
| **The Pond** | 2 | Wetlands | Frog, Duck, Fish, Turtle | Blues, greens, lily pads |
| **The Forest** | 3 | Woodland | Fox, Owl, Bear, Deer, Rabbit | Forest greens, browns |
| **The Jungle** | 4-5 | Tropical | Monkey, Parrot, Snake, Tiger | Vibrant greens, oranges |
| **The Savanna** | 6-7 | African plains | Lion, Elephant, Giraffe, Zebra | Golden yellows, tans |
| **The Arctic** | 8 | Polar | Penguin, Seal, Polar Bear, Walrus | Whites, icy blues |

**MVP Scope: Farm + Pond only (Phases 0-2)**

---

# SECTION 2: CORE GAMEPLAY LOOP

## 2.1 Single Word Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. ANIMAL INTRO                                                │
│     - Sleeping/gray animal appears                              │
│     - Word appears below (letters visible but muted)            │
│     - Audio: "Help [animal] say [word]!"                        │
│                          ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  2. SCRUB PHASE                                                 │
│     - Child slides finger across letters                        │
│     - Each zone lights up + plays phoneme                       │
│     - Animal subtly "stirs" as progress is made                 │
│                          ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  3. BLEND MOMENT                                                │
│     - On complete slide-through, whole word plays               │
│     - Brief pause (500ms) for recognition                       │
│                          ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  4. COMPREHENSION CHECK                                         │
│     - "Which one is [word]?" + 2-3 pictures appear              │
│     - Child taps correct picture                                │
│                          ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  5. SUCCESS CELEBRATION                                         │
│     - Animal wakes up, full color, makes sound                  │
│     - Confetti/stars particle effect                            │
│     - "+1" to collection (if first time)                        │
│     - "Great job! [Animal] says [word]!"                        │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Session Flow

```
SESSION START
     │
     ▼
┌─────────────┐
│ Habitat Map │ ← Child taps a habitat (or auto-selects current)
└─────────────┘
     │
     ▼
┌─────────────────┐
│ Animal Selection│ ← Shows 3-4 animals, some locked, some "need help"
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Word Set        │ ← 3-5 words per animal (one "lesson")
│ (Word 1)        │
│ (Word 2)        │
│ (Word 3)        │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Lesson Complete │ ← Animal fully awake, celebration
│ - Stars earned  │
│ - Animal added  │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Continue?       │ ← "Play more?" or "Visit barn?"
└─────────────────┘
```

## 2.3 Session Length Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Words per lesson** | 3-5 | Toddler attention span |
| **Lessons per session** | 1-3 | ~5-10 minutes total |
| **Max session time** | 15 min | Enforced break prompt |
| **Min session time** | 2 min | At least one lesson |
| **Words before break prompt** | 15 | Gentle "take a break?" |

---

# SECTION 3: THE SCRUB INTERACTION

## 3.1 Touch Mechanics

### 3.1.1 Gesture Recognition

```
VALID SCRUB GESTURE:
- Touch down on or before first letter
- Drag horizontally (±30° vertical tolerance)
- Minimum drag distance: 60% of word width
- Touch up anywhere after last letter zone

INVALID GESTURES (graceful handling):
- Tap without drag → "Slide your finger across!"
- Vertical swipe → Ignore (no response)
- Multi-touch → Use first touch only, ignore others
- Start mid-word → Allow (scrub from that point)
```

### 3.1.2 Scrub Direction

```
PRIMARY: Left-to-right (standard reading direction)
         Always enabled
         
REVERSE: Right-to-left
         Disabled for MVP
         Future: Enable for review/play mode
```

### 3.1.3 Finger Position → Audio Mapping

```javascript
// Zone calculation
const zoneCount = phonemes.length;
const wordWidth = letterContainerWidth;
const zoneWidth = wordWidth / zoneCount;

function getZoneIndex(fingerX) {
    const relativeX = fingerX - letterContainerLeft;
    const zoneIndex = Math.floor(relativeX / zoneWidth);
    return Math.max(0, Math.min(zoneIndex, zoneCount - 1));
}
```

### 3.1.4 Speed Handling

| Finger Speed | Behavior |
|--------------|----------|
| **Very slow** (<50px/sec) | Audio stretches (natural for continuous). Stop consonants still play once. |
| **Normal** (50-300px/sec) | Ideal scrub speed. Audio plays naturally. |
| **Fast** (300-600px/sec) | Audio compresses slightly. Each phoneme still audible (min 80ms). |
| **Very fast** (>600px/sec) | Clamp to fast speed. Don't skip phonemes. |

### 3.1.5 Finger Lift Behavior

```
LIFT DURING SCRUB:
├── If < 40% complete → Reset to beginning
│   - Visual: Letters dim back to start state
│   - Audio: Gentle "try again" chime
│   - Prompt: "Keep sliding!"
│
├── If 40-90% complete → Hold position for 2 seconds
│   - Visual: Progress indicator pulses
│   - Audio: None (waiting)
│   - If finger returns within 2s → Continue from that point
│   - If timeout → Reset with encouragement
│
└── If > 90% complete → Auto-complete
    - Visual: Animate to 100%
    - Audio: Play remaining phoneme(s) + full word
    - Proceed to comprehension check
```

## 3.2 Visual Feedback System

### 3.2.1 Letter States

| State | Visual Treatment | When |
|-------|------------------|------|
| **Inactive** | Gray/muted, 80% opacity | Before scrub reaches |
| **Active** | Full color, slight scale up (105%), glow | Current zone |
| **Completed** | Full color, 100% opacity, no glow | After scrub passes |
| **Digraph/Blend** | Connected with subtle bridge/underline | Always (structural) |

### 3.2.2 Zone Highlighting

```css
/* Active zone highlight */
.letter-zone.active {
    background: radial-gradient(
        ellipse at center,
        rgba(255, 220, 100, 0.4) 0%,
        transparent 70%
    );
    transform: scale(1.05);
    transition: all 0.1s ease-out;
}

/* Completed zone */
.letter-zone.completed {
    opacity: 1.0;
    color: #2D5A27; /* Rich green = "done" */
}
```

### 3.2.3 Animal Feedback During Scrub

| Scrub Progress | Animal Animation |
|----------------|------------------|
| 0% | Sleeping/gray, still |
| 1-33% | Slight stir (ear twitch, eye flutter) |
| 34-66% | More movement (stretch, yawn) |
| 67-99% | Almost awake (eyes opening, color fading in) |
| 100% | Full wake up (jump, sound, full color) |

### 3.2.4 Digraph/Blend Visual Grouping

```
Standard letters:     c   a   t
                     [ ] [ ] [ ]

Digraph (sh):        sh      i   p
                     [══]   [ ] [ ]
                     ↑ Connected box

Blend (st):          st      o   p
                     [╔╗]   [ ] [ ]
                     ↑ Joined but two cells visible

Welded (ing):        r    ing
                    [ ]  [═══]
                         ↑ Single elongated zone
```

**Implementation:** Use subtle visual connectors (rounded shared background, thin underline) so child perceives these as "one sound = one touch zone" without explicit instruction.

## 3.3 Audio Feedback System

### 3.3.1 Latency Requirements

| Event | Max Latency | Notes |
|-------|-------------|-------|
| Touch down → first phoneme | **<50ms** | Critical for responsiveness |
| Zone transition → next phoneme | **<30ms** | Crossfade handles this |
| Scrub complete → whole word | **<100ms** | Brief pause acceptable |
| Picture tap → success sound | **<50ms** | Immediate feedback |

### 3.3.2 Audio Preloading Strategy

```javascript
// On lesson start, preload all audio for current word set
async function preloadLesson(words) {
    const allPhonemes = new Set();
    
    for (const word of words) {
        const parsed = parseWord(word);
        parsed.forEach(p => allPhonemes.add(p.file));
    }
    
    // Preload all unique phoneme files
    await Promise.all(
        Array.from(allPhonemes).map(file => audioCache.load(file))
    );
    
    // Pre-build blended buffers for each word
    for (const word of words) {
        wordBuffers[word] = await buildWordBuffer(parseWord(word));
    }
}
```

### 3.3.3 Sound Effect Library

| Event | Sound | Duration | Notes |
|-------|-------|----------|-------|
| Scrub start | Soft "pop" | 50ms | Confirms touch registered |
| Zone transition | None | — | Phoneme change is feedback |
| Scrub complete | Rising chime | 200ms | Celebratory |
| Correct picture | "Ding!" + animal sound | 500ms | Big reward |
| Wrong picture | Soft "bonk" | 150ms | Non-punishing |
| Lesson complete | Fanfare + animal chorus | 1500ms | Major celebration |
| Level up | New habitat jingle | 2000ms | Exciting discovery |

### 3.3.4 Voice-Over Requirements

| VO Line | When | Example |
|---------|------|---------|
| Animal intro | Start of word | "Help Pig say 'sat'!" |
| Encouragement (lift early) | Finger lifted <40% | "Keep going! Slide all the way!" |
| Encouragement (timeout) | Finger lifted, 2s timeout | "Try again! You can do it!" |
| Comprehension prompt | After blend | "Which one is 'sat'?" |
| Correct answer | Right picture tapped | "Yes! That's 'sat'! Great job!" |
| Wrong answer (gentle) | Wrong picture tapped | "Hmm, try another one!" |
| Lesson complete | End of word set | "Amazing! Pig can talk now!" |

**VO Style Guide:**
- Warm, encouraging, never condescending
- Short sentences (toddler comprehension)
- Consistent voice actor (builds trust/familiarity)
- ~2 second max per line

---

# SECTION 4: COMPREHENSION CHECK

## 4.1 Picture Matching Mechanic

After successful scrub-through, child proves they understood the word by selecting the correct picture.

### 4.1.1 Display Layout

```
┌─────────────────────────────────────────┐
│                                         │
│         "Which one is 'cat'?"           │
│                                         │
│    ┌─────┐    ┌─────┐    ┌─────┐       │
│    │ 🐱  │    │ 🎩  │    │ 🦇  │       │
│    │ cat │    │ hat │    │ bat │       │
│    └─────┘    └─────┘    └─────┘       │
│                                         │
│              [SPEAKER ICON]             │
│              "Hear it again"            │
└─────────────────────────────────────────┘
```

### 4.1.2 Distractor Selection Rules

**Principle:** Distractors should be phonetically similar (tests decoding) not just semantically random.

| Target Word | Good Distractors | Bad Distractors |
|-------------|------------------|-----------------|
| cat | hat, bat, can | dog, tree, car |
| ship | shop, chip, fish | boat, water, star |
| bed | red, bet, beg | pillow, sleep, house |

**Distractor Algorithm:**

```python
def select_distractors(target_word, word_bank, count=2):
    """
    Select phonetically similar distractors.
    Priority:
    1. Minimal pairs (one phoneme different)
    2. Same rime (-at, -ip, -ed)
    3. Same onset
    4. Random from same phase (fallback)
    """
    candidates = []
    
    # Priority 1: Minimal pairs
    for word in word_bank:
        if is_minimal_pair(target_word, word):
            candidates.append((word, 1))
    
    # Priority 2: Same rime
    target_rime = get_rime(target_word)
    for word in word_bank:
        if get_rime(word) == target_rime and word != target_word:
            candidates.append((word, 2))
    
    # Priority 3: Same onset
    target_onset = get_onset(target_word)
    for word in word_bank:
        if get_onset(word) == target_onset and word != target_word:
            candidates.append((word, 3))
    
    # Sort by priority, take top N
    candidates.sort(key=lambda x: x[1])
    return [c[0] for c in candidates[:count]]
```

### 4.1.3 Number of Choices

| Phase | Choices | Rationale |
|-------|---------|-----------|
| 0-1 | 2 | Binary choice for youngest |
| 2-3 | 3 | Standard difficulty |
| 4+ | 3-4 | Increased challenge |

### 4.1.4 Response Handling

```
CORRECT TAP:
├── Immediate: Picture bounces, glows green
├── 100ms: Success sound
├── 300ms: VO "Yes! That's [word]!"
├── 800ms: Transition to celebration
└── Continue to next word or lesson complete

INCORRECT TAP:
├── Immediate: Picture shakes slightly, dims
├── 100ms: Soft "bonk" sound
├── 300ms: VO "Hmm, try another one!"
├── Incorrect option dims (but stays visible)
├── Child can try again (remaining options)
└── After 2 wrong: Highlight correct answer, VO explains, move on

TIMEOUT (10 seconds no tap):
├── VO: "Tap the picture that shows [word]!"
├── Replay word audio
├── Wait another 10 seconds
└── If still no response: Highlight correct, move on
```

### 4.1.5 Image Asset Requirements

**Per word, we need:**
- 1 target image (the correct answer)
- Images must be stored/tagged with their word

**Image specifications:**
- Format: PNG with transparency
- Size: 512x512px (scales down for display)
- Style: Simple, clear illustrations (not photos)
- Consistency: Same art style across all images
- Diversity: Represent diverse contexts where appropriate

**MVP Image Count Estimate:**
- Phase 0-1: ~30 words × 1 image = 30 images
- Phase 2: ~40 words × 1 image = 40 images
- **MVP Total: ~70 unique images**

(Distractors reuse images from other words in the same phase)

---

# SECTION 5: PROGRESSION SYSTEM

## 5.1 Mastery Model

### 5.1.1 Word Mastery States

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   NEW    │ ──▶ │ LEARNING │ ──▶ │ MASTERED │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │                │                │
     ▼                ▼                ▼
  Never seen    Seen but not      3+ correct
                 yet mastered      in a row
```

### 5.1.2 Mastery Criteria

| Metric | Threshold | Notes |
|--------|-----------|-------|
| **Correct in a row** | 3 | Consecutive correct scrub + comprehension |
| **Across sessions** | 2+ | Must succeed in at least 2 different sessions |
| **Time spread** | 24+ hours | Can't master in single sitting |

### 5.1.3 Per-Word Tracking

```javascript
const wordProgress = {
    "cat": {
        status: "learning",        // new | learning | mastered
        timesPresented: 5,
        timesCorrect: 4,
        currentStreak: 2,          // Consecutive correct
        bestStreak: 2,
        lastSeen: "2024-01-15T10:30:00Z",
        sessionsWithSuccess: ["session_001", "session_003"],
        averageScrubTime: 2400,    // ms
        comprehensionAccuracy: 0.8 // 4/5
    }
}
```

## 5.2 Spaced Repetition (Simplified)

Full SRS is overkill for toddlers. We use a simplified "needs attention" model.

### 5.2.1 Review Intervals

| Word Status | Review After |
|-------------|--------------|
| NEW | Immediate (current lesson) |
| LEARNING (streak 0) | Same session |
| LEARNING (streak 1-2) | Next session |
| MASTERED | 3 days |
| MASTERED (seen again) | 7 days |
| MASTERED (stable) | 14 days |

### 5.2.2 "Needs Attention" Queue

```python
def get_words_for_session(child_id, target_count=15):
    """
    Select words for a session, mixing review and new.
    """
    words = []
    
    # Priority 1: Overdue mastered words (review)
    overdue = get_overdue_mastered_words(child_id)
    words.extend(overdue[:3])  # Max 3 review words
    
    # Priority 2: Learning words (almost mastered)
    learning = get_learning_words(child_id)
    words.extend(learning[:5])  # Up to 5 learning words
    
    # Priority 3: New words (introduce fresh content)
    remaining = target_count - len(words)
    new_words = get_next_new_words(child_id, remaining)
    words.extend(new_words)
    
    # Shuffle to avoid predictable order
    random.shuffle(words)
    
    return words
```

### 5.2.3 Game Metaphor for Review

"Your animals miss you! Pig wants to practice 'sat' again!"

- Animals in the barn occasionally show a small "!" indicator
- Tapping takes child to review that word
- Not mandatory, but encouraged
- Keeps collection feeling "alive"

## 5.3 Phase Unlocking

### 5.3.1 Unlock Requirements

| To Unlock | Requirement |
|-----------|-------------|
| Phase 1 | Complete Phase 0 intro (5 words) |
| Phase 2 | Master 15 Phase 1 words (50%) |
| Phase 3 | Master 20 Phase 2 words (50%) |
| Phase 4+ | Master 50% of previous phase |

### 5.3.2 Unlock Celebration

```
NEW HABITAT UNLOCK:
├── Screen dims, spotlight on new habitat
├── Habitat "unlocks" with key animation
├── New animal silhouettes appear
├── VO: "Wow! You unlocked The Pond! New friends are waiting!"
├── Option to explore now or continue current habitat
└── Badge/achievement added to collection
```

## 5.4 Parent Dashboard

### 5.4.1 Key Metrics (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│  EMMA'S PROGRESS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 This Week                                               │
│  ├── Sessions: 5                                            │
│  ├── Time: 42 minutes                                       │
│  └── Words practiced: 34                                    │
│                                                             │
│  📈 Overall                                                 │
│  ├── Words mastered: 23 / 50 (Phase 1-2)                   │
│  ├── Current phase: 2 (The Pond)                           │
│  └── Streak: 4 days                                        │
│                                                             │
│  🔤 Phoneme Accuracy                                        │
│  ├── Short vowels: ████████░░ 80%                          │
│  ├── Consonants:   █████████░ 92%                          │
│  └── Digraphs:     ██████░░░░ 65% ← Needs practice         │
│                                                             │
│  🐷 Animal Collection: 12 / 40                              │
│                                                             │
│  [View Details]  [Adjust Settings]  [Practice Mode]         │
└─────────────────────────────────────────────────────────────┘
```

### 5.4.2 Settings Available to Parents

| Setting | Options | Default |
|---------|---------|---------|
| Daily time limit | 10 / 15 / 20 / 30 min | 15 min |
| Session break prompt | Every 5 / 10 / 15 words | 10 words |
| Difficulty | Standard / Easier / Harder | Standard |
| Sound effects | On / Off | On |
| Background music | On / Off | On |
| Comprehension check | Always / Sometimes / Off | Always |

---

# SECTION 6: VISUAL DESIGN GUIDELINES

## 6.1 Art Style

**Direction:** Friendly, rounded, "soft" illustration style

**References:**
- Sago Mini apps
- Toca Boca aesthetic  
- Duolingo's character design

**Key Principles:**
- Large, simple shapes (toddler visual processing)
- Bright but not garish colors
- Thick outlines for clarity
- Expressive but not overly detailed faces
- Consistent proportions across all animals

## 6.2 Typography

### 6.2.1 Letter Display Font

**Requirements:**
- Single-story 'a' (not double-story) — matches handwriting
- Single-story 'g' — same reason
- Clear distinction between similar letters (I/l/1, O/0)
- Rounded, friendly feel
- Works at large sizes (100px+)

**Recommended:** 
- Andika (SIL) — designed specifically for literacy
- Sassoon Primary — UK literacy standard
- OpenDyslexic — if accessibility focus

**Letter Sizing:**
- Minimum: 80pt for youngest users
- Standard: 100pt
- Zone width: Min 80px per letter/unit

### 6.2.2 UI Font

- Sans-serif, rounded (Nunito, Quicksand, Poppins Rounded)
- High contrast against backgrounds
- Min 18pt for parent-facing text
- Min 24pt for any child-facing text

## 6.3 Color System

### 6.3.1 Core Palette

```
PRIMARY (Interactive elements):
- Sunshine Yellow: #FFD93D (buttons, highlights)
- Grass Green: #6BCB77 (success, completion)
- Sky Blue: #4D96FF (info, neutral interaction)

FEEDBACK:
- Coral Pink: #FF6B6B (gentle error, attention)
- Purple: #9B59B6 (bonus, surprise)

BACKGROUNDS:
- Warm Cream: #FFF8E7 (default background)
- Soft Gray: #F5F5F5 (parent dashboard)

TEXT:
- Rich Brown: #5D4037 (primary text)
- Dark Gray: #424242 (secondary text)
```

### 6.3.2 Habitat Color Palettes

```
FARM:
- Background: #FFF8E7 (cream)
- Accent: #D32F2F (barn red), #FFB74D (hay gold)

POND:
- Background: #E3F2FD (pale blue)
- Accent: #4CAF50 (lily green), #81D4FA (water blue)

FOREST:
- Background: #F1F8E9 (pale sage)
- Accent: #795548 (bark brown), #8BC34A (leaf green)
```

## 6.4 Animation Principles

### 6.4.1 Timing

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Button press | 100ms | ease-out |
| Letter highlight | 150ms | ease-out |
| Zone transition | 100ms | linear |
| Success celebration | 800ms | ease-in-out with bounce |
| Screen transition | 300ms | ease-in-out |
| Animal wake-up | 600ms | spring physics |

### 6.4.2 Feedback Animations

**Letter Zone Active:**
```css
@keyframes zone-active {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1.05); }
}
```

**Success Bounce:**
```css
@keyframes success-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.2); }
    50% { transform: scale(0.95); }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
```

**Wrong Answer Shake:**
```css
@keyframes gentle-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
```

---

# SECTION 7: TECHNICAL SPECIFICATIONS

## 7.1 Platform Requirements

| Requirement | Specification |
|-------------|---------------|
| **Primary Platform** | iPad (iPadOS 15+) |
| **Secondary** | iPhone (iOS 15+), Android tablets (future) |
| **Orientation** | Landscape only |
| **Min Screen** | 9.7" iPad |
| **Touch** | Multi-touch (use first touch only) |

## 7.2 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Touch-to-audio latency | <50ms | <100ms |
| Frame rate | 60fps | 30fps |
| App launch to playable | <3s | <5s |
| Memory footprint | <200MB | <300MB |
| Lesson load time | <1s | <2s |
| Audio preload (lesson) | <500ms | <1s |

## 7.3 Offline Capability

**MVP: Offline-first design**

| Content | Storage | Sync |
|---------|---------|------|
| Audio assets (93 files) | Bundled in app (~15MB) | App update |
| Images (70 files) | Bundled in app (~20MB) | App update |
| Progress data | Local SQLite | Background sync when online |
| Parent dashboard | Requires connection | Cached last view |

## 7.4 Data Architecture

### 7.4.1 Local Schema

```sql
-- Child profile
CREATE TABLE children (
    id TEXT PRIMARY KEY,
    name TEXT,
    avatar_id TEXT,
    created_at TIMESTAMP,
    current_phase INTEGER DEFAULT 0
);

-- Word progress
CREATE TABLE word_progress (
    child_id TEXT,
    word TEXT,
    status TEXT DEFAULT 'new',  -- new, learning, mastered
    times_presented INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_seen TIMESTAMP,
    last_correct TIMESTAMP,
    PRIMARY KEY (child_id, word)
);

-- Session log
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    child_id TEXT,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    words_practiced INTEGER,
    words_correct INTEGER,
    phase INTEGER
);

-- Unlocks
CREATE TABLE unlocks (
    child_id TEXT,
    unlock_type TEXT,  -- phase, animal, achievement
    unlock_id TEXT,
    unlocked_at TIMESTAMP,
    PRIMARY KEY (child_id, unlock_type, unlock_id)
);
```

### 7.4.2 Analytics Events (MVP)

```javascript
// Core events to track
const ANALYTICS_EVENTS = {
    SESSION_START: 'session_start',
    SESSION_END: 'session_end',
    WORD_PRESENTED: 'word_presented',
    SCRUB_STARTED: 'scrub_started',
    SCRUB_COMPLETED: 'scrub_completed',
    SCRUB_ABANDONED: 'scrub_abandoned',
    COMPREHENSION_CORRECT: 'comprehension_correct',
    COMPREHENSION_INCORRECT: 'comprehension_incorrect',
    PHASE_UNLOCKED: 'phase_unlocked',
    ANIMAL_COLLECTED: 'animal_collected',
    SETTING_CHANGED: 'setting_changed'
};

// Example event payload
{
    event: 'scrub_completed',
    child_id: 'abc123',
    session_id: 'sess_456',
    word: 'cat',
    scrub_time_ms: 2340,
    finger_lifts: 0,
    phonemes: ['k', 'æ', 't'],
    timestamp: '2024-01-15T10:30:00Z'
}
```

---

# SECTION 8: MVP SCOPE DEFINITION

## 8.1 What's IN for MVP

| Feature | Details |
|---------|---------|
| **Habitats** | Farm only (Phase 0-2) |
| **Animals** | 8 animals (Pig, Cow, Cat, Hen, Frog, Duck, Fish, Turtle) |
| **Words** | 50 words (see word list below) |
| **Core loop** | Scrub → Blend → Comprehension → Celebrate |
| **Progress** | Word mastery tracking, phase unlock |
| **Parent view** | Basic progress dashboard |
| **Audio** | Full 93-file phoneme library |
| **Images** | 50 word images + 8 animal characters |

## 8.2 What's OUT for MVP (Future)

| Feature | Reason |
|---------|--------|
| Additional habitats | Scope control |
| Sentence-level scrubbing | Complexity |
| Multi-child profiles | Polish later |
| Achievements/badges | Nice-to-have |
| Mini-games | Core loop first |
| Android support | Platform focus |
| Cloud sync | Offline-first MVP |
| Customizable avatars | Scope |
| Background music | Can add easily |

## 8.3 MVP Word List (50 Words)

### Phase 0-1: Farm (20 words)

**Animal: Pig**
- am, at, sat, mat, pat

**Animal: Cow**
- map, tap, sap, nap, cap

**Animal: Cat**
- cat, can, man, fan, ran

**Animal: Hen**
- pan, tan, rat, fat, hat

### Phase 2: Pond (30 words)

**Animal: Frog**
- pet, set, net, met, wet

**Animal: Duck**
- sit, pit, fin, pin, win

**Animal: Fish**
- pot, not, mop, top, hot

**Animal: Turtle**
- cup, sun, fun, nut, cut, run, pup, mud, hut, bus

## 8.4 MVP Asset Summary

| Asset Type | Count | Format | Total Size (est.) |
|------------|-------|--------|-------------------|
| Phoneme audio | 93 | WAV (44.1kHz mono) | ~15 MB |
| Word images | 50 | PNG (512x512) | ~10 MB |
| Animal characters | 8 | PNG + animation frames | ~8 MB |
| UI elements | ~30 | PNG/SVG | ~2 MB |
| Voice-over lines | ~50 | MP3 (128kbps) | ~5 MB |
| Sound effects | ~15 | WAV | ~1 MB |
| **TOTAL** | | | **~41 MB** |

---

# SECTION 9: IMPLEMENTATION ROADMAP

## 9.1 Development Phases

### Phase A: Foundation (2 weeks)

- [ ] Project setup (SwiftUI or Flutter)
- [ ] Audio engine implementation
  - [ ] Phoneme loading/caching
  - [ ] Word buffer construction
  - [ ] Crossfade implementation
- [ ] Touch gesture recognition
  - [ ] Scrub detection
  - [ ] Zone mapping
  - [ ] Speed handling
- [ ] Basic letter rendering (no animation)

**Milestone:** Can scrub "cat" and hear /k/-/æ/-/t/ blended

### Phase B: Core Loop (2 weeks)

- [ ] Visual feedback system
  - [ ] Zone highlighting
  - [ ] Letter state animations
- [ ] Comprehension check UI
  - [ ] Picture display
  - [ ] Tap handling
  - [ ] Feedback animations
- [ ] Word parser integration
- [ ] Progress tracking (local)

**Milestone:** Full word loop (scrub → comprehension → success) for 5 words

### Phase C: Game Layer (2 weeks)

- [ ] Animal integration
  - [ ] Character display
  - [ ] Wake-up animation
  - [ ] Association with words
- [ ] Habitat UI
  - [ ] Farm habitat screen
  - [ ] Animal selection
- [ ] Session flow
  - [ ] Lesson structure
  - [ ] Word sequencing
- [ ] Voice-over integration

**Milestone:** Playable Farm with Pig (5 words)

### Phase D: Polish & Content (2 weeks)

- [ ] Remaining animals (7 more)
- [ ] Remaining words (45 more)
- [ ] Comprehension images (50 total)
- [ ] Phase unlock system
- [ ] Parent dashboard (basic)
- [ ] Settings screen
- [ ] Bug fixes & performance

**Milestone:** Complete MVP ready for testing

### Phase E: Testing & Launch (2 weeks)

- [ ] Internal QA
- [ ] Child user testing (5-10 families)
- [ ] Iteration based on feedback
- [ ] App Store preparation
- [ ] Launch

**Total: ~10 weeks**

## 9.2 Testing Checkpoints

| Week | Test Focus | Method |
|------|------------|--------|
| 2 | Audio scrubbing feel | Internal + 2 toddlers |
| 4 | Core loop engagement | 3-5 toddlers |
| 6 | Session length/fatigue | 5 toddlers, 3 sessions each |
| 8 | Full MVP flow | 10 families, 1 week |
| 10 | Final polish | Bug bash + last feedback |

## 9.3 Key Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Audio latency issues | Test early (Week 1), have fallback to simpler playback |
| Toddlers don't understand scrub | Add animated hand demo, test gesture alternatives |
| Words too hard/easy | Design word list with buffer, easy to adjust |
| Art delays | Use placeholder art, animals last |
| Scope creep | Strict MVP boundary, backlog everything else |

---

# SECTION 10: APPENDICES

## Appendix A: Complete Phoneme-to-Word Mapping for MVP

```javascript
const MVP_WORDS = {
    // Phase 0-1: Farm
    "am":  { phonemes: ["w_am"], animal: "pig", habitat: "farm" },
    "at":  { phonemes: ["v_short_a", "c_t"], animal: "pig", habitat: "farm" },
    "sat": { phonemes: ["c_s", "v_short_a", "c_t"], animal: "pig", habitat: "farm" },
    "mat": { phonemes: ["c_m", "v_short_a", "c_t"], animal: "pig", habitat: "farm" },
    "pat": { phonemes: ["c_p", "v_short_a", "c_t"], animal: "pig", habitat: "farm" },
    
    "map": { phonemes: ["c_m", "v_short_a", "c_p"], animal: "cow", habitat: "farm" },
    "tap": { phonemes: ["c_t", "v_short_a", "c_p"], animal: "cow", habitat: "farm" },
    "sap": { phonemes: ["c_s", "v_short_a", "c_p"], animal: "cow", habitat: "farm" },
    "nap": { phonemes: ["c_n", "v_short_a", "c_p"], animal: "cow", habitat: "farm" },
    "cap": { phonemes: ["c_k", "v_short_a", "c_p"], animal: "cow", habitat: "farm" },
    
    "cat": { phonemes: ["c_k", "v_short_a", "c_t"], animal: "cat", habitat: "farm" },
    "can": { phonemes: ["c_k", "w_an"], animal: "cat", habitat: "farm" },
    "man": { phonemes: ["c_m", "w_an"], animal: "cat", habitat: "farm" },
    "fan": { phonemes: ["c_f", "w_an"], animal: "cat", habitat: "farm" },
    "ran": { phonemes: ["c_r", "w_an"], animal: "cat", habitat: "farm" },
    
    "pan": { phonemes: ["c_p", "w_an"], animal: "hen", habitat: "farm" },
    "tan": { phonemes: ["c_t", "w_an"], animal: "hen", habitat: "farm" },
    "rat": { phonemes: ["c_r", "v_short_a", "c_t"], animal: "hen", habitat: "farm" },
    "fat": { phonemes: ["c_f", "v_short_a", "c_t"], animal: "hen", habitat: "farm" },
    "hat": { phonemes: ["c_h", "v_short_a", "c_t"], animal: "hen", habitat: "farm" },
    
    // Phase 2: Pond - Short E
    "pet": { phonemes: ["c_p", "v_short_e", "c_t"], animal: "frog", habitat: "pond" },
    "set": { phonemes: ["c_s", "v_short_e", "c_t"], animal: "frog", habitat: "pond" },
    "net": { phonemes: ["c_n", "v_short_e", "c_t"], animal: "frog", habitat: "pond" },
    "met": { phonemes: ["c_m", "v_short_e", "c_t"], animal: "frog", habitat: "pond" },
    "wet": { phonemes: ["c_w", "v_short_e", "c_t"], animal: "frog", habitat: "pond" },
    
    // Phase 2: Pond - Short I
    "sit": { phonemes: ["c_s", "v_short_i", "c_t"], animal: "duck", habitat: "pond" },
    "pit": { phonemes: ["c_p", "v_short_i", "c_t"], animal: "duck", habitat: "pond" },
    "fin": { phonemes: ["c_f", "v_short_i", "c_n"], animal: "duck", habitat: "pond" },
    "pin": { phonemes: ["c_p", "v_short_i", "c_n"], animal: "duck", habitat: "pond" },
    "win": { phonemes: ["c_w", "v_short_i", "c_n"], animal: "duck", habitat: "pond" },
    
    // Phase 2: Pond - Short O
    "pot": { phonemes: ["c_p", "v_short_o", "c_t"], animal: "fish", habitat: "pond" },
    "not": { phonemes: ["c_n", "v_short_o", "c_t"], animal: "fish", habitat: "pond" },
    "mop": { phonemes: ["c_m", "v_short_o", "c_p"], animal: "fish", habitat: "pond" },
    "top": { phonemes: ["c_t", "v_short_o", "c_p"], animal: "fish", habitat: "pond" },
    "hot": { phonemes: ["c_h", "v_short_o", "c_t"], animal: "fish", habitat: "pond" },
    
    // Phase 2: Pond - Short U
    "cup": { phonemes: ["c_k", "v_short_u", "c_p"], animal: "turtle", habitat: "pond" },
    "sun": { phonemes: ["c_s", "v_short_u", "c_n"], animal: "turtle", habitat: "pond" },
    "fun": { phonemes: ["c_f", "v_short_u", "c_n"], animal: "turtle", habitat: "pond" },
    "nut": { phonemes: ["c_n", "v_short_u", "c_t"], animal: "turtle", habitat: "pond" },
    "cut": { phonemes: ["c_k", "v_short_u", "c_t"], animal: "turtle", habitat: "pond" },
    "run": { phonemes: ["c_r", "v_short_u", "c_n"], animal: "turtle", habitat: "pond" },
    "pup": { phonemes: ["c_p", "v_short_u", "c_p"], animal: "turtle", habitat: "pond" },
    "mud": { phonemes: ["c_m", "v_short_u", "c_d"], animal: "turtle", habitat: "pond" },
    "hut": { phonemes: ["c_h", "v_short_u", "c_t"], animal: "turtle", habitat: "pond" },
    "bus": { phonemes: ["c_b", "v_short_u", "c_s"], animal: "turtle", habitat: "pond" },
};
```

## Appendix B: Voice-Over Script (MVP)

```
=== INTRO/TUTORIAL ===
VO_001: "Welcome to Phonics Adventure!"
VO_002: "Slide your finger across the letters to help animals talk!"
VO_003: "Let's try it! Slide across to wake up Pig."

=== ANIMAL INTROS ===
VO_PIG: "Help Pig say this word!"
VO_COW: "Help Cow say this word!"
VO_CAT: "Help Cat say this word!"
VO_HEN: "Help Hen say this word!"
VO_FROG: "Help Frog say this word!"
VO_DUCK: "Help Duck say this word!"
VO_FISH: "Help Fish say this word!"
VO_TURTLE: "Help Turtle say this word!"

=== ENCOURAGEMENT ===
VO_KEEP_GOING: "Keep sliding!"
VO_TRY_AGAIN: "Try again! You can do it!"
VO_ALMOST: "Almost there! Keep going!"

=== COMPREHENSION ===
VO_WHICH_ONE: "Which one is [WORD]?"
VO_HEAR_AGAIN: "Tap to hear it again!"

=== FEEDBACK ===
VO_CORRECT_1: "Yes! Great job!"
VO_CORRECT_2: "That's right!"
VO_CORRECT_3: "You got it!"
VO_INCORRECT: "Hmm, try another one!"

=== CELEBRATIONS ===
VO_ANIMAL_AWAKE: "[ANIMAL] can talk now! Great work!"
VO_LESSON_DONE: "Amazing! You helped so many animals!"
VO_NEW_HABITAT: "Wow! You unlocked a new place!"

=== SESSION ===
VO_TAKE_BREAK: "Great job! Want to take a break?"
VO_WELCOME_BACK: "Welcome back! Your animals missed you!"
```

## Appendix C: Error Handling Matrix

| Error State | User Feedback | System Response |
|-------------|---------------|-----------------|
| Audio fails to load | "Oops! Let's try that again." | Retry load 3x, fallback to next word |
| Touch not detected | Pulsing "touch here" indicator | Auto-show after 5s inactivity |
| Scrub too fast | None (clamp speed internally) | Process at max speed |
| Scrub in wrong direction | None (allow but less common) | Play backwards through buffer |
| No image for word | Skip comprehension | Log error, proceed to success |
| Progress save fails | None (silent retry) | Queue for retry, don't block |
| Session timeout | "Want to keep playing?" | Pause game, wait for response |

---

# DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Draft | — | Initial MVP specification |

---

*This document provides complete specifications for building the MVP of Phonics Adventure. For phoneme audio asset details, refer to the Sound Engine Strategy document. For curriculum sequencing details, refer to the Enhanced Phonics Syllabus.*
