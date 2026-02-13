import type { Provider } from "@/lib/types";

export interface WordContextMatch {
  provider: Provider;
  providerLabel: string;
  excerpts: string[];
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
};

/**
 * Find sentences containing a given word across all provider texts.
 * Returns up to `maxExcerpts` matching sentences per provider, with
 * the matched word highlighted using **bold** markers.
 */
export function findWordContext(
  word: string,
  providerTexts: Record<string, string>,
  maxExcerpts = 3
): WordContextMatch[] {
  const results: WordContextMatch[] = [];
  const wordLower = word.toLowerCase();
  // Match word boundaries — handles punctuation around the word
  const wordRegex = new RegExp(`\\b${escapeRegex(wordLower)}\\b`, "gi");

  for (const [provider, text] of Object.entries(providerTexts)) {
    // Split into sentences (handles ., !, ?, and newlines as boundaries)
    const sentences = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const matchingSentences: string[] = [];

    for (const sentence of sentences) {
      if (matchingSentences.length >= maxExcerpts) break;

      if (wordRegex.test(sentence)) {
        // Reset regex lastIndex since we're using 'g' flag
        wordRegex.lastIndex = 0;
        matchingSentences.push(sentence);
      }
    }

    if (matchingSentences.length > 0) {
      results.push({
        provider: provider as Provider,
        providerLabel: PROVIDER_LABELS[provider as Provider] || provider,
        excerpts: matchingSentences,
      });
    }
  }

  return results;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
