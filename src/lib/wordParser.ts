import { getPhonemeMetadata } from '../data/phonemeMap';
import { PhonemeUnit } from '../types/phoneme';

export interface ParseWordResult {
  units: PhonemeUnit[];
  missingGraphemes: string[];
}

export const parseWordToPhonemes = (word: string): ParseWordResult => {
  const normalized = word.trim().toLowerCase();
  const units: PhonemeUnit[] = [];
  const missing = new Set<string>();

  for (const grapheme of normalized) {
    const metadata = getPhonemeMetadata(grapheme);
    if (!metadata) {
      missing.add(grapheme);
      continue;
    }

    units.push({
      id: `${grapheme}-${units.length}`,
      grapheme,
      label: metadata.label,
      audioFile: metadata.audioFile,
      category: metadata.category,
    });
  }

  return {
    units,
    missingGraphemes: Array.from(missing),
  };
};
