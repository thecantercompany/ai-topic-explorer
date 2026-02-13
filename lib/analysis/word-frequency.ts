import type { WordFrequency, WordCloudWord } from "@/lib/types";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would", "should",
  "could", "may", "might", "must", "can", "this", "that", "these", "those",
  "i", "you", "he", "she", "it", "we", "they", "what", "which", "who",
  "when", "where", "why", "how", "all", "each", "every", "both", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "than", "too", "very", "just", "about", "also",
  "into", "over", "after", "before", "between", "through", "during",
  "above", "below", "under", "again", "further", "then", "once", "here",
  "there", "any", "many", "much", "well", "also", "its", "his", "her",
  "their", "our", "your", "my", "me", "him", "them", "us", "been", "being",
  "having", "doing", "while", "until", "since", "because", "although",
  "though", "however", "therefore", "thus", "hence", "yet", "still",
  "already", "always", "never", "sometimes", "often", "usually", "rather",
  "quite", "really", "even", "perhaps", "maybe", "likely", "certainly",
  "including", "such", "several", "various", "among", "within", "without",
  "along", "across", "around", "upon", "toward", "towards", "against",
  "per", "via", "like", "unlike", "despite", "regarding", "concerning",
  "given", "based", "according", "provide", "provides", "provided",
  "include", "includes", "included", "make", "makes", "made",
]);

export function calculateWordFrequency(text: string): WordFrequency[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  return Array.from(frequencyMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);
}

export function mergeWordFrequencies(
  ...frequencyLists: WordFrequency[][]
): WordFrequency[] {
  const merged = new Map<string, number>();

  for (const list of frequencyLists) {
    for (const { word, count } of list) {
      merged.set(word, (merged.get(word) || 0) + count);
    }
  }

  return Array.from(merged.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);
}

export function toWordCloudData(frequencies: WordFrequency[]): WordCloudWord[] {
  return frequencies.map(({ word, count }) => ({
    text: word,
    value: count,
  }));
}
