import { PhonemeCategory } from '../types/phoneme';

type PhonemeMetadata = {
  grapheme: string;
  label: string;
  audioFile: string;
  category: PhonemeCategory;
};

const AUDIO_BASE_PATH = 'audio/phonemes';

const makeMeta = (
  grapheme: string,
  label: string,
  filename: string,
  category: PhonemeCategory,
): PhonemeMetadata => ({
  grapheme,
  label,
  audioFile: `${AUDIO_BASE_PATH}/${filename}`,
  category,
});

export const BASIC_PHONEMES: Record<string, PhonemeMetadata> = {
  a: makeMeta('a', 'ă', 'a_short.wav', 'vowel'),
  e: makeMeta('e', 'ĕ', 'e_short.wav', 'vowel'),
  i: makeMeta('i', 'ĭ', 'i_short.wav', 'vowel'),
  o: makeMeta('o', 'ŏ', 'o_short.wav', 'vowel'),
  u: makeMeta('u', 'ŭ', 'u_short.wav', 'vowel'),
  b: makeMeta('b', 'b', 'b.wav', 'consonant'),
  c: makeMeta('c', 'k', 'k.wav', 'consonant'),
  d: makeMeta('d', 'd', 'd.wav', 'consonant'),
  f: makeMeta('f', 'f', 'f.wav', 'consonant'),
  g: makeMeta('g', 'g', 'g.wav', 'consonant'),
  h: makeMeta('h', 'h', 'h.wav', 'consonant'),
  j: makeMeta('j', 'j', 'j.wav', 'consonant'),
  k: makeMeta('k', 'k', 'k.wav', 'consonant'),
  l: makeMeta('l', 'l', 'l.wav', 'consonant'),
  m: makeMeta('m', 'm', 'm.wav', 'consonant'),
  n: makeMeta('n', 'n', 'n.wav', 'consonant'),
  p: makeMeta('p', 'p', 'p.wav', 'consonant'),
  r: makeMeta('r', 'r', 'r.wav', 'consonant'),
  s: makeMeta('s', 's', 's.wav', 'consonant'),
  t: makeMeta('t', 't', 't.wav', 'consonant'),
  w: makeMeta('w', 'w', 'w.wav', 'consonant'),
  y: makeMeta('y', 'y', 'y.wav', 'consonant'),
  z: makeMeta('z', 'z', 'z.wav', 'consonant'),
};

export const SUPPORTED_GRAPHEMES = Object.keys(BASIC_PHONEMES);

export const getPhonemeMetadata = (grapheme: string): PhonemeMetadata | undefined =>
  BASIC_PHONEMES[grapheme];
