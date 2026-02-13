"use client";

import { useMemo } from "react";
import { pack, hierarchy } from "d3-hierarchy";
import type { WordCloudWord } from "@/lib/types";

interface Props {
  words: WordCloudWord[];
  onWordClick?: (word: string) => void;
}

const COLORS = [
  "#0891b2",
  "#06b6d4",
  "#7c3aed",
  "#6d28d9",
  "#0e7490",
  "#155e75",
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SIZE = 800;
const PADDING = 4;

export default function WordCloud({ words, onWordClick }: Props) {
  const bubbles = useMemo(() => {
    if (words.length === 0) return [];

    const root = hierarchy({ children: words } as { children: WordCloudWord[] })
      .sum((d) => (d as unknown as WordCloudWord).value || 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const packLayout = pack<{ children: WordCloudWord[] }>()
      .size([SIZE, SIZE])
      .padding(PADDING);

    const packed = packLayout(root);

    return packed.leaves().map((leaf, i) => {
      const d = leaf.data as unknown as WordCloudWord;
      const color = COLORS[i % COLORS.length];
      const fontSize = Math.max(8, Math.min(leaf.r * 0.65, 28));
      const showText = leaf.r > 14;

      return {
        x: leaf.x,
        y: leaf.y,
        r: leaf.r,
        text: d.text,
        color,
        fill: hexToRgba(color, 0.1),
        fillHover: hexToRgba(color, 0.22),
        fontSize,
        showText,
      };
    });
  }, [words]);

  if (words.length === 0) {
    return (
      <div className="glass-tier-2 rounded-2xl p-8 text-center">
        <p className="text-[--text-tertiary]">No word frequency data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-tier-2 rounded-2xl p-6">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full"
        style={{ maxHeight: "500px" }}
      >
        {bubbles.map((b, i) => (
          <g
            key={b.text}
            onClick={() => onWordClick?.(b.text)}
            className="cursor-pointer group"
            style={{
              animation: `bubble-fade-in 0.4s ease-out ${i * 0.01}s both`,
            }}
          >
            <circle
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill={b.fill}
              stroke={b.color}
              strokeWidth={1}
              strokeOpacity={0.2}
              className="transition-all duration-200 group-hover:scale-105"
              style={{ transformOrigin: `${b.x}px ${b.y}px` }}
            />
            {/* Hover overlay */}
            <circle
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill={b.fillHover}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
            {b.showText && (
              <text
                x={b.x}
                y={b.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={b.color}
                fontSize={b.fontSize}
                fontWeight={600}
                fontFamily="'Inter', system-ui, -apple-system, sans-serif"
                className="pointer-events-none select-none"
              >
                {b.text}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-[--text-tertiary] text-center">
        Click any bubble to see it in context
      </p>
    </div>
  );
}
