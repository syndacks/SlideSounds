import {
  getPhonemeMetadata,
  DIGRAPHS,
  WELDED_SOUNDS,
  R_CONTROLLED,
  VOWEL_TEAMS,
  LONG_VOWELS,
  SILENT,
  SHORT_VOWELS,
  STOP_CONSONANTS,
  CONTINUOUS_CONSONANTS,
  hasAudioFile,
} from '../data/phonemeMap';
import { PhonemeUnit, ParsedWord, PhonemeMetadata } from '../types/phoneme';

// ============================================================================
// MAGIC-E DETECTION
// ============================================================================

interface MagicEResult {
  isMagicE: boolean;
  vowelIndex: number;
}

/**
 * Detect if a word follows the magic-e (CVCe) pattern
 * Returns the index of the vowel that should be long
 */
const detectMagicE = (word: string): MagicEResult => {
  const result: MagicEResult = { isMagicE: false, vowelIndex: -1 };

  if (word.length < 4) return result;
  if (word[word.length - 1] !== 'e') return result;

  const vowels = 'aeiou';
  const secondToLast = word[word.length - 2];

  // Check if second-to-last is a consonant
  if (vowels.includes(secondToLast)) return result;

  // Find the vowel before the final consonant
  for (let i = word.length - 3; i >= 0; i--) {
    if (vowels.includes(word[i])) {
      // Make sure there's a consonant before this vowel (or it's word start)
      if (i === 0 || !vowels.includes(word[i - 1])) {
        result.isMagicE = true;
        result.vowelIndex = i;
        return result;
      }
    }
  }

  return result;
};

// ============================================================================
// MULTI-LETTER PATTERN MATCHING
// ============================================================================

interface PatternMatch {
  grapheme: string;
  metadata: PhonemeMetadata;
  length: number;
  isUnit: boolean;
}

/**
 * Try to match a multi-letter pattern at the given position
 */
const tryMatchPattern = (
  word: string,
  position: number,
  isWordEnd: boolean,
): PatternMatch | null => {
  const remaining = word.slice(position);

  // Priority 1: Welded sounds (only at word end)
  if (isWordEnd) {
    // Check 3-letter welded sounds first
    const threeLetterWelded = ['ank', 'ink', 'onk', 'unk', 'ang', 'ing', 'ong', 'ung', 'all'];
    for (const pattern of threeLetterWelded) {
      if (remaining === pattern) {
        const meta = WELDED_SOUNDS[pattern];
        if (meta) {
          return { grapheme: pattern, metadata: meta, length: pattern.length, isUnit: true };
        }
      }
    }
    // Check 2-letter welded sounds
    const twoLetterWelded = ['am', 'an'];
    for (const pattern of twoLetterWelded) {
      if (remaining === pattern) {
        const meta = WELDED_SOUNDS[pattern];
        if (meta) {
          return { grapheme: pattern, metadata: meta, length: pattern.length, isUnit: true };
        }
      }
    }
  }

  // Priority 2: Trigraphs (igh)
  if (remaining.length >= 3) {
    if (remaining.startsWith('igh')) {
      const meta = VOWEL_TEAMS.igh;
      if (meta) {
        return { grapheme: 'igh', metadata: meta, length: 3, isUnit: true };
      }
    }
  }

  // Priority 3: R-controlled vowels
  if (remaining.length >= 2) {
    const twoChars = remaining.slice(0, 2);
    const rControlled = R_CONTROLLED[twoChars];
    if (rControlled) {
      return { grapheme: twoChars, metadata: rControlled, length: 2, isUnit: true };
    }
  }

  // Priority 4: Vowel teams
  if (remaining.length >= 2) {
    const twoChars = remaining.slice(0, 2);
    const vowelTeam = VOWEL_TEAMS[twoChars] || VOWEL_TEAMS[`${twoChars}_long`];
    if (vowelTeam) {
      return { grapheme: twoChars, metadata: vowelTeam, length: 2, isUnit: true };
    }
  }

  // Priority 5: Digraphs
  if (remaining.length >= 2) {
    const twoChars = remaining.slice(0, 2);
    const digraph = DIGRAPHS[twoChars];
    if (digraph) {
      return { grapheme: twoChars, metadata: digraph, length: 2, isUnit: true };
    }
  }

  // Priority 6: Blends (only if we have blend audio, otherwise parse separately)
  // For now, we parse blends as separate letters since we don't have blend audio
  // This allows us to play individual phonemes
  // Uncomment this block if you have blend audio files:
  /*
  if (remaining.length >= 2) {
    const twoChars = remaining.slice(0, 2);
    const blend = BLENDS[twoChars];
    if (blend && hasAudioFile(blend)) {
      return { grapheme: twoChars, metadata: blend, length: 2, isUnit: true };
    }
  }
  */

  return null;
};

// ============================================================================
// MAIN PARSER
// ============================================================================

/**
 * Parse a word into phoneme units following priority rules:
 * 1. Welded sounds (word endings)
 * 2. Trigraphs (igh)
 * 3. R-controlled vowels
 * 4. Vowel teams
 * 5. Digraphs
 * 6. Blends (if audio available)
 * 7. Magic-e detection
 * 8. Single letters
 */
export const parseWordToPhonemes = (word: string): ParsedWord => {
  const normalized = word.trim().toLowerCase();
  const units: PhonemeUnit[] = [];
  const missingGraphemes = new Set<string>();

  if (!normalized) {
    return { word, units: [], missingGraphemes: [], hasAllAudio: true };
  }

  // Check for magic-e pattern
  const magicE = detectMagicE(normalized);

  let i = 0;
  let unitIndex = 0;

  while (i < normalized.length) {
    const isAtWordEnd = i + normalized.slice(i).length === normalized.length;
    const remainingLength = normalized.length - i;

    // Handle magic-e silent e at the end
    if (magicE.isMagicE && i === normalized.length - 1 && normalized[i] === 'e') {
      units.push({
        id: `silent-e-${unitIndex}`,
        grapheme: 'e',
        label: '(silent)',
        audioFile: '',
        category: 'silent',
        isStop: false,
        isSilent: true,
        durationMs: SILENT.durationMs,
      });
      i++;
      unitIndex++;
      continue;
    }

    // Try multi-letter patterns
    const pattern = tryMatchPattern(normalized, i, isAtWordEnd && remainingLength <= 4);
    if (pattern) {
      const unit: PhonemeUnit = {
        id: `${pattern.grapheme}-${unitIndex}`,
        grapheme: pattern.grapheme,
        label: pattern.metadata.label,
        audioFile: pattern.metadata.audioFile,
        category: pattern.metadata.category,
        isStop: pattern.metadata.isStop,
        isUnit: pattern.isUnit,
        durationMs: pattern.metadata.durationMs,
      };

      if (!hasAudioFile(pattern.metadata)) {
        missingGraphemes.add(pattern.grapheme);
      }

      units.push(unit);
      i += pattern.length;
      unitIndex++;
      continue;
    }

    // Single letter fallback
    const char = normalized[i];

    // Handle vowels
    if ('aeiou'.includes(char)) {
      // Check if this is a long vowel due to magic-e
      if (magicE.isMagicE && i === magicE.vowelIndex) {
        const longVowelMeta = LONG_VOWELS[`${char}_long`];
        if (longVowelMeta) {
          units.push({
            id: `${char}-long-${unitIndex}`,
            grapheme: char,
            label: longVowelMeta.label,
            audioFile: longVowelMeta.audioFile,
            category: 'long_vowel',
            isStop: false,
            durationMs: longVowelMeta.durationMs,
          });

          if (!hasAudioFile(longVowelMeta)) {
            missingGraphemes.add(`${char} (long)`);
          }

          i++;
          unitIndex++;
          continue;
        }
      }

      // Short vowel
      const shortVowelMeta = SHORT_VOWELS[char];
      if (shortVowelMeta) {
        units.push({
          id: `${char}-${unitIndex}`,
          grapheme: char,
          label: shortVowelMeta.label,
          audioFile: shortVowelMeta.audioFile,
          category: 'short_vowel',
          isStop: false,
          durationMs: shortVowelMeta.durationMs,
        });

        if (!hasAudioFile(shortVowelMeta)) {
          missingGraphemes.add(char);
        }

        i++;
        unitIndex++;
        continue;
      }
    }

    // Handle consonants
    const consonantMeta = STOP_CONSONANTS[char] || CONTINUOUS_CONSONANTS[char];
    if (consonantMeta) {
      units.push({
        id: `${char}-${unitIndex}`,
        grapheme: char,
        label: consonantMeta.label,
        audioFile: consonantMeta.audioFile,
        category: consonantMeta.category,
        isStop: consonantMeta.isStop,
        durationMs: consonantMeta.durationMs,
      });

      if (!hasAudioFile(consonantMeta)) {
        missingGraphemes.add(char);
      }

      i++;
      unitIndex++;
      continue;
    }

    // Unknown character - try basic lookup
    const basicMeta = getPhonemeMetadata(char);
    if (basicMeta) {
      units.push({
        id: `${char}-${unitIndex}`,
        grapheme: char,
        label: basicMeta.label,
        audioFile: basicMeta.audioFile,
        category: basicMeta.category,
        isStop: basicMeta.isStop,
        durationMs: basicMeta.durationMs,
      });

      if (!hasAudioFile(basicMeta)) {
        missingGraphemes.add(char);
      }
    } else {
      // Completely unknown - skip but log
      missingGraphemes.add(char);
    }

    i++;
    unitIndex++;
  }

  const missingArray = Array.from(missingGraphemes);
  const hasAllAudio = missingArray.length === 0;

  return {
    word: normalized,
    units,
    missingGraphemes: missingArray,
    hasAllAudio,
  };
};

/**
 * Check if a word can be fully played with available audio
 */
export const canPlayWord = (word: string): boolean => {
  const parsed = parseWordToPhonemes(word);
  return parsed.hasAllAudio;
};

/**
 * Get a list of which phonemes are missing audio for a word
 */
export const getMissingAudio = (word: string): string[] => {
  const parsed = parseWordToPhonemes(word);
  return parsed.missingGraphemes;
};
