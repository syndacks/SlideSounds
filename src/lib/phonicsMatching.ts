export type MatchStatus = 'none' | 'close' | 'match';

const LETTER_ALIAS_MAP: Record<string, string[]> = {
  a: ['a', 'ay', 'ah', 'uh', 'eh'],
  b: ['b', 'bee', 'buh', 'beh'],
  c: ['c', 'cee', 'see', 'kuh', 'cuh'],
  d: ['d', 'dee', 'duh'],
  e: ['e', 'ee', 'eh', 'ih'],
  f: ['f', 'ef', 'eff'],
  g: ['g', 'jee', 'geh', 'guh'],
  h: ['h', 'aitch', 'ha', 'huh'],
  i: ['i', 'eye', 'ih', 'aye'],
  j: ['j', 'jay', 'juh'],
  k: ['k', 'kay', 'kuh'],
  l: ['l', 'el', 'ell', 'uhl'],
  m: ['m', 'em', 'mmm', 'um'],
  n: ['n', 'en', 'nnn', 'un'],
  o: ['o', 'oh', 'aw', 'ah'],
  p: ['p', 'pee', 'puh'],
  q: ['q', 'cue', 'coo', 'kuh'],
  r: ['r', 'ar', 'err'],
  s: ['s', 'ess', 'sss'],
  t: ['t', 'tee', 'tuh'],
  u: ['u', 'you', 'uh', 'oo'],
  v: ['v', 'vee', 'vvv'],
  w: ['w', 'doubleyou', 'dubya', 'wuh'],
  x: ['x', 'ex', 'cks'],
  y: ['y', 'why', 'yee'],
  z: ['z', 'zee', 'zed'],
};

/**
 * Normalize user speech into a safe, comparable form. We preserve spaces so that
 * callers can inspect tokens, but we also return a collapsed version for
 * side-by-side matching.
 */
const normalizeUtterance = (
  value: string,
): { tokens: string[]; collapsed: string } => {
  const cleaned = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return { tokens: [], collapsed: '' };
  }
  const tokens = cleaned.split(' ');
  return { tokens, collapsed: tokens.join('') };
};

/**
 * Basic Levenshtein distance implementation for fuzzy comparison.
 */
const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, row) => [
    row,
    ...Array(a.length).fill(0),
  ]);

  for (let i = 1; i <= b.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 1; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const canonicalize = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const buildAliasSet = (expectedUtterances: string[]): Set<string> => {
  const aliases = new Set<string>();
  expectedUtterances.forEach((utterance) => {
    const canonical = canonicalize(utterance);
    if (canonical) {
      aliases.add(canonical);
    }
    const aliasList = LETTER_ALIAS_MAP[canonical] ?? [];
    aliasList.forEach((alias) => {
      const normalizedAlias = canonicalize(alias);
      if (normalizedAlias) {
        aliases.add(normalizedAlias);
      }
    });
  });
  return aliases;
};

/**
 * Determine how close the spoken utterance is to any of the expected options.
 */
export const evaluatePhonicsMatch = (
  spokenText: string,
  expectedUtterances: string[],
): MatchStatus => {
  if (!spokenText || expectedUtterances.length === 0) {
    return 'none';
  }

  const aliasSet = buildAliasSet(expectedUtterances);
  const { tokens, collapsed } = normalizeUtterance(spokenText);
  if (!collapsed && tokens.length === 0) {
    return 'none';
  }

  const candidates = new Set<string>();
  if (collapsed) candidates.add(collapsed);
  tokens.forEach((token) => {
    const canonicalToken = canonicalize(token);
    if (canonicalToken) {
      candidates.add(canonicalToken);
    }
  });

  if (candidates.size === 0) {
    return 'none';
  }

  for (const candidate of candidates) {
    if (aliasSet.has(candidate)) {
      return 'match';
    }
  }

  for (const candidate of candidates) {
    for (const target of aliasSet) {
      if (!target) continue;
      if (
        candidate.length >= 2 &&
        (target.includes(candidate) || candidate.includes(target))
      ) {
        return 'close';
      }
      const distance = levenshteinDistance(candidate, target);
      const maxLength = Math.max(candidate.length, target.length);
      const normalizedDistance = distance / Math.max(1, maxLength);
      if (normalizedDistance <= 0.34) {
        // Very short words (letters / CVC) can be considered a full match.
        return maxLength <= 3 ? 'match' : 'close';
      }
    }
  }

  return 'none';
};
