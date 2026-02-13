"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import WordCloud from "@/components/WordCloud";
import WordContextModal from "@/components/WordContextModal";
import EntityList from "@/components/EntityList";
import CitationList from "@/components/CitationList";
import ProgressTracker from "@/components/ProgressTracker";
import Footer from "@/components/Footer";
import { findWordContext, type WordContextMatch } from "@/lib/analysis/word-context";
import type {
  WordCloudWord,
  CombinedEntities,
  CombinedCitation,
  Provider,
} from "@/lib/types";

interface Props {
  topic: string;
  wordCloudData: WordCloudWord[];
  entities: CombinedEntities;
  citations: CombinedCitation[];
  providerStatuses: { provider: Provider; status: "done" | "failed" }[];
  partialFailureMessage: string | null;
  analysisId: string;
  providerTexts: Record<string, string>;
}

export default function ResultsContent({
  topic,
  wordCloudData,
  entities,
  citations,
  providerStatuses,
  partialFailureMessage,
  analysisId,
  providerTexts,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [contextModal, setContextModal] = useState<{
    word: string;
    matches: WordContextMatch[];
  } | null>(null);

  const handleWordClick = useCallback(
    (word: string) => {
      const matches = findWordContext(word, providerTexts);
      setContextModal({ word, matches });
    },
    [providerTexts]
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/results/${analysisId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[--text-primary] mb-2">
              {topic}
            </h1>
            <p className="text-[--text-secondary] mb-4">AI Topic Analysis</p>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[--text-secondary] bg-white/50 border border-black/6 rounded-xl hover:border-[--accent-cyan]/40 hover:text-[--accent-cyan] hover:bg-[--accent-cyan-muted] transition-all duration-200"
            >
              {copied ? "Link copied!" : "Share results"}
            </button>
          </div>

          {/* Provider status bar */}
          <div className="mb-6">
            <ProgressTracker providers={providerStatuses} />
          </div>

          {/* Partial failure banner */}
          {partialFailureMessage && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700 text-center">
              {partialFailureMessage}
            </div>
          )}

          {/* Word Cloud */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[--text-primary] mb-4">
              Key Terms
            </h2>
            <WordCloud words={wordCloudData} onWordClick={handleWordClick} />
          </section>

          {/* Entities */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[--text-primary] mb-4">
              Named Entities
            </h2>
            <EntityList entities={entities} />
          </section>

          {/* Citations */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[--text-primary] mb-4">
              Citations
            </h2>
            <CitationList citations={citations} />
          </section>

          {/* Back button */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[--accent-cyan] to-[--accent-violet] rounded-2xl hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] focus:outline-none focus:ring-2 focus:ring-[--accent-cyan]/30 transition-all duration-300"
            >
              Analyze Another Topic
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {contextModal && (
        <WordContextModal
          word={contextModal.word}
          matches={contextModal.matches}
          onClose={() => setContextModal(null)}
        />
      )}
    </div>
  );
}
