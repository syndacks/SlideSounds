# SOUND ENGINE STRATEGY

## Complete Audio Asset Specification & Word Mapping System

---

> **📌 COMPANION DOCUMENT**  
> This is a companion document to `phonics-adventure-implementation-handoff.md`, which serves as the primary implementation guide.  
> **All Python code in this document is PSEUDOCODE** — it demonstrates logic and algorithms. Implement equivalent functionality in TypeScript/Rust using idiomatic patterns.

---

## PART 1: ARCHITECTURE OVERVIEW

### The Core Problem

Given any decodable word (e.g., "ship", "strong", "thinking"), we need to:

1. **Parse** it into sound units (grapheme-to-phoneme mapping)
2. **Load** the corresponding .wav files
3. **Blend** them into a scrrubbable audio buffer
4. **Map** finger position to playback position

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Digraphs | Pre-recorded as single units | Cannot be split; coarticulation matters |
| Welded sounds | Pre-recorded as single units | Nasalization requires unified recording |
| R-controlled vowels | Pre-recorded as single units | Vowel coloring inseparable from /r/ |
| Common blends | Pre-recorded as single units | Smoother coarticulation, worth the asset cost |
| Rare blends | Dynamic concatenation | Edge cases not worth pre-recording |
| Long vowels | Separate from short vowels | Different durations and formants |
| Magic-e | Silence file for 'e' zone | Visual zone exists but plays nothing |

---

## PART 2: COMPLETE AUDIO ASSET LIST

### Summary Counts

| Category | Count | Notes |
|----------|-------|-------|
| Short vowels | 5 | a, e, i, o, u |
| Long vowels | 5 | ā, ē, ī, ō, ū |
| Continuous consonants | 11 | m, n, s, f, v, z, l, r, h, w, y |
| Stop consonants | 6 | p, b, t, d, k, g |
| Digraphs | 8 | sh, ch, th (×2), wh, ng, ck, ph |
| Welded sounds | 11 | am, an, all, ang, ing, ong, ung, ank, ink, onk, unk |
| R-controlled | 5 | ar, or, er, ir, ur |
| Vowel teams | 14 | ai, ay, ee, ea, ey, oa, ow, oe, ie, igh, ue, ew, oo, ou |
| Common blends | 26 | L-blends, R-blends, S-blends |
| Special | 2 | silence, schwa (for unstressed syllables later) |
| **TOTAL** | **93** | Core asset library |

---

### ASSET LIST: SHORT VOWELS

| Filename | Phoneme | IPA | Duration | Recording Notes |
|----------|---------|-----|----------|-----------------|
| `v_short_a.wav` | /ă/ | /æ/ | 250-300ms | Mouth wide open, tongue low and flat. "ah" as in "cat" |
| `v_short_e.wav` | /ĕ/ | /ɛ/ | 200-250ms | Mouth slightly open, tongue mid-front. "eh" as in "bed" |
| `v_short_i.wav` | /ĭ/ | /ɪ/ | 180-220ms | Mouth barely open, tongue high-front. "ih" as in "sit" |
| `v_short_o.wav` | /ŏ/ | /ɒ/ | 220-280ms | Mouth round and open, tongue low-back. "ah" as in "hot" |
| `v_short_u.wav` | /ŭ/ | /ʌ/ | 200-250ms | Mouth slightly open, tongue mid-central. "uh" as in "cup" |

---

### ASSET LIST: LONG VOWELS

| Filename | Phoneme | IPA | Duration | Recording Notes |
|----------|---------|-----|----------|-----------------|
| `v_long_a.wav` | /ā/ | /eɪ/ | 300-400ms | Diphthong: starts mid, glides to high-front. "ay" as in "cake" |
| `v_long_e.wav` | /ē/ | /iː/ | 300-380ms | High front, sustained. "ee" as in "see" |
| `v_long_i.wav` | /ī/ | /aɪ/ | 320-420ms | Diphthong: starts low-central, glides up. "eye" as in "bike" |
| `v_long_o.wav` | /ō/ | /oʊ/ | 320-400ms | Diphthong: starts mid-back, glides higher. "oh" as in "home" |
| `v_long_u.wav` | /ū/ | /uː/ | 300-400ms | High back rounded. "oo" as in "blue" |

---

### ASSET LIST: CONTINUOUS CONSONANTS

| Filename | Phoneme | IPA | Duration | Recording Notes |
|----------|---------|-----|----------|-----------------|
| `c_m.wav` | /m/ | /m/ | 300-400ms | Lips together, nasal hum. NO "muh" — pure hum, fade out cleanly |
| `c_n.wav` | /n/ | /n/ | 300-400ms | Tongue tip behind top teeth, nasal hum. NO "nuh" |
| `c_s.wav` | /s/ | /s/ | 350-450ms | Teeth together, air through center. Pure hiss, no vowel |
| `c_f.wav` | /f/ | /f/ | 300-400ms | Top teeth on lower lip, blow. Sustained friction |
| `c_v.wav` | /v/ | /v/ | 300-400ms | Like /f/ but with voice. Feel throat vibration |
| `c_z.wav` | /z/ | /z/ | 350-450ms | Like /s/ but with voice. Buzzy hiss |
| `c_l.wav` | /l/ | /l/ | 300-400ms | Tongue tip up, air flows around sides |
| `c_r.wav` | /r/ | /ɹ/ | 350-450ms | Tongue curled back, doesn't touch roof. Growly |
| `c_h.wav` | /h/ | /h/ | 200-300ms | Open throat, breathy exhale. Very light |
| `c_w.wav` | /w/ | /w/ | 200-300ms | Rounded lips, quick glide. Not "wuh" |
| `c_y.wav` | /j/ | /j/ | 200-300ms | Tongue high-front, quick glide. Not "yuh" |

---

### ASSET LIST: STOP CONSONANTS

| Filename | Phoneme | IPA | Duration | Recording Notes |
|----------|---------|-----|----------|-----------------|
| `c_p.wav` | /p/ | /p/ | 50-70ms | Lips pop apart. JUST the burst + aspiration. NO "puh" |
| `c_b.wav` | /b/ | /b/ | 60-80ms | Lips pop, voiced. Slightly longer than /p/ |
| `c_t.wav` | /t/ | /t/ | 60-80ms | Tongue tip tap behind teeth. Crisp aspirated release only |
| `c_d.wav` | /d/ | /d/ | 70-90ms | Tongue tip tap, voiced. NO "duh" |
| `c_k.wav` | /k/ | /k/ | 60-80ms | Back of tongue clicks soft palate. Quick release |
| `c_g.wav` | /g/ | /g/ | 70-90ms | Back of tongue click, voiced. NO "guh" |

**CRITICAL for stops:** These files must be EXTREMELY short. Test by looping — if it sounds like "puh-puh-puh", re-record.

---

### ASSET LIST: DIGRAPHS

| Filename | Grapheme | Phoneme | IPA | Duration | Recording Notes |
|----------|----------|---------|-----|----------|-----------------|
| `d_sh.wav` | sh | /ʃ/ | /ʃ/ | 350-450ms | Lips pushed forward, continuous "shhhh" |
| `d_ch.wav` | ch | /tʃ/ | /tʃ/ | 100-150ms | Starts like /t/, releases into /ʃ/. Single gesture |
| `d_th_unvoiced.wav` | th | /θ/ | /θ/ | 300-400ms | Tongue between teeth, blow air. No voice |
| `d_th_voiced.wav` | th | /ð/ | /ð/ | 300-400ms | Tongue between teeth, voice ON. Buzzy |
| `d_wh.wav` | wh | /ʍ/ | /ʍ/ | 200-300ms | Breathy w. (If dialect merges with /w/, use /w/) |
| `d_ng.wav` | ng | /ŋ/ | /ŋ/ | 280-350ms | Back of tongue to soft palate, nasal |
| `d_ck.wav` | ck | /k/ | /k/ | 60-80ms | Same as /k/ — only used after short vowels |
| `d_ph.wav` | ph | /f/ | /f/ | 300-400ms | Same as /f/ — alternate spelling |

---

### ASSET LIST: WELDED SOUNDS

| Filename | Grapheme | IPA | Duration | Recording Notes |
|----------|----------|-----|----------|-----------------|
| `w_am.wav` | am | /æm/ | 250-350ms | Nasalized vowel flowing into /m/. Single unit |
| `w_an.wav` | an | /æn/ | 250-350ms | Nasalized vowel flowing into /n/. Single unit |
| `w_all.wav` | all | /ɔːl/ | 300-400ms | Rounded vowel + dark /l/. Single unit |
| `w_ang.wav` | ang | /æŋ/ | 280-350ms | Nasalized vowel + velar nasal |
| `w_ing.wav` | ing | /ɪŋ/ | 250-320ms | High vowel + velar nasal |
| `w_ong.wav` | ong | /ɒŋ/ | 280-350ms | Back vowel + velar nasal |
| `w_ung.wav` | ung | /ʌŋ/ | 260-330ms | Central vowel + velar nasal |
| `w_ank.wav` | ank | /æŋk/ | 280-350ms | Welded + final stop |
| `w_ink.wav` | ink | /ɪŋk/ | 260-330ms | Welded + final stop |
| `w_onk.wav` | onk | /ɒŋk/ | 280-350ms | Welded + final stop |
| `w_unk.wav` | unk | /ʌŋk/ | 270-340ms | Welded + final stop |

---

### ASSET LIST: R-CONTROLLED VOWELS

| Filename | Grapheme | IPA | Duration | Recording Notes |
|----------|----------|-----|----------|-----------------|
| `r_ar.wav` | ar | /ɑɹ/ | 300-400ms | Open back vowel colored by /r/. "ar" as in "car" |
| `r_or.wav` | or | /ɔɹ/ | 300-400ms | Rounded back vowel + /r/. "or" as in "for" |
| `r_er.wav` | er | /ɜɹ/ | 280-350ms | Central vowel + /r/. "er" as in "her" |
| `r_ir.wav` | ir | /ɜɹ/ | 280-350ms | Same sound as "er". "ir" as in "bird" |
| `r_ur.wav` | ur | /ɜɹ/ | 280-350ms | Same sound as "er". "ur" as in "fur" |

**Note:** er/ir/ur are phonetically identical. You could use ONE recording for all three, but having separate files allows for future dialect variants.

---

### ASSET LIST: VOWEL TEAMS

| Filename | Grapheme | Phoneme | IPA | Duration | Recording Notes |
|----------|----------|---------|-----|----------|-----------------|
| `vt_ai.wav` | ai | /ā/ | /eɪ/ | 300-400ms | Long a sound. Same as `v_long_a.wav` |
| `vt_ay.wav` | ay | /ā/ | /eɪ/ | 300-400ms | Long a sound. Same as `v_long_a.wav` |
| `vt_ee.wav` | ee | /ē/ | /iː/ | 300-380ms | Long e sound. Same as `v_long_e.wav` |
| `vt_ea.wav` | ea | /ē/ | /iː/ | 300-380ms | Long e sound (primary). Same as `v_long_e.wav` |
| `vt_ey.wav` | ey | /ē/ | /iː/ | 300-380ms | Long e sound. As in "key" |
| `vt_oa.wav` | oa | /ō/ | /oʊ/ | 320-400ms | Long o sound. Same as `v_long_o.wav` |
| `vt_ow_long.wav` | ow | /ō/ | /oʊ/ | 320-400ms | Long o sound. As in "snow" |
| `vt_ow_diphthong.wav` | ow | /ou/ | /aʊ/ | 320-400ms | Diphthong. As in "cow" |
| `vt_oe.wav` | oe | /ō/ | /oʊ/ | 320-400ms | Long o sound. As in "toe" |
| `vt_ie.wav` | ie | /ī/ | /aɪ/ | 320-420ms | Long i sound. As in "pie" |
| `vt_igh.wav` | igh | /ī/ | /aɪ/ | 320-420ms | Long i sound. As in "high" |
| `vt_ue.wav` | ue | /ū/ | /uː/ | 300-400ms | Long u sound. As in "blue" |
| `vt_ew.wav` | ew | /ū/ | /uː/ | 300-400ms | Long u sound. As in "new" |
| `vt_oo_long.wav` | oo | /ū/ | /uː/ | 300-400ms | Long oo. As in "moon" |
| `vt_oo_short.wav` | oo | /ʊ/ | /ʊ/ | 200-280ms | Short oo. As in "book" |
| `vt_ou.wav` | ou | /ou/ | /aʊ/ | 320-400ms | Diphthong. As in "out" |

**Note on duplicates:** Many vowel teams produce the same phoneme (ai/ay both = long a). You can:
- Option A: Use identical recordings with different filenames (simpler mapping)
- Option B: Use one recording, alias in code (smaller asset size)

---

### ASSET LIST: COMMON BLENDS (Pre-recorded)

#### L-Blends

| Filename | Grapheme | IPA | Duration |
|----------|----------|-----|----------|
| `bl_bl.wav` | bl | /bl/ | 350-450ms |
| `bl_cl.wav` | cl | /kl/ | 320-400ms |
| `bl_fl.wav` | fl | /fl/ | 350-450ms |
| `bl_gl.wav` | gl | /gl/ | 350-450ms |
| `bl_pl.wav` | pl | /pl/ | 320-400ms |
| `bl_sl.wav` | sl | /sl/ | 400-500ms |

#### R-Blends

| Filename | Grapheme | IPA | Duration |
|----------|----------|-----|----------|
| `bl_br.wav` | br | /bɹ/ | 380-480ms |
| `bl_cr.wav` | cr | /kɹ/ | 350-450ms |
| `bl_dr.wav` | dr | /dɹ/ | 380-480ms |
| `bl_fr.wav` | fr | /fɹ/ | 400-500ms |
| `bl_gr.wav` | gr | /gɹ/ | 380-480ms |
| `bl_pr.wav` | pr | /pɹ/ | 350-450ms |
| `bl_tr.wav` | tr | /tɹ/ | 350-450ms |

#### S-Blends (Initial)

| Filename | Grapheme | IPA | Duration |
|----------|----------|-----|----------|
| `bl_sc.wav` | sc | /sk/ | 350-450ms |
| `bl_sk.wav` | sk | /sk/ | 350-450ms |
| `bl_sm.wav` | sm | /sm/ | 400-500ms |
| `bl_sn.wav` | sn | /sn/ | 400-500ms |
| `bl_sp.wav` | sp | /sp/ | 350-450ms |
| `bl_st.wav` | st | /st/ | 350-450ms |
| `bl_sw.wav` | sw | /sw/ | 350-450ms |

#### End Blends

| Filename | Grapheme | IPA | Duration |
|----------|----------|-----|----------|
| `bl_ft.wav` | ft | /ft/ | 250-350ms |
| `bl_lt.wav` | lt | /lt/ | 280-380ms |
| `bl_mp.wav` | mp | /mp/ | 280-380ms |
| `bl_nd.wav` | nd | /nd/ | 280-380ms |
| `bl_sk_end.wav` | sk | /sk/ | 250-350ms |
| `bl_st_end.wav` | st | /st/ | 250-350ms |

---

### ASSET LIST: SPECIAL

| Filename | Purpose | Duration | Notes |
|----------|---------|----------|-------|
| `x_silence.wav` | Silent-e zone | 100ms | Pure silence. Used for magic-e |
| `x_schwa.wav` | Unstressed syllables | 80-120ms | Neutral "uh". For multisyllable words later |

---

## PART 3: WORD-TO-PHONEME MAPPING ALGORITHM

### The Parsing Problem

English spelling is not 1:1 with sounds. We need a **priority-ordered tokenizer** that:

1. Identifies multi-letter units FIRST (longest match wins)
2. Falls back to single letters
3. Handles special patterns (magic-e, vowel contexts)

### Parsing Priority Order

```
PRIORITY 1: Welded endings (check if word ENDS with these)
           → ank, ink, onk, unk, ang, ing, ong, ung, all, am, an

PRIORITY 2: Vowel teams (two-letter vowel combinations)
           → igh, eigh, ough, augh (trigraphs first!)
           → ai, ay, ee, ea, ey, oa, ow, oe, ie, ue, ew, oo, ou

PRIORITY 3: R-controlled vowels
           → ar, or, er, ir, ur

PRIORITY 4: Consonant digraphs
           → sh, ch, th, wh, ng, ck, ph

PRIORITY 5: Consonant blends (check both beginning and end)
           → bl, cl, fl, gl, pl, sl, br, cr, dr, fr, gr, pr, tr
           → sc, sk, sm, sn, sp, st, sw
           → ft, lt, mp, nd

PRIORITY 6: Magic-e detection
           → If word matches pattern: [consonant][vowel][consonant]e
           → Mark vowel as LONG, mark final e as SILENT

PRIORITY 7: Single letters (default fallback)
           → Map each remaining letter to its phoneme
```

### Pseudocode: Word Parser

```python
def parse_word_to_phonemes(word):
    """
    Parse a word into a list of phoneme units.
    Returns list of tuples: (grapheme, phoneme_file, is_stop)
    """
    word = word.lower()
    phonemes = []
    i = 0
    
    # Pre-check for magic-e pattern
    is_magic_e = detect_magic_e(word)
    if is_magic_e:
        magic_e_vowel_index = is_magic_e['vowel_index']
    
    while i < len(word):
        matched = False
        
        # Try longest matches first (up to 4 chars for 'ough', 'eigh')
        for length in [4, 3, 2]:
            if i + length <= len(word):
                chunk = word[i:i+length]
                
                # Check welded sounds (only at word END)
                if i + length == len(word) and chunk in WELDED_SOUNDS:
                    phonemes.append({
                        'grapheme': chunk,
                        'file': WELDED_SOUNDS[chunk],
                        'is_stop': False,
                        'is_unit': True
                    })
                    i += length
                    matched = True
                    break
                
                # Check vowel teams
                if chunk in VOWEL_TEAMS:
                    phonemes.append({
                        'grapheme': chunk,
                        'file': VOWEL_TEAMS[chunk],
                        'is_stop': False,
                        'is_unit': True
                    })
                    i += length
                    matched = True
                    break
                
                # Check r-controlled (only 2 chars)
                if length == 2 and chunk in R_CONTROLLED:
                    phonemes.append({
                        'grapheme': chunk,
                        'file': R_CONTROLLED[chunk],
                        'is_stop': False,
                        'is_unit': True
                    })
                    i += length
                    matched = True
                    break
                
                # Check digraphs (only 2 chars)
                if length == 2 and chunk in DIGRAPHS:
                    phonemes.append({
                        'grapheme': chunk,
                        'file': get_digraph_file(chunk, word, i),
                        'is_stop': chunk == 'ch',  # ch is stop-like
                        'is_unit': True
                    })
                    i += length
                    matched = True
                    break
                
                # Check blends (only 2 chars)
                if length == 2 and chunk in BLENDS:
                    phonemes.append({
                        'grapheme': chunk,
                        'file': BLENDS[chunk],
                        'is_stop': False,
                        'is_unit': True
                    })
                    i += length
                    matched = True
                    break
        
        if matched:
            continue
        
        # Single character fallback
        char = word[i]
        
        # Handle magic-e
        if is_magic_e and i == len(word) - 1 and char == 'e':
            phonemes.append({
                'grapheme': 'e',
                'file': 'x_silence.wav',
                'is_stop': False,
                'is_silent': True
            })
            i += 1
            continue
        
        # Handle vowels
        if char in 'aeiou':
            if is_magic_e and i == magic_e_vowel_index:
                # Long vowel due to magic-e
                phonemes.append({
                    'grapheme': char,
                    'file': LONG_VOWELS[char],
                    'is_stop': False
                })
            else:
                # Short vowel
                phonemes.append({
                    'grapheme': char,
                    'file': SHORT_VOWELS[char],
                    'is_stop': False
                })
            i += 1
            continue
        
        # Handle consonants
        if char in CONSONANTS:
            phonemes.append({
                'grapheme': char,
                'file': CONSONANTS[char]['file'],
                'is_stop': CONSONANTS[char]['is_stop']
            })
            i += 1
            continue
        
        # Unknown character (skip or error)
        i += 1
    
    return phonemes


def detect_magic_e(word):
    """
    Detect if word follows magic-e pattern: CVCe
    Returns dict with vowel_index or False
    """
    if len(word) < 4:
        return False
    if word[-1] != 'e':
        return False
    if word[-2] not in CONSONANTS:
        return False
    
    # Find the vowel before the final consonant
    for i in range(len(word) - 3, -1, -1):
        if word[i] in 'aeiou':
            # Check there's a consonant before the vowel
            if i > 0 and word[i-1] in CONSONANTS:
                return {'vowel_index': i}
            elif i == 0:
                # Word starts with vowel (rare for magic-e)
                return False
    return False
```

### Lookup Tables (Data Structures)

```python
SHORT_VOWELS = {
    'a': 'v_short_a.wav',
    'e': 'v_short_e.wav',
    'i': 'v_short_i.wav',
    'o': 'v_short_o.wav',
    'u': 'v_short_u.wav',
}

LONG_VOWELS = {
    'a': 'v_long_a.wav',
    'e': 'v_long_e.wav',
    'i': 'v_long_i.wav',
    'o': 'v_long_o.wav',
    'u': 'v_long_u.wav',
}

CONSONANTS = {
    'm': {'file': 'c_m.wav', 'is_stop': False},
    'n': {'file': 'c_n.wav', 'is_stop': False},
    's': {'file': 'c_s.wav', 'is_stop': False},
    'f': {'file': 'c_f.wav', 'is_stop': False},
    'v': {'file': 'c_v.wav', 'is_stop': False},
    'z': {'file': 'c_z.wav', 'is_stop': False},
    'l': {'file': 'c_l.wav', 'is_stop': False},
    'r': {'file': 'c_r.wav', 'is_stop': False},
    'h': {'file': 'c_h.wav', 'is_stop': False},
    'w': {'file': 'c_w.wav', 'is_stop': False},
    'y': {'file': 'c_y.wav', 'is_stop': False},
    'p': {'file': 'c_p.wav', 'is_stop': True},
    'b': {'file': 'c_b.wav', 'is_stop': True},
    't': {'file': 'c_t.wav', 'is_stop': True},
    'd': {'file': 'c_d.wav', 'is_stop': True},
    'k': {'file': 'c_k.wav', 'is_stop': True},
    'c': {'file': 'c_k.wav', 'is_stop': True},  # hard c = /k/
    'g': {'file': 'c_g.wav', 'is_stop': True},
    'j': {'file': 'd_j.wav', 'is_stop': True},  # /dʒ/ - add this
    'x': {'file': 'c_x.wav', 'is_stop': True},  # /ks/ - special case
    'q': {'file': 'c_k.wav', 'is_stop': True},  # always with 'u'
}

DIGRAPHS = {
    'sh': 'd_sh.wav',
    'ch': 'd_ch.wav',
    'th': 'd_th_unvoiced.wav',  # default; context may override
    'wh': 'd_wh.wav',
    'ng': 'd_ng.wav',
    'ck': 'd_ck.wav',
    'ph': 'd_ph.wav',
}

# Words where 'th' is voiced (partial list - expand as needed)
VOICED_TH_WORDS = {'the', 'this', 'that', 'them', 'then', 'there', 'these', 
                   'those', 'they', 'their', 'with', 'other', 'mother', 
                   'father', 'brother', 'weather', 'together'}

WELDED_SOUNDS = {
    'am': 'w_am.wav',
    'an': 'w_an.wav',
    'all': 'w_all.wav',
    'ang': 'w_ang.wav',
    'ing': 'w_ing.wav',
    'ong': 'w_ong.wav',
    'ung': 'w_ung.wav',
    'ank': 'w_ank.wav',
    'ink': 'w_ink.wav',
    'onk': 'w_onk.wav',
    'unk': 'w_unk.wav',
}

R_CONTROLLED = {
    'ar': 'r_ar.wav',
    'or': 'r_or.wav',
    'er': 'r_er.wav',
    'ir': 'r_ir.wav',
    'ur': 'r_ur.wav',
}

VOWEL_TEAMS = {
    'ai': 'vt_ai.wav',
    'ay': 'vt_ay.wav',
    'ee': 'vt_ee.wav',
    'ea': 'vt_ea.wav',
    'ey': 'vt_ey.wav',
    'oa': 'vt_oa.wav',
    'ow': 'vt_ow_long.wav',  # default to long; context may override
    'oe': 'vt_oe.wav',
    'ie': 'vt_ie.wav',
    'igh': 'vt_igh.wav',
    'ue': 'vt_ue.wav',
    'ew': 'vt_ew.wav',
    'oo': 'vt_oo_long.wav',  # default to long; override for 'book', 'good'
    'ou': 'vt_ou.wav',
}

BLENDS = {
    # L-blends
    'bl': 'bl_bl.wav',
    'cl': 'bl_cl.wav',
    'fl': 'bl_fl.wav',
    'gl': 'bl_gl.wav',
    'pl': 'bl_pl.wav',
    'sl': 'bl_sl.wav',
    # R-blends
    'br': 'bl_br.wav',
    'cr': 'bl_cr.wav',
    'dr': 'bl_dr.wav',
    'fr': 'bl_fr.wav',
    'gr': 'bl_gr.wav',
    'pr': 'bl_pr.wav',
    'tr': 'bl_tr.wav',
    # S-blends
    'sc': 'bl_sc.wav',
    'sk': 'bl_sk.wav',
    'sm': 'bl_sm.wav',
    'sn': 'bl_sn.wav',
    'sp': 'bl_sp.wav',
    'st': 'bl_st.wav',
    'sw': 'bl_sw.wav',
    # End blends
    'ft': 'bl_ft.wav',
    'lt': 'bl_lt.wav',
    'mp': 'bl_mp.wav',
    'nd': 'bl_nd.wav',
}
```

### Context-Sensitive Rules

Some graphemes have multiple pronunciations. Handle with lookup tables:

```python
# Words where 'ow' says /aʊ/ (as in "cow") instead of /oʊ/ (as in "snow")
OW_DIPHTHONG_WORDS = {'cow', 'how', 'now', 'bow', 'wow', 'down', 'town', 
                       'brown', 'crown', 'frown', 'gown', 'clown', 'crowd',
                       'loud', 'cloud', 'proud', 'out', 'about', 'shout'}

# Words where 'oo' says /ʊ/ (as in "book") instead of /uː/ (as in "moon")
OO_SHORT_WORDS = {'book', 'look', 'cook', 'hook', 'took', 'good', 'wood',
                  'hood', 'stood', 'foot', 'wool', 'brook', 'crook', 'shook'}

# Words where 'ea' says /ɛ/ (as in "bread") instead of /iː/ (as in "read")
EA_SHORT_WORDS = {'bread', 'head', 'dead', 'read', 'spread', 'thread', 
                  'breath', 'death', 'health', 'wealth', 'meant', 'sweat',
                  'threat', 'instead', 'breakfast', 'heaven', 'heavy'}

def get_vowel_team_file(grapheme, word):
    """Return correct audio file based on word context"""
    if grapheme == 'ow' and word in OW_DIPHTHONG_WORDS:
        return 'vt_ow_diphthong.wav'
    if grapheme == 'oo' and word in OO_SHORT_WORDS:
        return 'vt_oo_short.wav'
    if grapheme == 'ea' and word in EA_SHORT_WORDS:
        return 'v_short_e.wav'  # Just use short e
    return VOWEL_TEAMS.get(grapheme)

def get_digraph_file(grapheme, word, position):
    """Return correct audio file for digraph based on context"""
    if grapheme == 'th':
        if word in VOICED_TH_WORDS:
            return 'd_th_voiced.wav'
        # Also voiced when 'th' is between vowels (e.g., "mother")
        if position > 0 and position < len(word) - 2:
            if word[position-1] in 'aeiou' and word[position+2] in 'aeiou':
                return 'd_th_voiced.wav'
        return 'd_th_unvoiced.wav'
    return DIGRAPHS.get(grapheme)
```

---

## PART 4: MAPPING EXAMPLES

### Example 1: "cat"

```
Input: "cat"

Parsing:
- Check welded endings: No match
- Check vowel teams: No match  
- Check r-controlled: No match
- Check digraphs: No match
- Check blends: No match
- Check magic-e: No (doesn't end in 'e')
- Single letters: c, a, t

Output:
[
  {grapheme: 'c', file: 'c_k.wav', is_stop: True},
  {grapheme: 'a', file: 'v_short_a.wav', is_stop: False},
  {grapheme: 't', file: 'c_t.wav', is_stop: True}
]

Zones: [c: 0-33%] [a: 34-66%] [t: 67-100%]
```

### Example 2: "ship"

```
Input: "ship"

Parsing:
- Check digraphs: "sh" matches!
- Continue from index 2
- Single letters: i, p

Output:
[
  {grapheme: 'sh', file: 'd_sh.wav', is_stop: False, is_unit: True},
  {grapheme: 'i', file: 'v_short_i.wav', is_stop: False},
  {grapheme: 'p', file: 'c_p.wav', is_stop: True}
]

Zones: [sh: 0-33%] [i: 34-66%] [p: 67-100%]
```

### Example 3: "make" (magic-e)

```
Input: "make"

Parsing:
- Check magic-e: Yes! Pattern = m[a]ke, vowel at index 1
- Single letters: m, a (LONG), k, e (SILENT)

Output:
[
  {grapheme: 'm', file: 'c_m.wav', is_stop: False},
  {grapheme: 'a', file: 'v_long_a.wav', is_stop: False},  // LONG due to magic-e
  {grapheme: 'k', file: 'c_k.wav', is_stop: True},
  {grapheme: 'e', file: 'x_silence.wav', is_silent: True}
]

Zones: [m: 0-25%] [a: 26-50%] [k: 51-75%] [e: 76-100%]
Note: 'e' zone is visible but plays silence
```

### Example 4: "string" (blend + welded)

```
Input: "string"

Parsing:
- Check welded endings: "ing" matches at end!
- Check blends at start: "str"... "st" matches, then "r"
- Actually, let's be more careful:
  - "str" at position 0: check "st" blend → matches
  - Then "r" alone? Or is "tr" a blend too?
  
Better approach - check position 0:
- "st" is a blend → matches
- Continue from index 2: "ring"
- Check "ri" - not a blend
- "r" alone
- Check welded: "ing" → matches!

Output:
[
  {grapheme: 'st', file: 'bl_st.wav', is_stop: False, is_unit: True},
  {grapheme: 'r', file: 'c_r.wav', is_stop: False},
  {grapheme: 'ing', file: 'w_ing.wav', is_stop: False, is_unit: True}
]

Zones: [st: 0-33%] [r: 34-66%] [ing: 67-100%]
```

### Example 5: "think" (digraph + welded)

```
Input: "think"

Parsing:
- Check welded endings: "ink" matches!
- Remaining: "th"
- Check digraphs: "th" matches (unvoiced)

Output:
[
  {grapheme: 'th', file: 'd_th_unvoiced.wav', is_stop: False, is_unit: True},
  {grapheme: 'ink', file: 'w_ink.wav', is_stop: False, is_unit: True}
]

Zones: [th: 0-50%] [ink: 51-100%]
```

### Example 6: "boat" (vowel team)

```
Input: "boat"

Parsing:
- Check vowel teams: "oa" at position 1 → matches!
- Single letters: b, [oa], t

Output:
[
  {grapheme: 'b', file: 'c_b.wav', is_stop: True},
  {grapheme: 'oa', file: 'vt_oa.wav', is_stop: False, is_unit: True},
  {grapheme: 't', file: 'c_t.wav', is_stop: True}
]

Zones: [b: 0-33%] [oa: 34-66%] [t: 67-100%]
```

### Example 7: "star" (blend + r-controlled)

```
Input: "star"

Parsing:
- Check r-controlled: "ar" at position 2 → matches!
- Check blends at start: "st" → matches!

Output:
[
  {grapheme: 'st', file: 'bl_st.wav', is_stop: False, is_unit: True},
  {grapheme: 'ar', file: 'r_ar.wav', is_stop: False, is_unit: True}
]

Zones: [st: 0-50%] [ar: 51-100%]
```

---

## PART 5: AUDIO BUFFER CONSTRUCTION

### Building the Scrrubbable Buffer

Once we have the phoneme list, construct a single audio buffer:

```javascript
async function buildWordBuffer(phonemeList) {
    const sampleRate = 44100;
    const crossfadeMs = 35;
    const crossfadeSamples = Math.floor(crossfadeMs / 1000 * sampleRate);
    
    // Load all audio files
    const audioBuffers = await Promise.all(
        phonemeList.map(p => loadAudioFile(p.file))
    );
    
    // Calculate total length (accounting for crossfade overlaps)
    let totalSamples = 0;
    for (let i = 0; i < audioBuffers.length; i++) {
        totalSamples += audioBuffers[i].length;
        if (i > 0) totalSamples -= crossfadeSamples; // Overlap
    }
    
    // Create output buffer
    const outputBuffer = new Float32Array(totalSamples);
    
    // Build with crossfades
    let writePosition = 0;
    for (let i = 0; i < audioBuffers.length; i++) {
        const buffer = audioBuffers[i];
        
        if (i === 0) {
            // First phoneme: no fade-in
            outputBuffer.set(buffer, 0);
            writePosition = buffer.length;
        } else {
            // Crossfade with previous
            const fadeStart = writePosition - crossfadeSamples;
            
            for (let j = 0; j < crossfadeSamples; j++) {
                const fadeOutGain = 1 - (j / crossfadeSamples);
                const fadeInGain = j / crossfadeSamples;
                outputBuffer[fadeStart + j] = 
                    outputBuffer[fadeStart + j] * fadeOutGain + 
                    buffer[j] * fadeInGain;
            }
            
            // Copy remainder of current buffer
            outputBuffer.set(
                buffer.slice(crossfadeSamples), 
                writePosition
            );
            writePosition += buffer.length - crossfadeSamples;
        }
    }
    
    // Store zone boundaries for slider mapping
    const zones = calculateZoneBoundaries(phonemeList, totalSamples);
    
    return { buffer: outputBuffer, zones, totalSamples };
}

function calculateZoneBoundaries(phonemeList, totalSamples) {
    const zoneCount = phonemeList.length;
    const samplesPerZone = totalSamples / zoneCount;
    
    return phonemeList.map((phoneme, i) => ({
        grapheme: phoneme.grapheme,
        startSample: Math.floor(i * samplesPerZone),
        endSample: Math.floor((i + 1) * samplesPerZone),
        startPercent: (i / zoneCount) * 100,
        endPercent: ((i + 1) / zoneCount) * 100,
        isStop: phoneme.is_stop,
        isSilent: phoneme.is_silent
    }));
}
```

### Slider Interaction Handler

```javascript
class WordScrubber {
    constructor(wordBuffer) {
        this.buffer = wordBuffer.buffer;
        this.zones = wordBuffer.zones;
        this.totalSamples = wordBuffer.totalSamples;
        this.currentZoneIndex = -1;
        this.stopPlayed = {}; // Track which stops have played
    }
    
    handleSliderPosition(percent) {
        // Find current zone
        const zone = this.zones.find(z => 
            percent >= z.startPercent && percent < z.endPercent
        );
        
        if (!zone) return;
        
        const zoneIndex = this.zones.indexOf(zone);
        
        // Detect zone change
        if (zoneIndex !== this.currentZoneIndex) {
            this.onZoneEnter(zone, zoneIndex);
            this.currentZoneIndex = zoneIndex;
        }
        
        // Handle playback based on phoneme type
        if (zone.isSilent) {
            // Silent zone (magic-e): do nothing
            return;
        }
        
        if (zone.isStop) {
            // Stop consonant: play once when zone entered
            // (handled in onZoneEnter)
            return;
        }
        
        // Continuous sound: scrub through buffer
        const samplePosition = Math.floor(
            (percent / 100) * this.totalSamples
        );
        this.audioContext.currentTime = samplePosition / 44100;
    }
    
    onZoneEnter(zone, zoneIndex) {
        if (zone.isStop && !this.stopPlayed[zoneIndex]) {
            // Play full stop clip immediately
            this.playStopPhoneme(zone);
            this.stopPlayed[zoneIndex] = true;
        }
        
        // Visual feedback: highlight current zone
        this.highlightZone(zone.grapheme);
    }
    
    reset() {
        this.currentZoneIndex = -1;
        this.stopPlayed = {};
    }
}
```

---

## PART 6: COMPLETE FILE LIST FOR RECORDING SESSION

### Recording Session Checklist

Use this exact list for your recording session. Check off each file as recorded.

```
=== SHORT VOWELS (5 files) ===
[ ] v_short_a.wav   - "ah" as in cat     - 250-300ms
[ ] v_short_e.wav   - "eh" as in bed     - 200-250ms
[ ] v_short_i.wav   - "ih" as in sit     - 180-220ms
[ ] v_short_o.wav   - "ah" as in hot     - 220-280ms
[ ] v_short_u.wav   - "uh" as in cup     - 200-250ms

=== LONG VOWELS (5 files) ===
[ ] v_long_a.wav    - "ay" as in cake    - 300-400ms
[ ] v_long_e.wav    - "ee" as in see     - 300-380ms
[ ] v_long_i.wav    - "eye" as in bike   - 320-420ms
[ ] v_long_o.wav    - "oh" as in home    - 320-400ms
[ ] v_long_u.wav    - "oo" as in blue    - 300-400ms

=== CONTINUOUS CONSONANTS (11 files) ===
[ ] c_m.wav         - "mmmm"             - 300-400ms
[ ] c_n.wav         - "nnnn"             - 300-400ms
[ ] c_s.wav         - "ssss"             - 350-450ms
[ ] c_f.wav         - "ffff"             - 300-400ms
[ ] c_v.wav         - "vvvv"             - 300-400ms
[ ] c_z.wav         - "zzzz"             - 350-450ms
[ ] c_l.wav         - "llll"             - 300-400ms
[ ] c_r.wav         - "rrrr"             - 350-450ms
[ ] c_h.wav         - "hhhh"             - 200-300ms
[ ] c_w.wav         - "w" glide          - 200-300ms
[ ] c_y.wav         - "y" glide          - 200-300ms

=== STOP CONSONANTS (6 files) - CRITICAL: NO SCHWA ===
[ ] c_p.wav         - lip pop only       - 50-70ms
[ ] c_b.wav         - voiced lip pop     - 60-80ms
[ ] c_t.wav         - tongue tap only    - 60-80ms
[ ] c_d.wav         - voiced tongue tap  - 70-90ms
[ ] c_k.wav         - back click only    - 60-80ms
[ ] c_g.wav         - voiced back click  - 70-90ms

=== DIGRAPHS (8 files) ===
[ ] d_sh.wav        - "shhhh"            - 350-450ms
[ ] d_ch.wav        - "ch" (single)      - 100-150ms
[ ] d_th_unvoiced.wav - "th" no voice    - 300-400ms
[ ] d_th_voiced.wav - "th" with voice    - 300-400ms
[ ] d_wh.wav        - "wh" breathy       - 200-300ms
[ ] d_ng.wav        - "ng" nasal         - 280-350ms
[ ] d_ck.wav        - same as c_k        - 60-80ms
[ ] d_ph.wav        - same as c_f        - 300-400ms

=== WELDED SOUNDS (11 files) ===
[ ] w_am.wav        - "am" unit          - 250-350ms
[ ] w_an.wav        - "an" unit          - 250-350ms
[ ] w_all.wav       - "all" unit         - 300-400ms
[ ] w_ang.wav       - "ang" unit         - 280-350ms
[ ] w_ing.wav       - "ing" unit         - 250-320ms
[ ] w_ong.wav       - "ong" unit         - 280-350ms
[ ] w_ung.wav       - "ung" unit         - 260-330ms
[ ] w_ank.wav       - "ank" unit         - 280-350ms
[ ] w_ink.wav       - "ink" unit         - 260-330ms
[ ] w_onk.wav       - "onk" unit         - 280-350ms
[ ] w_unk.wav       - "unk" unit         - 270-340ms

=== R-CONTROLLED (5 files) ===
[ ] r_ar.wav        - "ar" as in car     - 300-400ms
[ ] r_or.wav        - "or" as in for     - 300-400ms
[ ] r_er.wav        - "er" as in her     - 280-350ms
[ ] r_ir.wav        - "ir" as in bird    - 280-350ms
[ ] r_ur.wav        - "ur" as in fur     - 280-350ms

=== VOWEL TEAMS (16 files) ===
[ ] vt_ai.wav       - long a             - 300-400ms
[ ] vt_ay.wav       - long a             - 300-400ms
[ ] vt_ee.wav       - long e             - 300-380ms
[ ] vt_ea.wav       - long e             - 300-380ms
[ ] vt_ey.wav       - long e             - 300-380ms
[ ] vt_oa.wav       - long o             - 320-400ms
[ ] vt_ow_long.wav  - long o (snow)      - 320-400ms
[ ] vt_ow_diphthong.wav - "ow" (cow)     - 320-400ms
[ ] vt_oe.wav       - long o             - 320-400ms
[ ] vt_ie.wav       - long i             - 320-420ms
[ ] vt_igh.wav      - long i             - 320-420ms
[ ] vt_ue.wav       - long u             - 300-400ms
[ ] vt_ew.wav       - long u             - 300-400ms
[ ] vt_oo_long.wav  - "oo" (moon)        - 300-400ms
[ ] vt_oo_short.wav - "oo" (book)        - 200-280ms
[ ] vt_ou.wav       - "ou" (out)         - 320-400ms

=== BLENDS - L-BLENDS (6 files) ===
[ ] bl_bl.wav       - "bl"               - 350-450ms
[ ] bl_cl.wav       - "cl"               - 320-400ms
[ ] bl_fl.wav       - "fl"               - 350-450ms
[ ] bl_gl.wav       - "gl"               - 350-450ms
[ ] bl_pl.wav       - "pl"               - 320-400ms
[ ] bl_sl.wav       - "sl"               - 400-500ms

=== BLENDS - R-BLENDS (7 files) ===
[ ] bl_br.wav       - "br"               - 380-480ms
[ ] bl_cr.wav       - "cr"               - 350-450ms
[ ] bl_dr.wav       - "dr"               - 380-480ms
[ ] bl_fr.wav       - "fr"               - 400-500ms
[ ] bl_gr.wav       - "gr"               - 380-480ms
[ ] bl_pr.wav       - "pr"               - 350-450ms
[ ] bl_tr.wav       - "tr"               - 350-450ms

=== BLENDS - S-BLENDS (7 files) ===
[ ] bl_sc.wav       - "sc"               - 350-450ms
[ ] bl_sk.wav       - "sk"               - 350-450ms
[ ] bl_sm.wav       - "sm"               - 400-500ms
[ ] bl_sn.wav       - "sn"               - 400-500ms
[ ] bl_sp.wav       - "sp"               - 350-450ms
[ ] bl_st.wav       - "st"               - 350-450ms
[ ] bl_sw.wav       - "sw"               - 350-450ms

=== BLENDS - END BLENDS (6 files) ===
[ ] bl_ft.wav       - "ft"               - 250-350ms
[ ] bl_lt.wav       - "lt"               - 280-380ms
[ ] bl_mp.wav       - "mp"               - 280-380ms
[ ] bl_nd.wav       - "nd"               - 280-380ms
[ ] bl_sk_end.wav   - "sk" (end)         - 250-350ms
[ ] bl_st_end.wav   - "st" (end)         - 250-350ms

=== SPECIAL (2 files) ===
[ ] x_silence.wav   - silence            - 100ms
[ ] x_schwa.wav     - unstressed "uh"    - 80-120ms

=== TOTAL: 95 FILES ===
```

---

## PART 7: RECORDING SPECIFICATIONS

### Technical Requirements

```
Format:         WAV (PCM, uncompressed)
Sample Rate:    44,100 Hz
Bit Depth:      16-bit minimum (24-bit preferred for headroom)
Channels:       Mono
Normalization:  -3dB peak, -16 LUFS integrated

Microphone:     Large-diaphragm condenser (recommended)
Distance:       6-8 inches from mouth
Room:           Treated/quiet (no reverb, no background noise)
Pop filter:     Required (especially for stops: p, b, t, d)
```

### Recording Protocol

**For continuous sounds (vowels, m, n, s, f, etc.):**

1. Take a breath before recording
2. Produce the sound in isolation, sustained
3. Fade out naturally over the last 30-50ms
4. DO NOT add any vowel at the end
5. Trim silence from beginning, leave 10ms fade at end

**For stop consonants (p, b, t, d, k, g):**

1. Position mouth for the sound
2. Release with aspiration only
3. Hard cutoff immediately after release
4. NO vowel sound whatsoever
5. Total duration should be 50-90ms
6. Test by looping — should NOT sound like "puh-puh-puh"

**For digraphs and blends:**

1. Produce as a single articulatory gesture
2. Let the sounds flow naturally into each other
3. Duration should feel like "one sound event"
4. Maintain consistent volume/energy throughout

**For welded sounds:**

1. Produce as a connected unit
2. Allow natural nasalization of the vowel
3. Do not pause between vowel and nasal consonant
4. Should sound like a native speaker saying the rime in isolation

### Quality Assurance Checklist

Before finalizing each file:

- [ ] No background noise/hum
- [ ] No mouth clicks or lip smacks
- [ ] No breath sounds at beginning or end
- [ ] Correct duration range
- [ ] Clean attack and release
- [ ] For stops: NO schwa contamination (loop test)
- [ ] Consistent volume across all files
- [ ] No clipping

---

## PART 8: EDGE CASES & EXCEPTIONS

### Words Requiring Special Handling

```python
# Exception dictionaries for words that don't follow standard rules

EXCEPTION_WORDS = {
    # 'oo' pronounced as short /ʊ/
    'book': [('b', 'c_b.wav'), ('oo', 'vt_oo_short.wav'), ('k', 'c_k.wav')],
    'look': [('l', 'c_l.wav'), ('oo', 'vt_oo_short.wav'), ('k', 'c_k.wav')],
    'good': [('g', 'c_g.wav'), ('oo', 'vt_oo_short.wav'), ('d', 'c_d.wav')],
    'wood': [('w', 'c_w.wav'), ('oo', 'vt_oo_short.wav'), ('d', 'c_d.wav')],
    'foot': [('f', 'c_f.wav'), ('oo', 'vt_oo_short.wav'), ('t', 'c_t.wav')],
    
    # 'ea' pronounced as short /ɛ/
    'bread': [('br', 'bl_br.wav'), ('ea', 'v_short_e.wav'), ('d', 'c_d.wav')],
    'head': [('h', 'c_h.wav'), ('ea', 'v_short_e.wav'), ('d', 'c_d.wav')],
    'dead': [('d', 'c_d.wav'), ('ea', 'v_short_e.wav'), ('d', 'c_d.wav')],
    
    # 'ow' as diphthong /aʊ/
    'cow': [('c', 'c_k.wav'), ('ow', 'vt_ow_diphthong.wav')],
    'how': [('h', 'c_h.wav'), ('ow', 'vt_ow_diphthong.wav')],
    'now': [('n', 'c_n.wav'), ('ow', 'vt_ow_diphthong.wav')],
    'down': [('d', 'c_d.wav'), ('ow', 'vt_ow_diphthong.wav'), ('n', 'c_n.wav')],
    'town': [('t', 'c_t.wav'), ('ow', 'vt_ow_diphthong.wav'), ('n', 'c_n.wav')],
    
    # Voiced 'th'
    'the': [('th', 'd_th_voiced.wav'), ('e', 'v_short_e.wav')],
    'this': [('th', 'd_th_voiced.wav'), ('i', 'v_short_i.wav'), ('s', 'c_s.wav')],
    'that': [('th', 'd_th_voiced.wav'), ('a', 'v_short_a.wav'), ('t', 'c_t.wav')],
    
    # Silent letters
    'know': [('kn', 'c_n.wav'), ('ow', 'vt_ow_long.wav')],  # 'k' silent
    'write': [('wr', 'c_r.wav'), ('i', 'v_long_i.wav'), ('t', 'c_t.wav'), ('e', 'x_silence.wav')],
    'lamb': [('l', 'c_l.wav'), ('a', 'v_short_a.wav'), ('mb', 'c_m.wav')],  # 'b' silent
    
    # Irregular vowels
    'said': [('s', 'c_s.wav'), ('ai', 'v_short_e.wav'), ('d', 'c_d.wav')],  # 'ai' says /ɛ/
    'have': [('h', 'c_h.wav'), ('a', 'v_short_a.wav'), ('v', 'c_v.wav'), ('e', 'x_silence.wav')],
    'give': [('g', 'c_g.wav'), ('i', 'v_short_i.wav'), ('v', 'c_v.wav'), ('e', 'x_silence.wav')],
    'live': [('l', 'c_l.wav'), ('i', 'v_short_i.wav'), ('v', 'c_v.wav'), ('e', 'x_silence.wav')],
}

def parse_word(word):
    """Parse word to phonemes, checking exceptions first"""
    word_lower = word.lower()
    
    # Check exception dictionary first
    if word_lower in EXCEPTION_WORDS:
        return EXCEPTION_WORDS[word_lower]
    
    # Fall back to algorithmic parsing
    return parse_word_algorithmic(word_lower)
```

### Handling Unknown Words

For words not in your dictionary and not matching standard patterns:

```python
def handle_unknown_word(word):
    """
    Strategy for words the parser can't handle:
    1. Attempt algorithmic parse
    2. Flag for human review
    3. Add to exception dictionary after review
    """
    try:
        result = parse_word_algorithmic(word)
        # Log for review
        log_unknown_word(word, result)
        return result
    except ParsingError:
        # Return letter-by-letter fallback
        return letter_by_letter_parse(word)
```

---

## SUMMARY

### Quick Reference Card

| Category | File Count | Key Principle |
|----------|------------|---------------|
| Short vowels | 5 | Clean, isolated vowel sounds |
| Long vowels | 5 | Include full diphthong glide |
| Continuous consonants | 11 | Sustained, no trailing schwa |
| Stop consonants | 6 | ULTRA short, pure aspiration only |
| Digraphs | 8 | Single audio units, never split |
| Welded sounds | 11 | Nasalized vowel + consonant as one |
| R-controlled | 5 | Vowel + /r/ coloring as one |
| Vowel teams | 16 | Include variant pronunciations |
| Blends | 26 | Pre-recorded for smooth coarticulation |
| Special | 2 | Silence for magic-e, schwa for future |
| **TOTAL** | **95** | |

### Parsing Priority

```
1. Check exception dictionary (hardcoded irregulars)
2. Check welded endings (only at word end)
3. Check vowel teams (longest first: igh, eigh before ai, ay)
4. Check r-controlled vowels
5. Check digraphs
6. Check blends
7. Check magic-e pattern
8. Fall back to single letters
```

### Critical Success Factors

1. **Stop consonants must be CLEAN** — no schwa, loop test everything
2. **Multi-letter units are atomic** — digraphs, welded sounds, blends are never split
3. **Exception dictionary handles irregulars** — don't over-engineer the algorithm
4. **Crossfade timing matters** — 30-40ms overlap creates natural coarticulation
5. **Test with real children** — the best spec is validated by user testing

---

*Document Version: 1.0*  
*For: SageNet Finger-Scrub Reading App*  
*Total Audio Assets: 95 files*
