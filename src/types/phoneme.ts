export type PhonemeCategory = 'vowel' | 'consonant' | 'digraph' | 'blend';

export interface PhonemeUnit {
  /** stable identifier (audio file name without extension) */
  id: string;
  /** grapheme as it appears in the UI */
  grapheme: string;
  /** short label (ă, k, sh) for debug/aria text */
  label: string;
  /** relative path inside /public for the audio asset */
  audioFile: string;
  category: PhonemeCategory;
}

export interface WordDefinition {
  id: string;
  text: string;
  displayText?: string;
}
