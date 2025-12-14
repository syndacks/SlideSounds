import { PhonemeCategory, PhonemeMetadata } from '../types/phoneme';

const AUDIO_BASE_PATH = 'audio/phonemes';

/**
 * Creates phoneme metadata with common defaults
 */
const makeMeta = (
  grapheme: string,
  label: string,
  filename: string | null, // null means no audio file exists
  category: PhonemeCategory,
  opts?: { isStop?: boolean; durationMs?: number },
): PhonemeMetadata => ({
  grapheme,
  label,
  audioFile: filename ? `${AUDIO_BASE_PATH}/${filename}` : '',
  category,
  isStop: opts?.isStop ?? false,
  durationMs: opts?.durationMs,
});

// ============================================================================
// SHORT VOWELS
// ============================================================================
export const SHORT_VOWELS: Record<string, PhonemeMetadata> = {
  a: makeMeta('a', 'ă', 'a_short.wav', 'short_vowel', { durationMs: 275 }),
  e: makeMeta('e', 'ĕ', 'e_short.wav', 'short_vowel', { durationMs: 225 }),
  i: makeMeta('i', 'ĭ', 'i_short.wav', 'short_vowel', { durationMs: 200 }),
  o: makeMeta('o', 'ŏ', 'o_short.wav', 'short_vowel', { durationMs: 250 }),
  u: makeMeta('u', 'ŭ', 'u_short.wav', 'short_vowel', { durationMs: 225 }),
};

// ============================================================================
// LONG VOWELS (for magic-e and vowel teams)
// ============================================================================
export const LONG_VOWELS: Record<string, PhonemeMetadata> = {
  a_long: makeMeta('a', 'ā', null, 'long_vowel', { durationMs: 350 }),
  e_long: makeMeta('e', 'ē', null, 'long_vowel', { durationMs: 340 }),
  i_long: makeMeta('i', 'ī', null, 'long_vowel', { durationMs: 370 }),
  o_long: makeMeta('o', 'ō', null, 'long_vowel', { durationMs: 360 }),
  u_long: makeMeta('u', 'ū', null, 'long_vowel', { durationMs: 350 }),
};

// ============================================================================
// CONTINUOUS CONSONANTS (can be sustained)
// ============================================================================
export const CONTINUOUS_CONSONANTS: Record<string, PhonemeMetadata> = {
  m: makeMeta('m', 'm', 'm.wav', 'continuous_consonant', { durationMs: 350 }),
  n: makeMeta('n', 'n', 'n.wav', 'continuous_consonant', { durationMs: 350 }),
  s: makeMeta('s', 's', 's.wav', 'continuous_consonant', { durationMs: 400 }),
  f: makeMeta('f', 'f', 'f.wav', 'continuous_consonant', { durationMs: 350 }),
  v: makeMeta('v', 'v', null, 'continuous_consonant', { durationMs: 350 }),
  z: makeMeta('z', 'z', 'z.wav', 'continuous_consonant', { durationMs: 400 }),
  l: makeMeta('l', 'l', 'l.wav', 'continuous_consonant', { durationMs: 350 }),
  r: makeMeta('r', 'r', 'r.wav', 'continuous_consonant', { durationMs: 400 }),
  h: makeMeta('h', 'h', 'h.wav', 'continuous_consonant', { durationMs: 250 }),
  w: makeMeta('w', 'w', 'w.wav', 'continuous_consonant', { durationMs: 250 }),
  y: makeMeta('y', 'y', 'y.wav', 'continuous_consonant', { durationMs: 250 }),
};

// ============================================================================
// STOP CONSONANTS (short burst, cannot be sustained)
// ============================================================================
export const STOP_CONSONANTS: Record<string, PhonemeMetadata> = {
  p: makeMeta('p', 'p', 'p.wav', 'stop_consonant', { isStop: true, durationMs: 60 }),
  b: makeMeta('b', 'b', 'b.wav', 'stop_consonant', { isStop: true, durationMs: 70 }),
  t: makeMeta('t', 't', 't.wav', 'stop_consonant', { isStop: true, durationMs: 70 }),
  d: makeMeta('d', 'd', 'd.wav', 'stop_consonant', { isStop: true, durationMs: 80 }),
  k: makeMeta('k', 'k', 'k.wav', 'stop_consonant', { isStop: true, durationMs: 70 }),
  g: makeMeta('g', 'g', 'g.wav', 'stop_consonant', { isStop: true, durationMs: 80 }),
  c: makeMeta('c', 'k', 'k.wav', 'stop_consonant', { isStop: true, durationMs: 70 }), // hard c = /k/
  j: makeMeta('j', 'j', 'j.wav', 'stop_consonant', { isStop: true, durationMs: 100 }),
  x: makeMeta('x', 'ks', null, 'stop_consonant', { isStop: true, durationMs: 120 }),
  q: makeMeta('q', 'kw', null, 'stop_consonant', { isStop: true, durationMs: 100 }),
};

// ============================================================================
// DIGRAPHS (two letters, one sound)
// ============================================================================
export const DIGRAPHS: Record<string, PhonemeMetadata> = {
  sh: makeMeta('sh', 'sh', null, 'digraph', { durationMs: 400 }),
  ch: makeMeta('ch', 'ch', null, 'digraph', { isStop: true, durationMs: 125 }),
  th: makeMeta('th', 'th', null, 'digraph', { durationMs: 350 }), // default unvoiced
  th_voiced: makeMeta('th', 'th', null, 'digraph', { durationMs: 350 }),
  wh: makeMeta('wh', 'wh', null, 'digraph', { durationMs: 250 }),
  ng: makeMeta('ng', 'ng', null, 'digraph', { durationMs: 315 }),
  ck: makeMeta('ck', 'k', null, 'digraph', { isStop: true, durationMs: 70 }),
  ph: makeMeta('ph', 'f', null, 'digraph', { durationMs: 350 }),
};

// ============================================================================
// WELDED SOUNDS (vowel + consonant as single unit)
// ============================================================================
export const WELDED_SOUNDS: Record<string, PhonemeMetadata> = {
  am: makeMeta('am', 'am', 'w_am.wav', 'welded', { durationMs: 300 }),
  an: makeMeta('an', 'an', 'w_an.wav', 'welded', { durationMs: 300 }),
  all: makeMeta('all', 'all', 'w_all.wav', 'welded', { durationMs: 350 }),
  ang: makeMeta('ang', 'ang', 'w_ang.wav', 'welded', { durationMs: 315 }),
  ing: makeMeta('ing', 'ing', 'w_ing.wav', 'welded', { durationMs: 285 }),
  ong: makeMeta('ong', 'ong', 'w_ong.wav', 'welded', { durationMs: 315 }),
  ung: makeMeta('ung', 'ung', 'w_ung.wav', 'welded', { durationMs: 295 }),
  ank: makeMeta('ank', 'ank', 'w_ank.wav', 'welded', { durationMs: 315 }),
  ink: makeMeta('ink', 'ink', 'w_ink.wav', 'welded', { durationMs: 295 }),
  onk: makeMeta('onk', 'onk', 'w_onk.wav', 'welded', { durationMs: 315 }),
  unk: makeMeta('unk', 'unk', 'w_unk.wav', 'welded', { durationMs: 305 }),
};

// ============================================================================
// R-CONTROLLED VOWELS
// ============================================================================
export const R_CONTROLLED: Record<string, PhonemeMetadata> = {
  ar: makeMeta('ar', 'ar', null, 'r_controlled', { durationMs: 350 }),
  or: makeMeta('or', 'or', null, 'r_controlled', { durationMs: 350 }),
  er: makeMeta('er', 'er', null, 'r_controlled', { durationMs: 315 }),
  ir: makeMeta('ir', 'er', null, 'r_controlled', { durationMs: 315 }),
  ur: makeMeta('ur', 'er', null, 'r_controlled', { durationMs: 315 }),
};

// ============================================================================
// VOWEL TEAMS
// ============================================================================
export const VOWEL_TEAMS: Record<string, PhonemeMetadata> = {
  ai: makeMeta('ai', 'ā', null, 'vowel_team', { durationMs: 350 }),
  ay: makeMeta('ay', 'ā', null, 'vowel_team', { durationMs: 350 }),
  ee: makeMeta('ee', 'ē', null, 'vowel_team', { durationMs: 340 }),
  ea: makeMeta('ea', 'ē', null, 'vowel_team', { durationMs: 340 }),
  ey: makeMeta('ey', 'ē', null, 'vowel_team', { durationMs: 340 }),
  oa: makeMeta('oa', 'ō', null, 'vowel_team', { durationMs: 360 }),
  ow_long: makeMeta('ow', 'ō', null, 'vowel_team', { durationMs: 360 }),
  ow_diphthong: makeMeta('ow', 'ow', null, 'vowel_team', { durationMs: 360 }),
  oe: makeMeta('oe', 'ō', null, 'vowel_team', { durationMs: 360 }),
  ie: makeMeta('ie', 'ī', null, 'vowel_team', { durationMs: 370 }),
  igh: makeMeta('igh', 'ī', null, 'vowel_team', { durationMs: 370 }),
  ue: makeMeta('ue', 'ū', null, 'vowel_team', { durationMs: 350 }),
  ew: makeMeta('ew', 'ū', null, 'vowel_team', { durationMs: 350 }),
  oo_long: makeMeta('oo', 'ū', null, 'vowel_team', { durationMs: 350 }),
  oo_short: makeMeta('oo', 'ŏŏ', null, 'vowel_team', { durationMs: 240 }),
  ou: makeMeta('ou', 'ow', null, 'vowel_team', { durationMs: 360 }),
};

// ============================================================================
// BLENDS (pre-recorded for smooth coarticulation)
// ============================================================================
export const BLENDS: Record<string, PhonemeMetadata> = {
  // L-blends
  bl: makeMeta('bl', 'bl', null, 'blend', { durationMs: 400 }),
  cl: makeMeta('cl', 'cl', null, 'blend', { durationMs: 360 }),
  fl: makeMeta('fl', 'fl', null, 'blend', { durationMs: 400 }),
  gl: makeMeta('gl', 'gl', null, 'blend', { durationMs: 400 }),
  pl: makeMeta('pl', 'pl', null, 'blend', { durationMs: 360 }),
  sl: makeMeta('sl', 'sl', null, 'blend', { durationMs: 450 }),
  // R-blends
  br: makeMeta('br', 'br', null, 'blend', { durationMs: 430 }),
  cr: makeMeta('cr', 'cr', null, 'blend', { durationMs: 400 }),
  dr: makeMeta('dr', 'dr', null, 'blend', { durationMs: 430 }),
  fr: makeMeta('fr', 'fr', null, 'blend', { durationMs: 450 }),
  gr: makeMeta('gr', 'gr', null, 'blend', { durationMs: 430 }),
  pr: makeMeta('pr', 'pr', null, 'blend', { durationMs: 400 }),
  tr: makeMeta('tr', 'tr', null, 'blend', { durationMs: 400 }),
  // S-blends
  sc: makeMeta('sc', 'sk', null, 'blend', { durationMs: 400 }),
  sk: makeMeta('sk', 'sk', null, 'blend', { durationMs: 400 }),
  sm: makeMeta('sm', 'sm', null, 'blend', { durationMs: 450 }),
  sn: makeMeta('sn', 'sn', null, 'blend', { durationMs: 450 }),
  sp: makeMeta('sp', 'sp', null, 'blend', { durationMs: 400 }),
  st: makeMeta('st', 'st', null, 'blend', { durationMs: 400 }),
  sw: makeMeta('sw', 'sw', null, 'blend', { durationMs: 400 }),
  // End blends
  ft: makeMeta('ft', 'ft', null, 'blend', { durationMs: 300 }),
  lt: makeMeta('lt', 'lt', null, 'blend', { durationMs: 330 }),
  mp: makeMeta('mp', 'mp', null, 'blend', { durationMs: 330 }),
  nd: makeMeta('nd', 'nd', null, 'blend', { durationMs: 330 }),
};

// ============================================================================
// SILENT (for magic-e)
// ============================================================================
export const SILENT: PhonemeMetadata = makeMeta('e', '', null, 'silent', {
  durationMs: 100,
});

// ============================================================================
// EXCEPTION WORD DICTIONARIES
// ============================================================================

/** Words where 'th' is voiced (like "this") instead of unvoiced (like "think") */
export const VOICED_TH_WORDS = new Set([
  'the',
  'this',
  'that',
  'them',
  'then',
  'there',
  'these',
  'those',
  'they',
  'their',
  'with',
  'other',
  'mother',
  'father',
  'brother',
  'weather',
  'together',
]);

/** Words where 'ow' says /aʊ/ (cow) instead of /oʊ/ (snow) */
export const OW_DIPHTHONG_WORDS = new Set([
  'cow',
  'how',
  'now',
  'bow',
  'wow',
  'down',
  'town',
  'brown',
  'crown',
  'frown',
  'gown',
  'clown',
  'crowd',
  'loud',
  'cloud',
  'proud',
  'out',
  'about',
  'shout',
]);

/** Words where 'oo' says /ʊ/ (book) instead of /uː/ (moon) */
export const OO_SHORT_WORDS = new Set([
  'book',
  'look',
  'cook',
  'hook',
  'took',
  'good',
  'wood',
  'hood',
  'stood',
  'foot',
  'wool',
  'brook',
  'crook',
  'shook',
]);

/** Words where 'ea' says /ɛ/ (bread) instead of /iː/ (read) */
export const EA_SHORT_WORDS = new Set([
  'bread',
  'head',
  'dead',
  'read', // past tense
  'spread',
  'thread',
  'breath',
  'death',
  'health',
  'wealth',
  'meant',
  'sweat',
  'threat',
  'instead',
  'breakfast',
  'heaven',
  'heavy',
]);

// ============================================================================
// UNIFIED LOOKUP
// ============================================================================

/**
 * All phonemes in a single map for quick lookup
 * Keys are graphemes, values are metadata
 */
export const ALL_PHONEMES: Record<string, PhonemeMetadata> = {
  // Short vowels
  ...SHORT_VOWELS,
  // Continuous consonants
  ...CONTINUOUS_CONSONANTS,
  // Stop consonants
  ...STOP_CONSONANTS,
};

/**
 * Multi-letter patterns for parsing priority
 * Ordered by length (longest first) for proper matching
 */
export const MULTI_LETTER_PATTERNS = {
  // 3+ letter patterns
  trigraphs: ['igh'] as const,
  // Welded sounds (check at word end)
  welded: ['ank', 'ink', 'onk', 'unk', 'ang', 'ing', 'ong', 'ung', 'all', 'am', 'an'] as const,
  // R-controlled
  rControlled: ['ar', 'or', 'er', 'ir', 'ur'] as const,
  // Vowel teams
  vowelTeams: ['ai', 'ay', 'ee', 'ea', 'ey', 'oa', 'ow', 'oe', 'ie', 'ue', 'ew', 'oo', 'ou'] as const,
  // Digraphs
  digraphs: ['sh', 'ch', 'th', 'wh', 'ng', 'ck', 'ph'] as const,
  // Blends
  blends: [
    'bl',
    'cl',
    'fl',
    'gl',
    'pl',
    'sl',
    'br',
    'cr',
    'dr',
    'fr',
    'gr',
    'pr',
    'tr',
    'sc',
    'sk',
    'sm',
    'sn',
    'sp',
    'st',
    'sw',
    'ft',
    'lt',
    'mp',
    'nd',
  ] as const,
};

/**
 * Get phoneme metadata for a single-letter grapheme
 */
export const getPhonemeMetadata = (grapheme: string): PhonemeMetadata | undefined => {
  return ALL_PHONEMES[grapheme.toLowerCase()];
};

/**
 * Get metadata for a multi-letter unit (digraph, blend, welded, etc.)
 */
export const getMultiLetterMetadata = (
  grapheme: string,
  category: keyof typeof MULTI_LETTER_PATTERNS,
): PhonemeMetadata | undefined => {
  const key = grapheme.toLowerCase();
  switch (category) {
    case 'welded':
      return WELDED_SOUNDS[key];
    case 'rControlled':
      return R_CONTROLLED[key];
    case 'vowelTeams':
      return VOWEL_TEAMS[key] || VOWEL_TEAMS[`${key}_long`];
    case 'digraphs':
      return DIGRAPHS[key];
    case 'blends':
      return BLENDS[key];
    case 'trigraphs':
      return VOWEL_TEAMS[key];
    default:
      return undefined;
  }
};

/**
 * Check if a phoneme has audio available
 */
export const hasAudioFile = (metadata: PhonemeMetadata): boolean => {
  return Boolean(metadata.audioFile);
};

/**
 * Get list of all graphemes that have audio files
 */
export const getAvailableGraphemes = (): string[] => {
  return Object.entries(ALL_PHONEMES)
    .filter(([, meta]) => hasAudioFile(meta))
    .map(([grapheme]) => grapheme);
};
