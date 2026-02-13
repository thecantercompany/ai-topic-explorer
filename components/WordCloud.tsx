"use client";

import ReactWordcloud, { type Word } from "@cp949/react-wordcloud";
import type { WordCloudWord } from "@/lib/types";

interface Props {
  words: WordCloudWord[];
}

const options = {
  colors: ["#14532d", "#15803d", "#22c55e", "#4ade80", "#86efac", "#166534"],
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
  tooltipOptions: {
    theme: "custom",
    appendTo: () => document.body,
  },
};

export default function WordCloud({ words }: Props) {
  if (words.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
        <p className="text-green-500">No word frequency data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <div className="h-80 w-full">
        <ReactWordcloud words={words as unknown as Word[]} options={options} />
      </div>
    </div>
  );
}
