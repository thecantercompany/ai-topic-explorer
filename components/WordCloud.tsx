"use client";

import { useCallback } from "react";
import ReactWordcloud, { type Word } from "@cp949/react-wordcloud";
import type { WordCloudWord } from "@/lib/types";

interface Props {
  words: WordCloudWord[];
  onWordClick?: (word: string) => void;
}

const options = {
  colors: ["#0891b2", "#0e7490", "#7c3aed", "#06b6d4", "#6d28d9", "#155e75"],
  enableTooltip: true,
  deterministic: true,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSizes: [18, 60] as [number, number],
  fontWeight: "600",
  padding: 3,
  rotations: 2,
  rotationAngles: [0, 90] as [number, number],
  scale: "sqrt" as const,
  spiral: "archimedean" as const,
  tooltipOptions: {
    theme: "custom",
    appendTo: () => document.body,
  },
};

export default function WordCloud({ words, onWordClick }: Props) {
  const callbacks = useCallback(
    () => ({
      onWordClick: onWordClick
        ? (word: Word) => onWordClick(word.text)
        : undefined,
    }),
    [onWordClick]
  );

  if (words.length === 0) {
    return (
      <div className="glass-tier-2 rounded-2xl p-8 text-center">
        <p className="text-[--text-tertiary]">No word frequency data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-tier-2 rounded-2xl p-6">
      <div className="h-80 w-full [&_text]:cursor-pointer">
        <ReactWordcloud
          words={words as unknown as Word[]}
          options={options}
          callbacks={callbacks()}
        />
      </div>
      <p className="mt-2 text-xs text-[--text-tertiary] text-center">
        Click any word to see it in context
      </p>
    </div>
  );
}
