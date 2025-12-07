# ENHANCED PHONICS SYLLABUS FOR FINGER-SCRUB READING APP

## Wilson-Aligned | Orton-Gillingham-Influenced | Toddler-Optimized

---

> **📌 COMPANION DOCUMENT**  
> This is a companion document to `phonics-adventure-implementation-handoff.md`, which serves as the primary implementation guide.  
> This syllabus defines **curriculum content** (what to teach). See the handoff doc for implementation structure.

---

## FOUNDATIONAL PRINCIPLES

### Why This Phoneme Order Matters

The introduction sequence follows three research-backed constraints:

1. **Articulatory accessibility**: Sounds toddlers can physically produce and isolate
2. **Visual distinctiveness**: Letters that don't look alike (avoid b/d, p/q early)
3. **Blending compatibility**: Continuous sounds first (can be stretched), stops later (require special handling)

### The Cardinal Rule: No Schwa Contamination

The most common error in phonics instruction is adding "uh" to consonants:

- ❌ "buh" "tuh" "puh"
- ✅ /b/ /t/ /p/ (crisp, clipped, NO vowel sound attached)

**For audio assets, this means:**

- **Continuous consonants**: Pure sustained sound, fade out cleanly—no vowel creep at end
- **Stop consonants**: Aspirated release only, 50-80ms max, hard cutoff

### Continuous vs. Stop Consonants

| Type | Sounds | Characteristic | Slider Behavior |
|------|--------|----------------|-----------------|
| **Continuous** | m, s, f, n, l, r, v, z, h, sh, th | Can be sustained indefinitely | Stretches with finger speed |
| **Stop** | p, t, k, b, d, g, ch | Cannot be stretched—instant release | Plays once when zone entered |

---

## PHASE 0 — PRE-PHONEMIC AWARENESS

**Target Age**: 2-3 years  
**Duration**: 2-4 weeks  
**Prerequisite**: None

### Goals

- Establish that spoken words are made of smaller sound pieces
- Train auditory discrimination (same/different sounds)
- Build the motor skill of finger-sliding before attaching meaning
- Develop phonological awareness without orthographic complexity

### No Letters Yet—Just Sounds

| Sound | Toddler Cue | Visual | Activity |
|-------|-------------|--------|----------|
| /s/ | "Snake says sssss" | Snake illustration | Slide finger across snake's body |
| /m/ | "Mmmmm yummy!" | Food/ice cream | Slide across food image |
| /f/ | "Blow out candles: fffff" | Birthday candles | Slide across candle row |
| /æ/ | "Open wide for doctor: aaaa" | Open mouth | Slide across mouth graphic |

### UX Specifications

- **No letter symbols**—only pictures/icons
- Single sustained phoneme per slide (no blending yet)
- Child learns fundamental mapping: "sliding = sound plays"
- Sound duration tied to slide speed (slower = longer sound)
- Bright visual feedback (trail behind finger, color glow)

### Mastery Criteria (Exit Requirements)

Child demonstrates ability to:

1. Produce /s/, /m/, /f/, /æ/ in isolation on verbal request
2. Match sound to correct picture when hearing phoneme (receptive discrimination)
3. Smoothly slide finger across screen while sound plays (motor coordination)
4. Distinguish between two different phonemes ("Is this sssss or mmmm?")

---

## PHASE 1 — FIRST PHONEMES + LETTER-SOUND LINKING

**Target Age**: 2.5-3.5 years  
**Duration**: 4-6 weeks  
**Prerequisite**: Phase 0 mastery

### Goals

- Link first 5 letters to their phonemes
- Introduce CVC blending (2-phoneme → 3-phoneme progression)
- All continuous consonants except one stop (/t/) for variety
- Single vowel (/æ/) to reduce cognitive load

### Phonemes Introduced

| Letter | Phoneme | IPA | Articulation Guide | Toddler Cue | Audio Duration |
|--------|---------|-----|---------------------|-------------|----------------|
| **m** | /m/ | /m/ | Lips pressed together, voice on, airflow through nose. Sustain the hum, then stop cleanly. NO "muh". | "Mmmm, yummy sound" | 300-400ms |
| **s** | /s/ | /s/ | Teeth close together, tongue behind teeth, air pushed through center channel. Sustained hiss, NO vowel at end. | "Ssssnake sound" | 350-450ms |
| **a** | /ă/ | /æ/ | Mouth open wide, tongue flat and low, jaw dropped. Short duration, not drawn out into a diphthong. | "Ah! Like when something surprises you" | 250-300ms |
| **t** | /t/ | /t/ | Tongue tip taps alveolar ridge (behind top teeth). CRISP release—just the click of aspirated air, absolutely no "tuh". | "Tiny tap sound" | 60-80ms |
| **p** | /p/ | /p/ | Lips pressed, then pop apart with burst of air. Just the burst, no "puh". | "Popping bubble" | 50-70ms |

### Critical Note on Stop Consonants (/t/ and /p/)

These cannot be stretched. The audio clip must be:

- 50-80ms of pure aspirated release
- Hard cutoff at the end
- No vowel coloring whatsoever
- If child lingers in the zone, silence follows (or replay on re-entry)

### Week-by-Week Progression

**Weeks 1-2: Two-Phoneme Slides (VC and CV patterns)**

| Pattern | Words |
|---------|-------|
| VC | am, at, as |
| CV | ma, sa, pa, ta |

**Weeks 3-4: Three-Phoneme Slides (CVC)**

| Words |
|-------|
| sat, mat, Sam, tam, pat, tap, map, sap, Pam, mas |

**Weeks 5-6: Consolidation + Assessment**

- Mixed practice with all Phase 1 words
- Speed building (faster slides, maintained accuracy)
- Comprehension checks (slide → point to picture)

### Sliding Interaction Mapping

```
Word: "sat"

┌─────────┬─────────┬─────────┐
│    s    │    a    │    t    │
│  LEFT   │ CENTER  │  RIGHT  │
└─────────┴─────────┴─────────┘
  0-33%     34-66%    67-100%
  
Finger at 0-33%:   /s/ plays (continuous—stretches with slide speed)
Finger at 34-66%:  /æ/ plays (continuous—stretches with slide speed)
Finger at 67-100%: /t/ plays (stop—quick tap regardless of slide speed)
```

**Crossfade Protocol:**

- 30-40ms overlap between adjacent phonemes
- /s/ amplitude fades as /æ/ amplitude rises
- Creates natural coarticulation effect
- No audible "seam" between sounds

**Stop Consonant UX:**

- When finger enters /t/ zone, immediately trigger full stop clip
- Do NOT attempt to stretch
- If finger remains in zone after clip ends → silence
- If finger exits and re-enters zone → replay the stop

### Mastery Criteria (Exit Requirements)

1. Produce each Phase 1 phoneme when shown the letter (≥90% accuracy)
2. Blend any Phase 1 CVC word by sliding (≥85% accuracy)
3. Demonstrate comprehension: after blending, identify correct picture from 3 options
4. Blend independently without model (no adult demo needed)

### Remediation Triggers

If child struggles with:

- **Letter-sound linking**: Return to isolated phoneme practice; increase picture-to-letter bridging
- **Blending**: Use slower guided slides with adult finger-over-finger support
- **Stop consonants**: Isolate /t/ and /p/ in final position first (easier perceptually)

---

## PHASE 2 — EXPANDING THE CONSONANT INVENTORY

**Target Age**: 3-4 years  
**Duration**: 4-6 weeks  
**Prerequisite**: Phase 1 mastery

### Goals

- Add 4 high-utility consonants (3 continuous + 1 stop)
- Dramatically expand decodable word set
- Maintain single vowel (/æ/) to isolate consonant learning

### New Phonemes

| Letter | Phoneme | IPA | Articulation Guide | Toddler Cue | Audio Duration |
|--------|---------|-----|---------------------|-------------|----------------|
| **f** | /f/ | /f/ | Top teeth rest on lower lip, blow air continuously. Sustained friction, no vowel creep. | "Angry cat sound: ffff" | 300-400ms |
| **n** | /n/ | /n/ | Tongue tip pressed behind top front teeth, voice on, air through nose. Sustained hum. | "Nose hum: nnnn" | 300-400ms |
| **c** | /k/ | /k/ | Back of tongue presses against soft palate, then releases with burst. Quick, clean. | "Quiet cough—just the click" | 60-80ms |
| **r** | /r/ | /ɹ/ | Tongue tip curled slightly back, sides touch upper molars, tongue doesn't touch roof. | "Growling dog: rrrr" | 350-450ms |

### Developmental Note on /r/

The phoneme /r/ is notoriously difficult for children under 5. Many will produce /w/ instead ("wabbit" for "rabbit"). This is developmentally normal.

**App handling:**

- Accept /w/ substitution in early practice
- Do NOT mark as incorrect
- Provide correct model but don't require perfect production
- Most children acquire /r/ between ages 5-7

### New Word List

**With /f/:**
fat, fan, fast, raft,aft

**With /n/:**
nap, nan, tan, pan, man, can, ran, ant

**With /c/ (spelling for /k/):**
cat, cap, can, cast, scat

**With /r/:**
rat, ram, rap, raft, craft, trap

**Combined practice:**
ran, raft, craft, fact, tract, scant

### Sliding Interaction: 4-Phoneme Words

```
Word: "raft"

┌────────┬────────┬────────┬────────┐
│   r    │   a    │   f    │   t    │
│  25%   │  25%   │  25%   │  25%   │
└────────┴────────┴────────┴────────┘

Zone allocation: Equal division by phoneme count
```

**For CCVC words like "trap":**

```
┌────────┬────────┬────────┬────────┐
│   t    │   r    │   a    │   p    │
│ STOP   │ CONT   │ CONT   │ STOP   │
└────────┴────────┴────────┴────────┘

Note: Both stop consonants get equal zone width but play as instant taps
```

### Mastery Criteria

1. Produce all Phase 1 + Phase 2 phonemes from letter cues
2. Blend 4-phoneme words containing one blend (CVCC, CCVC)
3. Self-correct when blend attempt doesn't form recognizable word

---

## PHASE 3 — SHORT VOWEL FAMILY COMPLETION

**Target Age**: 3-4 years  
**Duration**: 6-8 weeks  
**Prerequisite**: Phase 2 mastery

### Goals

- Introduce remaining 4 short vowels
- Enable cross-vowel decoding
- Build automatic vowel identification

### New Vowels

| Letter | Phoneme | IPA | Articulation Guide | Toddler Cue | Audio Duration | Common Confusion |
|--------|---------|-----|---------------------|-------------|----------------|------------------|
| **e** | /ĕ/ | /ɛ/ | Mouth slightly open, tongue mid-height and forward. Short, not "ee". | "Eh—like 'ready, set...'" | 200-250ms | Often confused with /ĭ/ |
| **i** | /ĭ/ | /ɪ/ | Mouth barely open, tongue high and forward. Quick, short. | "Ih—like 'icky sticky'" | 180-220ms | Often confused with /ĕ/ |
| **o** | /ŏ/ | /ɒ/ | Mouth round and open, tongue low and back. | "Ah—like 'hop hop hop'" | 220-280ms | Often confused with /ŭ/ |
| **u** | /ŭ/ | /ʌ/ | Mouth slightly open, tongue mid-central. | "Uh—like 'uh-oh!'" | 200-250ms | Often confused with /ŏ/ |

### Vowel Introduction Sequence

Introduce one new vowel per 1-2 weeks, with contrastive pairs:

| Week | Focus Vowel | Contrast With | Minimal Pairs |
|------|-------------|---------------|---------------|
| 1-2 | /ĕ/ | /ă/ | mat/met, sat/set, pat/pet |
| 3-4 | /ĭ/ | /ĕ/ | set/sit, pet/pit, met/mitt |
| 5-6 | /ŏ/ | /ă/ | cat/cot, tap/top, cap/cop |
| 7-8 | /ŭ/ | /ŏ/ | cot/cut, hop/hup, mop/mup* |

*Note: "mup" is a nonsense word—useful for decoding practice, less so for comprehension

### Word Lists by Vowel

**Short /ĕ/:**
met, men, set, net, pen, pet, ten, hen, bet, get, let, wet, fed, red, bed

**Short /ĭ/:**
sit, fin, pin, nip, kit, kin, hit, bit, fit, pit, win, tin, dim, him, rim

**Short /ŏ/:**
mom, pop, sob, cot, pot, mop, hot, not, got, lot, dot, rot, top, hop, cop

**Short /ŭ/:**
sun, fun, nut, pup, cup, cut, but, hut, rut, run, bun, gun, mud, bud, dug

### UX Consideration: Vowel Highlighting

Because vowels are the "nucleus" of every syllable and drive blending:

- Consider subtle visual distinction for vowel zone (warmer color, glow)
- Vowel zone could be slightly larger (35% vs 30% for consonants)
- Provides implicit teaching: "the middle sound is special"

### Mastery Criteria

1. Given any short vowel letter, produce correct phoneme
2. Read minimal pair words and demonstrate meaning distinction
3. Decode novel CVC words with any short vowel on first attempt

---

## PHASE 4 — CONSONANT DIGRAPHS

**Target Age**: 3.5-4.5 years  
**Duration**: 4-6 weeks  
**Prerequisite**: Phase 3 mastery

### Goals

- Introduce two-letter combinations that represent ONE sound
- Teach digraphs as single visual units
- Avoid splitting (sh ≠ /s/ + /h/)

### Critical Concept: Digraph vs. Blend

| Term | Definition | Example | Phoneme Count |
|------|------------|---------|---------------|
| **Digraph** | Two letters, ONE sound | "sh" in "ship" | 1 phoneme: /ʃ/ |
| **Blend** | Two letters, TWO sounds | "st" in "stop" | 2 phonemes: /s/ + /t/ |

### Digraphs to Introduce

| Digraph | Phoneme | IPA | Articulation Guide | Toddler Cue | Audio Duration |
|---------|---------|-----|---------------------|-------------|----------------|
| **sh** | /sh/ | /ʃ/ | Lips pushed forward (like blowing a kiss), tongue pulled back, continuous air. | "Shh—quiet in the library" | 350-450ms |
| **ch** | /ch/ | /tʃ/ | Start with tongue tip up (like /t/), then release into /sh/. Single motion, not two sounds. | "Choo-choo train!" | 100-150ms |
| **th** (unvoiced) | /th/ | /θ/ | Tongue tip between teeth, blow air over it. No vibration. | "Tongue sticks out, blow air" | 300-400ms |
| **th** (voiced) | /th/ | /ð/ | Same position as above, but voice on (feel throat buzz). | "Same tongue-out, but buzzy" | 300-400ms |
| **wh** | /wh/ | /ʍ/ or /w/ | Lips rounded, slight breath before voice. (Many dialects merge with /w/.) | "Blow through a tiny circle" | 200-300ms |
| **ck** | /k/ | /k/ | Same as "c"—back tongue clicks. (Only appears after short vowels.) | "Same as c—quick click" | 60-80ms |

### UX Implementation: Digraphs as Single Units

```
Word: "ship"

┌──────────┬─────────┬─────────┐
│    sh    │    i    │    p    │
│  SINGLE  │  vowel  │  stop   │
│   ZONE   │         │         │
└──────────┴─────────┴─────────┘

The "sh" box contains BOTH letters but triggers ONE phoneme
Finger slide across "sh" = one /ʃ/ sound (no /s/ then /h/)
```

**Visual Design Recommendation:**

- Digraph letters should be visually grouped (touching, underlined, or in a shared box)
- Consider subtle bridge/ligature connecting the two letters
- This teaches: "these two letters are partners—one sound"

### Word Lists

**sh words:**
ship, shop, shut, shim, shed, cash, mash, rash, dash, fish, dish, wish, rush, hush, mesh

**ch words:**
chat, chin, chop, chip, much, such, rich, each, inch, chest, chimp, champ

**th words (unvoiced):**
thin, thick, thud, math, path, bath, moth, with, cloth

**th words (voiced):**
this, that, them, then, with (note: "with" can be either)

**wh words:**
when, whip, wham, whim, which, what

**ck words:**
back, pack, tack, rack, sick, pick, kick, tick, duck, tuck, luck, rock, sock, lock

### Digraph vs. Non-Digraph Contrast

Practice distinguishing:

| Digraph | Not a Digraph |
|---------|---------------|
| "sh" in "ship" (one sound) | "s-h" in "mishap" (two sounds, different syllables) |
| "ch" in "chip" (one sound) | "c-h" in "cowherd" (two sounds) |
| "th" in "math" (one sound) | "t-h" in "anthill" (two sounds) |

For MVP, avoid words where the letter pair crosses syllable boundaries.

### Mastery Criteria

1. See digraph → produce single correct phoneme
2. Never split digraphs during blending
3. Decode novel digraph words accurately

---

## PHASE 5 — CONSONANT BLENDS

**Target Age**: 4-5 years  
**Duration**: 6-8 weeks  
**Prerequisite**: Phase 4 mastery

### Goals

- Teach consonant clusters where BOTH sounds are heard
- Develop rapid sequential phoneme processing
- Build toward more complex syllable structures

### Key Distinction from Digraphs

In a blend, you hear BOTH consonants. The finger slider plays TWO phonemes in quick succession with a tight crossfade.

### Blend Categories

#### L-Blends (Continuous + Continuous = Smooth)

| Blend | Words |
|-------|-------|
| bl | black, blab, bled, blot, blush |
| cl | clap, clip, club, clam, class |
| fl | flag, flat, flip, flop, flung |
| gl | glad, glen, glum, glass |
| pl | plan, plop, plug, plum, plus |
| sl | slam, slap, slip, slid, slot, slug |

#### R-Blends (Often Stop + Continuous)

| Blend | Words |
|-------|-------|
| br | brat, brim, bred, brush, brick |
| cr | crab, crib, crop, crush, crisp |
| dr | drag, drip, drop, drum, dress |
| fr | frog, from, fret, fresh, frost |
| gr | grab, grim, grin, grunt, grasp |
| pr | prep, prim, prod, prop, press |
| tr | trap, trim, trip, truck, trust |

#### S-Blends (Continuous + Various)

| Blend | Words |
|-------|-------|
| sc/sk | scan, scat, skin, skip, skull |
| sm | smash, smell, smog, smug |
| sn | snap, snip, snot, snug, snack |
| sp | span, spin, spot, spun, spent |
| st | stop, stem, step, stomp, stuck |
| sw | swim, swam, swell, swept, swing |

#### End Blends

| Blend | Words |
|-------|-------|
| -ft | raft, left, soft, loft, gift, lift |
| -lt | belt, felt, melt, jolt, salt, tilt |
| -mp | camp, lamp, jump, pump, stomp |
| -nd | and, band, hand, land, sand, pond |
| -ng | ring, sang, long, hung, thing |
| -nk | bank, tank, sink, pink, chunk |
| -sk | ask, mask, desk, task, dusk |
| -sp | wasp, clasp, crisp |
| -st | best, fast, just, must, fist, nest |

### UX: Blending Two Consonants

```
Word: "flag"

┌────────┬────────┬────────┬────────┐
│   f    │   l    │   a    │   g    │
│  CONT  │  CONT  │  VOWEL │  STOP  │
└────────┴────────┴────────┴────────┘
   25%      25%      25%      25%

Crossfade f→l: 30-40ms overlap
Both sounds audible, rapid succession
```

**Blend Audio Engineering:**

For blends, you have two options:

1. **Dynamic concatenation**: Play /f/, crossfade to /l/, continue. More flexible.
2. **Pre-recorded blend sprites**: Record "fl" as single ~400ms asset. Smoother coarticulation.

**Recommendation**: Use pre-recorded blend sprites for the most common blends (fl, bl, st, sp, etc.). Fall back to dynamic concatenation for rare combinations.

### Mastery Criteria

1. Decode CCVC words (e.g., "flag") with appropriate blend pronunciation
2. Decode CVCC words (e.g., "fast") with appropriate end-blend
3. Distinguish blends from digraphs (both sounds vs. one sound)

---

## PHASE 6 — WELDED/GLUED SOUNDS

**Target Age**: 4-5 years  
**Duration**: 3-4 weeks  
**Prerequisite**: Phase 5 mastery

### Goals

- Teach sound units where vowel + consonant are so coarticulated they function as one
- Reduce cognitive load by treating these as single "chunks"
- Align with Wilson Reading System "welded sounds"

### What Makes a Sound "Welded"?

When certain vowels precede nasal consonants (/m/, /n/, /ŋ/), the vowel becomes nasalized and the boundary between vowel and consonant blurs. Treating them as units improves fluency.

### Welded Sound Units

| Unit | IPA | Description | Example Words | Audio Duration |
|------|-----|-------------|---------------|----------------|
| **am** | /æm/ | Nasalized short-a + m | am, ham, jam, slam, clam | 250-350ms (single unit) |
| **an** | /æn/ | Nasalized short-a + n | an, can, man, fan, plan | 250-350ms |
| **all** | /ɔːl/ | Slightly long vowel + dark l | all, ball, call, fall, tall | 300-400ms |
| **ang** | /æŋ/ | Nasalized a + velar nasal | bang, hang, sang, gang | 280-350ms |
| **ing** | /ɪŋ/ | High front vowel + velar nasal | ring, sing, king, thing | 250-320ms |
| **ong** | /ɒŋ/ | Back rounded vowel + velar nasal | song, long, gong, strong | 280-350ms |
| **ung** | /ʌŋ/ | Mid central vowel + velar nasal | hung, rung, sung, lung | 260-330ms |
| **ank** | /æŋk/ | Welded + stop | bank, tank, sank, thank | 280-350ms |
| **ink** | /ɪŋk/ | Welded + stop | sink, pink, think, drink | 260-330ms |
| **onk** | /ɒŋk/ | Welded + stop | honk, bonk, conk | 280-350ms |
| **unk** | /ʌŋk/ | Welded + stop | bunk, junk, skunk, chunk | 270-340ms |

### UX Implementation

```
Word: "sing"

┌─────────┬───────────────┐
│    s    │      ing      │
│  ONSET  │  WELDED UNIT  │
└─────────┴───────────────┘
   33%          67%

The "ing" is ONE zone, ONE audio sprite
Do NOT split into i + n + g
```

**Visual Design:**

- Welded units should appear as connected letter groups
- Consider visual "bracket" or underline connecting the letters
- Child learns: "these letters stick together"

### Word Lists

**-am family:** am, ham, jam, ram, yam, slam, clam, swam, tram

**-an family:** an, ban, can, fan, man, pan, ran, tan, van, bran, plan, scan, than

**-all family:** all, ball, call, fall, hall, mall, tall, wall, small, stall

**-ang family:** bang, fang, gang, hang, rang, sang, clang, slang

**-ing family:** bing, ding, king, ping, ring, sing, wing, zing, bring, cling, fling, sling, sting, swing, thing, spring, string

**-ong family:** bong, dong, gong, long, song, tong, along, prong, strong, throng

**-ung family:** bung, dung, hung, lung, rung, sung, clung, flung, slung, stung, swung, young

**-ank family:** bank, dank, hank, lank, rank, sank, tank, yank, blank, clank, crank, drank, frank, plank, prank, spank, thank

**-ink family:** bink, dink, fink, kink, link, mink, pink, rink, sink, wink, blink, brink, clink, drink, shrink, stink, think

**-unk family:** bunk, dunk, funk, gunk, hunk, junk, punk, sunk, chunk, drunk, flunk, plunk, shrunk, skunk, slunk, spunk, stunk, trunk

### Mastery Criteria

1. Recognize welded units as single sound chunks
2. Decode words containing welded sounds fluently
3. Produce the welded sound naturally (nasalized vowel flowing into nasal consonant)

---

## PHASE 7 — R-CONTROLLED VOWELS (BOSSY R)

**Target Age**: 4.5-5.5 years  
**Duration**: 4-6 weeks  
**Prerequisite**: Phase 6 mastery

### Goals

- Introduce vowels modified by following /r/
- Teach as single units (vowel + r = one sound)
- Address the most common spelling patterns

### The "Bossy R" Concept

When /r/ follows a vowel, it "controls" (modifies) the vowel sound. The result is neither the original vowel nor pure /r/, but a blended r-colored vowel.

### R-Controlled Vowel Units

| Spelling | Phoneme | IPA | Description | Example Words | Audio Duration |
|----------|---------|-----|-------------|---------------|----------------|
| **ar** | /är/ | /ɑɹ/ | Open back vowel + r, like "car" | car, far, star, hard, dark, park, shark | 300-400ms |
| **or** | /ôr/ | /ɔɹ/ | Rounded back vowel + r, like "for" | for, or, corn, born, storm, short, north | 300-400ms |
| **er** | /ûr/ | /ɜɹ/ | Mid central vowel + r, like "her" | her, fern, verb, term, herd, perch | 280-350ms |
| **ir** | /ûr/ | /ɜɹ/ | Same sound as "er" | sir, bird, firm, first, shirt, third, girl | 280-350ms |
| **ur** | /ûr/ | /ɜɹ/ | Same sound as "er" and "ir" | fur, burn, turn, curb, hurt, church, burst | 280-350ms |

### Critical Teaching Point: er/ir/ur Sound the Same

One of the trickiest aspects of English spelling: three different spellings for the same sound.

- "her" "bird" "fur" — all have /ɜɹ/
- Spelling must be memorized; sound doesn't distinguish them

**App approach:** Teach the sound first, then introduce all three spellings as "different ways to write the same sound."

### UX Implementation

```
Word: "star"

┌─────────┬─────────┬───────────────┐
│    s    │    t    │      ar       │
│  CONT   │  STOP   │  R-CONTROLLED │
└─────────┴─────────┴───────────────┘

"ar" is ONE zone playing ONE audio sprite
```

### Word Lists

**ar words:**
car, far, jar, tar, bar, star, scar, hard, card, yard, dark, park, bark, mark, shark, spark, smart, start, chart

**or words:**
or, for, nor, corn, horn, born, torn, worn, fork, pork, cork, sort, port, fort, short, sport, storm, north, forth

**er words:**
her, per, fern, term, verb, herd, nerd, jerk, perk, clerk, perch, stern

**ir words:**
sir, fir, stir, bird, girl, firm, first, third, shirt, skirt, dirt, birth, chirp, twirl

**ur words:**
fur, blur, slur, burn, turn, curb, curl, hurt, burst, churn, church, nurse, purse, curse, surf, turf

### Mastery Criteria

1. Recognize r-controlled patterns as single units
2. Produce the correct r-colored vowel sound
3. Decode novel r-controlled words accurately
4. Understand that er/ir/ur sound identical (spelling varies)

---

## PHASE 8 — LONG VOWELS + VOWEL TEAMS

**Target Age**: 5-6 years  
**Duration**: 8-12 weeks  
**Prerequisite**: Phase 7 mastery

### Goals

- Introduce long vowel sounds
- Teach multiple spelling patterns for each long vowel
- Cover magic-e, vowel teams, and open syllables

### Long Vowel Sounds

| Long Vowel | Sound | IPA | Toddler Cue |
|------------|-------|-----|-------------|
| ā | "ay" | /eɪ/ | "Say your name: aaaa" |
| ē | "ee" | /iː/ | "Weee! Like going down a slide" |
| ī | "eye" | /aɪ/ | "Look with your iiiii (eye)" |
| ō | "oh" | /oʊ/ | "Oh! What's that?" |
| ū | "you" | /juː/ or /uː/ | "You! I see youuuu" |

### Spelling Patterns: Magic E (Silent E / VCe)

The "magic e" at the end makes the vowel say its name.

| Pattern | Examples | UX Note |
|---------|----------|---------|
| a_e | cake, make, take, late, gate, plate, skate | Silent e zone plays silence |
| i_e | bike, like, time, dime, hide, ride, slide | Silent e zone plays silence |
| o_e | home, bone, cone, hope, rope, note, vote | Silent e zone plays silence |
| u_e | cube, tube, cute, mute, huge, fuse, use | Silent e zone plays silence |
| e_e | these, eve (rare) | |

### UX for Magic E Words

```
Word: "make"

┌────────┬────────┬────────┬────────┐
│   m    │   a    │   k    │   e    │
│  CONT  │  LONG  │  STOP  │ SILENT │
└────────┴────────┴────────┴────────┘

Sliding through "e" zone produces NO sound
Visual: "e" could be grayed/faded to show it's "magic" (silent)
The "a" zone plays /eɪ/ (long a), not /æ/ (short a)
```

### Vowel Teams

Two vowels together making one sound. Rule of thumb: "When two vowels go walking, the first one does the talking" (with many exceptions).

#### Long A Spellings

| Spelling | Words | Notes |
|----------|-------|-------|
| ai | rain, tail, mail, snail, train, brain | Middle of word |
| ay | day, say, play, stay, tray, spray | End of word/syllable |

#### Long E Spellings

| Spelling | Words | Notes |
|----------|-------|-------|
| ee | see, bee, tree, green, sleep, street | Very common |
| ea | sea, tea, read, clean, dream, steam | Common (but ea also says /ĕ/ in some words) |
| ey | key, monkey, turkey | End of word |
| y | happy, funny, baby, candy | End of multisyllable words |

#### Long I Spellings

| Spelling | Words | Notes |
|----------|-------|-------|
| i_e | bike, time, smile | Magic e |
| igh | high, night, light, bright, flight | Silent gh |
| y | my, by, fly, sky, try, dry | End of one-syllable words |
| ie | pie, tie, lie, die | Less common |

#### Long O Spellings

| Spelling | Words | Notes |
|----------|-------|-------|
| o_e | home, bone, hope | Magic e |
| oa | boat, coat, road, toast, float | Common |
| ow | snow, grow, show, flow, know | Also says /aʊ/ in "cow" |
| oe | toe, doe, hoe | Less common |

#### Long U Spellings

| Spelling | Words | Notes |
|----------|-------|-------|
| u_e | cube, tube, cute | Magic e, often /juː/ |
| ue | blue, true, glue | Often /uː/ |
| ew | new, few, drew, grew | Often /uː/ |
| oo | moon, soon, room, food | Long oo (vs. short in "book") |

### UX for Vowel Teams

```
Word: "boat"

┌────────┬───────────┬────────┐
│   b    │    oa     │   t    │
│  STOP  │  VOWEL    │  STOP  │
│        │  TEAM     │        │
└────────┴───────────┴────────┘

"oa" is ONE zone playing ONE /oʊ/ phoneme
The two letters are visually grouped
```

### Mastery Criteria

1. Decode magic-e words with correct long vowel
2. Recognize vowel teams as single-sound units
3. Handle the same sound with different spellings
4. Distinguish long vs. short vowel words (bit vs. bite)

---

## MASTER PHONEME LIST

### Audio Asset Requirements Summary

All recordings must be:

- **Format**: WAV (or high-quality MP3 for mobile optimization)
- **Sample rate**: 44.1 kHz
- **Channels**: Mono
- **Bit depth**: 16-bit minimum
- **No trailing schwa**: Clean cutoff
- **No room reverb**: Close-mic, dry recording
- **Consistent volume**: Normalize to -3dB peak

---

### SHORT VOWELS

| Phoneme | Spelling(s) | IPA | Description | Example Words | Duration |
|---------|-------------|-----|-------------|---------------|----------|
| /ă/ | a | /æ/ | Mouth open wide, tongue flat and low | cat, hat, map, sad | 250-300ms |
| /ĕ/ | e | /ɛ/ | Mouth slightly open, tongue mid-front | bed, red, ten, pet | 200-250ms |
| /ĭ/ | i | /ɪ/ | Mouth barely open, tongue high-front | sit, big, pin, lip | 180-220ms |
| /ŏ/ | o | /ɒ/ | Mouth round, tongue low-back | hot, pot, mom, top | 220-280ms |
| /ŭ/ | u | /ʌ/ | Mouth slightly open, tongue mid-central | cup, but, sun, mud | 200-250ms |

---

### LONG VOWELS

| Phoneme | Spellings | IPA | Description | Example Words | Duration |
|---------|-----------|-----|-------------|---------------|----------|
| /ā/ | a_e, ai, ay | /eɪ/ | Starts mid, glides to high-front | cake, rain, day | 300-400ms |
| /ē/ | ee, ea, e_e, y | /iː/ | High front, sustained | see, tea, happy | 300-380ms |
| /ī/ | i_e, igh, y | /aɪ/ | Starts low-central, glides to high-front | bike, high, my | 320-420ms |
| /ō/ | o_e, oa, ow | /oʊ/ | Starts mid-back, glides to high-back | home, boat, snow | 320-400ms |
| /ū/ | u_e, ue, ew | /juː/ or /uː/ | High back rounded (sometimes with /j/ onset) | cube, blue, new | 300-400ms |

---

### CONTINUOUS CONSONANTS

| Phoneme | Spelling(s) | IPA | Description | Example Words | Duration |
|---------|-------------|-----|-------------|---------------|----------|
| /m/ | m | /m/ | Lips together, nasal hum | mom, map, ham | 300-400ms |
| /n/ | n | /n/ | Tongue tip up, nasal hum | no, net, sun | 300-400ms |
| /s/ | s, ss, ce, ci | /s/ | Teeth together, hiss | sun, miss, city | 350-450ms |
| /f/ | f, ff, ph | /f/ | Top teeth on lower lip, blow | fun, off, phone | 300-400ms |
| /v/ | v | /v/ | Like /f/ but voiced | van, love | 300-400ms |
| /z/ | z, zz, s | /z/ | Like /s/ but voiced | zoo, buzz, is | 350-450ms |
| /l/ | l, ll | /l/ | Tongue tip up, air around sides | leg, bell | 300-400ms |
| /r/ | r, rr, wr | /ɹ/ | Tongue curled back, no contact | red, purr, write | 350-450ms |
| /h/ | h | /h/ | Open throat, breathy | hat, hello | 200-300ms |
| /w/ | w | /w/ | Rounded lips, glide | wet, swim | 200-300ms |
| /y/ | y | /j/ | Tongue high-front, glide | yes, you | 200-300ms |

---

### STOP CONSONANTS

| Phoneme | Spelling(s) | IPA | Description | Example Words | Duration |
|---------|-------------|-----|-------------|---------------|----------|
| /p/ | p, pp | /p/ | Lips pop, unvoiced | pan, happy | 50-70ms |
| /b/ | b, bb | /b/ | Lips pop, voiced | bat, rabbit | 60-80ms |
| /t/ | t, tt | /t/ | Tongue tip tap, unvoiced | top, butter | 60-80ms |
| /d/ | d, dd | /d/ | Tongue tip tap, voiced | dog, ladder | 70-90ms |
| /k/ | c, k, ck | /k/ | Back tongue click, unvoiced | cat, kid, back | 60-80ms |
| /g/ | g, gg | /g/ | Back tongue click, voiced | go, bigger | 70-90ms |

---

### DIGRAPHS

| Phoneme | Spelling | IPA | Description | Example Words | Duration |
|---------|----------|-----|-------------|---------------|----------|
| /sh/ | sh | /ʃ/ | Lips forward, continuous hush | ship, fish, wish | 350-450ms |
| /ch/ | ch, tch | /tʃ/ | Tongue tap releasing to /sh/ | chat, watch | 100-150ms |
| /th/ (unvoiced) | th | /θ/ | Tongue between teeth, blow air | thin, math | 300-400ms |
| /th/ (voiced) | th | /ð/ | Tongue between teeth, voice on | this, that, with | 300-400ms |
| /wh/ | wh | /ʍ/ | Breathy w (often merged with /w/) | when, what | 200-300ms |
| /ng/ | ng | /ŋ/ | Back of tongue to soft palate, nasal | ring, song | 280-350ms |
| /ph/ | ph | /f/ | Same as /f/ | phone, graph | 300-400ms |

---

### WELDED SOUNDS

| Unit | IPA | Description | Example Words | Duration |
|------|-----|-------------|---------------|----------|
| am | /æm/ | Nasalized a + m | ham, jam | 250-350ms |
| an | /æn/ | Nasalized a + n | can, man | 250-350ms |
| all | /ɔːl/ | Rounded vowel + dark l | ball, call | 300-400ms |
| ang | /æŋ/ | Nasalized a + ng | bang, hang | 280-350ms |
| ing | /ɪŋ/ | High vowel + ng | ring, sing | 250-320ms |
| ong | /ɒŋ/ | Back vowel + ng | song, long | 280-350ms |
| ung | /ʌŋ/ | Central vowel + ng | hung, sung | 260-330ms |
| ank | /æŋk/ | Welded + k | bank, thank | 280-350ms |
| ink | /ɪŋk/ | Welded + k | sink, think | 260-330ms |
| onk | /ɒŋk/ | Welded + k | honk, bonk | 280-350ms |
| unk | /ʌŋk/ | Welded + k | junk, skunk | 270-340ms |

---

### R-CONTROLLED VOWELS

| Unit | Spellings | IPA | Description | Example Words | Duration |
|------|-----------|-----|-------------|---------------|----------|
| ar | ar | /ɑɹ/ | Open back + r | car, star | 300-400ms |
| or | or | /ɔɹ/ | Rounded back + r | for, corn | 300-400ms |
| er | er, ir, ur | /ɜɹ/ | Central + r (all same sound) | her, bird, fur | 280-350ms |

---

### COMMON BLENDS (Pre-recorded Sprites Recommended)

| Blend | Type | IPA | Duration | Example Words |
|-------|------|-----|----------|---------------|
| bl | L-blend | /bl/ | 350-450ms | black, blue |
| cl | L-blend | /kl/ | 320-400ms | clap, class |
| fl | L-blend | /fl/ | 350-450ms | flag, flat |
| gl | L-blend | /gl/ | 350-450ms | glad, glass |
| pl | L-blend | /pl/ | 320-400ms | plan, play |
| sl | L-blend | /sl/ | 400-500ms | slam, sleep |
| br | R-blend | /bɹ/ | 380-480ms | brat, bring |
| cr | R-blend | /kɹ/ | 350-450ms | crab, crisp |
| dr | R-blend | /dɹ/ | 380-480ms | drag, drink |
| fr | R-blend | /fɹ/ | 400-500ms | frog, fresh |
| gr | R-blend | /gɹ/ | 380-480ms | grab, green |
| pr | R-blend | /pɹ/ | 350-450ms | prep, print |
| tr | R-blend | /tɹ/ | 350-450ms | trap, truck |
| sc/sk | S-blend | /sk/ | 350-450ms | scan, skip |
| sm | S-blend | /sm/ | 400-500ms | smash, smell |
| sn | S-blend | /sn/ | 400-500ms | snap, snack |
| sp | S-blend | /sp/ | 350-450ms | spin, spot |
| st | S-blend | /st/ | 350-450ms | stop, star |
| sw | S-blend | /sw/ | 350-450ms | swim, sweet |

---

## BLENDING ENGINE PROTOCOL

### 1. Audio File Specifications

```
Format: WAV (PCM) or AAC/MP3 320kbps
Sample Rate: 44,100 Hz
Channels: Mono
Bit Depth: 16-bit minimum, 24-bit preferred for processing headroom
Normalization: -3dB peak, -16 LUFS integrated loudness
```

### 2. Recording Guidelines for Phonemes

**For continuous consonants and vowels:**

- Record in isolation with clean attack and release
- Duration: 300-450ms for consonants, 200-300ms for short vowels
- NO schwa at end — fade to silence over final 30ms
- Consistent mouth-to-mic distance (6-8 inches)
- Record multiple takes, select the cleanest

**For stop consonants:**

- Record with immediate aspirated release
- Duration: 50-90ms total
- Hard cutoff at end — no trailing air
- Include ONLY the burst and immediate aspiration
- Test by looping — should not sound like "puh-puh-puh"

### 3. Blending Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER AUDIO BUFFER                       │
│  [Phoneme 1] → [Crossfade] → [Phoneme 2] → [Crossfade] → ...│
└─────────────────────────────────────────────────────────────┘
                              ↑
                    Finger position maps here
```

**Buffer Construction Process:**

1. Load phoneme WAVs for word (e.g., "sat" → /s/, /æ/, /t/)
2. Normalize each to consistent loudness
3. Concatenate with crossfade zones (30-40ms overlap)
4. Store as single buffer for scrubbing

### 4. Crossfade Implementation

```javascript
// Pseudocode for crossfade between phonemes
function crossfade(audio1, audio2, overlapMs = 35) {
  const overlapSamples = (overlapMs / 1000) * sampleRate;
  
  // Linear crossfade (or use equal-power for smoother transition)
  for (let i = 0; i < overlapSamples; i++) {
    const fadeOut = 1 - (i / overlapSamples);  // 1 → 0
    const fadeIn = i / overlapSamples;          // 0 → 1
    
    // Equal-power alternative:
    // const fadeOut = Math.cos(i / overlapSamples * Math.PI / 2);
    // const fadeIn = Math.sin(i / overlapSamples * Math.PI / 2);
    
    outputBuffer[i] = audio1[end - overlapSamples + i] * fadeOut 
                    + audio2[i] * fadeIn;
  }
}
```

### 5. Slider Position Mapping

```javascript
function mapSliderToPlayback(sliderPercent, wordPhonemes, totalBufferLength) {
  // Calculate which phoneme zone we're in
  const zoneWidth = 100 / wordPhonemes.length;
  const currentZone = Math.floor(sliderPercent / zoneWidth);
  const phoneme = wordPhonemes[currentZone];
  
  // Map to buffer position
  const bufferPosition = (sliderPercent / 100) * totalBufferLength;
  
  // Handle stops differently
  if (phoneme.isStop) {
    // Play full stop clip once when zone entered
    if (!phoneme.hasPlayed) {
      playStopPhoneme(phoneme);
      phoneme.hasPlayed = true;
    }
  } else {
    // Continuous: scrub through the waveform
    seekToPosition(bufferPosition);
    playFromPosition();
  }
}
```

### 6. Stop Consonant Special Handling

**Problem:** Stop consonants can't be stretched. If you try to slow-scrub through /t/, you can't hear 50% of /t/.

**Solution:** 

```javascript
function handleStopConsonant(phoneme, zone) {
  // Option A: Play full clip immediately when zone entered
  if (fingerEnteredZone && !alreadyPlayed) {
    playFullClip(phoneme.audio);
    alreadyPlayed = true;
  }
  
  // Option B: "Jump" effect — finger skips over the zone
  // The stop plays, then finger "lands" at start of next zone
  
  // Option C: Visual indicator that this is a "tap" zone
  // Zone is narrower and marked differently
}
```

**Recommended approach for toddlers:** Option A with visual feedback (zone "lights up" when tapped).

### 7. Digraph and Welded Sound Handling

These MUST play as single audio sprites:

```javascript
const digraphs = ['sh', 'ch', 'th', 'wh', 'ck', 'ng', 'ph'];
const weldedSounds = ['am', 'an', 'all', 'ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk'];
const rControlled = ['ar', 'or', 'er', 'ir', 'ur'];

function parseWordToPhonemes(word) {
  // Check for multi-letter units FIRST
  // e.g., "ship" → ['sh', 'i', 'p'], NOT ['s', 'h', 'i', 'p']
  
  // Priority order:
  // 1. Welded sounds (check if ending matches)
  // 2. R-controlled vowels
  // 3. Digraphs
  // 4. Single letters
}
```

### 8. Avoiding Schwa Contamination in Engine

**Recording QA checklist:**

- [ ] Play each consonant recording on loop — does it sound like "[consonant]-uh-[consonant]-uh"? If yes, re-record.
- [ ] Spectrogram check: No formant structure (vowel characteristics) at end of consonant files
- [ ] Listening test: Play random consonants to naive listener — can they identify without guessing the following vowel?

**Runtime protection:**

- Keep phoneme boundaries precise — no accidental overlap into schwa-like artifacts
- Crossfade should happen in the middle of the transition zone, not at the edge

### 9. Playback Speed Normalization

When finger moves slowly:

- Continuous phonemes: Stretch naturally (pitch may shift slightly — acceptable for toddler app)
- Or: Use time-stretching algorithm (preserves pitch, more complex)

When finger moves quickly:

- Compress proportionally
- Ensure minimum audibility threshold (each phoneme heard for at least 80ms)

### 10. Complete Word Playback Mode

For comprehension checks and modeling:

```javascript
function playWholeWord(word) {
  // Use pre-blended buffer
  const buffer = constructBlendedBuffer(word);
  
  // Play at natural speaking rate
  // Duration: approximately 100-150ms per phoneme
  playBuffer(buffer, {
    rate: 1.0,
    showHighlightMovingAcrossLetters: true
  });
}
```

---

## MVP WORD BANK

### First 50 Decodable Words

Sorted by introduction phase and phoneme load. All words use only phonemes taught up to that point.

---

### Phase 1 Words (m, s, a, t, p)

| # | Word | Phonemes | Pattern |
|---|------|----------|---------|
| 1 | am | /æ/ /m/ | VC |
| 2 | at | /æ/ /t/ | VC |
| 3 | ma | /m/ /æ/ | CV |
| 4 | pa | /p/ /æ/ | CV |
| 5 | sat | /s/ /æ/ /t/ | CVC |
| 6 | mat | /m/ /æ/ /t/ | CVC |
| 7 | pat | /p/ /æ/ /t/ | CVC |
| 8 | tap | /t/ /æ/ /p/ | CVC |
| 9 | map | /m/ /æ/ /p/ | CVC |
| 10 | sap | /s/ /æ/ /p/ | CVC |

---

### Phase 2 Words (add f, n, c, r)

| # | Word | Phonemes | Pattern |
|---|------|----------|---------|
| 11 | fan | /f/ /æ/ /n/ | CVC |
| 12 | man | /m/ /æ/ /n/ | CVC |
| 13 | can | /k/ /æ/ /n/ | CVC |
| 14 | ran | /r/ /æ/ /n/ | CVC |
| 15 | tan | /t/ /æ/ /n/ | CVC |
| 16 | pan | /p/ /æ/ /n/ | CVC |
| 17 | cat | /k/ /æ/ /t/ | CVC |
| 18 | rat | /r/ /æ/ /t/ | CVC |
| 19 | fat | /f/ /æ/ /t/ | CVC |
| 20 | nap | /n/ /æ/ /p/ | CVC |

---

### Phase 3 Words (add e, i, o, u vowels)

| # | Word | Phonemes | Pattern | Vowel |
|---|------|----------|---------|-------|
| 21 | pet | /p/ /ɛ/ /t/ | CVC | short e |
| 22 | set | /s/ /ɛ/ /t/ | CVC | short e |
| 23 | net | /n/ /ɛ/ /t/ | CVC | short e |
| 24 | men | /m/ /ɛ/ /n/ | CVC | short e |
| 25 | sit | /s/ /ɪ/ /t/ | CVC | short i |
| 26 | pit | /p/ /ɪ/ /t/ | CVC | short i |
| 27 | fin | /f/ /ɪ/ /n/ | CVC | short i |
| 28 | pin | /p/ /ɪ/ /n/ | CVC | short i |
| 29 | pot | /p/ /ɒ/ /t/ | CVC | short o |
| 30 | not | /n/ /ɒ/ /t/ | CVC | short o |
| 31 | mop | /m/ /ɒ/ /p/ | CVC | short o |
| 32 | top | /t/ /ɒ/ /p/ | CVC | short o |
| 33 | cup | /k/ /ʌ/ /p/ | CVC | short u |
| 34 | sun | /s/ /ʌ/ /n/ | CVC | short u |
| 35 | fun | /f/ /ʌ/ /n/ | CVC | short u |
| 36 | nut | /n/ /ʌ/ /t/ | CVC | short u |

---

### Phase 4 Words (add digraphs)

| # | Word | Phonemes | Pattern |
|---|------|----------|---------|
| 37 | ship | /ʃ/ /ɪ/ /p/ | CVC |
| 38 | shop | /ʃ/ /ɒ/ /p/ | CVC |
| 39 | shut | /ʃ/ /ʌ/ /t/ | CVC |
| 40 | chat | /tʃ/ /æ/ /t/ | CVC |
| 41 | chip | /tʃ/ /ɪ/ /p/ | CVC |
| 42 | math | /m/ /æ/ /θ/ | CVC |
| 43 | path | /p/ /æ/ /θ/ | CVC |
| 44 | this | /ð/ /ɪ/ /s/ | CVC |
| 45 | that | /ð/ /æ/ /t/ | CVC |

---

### Phase 5 Words (add blends)

| # | Word | Phonemes | Pattern |
|---|------|----------|---------|
| 46 | flag | /f/ /l/ /æ/ /g/ | CCVC |
| 47 | slip | /s/ /l/ /ɪ/ /p/ | CCVC |
| 48 | stop | /s/ /t/ /ɒ/ /p/ | CCVC |
| 49 | fast | /f/ /æ/ /s/ /t/ | CVCC |
| 50 | just | /dʒ/ /ʌ/ /s/ /t/ | CVCC |

---

### Word Selection Principles

1. **High-frequency vocabulary**: Words toddlers actually know and use
2. **Imageable**: Can be illustrated for comprehension checks
3. **No minimal pair confusion**: Avoided words too similar to others in same list
4. **Phonetically clean**: No irregular pronunciations
5. **Culturally neutral**: No potentially sensitive content

---

## CURRICULUM EXTENSION PLAN

### Progression Timeline (Approximate)

| Months | Phase | Focus | Exit Skill |
|--------|-------|-------|------------|
| 0-1 | Phase 0 | Pre-phonemic awareness | Isolate 4 sounds |
| 1-2 | Phase 1 | First phonemes + blending | Blend 3-phoneme CVC |
| 2-3 | Phase 2 | Consonant expansion | Blend with 9 consonants |
| 3-5 | Phase 3 | All short vowels | Decode any short-vowel CVC |
| 5-6 | Phase 4 | Digraphs | Decode digraph words |
| 6-8 | Phase 5 | Blends | Decode CCVC, CVCC |
| 8-9 | Phase 6 | Welded sounds | Recognize -ang, -ing, etc. |
| 9-11 | Phase 7 | R-controlled | Decode ar, or, er words |
| 11-15 | Phase 8 | Long vowels + teams | Decode VCe, vowel teams |

---

### When to Introduce Advanced Features

**Digraphs (Phase 4)**

- Introduce after short vowels are solid
- Start with /sh/ (highly distinctive, continuous)
- Add /ch/ (common, builds on /sh/)
- /th/ last (articulatorily challenging)

**Long Vowels (Phase 8)**

- Only after short vowels are automatic
- Start with magic-e (clear visual pattern)
- Vowel teams after magic-e is solid
- /ie/, /igh/, /oa/ before more ambiguous patterns

**Multi-Syllable Words (Post-Phase 8)**

- Introduce after all single-syllable patterns mastered
- Start with compound words (into = in + to)
- Then closed + closed (rabbit = rab + bit)
- Teach syllable division rules explicitly

---

### Scaling: Toddler → Early Reader

**Level 1: Sound Discovery (Ages 2-3)**

- Phases 0-1
- Focus: phoneme isolation, basic blending
- UX: large touch targets, minimal words per session

**Level 2: Word Builder (Ages 3-4)**

- Phases 2-4
- Focus: CVC mastery, digraph introduction
- UX: word family groupings, picture matching

**Level 3: Story Reader (Ages 4-5)**

- Phases 5-7
- Focus: blends, complex patterns, decodable sentences
- UX: sentence-level scrubbing, mini-stories

**Level 4: Independent Reader (Ages 5-6)**

- Phase 8 + extensions
- Focus: vowel teams, multi-syllable words
- UX: longer passages, reduced scaffolding

---

### Decodable Text Integration

After Phase 4 (approximately 40-50 sight words decodable):

- Introduce 2-3 word sentences
- "The cat sat." / "A man ran."
- Finger-scrub word-by-word, then whole sentence

After Phase 6:

- 4-6 word sentences
- Simple decodable stories (3-5 sentences)
- "The fat cat sat on a mat. The rat ran. The cat ran at the rat."

After Phase 8:

- Full decodable books
- Integrate with fluency-building activities
- Transition from scrub-reading to smooth reading

---

### Assessment & Progress Tracking

**Per-Session Metrics:**

- Accuracy (% correct blends)
- Latency (time to complete word)
- Independence (blends without model)
- Regression detection (previously mastered sounds)

**Mastery Flags:**

- Phoneme: recognized and produced on 5 consecutive attempts
- Word: decoded correctly on 3 different sessions
- Pattern: generalized to novel words containing pattern

**Remediation Triggers:**

- <70% accuracy on previously mastered content → review
- 3+ errors on same phoneme → isolated practice
- Slow progress on new phase → extend current phase duration

---

## APPENDIX A: COMMON PITFALLS TO AVOID

### 1. Schwa Insertion

**Bad:** Recording /t/ as "tuh"
**Why it matters:** Children learn to insert schwa between all consonants, breaking blending
**Fix:** Re-record with pure aspirated release

### 2. Digraph Splitting

**Bad:** Treating "sh" as /s/ + /h/
**Why it matters:** "ship" becomes "s-hip" (nonsense)
**Fix:** Always parse digraphs as single units in engine

### 3. Stop Consonant Stretching

**Bad:** Trying to slow-play /p/ over 500ms
**Why it matters:** Unnatural, distorted, unrecognizable
**Fix:** Play full clip once; handle via UX (zone tap, not stretch)

### 4. Inconsistent Articulation Cues

**Bad:** Describing /r/ as "tongue curled" one time, "growling" another
**Why it matters:** Confuses children's motor memory
**Fix:** Use consistent language throughout app and parent guides

### 5. Dialect Mismatches

**Bad:** Recording with one accent, targeting users with another
**Why it matters:** "cot-caught merger" means /ɒ/ and /ɔ/ sound identical to some children
**Fix:** Consider regional variants OR use clearly distinctive vowels

---

## APPENDIX B: PARENT/CAREGIVER GUIDANCE SCRIPT

### What Parents Should Know

"This app teaches your child to read by connecting sounds to letters. Your child will slide their finger across letters and hear the sounds blend together into words.

**How to help:**

1. **Model the sounds correctly** — When you hear /m/, say 'mmmm' not 'muh'. No 'uh' after consonants!

2. **Slow it down** — Let your child slide slowly. The sounds stretch. That's good!

3. **Celebrate the blend** — When they slide and hear 'sssaaaaat... sat!' celebrate recognizing the word.

4. **Don't rush** — Mastery takes weeks. Repeat the same words until automatic.

5. **Make it fun** — 5 minutes of joyful practice beats 20 minutes of frustration."

---

## APPENDIX C: TECHNICAL GLOSSARY

| Term | Definition |
|------|------------|
| **Phoneme** | The smallest unit of sound that distinguishes meaning (/k/ vs /b/ in "cat" vs "bat") |
| **Grapheme** | The letter(s) representing a phoneme ("sh" represents /ʃ/) |
| **CVC** | Consonant-Vowel-Consonant word pattern (cat, dog, sun) |
| **Blend** | Two consonants where both sounds are heard (bl, st, cr) |
| **Digraph** | Two letters making one sound (sh, ch, th) |
| **Continuous consonant** | Sound that can be sustained (/m/, /s/, /f/) |
| **Stop consonant** | Sound with instant release, cannot be held (/p/, /t/, /k/) |
| **Schwa** | The "uh" sound; the most common vowel in English, often unstressed |
| **Coarticulation** | How adjacent sounds influence each other's pronunciation |
| **Crossfade** | Audio technique for smooth transition between clips |
| **Welded sound** | Vowel-consonant combination treated as single unit (/ang/, /ing/) |
| **R-controlled vowel** | Vowel modified by following /r/ (ar, or, er) |
| **Magic-e / Silent-e** | Final 'e' that signals long vowel (make, bike, home) |
| **Vowel team** | Two vowels representing one sound (ai, oa, ee) |

---

*Document Version: 2.0*
*Created for: SageNet Finger-Scrub Reading App*
*Framework: Wilson-aligned, Orton-Gillingham-influenced*
*Target Users: Toddlers and Early Emergent Readers (Ages 2-6)*
