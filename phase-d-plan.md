# Phase D: Core Polish Implementation Plan

## Overview

**Goal:** Complete the core UX loop and polish the single-animal flow without requiring new assets. Build on the "Minimum through line" foundation to create a satisfying, testable experience.

**Scope:** 
- 1 animal (Pig)
- 5 words (sat, mat, pat, tap, map)
- All existing screens
- Using only existing assets (phoneme audio, word audio, CSS/emoji for visuals)

**Out of Scope:**
- Additional animals or habitats
- DALL-E generated images
- New voice-over recordings
- Complex animations requiring new libraries

---

## Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Routing | ✅ Complete | All 6 screens wired up |
| ScrubWord | ✅ Complete | Phoneme audio, visual states working |
| Progress Storage | ✅ Complete | localStorage persistence |
| Game Store | ✅ Complete | Word navigation, completion tracking |
| HomeScreen | ✅ Complete | Basic layout, progress display |
| HabitatSelectScreen | ✅ Complete | Single habitat card |
| AnimalSelectScreen | ✅ Complete | Single animal card |
| LessonScreen | ✅ Complete | ScrubWord integrated |
| ComprehensionCheckScreen | ⚠️ Partial | Audio not wired, placeholder images |
| CelebrationScreen | ✅ Complete | Basic confetti, actions work |

---

## Phase D Tasks

### 1. Comprehension Check Audio (Priority: HIGH)

**Current Problem:** "Hear Again" button does nothing. No audio plays when entering the comprehension check.

**Files to Modify:**
- `src/screens/ComprehensionCheckScreen.tsx`
- `src/hooks/useWordAudio.ts` (new file)

**Implementation:**

1. Create a new hook `useWordAudio.ts` that:
   - Loads word audio from `/public/audio/words/{wordId}.mp3`
   - Falls back to phoneme blending if word audio doesn't exist
   - Provides `play()` and `isLoading` state

2. In `ComprehensionCheckScreen.tsx`:
   - Auto-play word audio on mount (after 500ms delay for user orientation)
   - Wire "Hear Again" button to replay the word
   - Show loading state while audio loads

**Data:**
Existing word audio files:
```
/public/audio/words/
├── can.mp3
├── cat.mp3
├── map.mp3
├── mat.mp3
├── pan.mp3
├── pat.mp3
├── sap.mp3
├── sat.mp3
└── tap.mp3
```

**Success Criteria:**
- [ ] Word audio plays automatically when entering comprehension check
- [ ] "Hear Again" button replays the word
- [ ] Loading state shown while audio loads
- [ ] Graceful fallback if audio file doesn't exist

---

### 2. Animal Avatar State Machine (Priority: MEDIUM)

**Current Problem:** Static 🐷 emoji used everywhere. No visual progression tied to scrubbing.

**Files to Create:**
- `src/components/AnimalAvatar.tsx`
- `src/hooks/useAnimalState.ts`

**Files to Modify:**
- `src/screens/LessonScreen.tsx`
- `src/screens/ComprehensionCheckScreen.tsx`
- `src/screens/CelebrationScreen.tsx`

**Avatar States:**

| State | Visual | Trigger |
|-------|--------|---------|
| `sleeping` | 😴 + gray filter + "zzz" text | Initial state, progress 0% |
| `stirring` | 🐷 + slight blur + "..." text | Progress 1-30% |
| `waking` | 🐷💫 + partial color | Progress 30-70% |
| `awake` | 🐷✨ + full color + bounce | Progress 70%+ or word complete |
| `celebrating` | 🎉🐷🎉 + jump animation | Celebration screen |

**Implementation:**

1. Create `AnimalAvatar` component:
   ```tsx
   interface AnimalAvatarProps {
     animal: Animal;
     state: 'sleeping' | 'stirring' | 'waking' | 'awake' | 'celebrating';
     size?: 'small' | 'medium' | 'large';
   }
   ```

2. Create `useAnimalState` hook:
   - Input: `progressRatio` (0-1)
   - Output: current state based on thresholds
   - Handles transitions with debouncing (don't flicker between states)

3. Integrate into LessonScreen:
   - Pass scrub progress to avatar
   - Avatar responds in real-time to finger position

**CSS Classes:**
```css
.animal-avatar--sleeping { filter: grayscale(80%); opacity: 0.7; }
.animal-avatar--stirring { filter: grayscale(40%); }
.animal-avatar--waking { filter: grayscale(0%); transform: scale(1.05); }
.animal-avatar--awake { animation: bounce 0.3s ease-out; }
.animal-avatar--celebrating { animation: jump 0.5s ease-in-out infinite; }
```

**Success Criteria:**
- [ ] Avatar changes state based on scrub progress
- [ ] Transitions are smooth, not jarring
- [ ] State persists correctly between word completions
- [ ] Celebration state shows on CelebrationScreen

---

### 3. Lesson Screen Animal Integration (Priority: MEDIUM)

**Current Problem:** LessonScreen doesn't show the animal character or tie scrubbing to "waking up" the animal.

**Files to Modify:**
- `src/screens/LessonScreen.tsx`
- `src/styles/screens.css`

**New Layout:**
```
┌─────────────────────────────────────────────┐
│ [← Back]                    Word 2 of 5     │
├─────────────────────────────────────────────┤
│                                             │
│              ┌─────────────┐                │
│              │   🐷 / 😴   │  ← AnimalAvatar│
│              │   "Pig"     │                │
│              └─────────────┘                │
│                                             │
│         "Help Pig say 'sat'!"               │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │     [ s ]  [ a ]  [ t ]         │      │
│    │     ═══════════════════         │      │
│    │     Slide to blend              │      │
│    └─────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

**Implementation:**

1. Add animal avatar section above ScrubWord
2. Create instruction text: "Help {Animal} say '{word}'!"
3. Pass scrub progress from ScrubWord to parent via callback
4. Wire avatar state to scrub progress

**New Props for ScrubWord:**
```tsx
interface ScrubWordProps {
  word: WordDefinition;
  onComplete?: () => void;
  onProgressChange?: (ratio: number) => void; // NEW
}
```

**Success Criteria:**
- [ ] Animal avatar visible during lesson
- [ ] Avatar state changes with scrub progress
- [ ] Instruction text shows current word
- [ ] Smooth visual flow from scrub to completion

---

### 4. Comprehension Check Visual Improvements (Priority: MEDIUM)

**Current Problem:** Options show 🖼️ placeholder. Correct/incorrect feedback is minimal.

**Files to Modify:**
- `src/screens/ComprehensionCheckScreen.tsx`
- `src/styles/screens.css`

**Implementation:**

1. **Replace image placeholder with styled text:**
   - Large, bold word text in each option
   - Optional: first letter emphasized
   - Background color variation per option

2. **Enhanced feedback animations:**
   - Correct: Green glow → bounce → checkmark overlay → confetti burst
   - Incorrect: Red flash → shake → dim to 50% opacity

3. **Better option card design:**
   ```
   ┌────────────────┐
   │                │
   │      SAT       │  ← Large text, no image
   │                │
   │   ─────────    │  ← Decorative line
   └────────────────┘
   ```

**CSS Additions:**
```css
.check-option--selecting { transform: scale(0.95); }
.check-option--correct { 
  animation: correctPulse 0.5s ease-out;
  border-color: #4caf50;
}
.check-option--incorrect {
  animation: shake 0.4s ease-out;
}
.check-option--dimmed {
  opacity: 0.4;
  pointer-events: none;
}

@keyframes correctPulse { /* green glow expand */ }
@keyframes shake { /* horizontal shake */ }
```

**Success Criteria:**
- [ ] Options display word text clearly (no 🖼️)
- [ ] Correct answer has satisfying visual feedback
- [ ] Incorrect answer clearly communicates "try again"
- [ ] Previous wrong answers stay dimmed

---

### 5. Tutorial/First-Run Overlay (Priority: LOW)

**Current Problem:** No guidance for first-time users on how to play.

**Files to Create:**
- `src/components/TutorialOverlay.tsx`
- `src/hooks/useTutorialState.ts`

**Files to Modify:**
- `src/screens/LessonScreen.tsx`
- `src/lib/progressStorage.ts`

**Implementation:**

1. Track `hasSeenTutorial` in localStorage
2. On first lesson, show overlay with:
   - Hand/finger icon pointing at word
   - Text: "Press and slide across the letters!"
   - Animated arrow showing left-to-right motion
3. Overlay dismisses on first touch or after 5 seconds
4. Never shows again after first dismissal

**Tutorial Flow:**
```
First time user enters lesson:
1. Show overlay (3 second delay)
2. Display instruction with animated hand
3. User taps anywhere → dismiss
4. Mark tutorial as seen
5. Never show again
```

**Success Criteria:**
- [ ] Tutorial shows on first lesson only
- [ ] Clear visual instruction for scrubbing
- [ ] Dismisses naturally without blocking
- [ ] Persists "seen" state across sessions

---

### 6. Micro-Interactions & Polish (Priority: LOW)

**Files to Modify:**
- `src/styles/global.css`
- `src/styles/screens.css`
- Various component files

**Improvements:**

1. **Button press feedback:**
   - All buttons: `transform: scale(0.95)` on active
   - Subtle shadow change

2. **Screen transitions:**
   - Fade in/out between screens (CSS only)
   - Add `page-enter` / `page-exit` classes

3. **Celebration enhancements:**
   - Stars animate in sequentially (stagger delay)
   - Confetti particles fall (CSS animation)
   - Animal emoji does small jump

4. **Progress indicators:**
   - Smooth fill animation on progress dots
   - Checkmark appears with scale-in effect

**Success Criteria:**
- [ ] All interactive elements have touch feedback
- [ ] Screen transitions feel smooth
- [ ] Celebration feels rewarding
- [ ] No jarring visual changes

---

## Implementation Order

```
Week 1:
├── Day 1-2: Task 1 (Comprehension Check Audio)
│   └── Create useWordAudio hook
│   └── Wire up ComprehensionCheckScreen
│   └── Test with existing word files
│
├── Day 3-4: Task 2 (Animal Avatar State Machine)
│   └── Create AnimalAvatar component
│   └── Create useAnimalState hook
│   └── Add CSS for states
│
└── Day 5: Task 3 (Lesson Screen Integration)
    └── Add avatar to LessonScreen
    └── Wire progress callback
    └── Add instruction text

Week 2:
├── Day 1-2: Task 4 (Comprehension Check Visual)
│   └── Replace placeholder images
│   └── Add feedback animations
│   └── Polish option cards
│
├── Day 3: Task 5 (Tutorial Overlay)
│   └── Create overlay component
│   └── Add localStorage tracking
│   └── Integrate with LessonScreen
│
└── Day 4-5: Task 6 (Polish & Testing)
    └── Add micro-interactions
    └── Test full flow end-to-end
    └── Bug fixes
```

---

## Files Summary

### New Files (5)
| File | Purpose |
|------|---------|
| `src/hooks/useWordAudio.ts` | Load and play word-level audio |
| `src/components/AnimalAvatar.tsx` | Animal character with state-based visuals |
| `src/hooks/useAnimalState.ts` | Calculate avatar state from progress |
| `src/components/TutorialOverlay.tsx` | First-run instruction overlay |
| `src/hooks/useTutorialState.ts` | Track tutorial completion |

### Modified Files (6)
| File | Changes |
|------|---------|
| `src/screens/LessonScreen.tsx` | Add avatar, progress callback, instruction text |
| `src/screens/ComprehensionCheckScreen.tsx` | Wire audio, improve options display |
| `src/screens/CelebrationScreen.tsx` | Use AnimalAvatar component |
| `src/components/ScrubWord.tsx` | Add onProgressChange callback |
| `src/lib/progressStorage.ts` | Add tutorial tracking |
| `src/styles/screens.css` | Add avatar states, animations, polish |

---

## Success Criteria (Phase D Complete)

- [ ] **Audio:** Word audio plays in comprehension check, "Hear Again" works
- [ ] **Avatar:** Animal responds to scrub progress in real-time
- [ ] **Flow:** Complete loop feels cohesive (lesson → check → celebrate)
- [ ] **Feedback:** Clear visual/audio feedback for all actions
- [ ] **Tutorial:** First-time users understand how to play
- [ ] **Polish:** Interactions feel smooth and satisfying
- [ ] **Testing:** Can complete all 5 words without bugs

---

## Testing Checklist

### Happy Path
- [ ] Start from HomeScreen, tap Play
- [ ] Select Farm habitat
- [ ] Select Pig animal
- [ ] Complete word 1 (scrub → check → correct)
- [ ] Complete words 2-5
- [ ] Reach CelebrationScreen
- [ ] Tap "Go Home" → returns to HomeScreen
- [ ] Progress shows 5/5 complete

### Edge Cases
- [ ] Wrong answer in comprehension check → can retry
- [ ] Exit mid-lesson → progress preserved
- [ ] "Play Again" resets animal progress correctly
- [ ] Works on touch devices (iOS Safari, Android Chrome)
- [ ] Works with keyboard/mouse (desktop testing)

### Audio
- [ ] Word audio plays in comprehension check
- [ ] "Hear Again" replays correctly
- [ ] Phoneme audio still works in ScrubWord
- [ ] No audio glitches or overlaps

---

## Notes

- **No new assets required** - uses existing audio files and CSS/emoji visuals
- **Focused scope** - only Pig + 5 words, can expand later
- **Testable incrementally** - each task can be tested independently
- **Fallback friendly** - graceful degradation if audio missing

---

*Document Version: 1.0*
*Parent Document: phonics-adventure-implementation-handoff.md*
*Depends On: Phase C "Minimum through line" completion*
