function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}


export function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


export function similarity(a: string, b: string): number {
  const na = normalizeLabel(a);
  const nb = normalizeLabel(b);

  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  if (na.includes(nb) || nb.includes(na)) return 0.9;

  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - dist / maxLen;
}

export const FUZZY_THRESHOLD = 0.50;


export function findSimilarCategories<T extends { label: string; isDefault?: boolean }>(
  input: string,
  categories: T[],
  threshold = FUZZY_THRESHOLD,
): Array<T & { score: number }> {
  if (!input.trim()) return [];

  return categories
    .filter((cat) => !cat.isDefault)
    .map((cat) => ({ ...cat, score: similarity(input, cat.label) }))
    .filter((cat) => cat.score >= threshold && normalizeLabel(cat.label) !== normalizeLabel(input))
    .sort((a, b) => b.score - a.score);
}