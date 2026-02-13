"use client";

import ReactWordcloud, { type Word } from "@cp949/react-wordcloud";
import type { WordCloudWord } from "@/lib/types";

interface Props {
  words: WordCloudWord[];
}

const options = {
  colors: ["#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#475569"],
  enableTooltip: true,
  deterministic: true,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSizes: [18, 60] as [number, number],
  fontWeight: "600",
  padding: 3,
  rotations: 2,
  rotationAngles: [0, 90] as [number, number],
  scale: "sqrt" as const,
  spiral: "archimedean" as const,
};

export default function WordCloud({ words }: Props) {
  if (words.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No word frequency data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="h-80 w-full">
        <ReactWordcloud words={words as unknown as Word[]} options={options} />
      </div>
    </div>
  );
}
