import type { KeyTheme } from "@/lib/types";

export function mergeKeyThemes(...themeLists: KeyTheme[][]): KeyTheme[] {
  const allThemes = themeLists.flat();
  const merged = new Map<string, KeyTheme>();

  for (const theme of allThemes) {
    const key = theme.phrase.toLowerCase().trim();
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...theme });
    } else if (theme.relevance > existing.relevance) {
      merged.set(key, { ...theme });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20);
}
