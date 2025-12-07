# SlideSounds

Tauri 2.0 app for toddler phonics learning with sliding phoneme playback.

## Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- pnpm (or npm)

### Install Dependencies
```bash
pnpm install
```

### Add Phoneme Audio Files

Place WAV files in `public/audio/phonemes/`:
```
public/audio/phonemes/
├── phoneme-map.json
├── s.wav
├── a_short.wav
├── t.wav
└── ... (other phoneme WAV files)
```

Audio requirements:
- Format: WAV (PCM)
- Sample rate: 44100Hz recommended
- Bit depth: 16-bit
- Duration: 200-500ms per phoneme
- No silence padding

## Run Development Mode

```bash
pnpm tauri dev
```

## Build for Production

```bash
pnpm tauri build
```

## Modify Word List

Edit `src/App.tsx`:

```typescript
<PhonicsWord word="cat" />
```

## Add Digraphs

Update `phoneme-map.json`:
```json
{
  "sh": "sh.wav",
  "ch": "ch.wav",
  "th": "th.wav"
}
```

Modify `PhonicsWord.tsx` to detect multi-character zones:
```typescript
// Split word into phoneme units instead of single letters
const phonemeUnits = parseWordIntoPhonemes(word); // ["sh", "o", "p"]
```

## Architecture

### Audio Engine
- `usePhonemeAudio.ts`: WebAudio hook
  - Preloads all WAV files at startup
  - Creates AudioBuffer map
  - Instant playback via BufferSource

### Sliding Logic
- `PhonicsWord.tsx`: Touch/mouse handler
  - Calculates zones via `getBoundingClientRect()`
  - Detects finger position
  - Triggers phoneme only on zone change
  - Prevents re-triggering same phoneme

### Zone Detection
```typescript
interface PhonemeZone {
  letter: string;
  startX: number;
  endX: number;
  phoneme: string;
}
```

## Performance

- Audio latency: <10ms (preloaded buffers)
- Zone detection: RAF-based (60fps)
- Touch response: Immediate (no debounce)

## Troubleshooting

**No audio playing:**
- Check browser console for loading errors
- Verify WAV files exist in `public/audio/phonemes/`
- Ensure phoneme-map.json paths match actual files

**Laggy playback:**
- Check WAV file sizes (<100KB per file)
- Verify sample rate (44100Hz)
- Test with shorter phoneme samples

**Touch not working:**
- Test with mouse first (desktop fallback)
- Check `touch-action: none` in CSS
- Verify browser supports touch events
