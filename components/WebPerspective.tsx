"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { KeyTheme } from "@/lib/types";

interface Props {
  rawText: string;
  keyThemes: KeyTheme[];
  relatedQuestions: string[];
}

export default function WebPerspective({ rawText, keyThemes, relatedQuestions }: Props) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = rawText.split(/\n\n+/).filter(Boolean);
  const previewParagraphs = paragraphs.slice(0, 3);
  const hasMore = paragraphs.length > 3;
  const displayParagraphs = expanded ? paragraphs : previewParagraphs;

  return (
    <div className="rounded-2xl border-l-4 border-purple-400 bg-purple-50/40 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-purple-700">Web Perspective</h3>
        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
          Perplexity
        </span>
      </div>
      <p className="text-xs text-[--text-tertiary] mb-4">
        Insights grounded in real-time web search, distinct from AI training data.
      </p>

      {/* Analysis text */}
      {paragraphs.length > 0 && (
        <div className="space-y-3 text-sm text-[--text-secondary] leading-relaxed mb-4">
          {displayParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {hasMore && (
        <button
          onClick={() => {
            setExpanded(!expanded);
            trackEvent({ action: "web_perspective_toggle", params: { expanded: !expanded } });
          }}
          className="text-purple-600 text-sm hover:underline mb-4"
        >
          {expanded ? "Show less" : `Show more (${paragraphs.length - 3} more paragraphs)`}
        </button>
      )}

      {/* Key themes from Perplexity */}
      {keyThemes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
            Web Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {keyThemes.slice(0, 10).map((theme) => (
              <span
                key={theme.phrase}
                className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium"
              >
                {theme.phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related questions */}
      {relatedQuestions.length > 0 && (
        <div className="border-t border-purple-200/50 pt-4 mt-4">
          <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
            Explore Further
          </h4>
          <div className="flex flex-col gap-2">
            {relatedQuestions.map((question, i) => (
              <Link
                key={i}
                href={`/?topic=${encodeURIComponent(question)}`}
                onClick={() =>
                  trackEvent({ action: "related_question_clicked", params: { question } })
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 border border-purple-200/50 hover:border-purple-400 hover:bg-white text-sm text-[--text-secondary] hover:text-purple-700 transition-all group"
              >
                <span className="text-purple-400 group-hover:text-purple-600 transition-colors">
                  &rarr;
                </span>
                {question}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
