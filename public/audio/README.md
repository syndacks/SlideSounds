# Audio Assets - Source of Truth

**⚠️ IMPORTANT: This is the ONLY place to add/edit audio files**

## Directory Structure
- `/public/audio/phonemes/` - Individual phoneme sounds (.wav files)
- `/public/audio/words/` - Complete word pronunciations (.mp3 files)

## Adding New Audio Files
1. Add files to this directory (`/public/audio/`)
2. Run `pnpm build` to copy to `/dist/audio/`
3. Commit only files in `/public/audio/` (not `/dist/`)

## DO NOT Edit `/dist/audio/`
The `/dist/` directory is generated during the build process.
Any changes made there will be overwritten on the next build.

## How It Works
- **Development** (`pnpm dev`): Vite serves from `/public/audio/` directly
- **Build** (`pnpm build`): Vite copies `/public/` → `/dist/`
- **Production**: Tauri bundles `/dist/` into the app

## File Naming Conventions

Following the specification in `sound-engine-strategy.md`:

### Phoneme Files
- **Short vowels:** `v_short_{letter}.wav` (e.g., `v_short_a.wav`, `v_short_e.wav`)
- **Long vowels:** `v_long_{letter}.wav` (e.g., `v_long_a.wav`, `v_long_i.wav`)
- **Consonants:** `c_{letter}.wav` (e.g., `c_p.wav`, `c_m.wav`, `c_s.wav`)
- **Digraphs:** `d_{digraph}.wav` (e.g., `d_sh.wav`, `d_ch.wav`, `d_th_unvoiced.wav`)
- **Welded sounds:** `w_{sound}.wav` (e.g., `w_am.wav`, `w_ing.wav`, `w_ank.wav`)
- **R-controlled:** `r_{letters}.wav` (e.g., `r_ar.wav`, `r_or.wav`, `r_er.wav`)
- **Vowel teams:** `vt_{letters}.wav` (e.g., `vt_ai.wav`, `vt_oo_long.wav`, `vt_oo_short.wav`)
- **Blends:** `bl_{letters}.wav` (e.g., `bl_st.wav`, `bl_br.wav`, `bl_fl.wav`)
- **Special:** `x_{name}.wav` (e.g., `x_silence.wav`, `x_schwa.wav`)

### Word Files
- **Words:** `{word}.mp3` (e.g., `sun.mp3`, `cat.mp3`)

This convention makes it easy to identify the phonetic category of each file and follows the comprehensive 95-file asset plan documented in `sound-engine-strategy.md`.
