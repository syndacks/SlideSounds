# Prerecorded Word Audio

This directory contains prerecorded MP3 files for complete words.

## File Naming
Files should be named using the word ID from src/data/words.ts (e.g., cat.mp3, sat.mp3)

## Format Specifications
- Format: MP3
- Bitrate: 64-96 kbps
- Sample rate: 44.1 kHz
- Mono channel (saves space)
- Expected file size: ~20-50KB per word

## Current Words
cat, sat, mat, pat, tap, map, sap, can, man, pan

## Anchor Metadata
Each prerecorded word should have rough letter anchor timestamps in `src/data/wordAudioMetadata.ts`.
Add a new entry with the word ID, approximate duration (ms), and an anchor `timeMs` per grapheme so the scrubber can align visuals with the continuous audio.

### Tuning workflow
1. `pnpm dev` and open a lesson word that has the recording you want to tune.
2. In dev builds a **Scrub Debug** panel appears under the word; drag the scrub handle while listening and adjust the slider / ms inputs for each letter until the audio matches the highlight.
3. Use the **Copy metadata JSON** button to grab the updated payload and paste it into `src/data/wordAudioMetadata.ts`.
4. Commit the audio file plus metadata update together so other teammates get both assets.
