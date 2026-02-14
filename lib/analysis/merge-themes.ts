import type { KeyTheme } from "@/lib/types";

/**
 * Normalize a phrase for dedup: lowercase, trim, strip trailing 's' from each
 * word (simple plural handling), and collapse whitespace.
 */
function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/s$/, ""))
    .join(" ");
}

/**
 * Check if two normalized phrases are similar enough to be duplicates.
 * Uses a word-overlap ratio: if ≥80% of the words in the shorter phrase
 * appear in the longer one (after normalization), they're considered a match.
 */
function isSimilar(a: string, b: string): boolean {
  if (a === b) return true;

  const wordsA = a.split(" ");
  const wordsB = b.split(" ");
  const [shorter, longer] =
    wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];

  const longerSet = new Set(longer);
  const overlap = shorter.filter((w) => longerSet.has(w)).length;

  return overlap / shorter.length >= 0.8;
}

export function mergeKeyThemes(...themeLists: KeyTheme[][]): KeyTheme[] {
  const allThemes = themeLists.flat();
  // Each entry: normalized key → best theme so far
  const entries: { normalized: string; theme: KeyTheme }[] = [];

  for (const theme of allThemes) {
    const norm = normalizePhrase(theme.phrase);

    // Find an existing entry that matches
    const match = entries.find((e) => isSimilar(e.normalized, norm));

    if (!match) {
      entries.push({ normalized: norm, theme: { ...theme } });
    } else if (theme.relevance > match.theme.relevance) {
      // Keep the higher-relevance version (phrase text + score)
      match.theme = { ...theme };
      // Use the longer normalized form for future matching
      if (norm.length > match.normalized.length) {
        match.normalized = norm;
      }
    }
  }

  return entries
    .map((e) => e.theme)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20);
}
