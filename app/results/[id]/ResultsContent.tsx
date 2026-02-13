"use client";

import { useState } from "react";
import Link from "next/link";
import WordCloud from "@/components/WordCloud";
import EntityList from "@/components/EntityList";
import CitationList from "@/components/CitationList";
import ProgressTracker from "@/components/ProgressTracker";
import Footer from "@/components/Footer";
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
}

export default function ResultsContent({
  topic,
  wordCloudData,
  entities,
  citations,
  providerStatuses,
  partialFailureMessage,
  analysisId,
}: Props) {
  const [copied, setCopied] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {topic}
            </h1>
            <p className="text-slate-500 mb-4">AI Topic Analysis</p>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
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
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 text-center">
              {partialFailureMessage}
            </div>
          )}

          {/* Word Cloud */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Key Terms
            </h2>
            <WordCloud words={wordCloudData} />
          </section>

          {/* Entities */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Named Entities
            </h2>
            <EntityList entities={entities} />
          </section>

          {/* Citations */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Citations
            </h2>
            <CitationList citations={citations} />
          </section>

          {/* Back button */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Analyze Another Topic
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
