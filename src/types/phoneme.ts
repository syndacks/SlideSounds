export type PhonemeCategory =
  | 'short_vowel'
  | 'long_vowel'
  | 'continuous_consonant'
  | 'stop_consonant'
  | 'digraph'
  | 'blend'
  | 'welded'
  | 'r_controlled'
  | 'vowel_team'
  | 'silent';

export interface PhonemeMetadata {
  /** The grapheme (letter/letters) this represents */
  grapheme: string;
  /** IPA-style label for display/debug */
  label: string;
  /** Relative path to audio file (from /public) */
  audioFile: string;
  /** Category of the phoneme */
  category: PhonemeCategory;
  /** Whether this is a stop consonant (plays once, can't sustain) */
  isStop: boolean;
  /** Duration hint in milliseconds (for timing) */
  durationMs?: number;
}

export interface PhonemeUnit {
  /** Unique ID for this instance (grapheme-index) */
  id: string;
  /** The grapheme as displayed */
  grapheme: string;
  /** Display label */
  label: string;
  /** Path to audio file */
  audioFile: string;
  /** Category */
  category: PhonemeCategory;
  /** Stop consonant flag */
  isStop: boolean;
  /** Whether this is a multi-letter unit (digraph, blend, etc.) */
  isUnit?: boolean;
  /** Whether this is a silent letter (magic-e) */
  isSilent?: boolean;
  /** Duration hint */
  durationMs?: number;
}

export interface WordImage {
  /** Path to the illustrative asset (from /public) */
  src: string;
  /** Accessible description of the illustration */
  alt?: string;
}

export interface WordDefinition {
  id: string;
  text: string;
  displayText?: string;
  /** Optional pre-defined phoneme breakdown (for exceptions) */
  phonemes?: string[];
  /** Phase this word belongs to */
  phase?: number;
  /** Optional picture used for comprehension checks */
  image?: WordImage;
}

export interface ParsedWord {
  word: string;
  units: PhonemeUnit[];
  missingGraphemes: string[];
  hasAllAudio: boolean;
}
