"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FloatingKeywords from "@/components/FloatingKeywords";
import Footer from "@/components/Footer";

const ALL_TOPICS = [
  "Climate change policy",
  "Artificial intelligence ethics",
  "Renewable energy in Texas",
  "Oil and gas in New Mexico",
  "Space exploration missions",
  "Quantum computing breakthroughs",
  "Gene editing with CRISPR",
  "Electric vehicle adoption",
  "Cybersecurity threats in 2026",
  "Ocean plastic pollution",
  "Nuclear fusion progress",
  "Remote work and productivity",
  "Blockchain in supply chains",
  "Mental health in teens",
  "Autonomous vehicle regulation",
  "Water scarcity solutions",
  "Microplastics in food",
  "Dark matter research",
  "Antibiotic resistance",
  "Generative AI in education",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMethodology, setShowMethodology] = useState(false);
  const router = useRouter();
  const exampleTopics = useMemo(() => pickRandom(ALL_TOPICS, 5), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a topic to explore.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmedTopic }),
      });

      if (response.status === 429) {
        setError(
          "You've reached the analysis limit. Please try again in a few minutes."
        );
        setIsLoading(false);
        return;
      }

      if (response.status === 503) {
        setError("Analysis is temporarily unavailable. Please try again later.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Analysis failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      router.push(`/results/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Full-page mesh bg */}
      <div className="absolute inset-0 hero-mesh-bg animate-gradient-shift pointer-events-none" aria-hidden="true" />

      <main className="relative flex-1 flex flex-col">
        {/* Split hero section */}
        <div className="flex-1 flex items-center">

          <div className="relative w-full max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:min-h-[calc(100vh-80px)] md:items-center">
            {/* LEFT — Search */}
            <div className="col-span-1 md:col-span-7 py-16 md:py-0">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                style={{
                  background: "linear-gradient(to right, var(--text-primary), var(--accent-cyan), var(--accent-violet))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AI Topic Explorer
              </h1>
              <p className="text-lg text-[--text-secondary] mb-10 max-w-lg leading-relaxed">
                Enter any topic and see what AI knows about it. We query
                multiple models and combine their responses into word clouds,
                entities, and citations.
              </p>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='e.g. "oil and gas in New Mexico"'
                    className="flex-1 px-5 py-3.5 text-base rounded-2xl bg-white/80 border border-black/12 shadow-sm text-[--text-primary] placeholder-[--text-tertiary] focus:outline-none focus:border-[--accent-cyan]/50 focus:ring-2 focus:ring-[--accent-cyan]/15 focus:bg-white/90 backdrop-blur-xl transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary px-8 py-3.5 text-base rounded-2xl whitespace-nowrap"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                        Analyzing…
                      </span>
                    ) : (
                      "Explore"
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-4 text-red-500 font-medium text-sm">{error}</p>
                )}
              </form>

              {/* Example Topics */}
              <div className="text-sm text-[--text-secondary]">
                <div className="flex items-center gap-3 mb-3">
                  <p>Try an example:</p>
                  <button
                    onClick={() => setShowMethodology(true)}
                    className="text-[--accent-cyan] hover:text-[--accent-violet] transition-colors underline underline-offset-2"
                  >
                    How does this work?
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exampleTopics.map((example) => (
                    <button
                      key={example}
                      onClick={() => setTopic(example)}
                      className="pill-interactive px-4 py-2 rounded-full text-sm"
                      disabled={isLoading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Floating Keywords Visual */}
            <div className="hidden md:flex col-span-1 md:col-span-5 items-center justify-center">
              <FloatingKeywords />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Methodology Modal */}
      {showMethodology && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMethodology(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative glass-tier-3 max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMethodology(false)}
              className="absolute top-4 right-4 text-[--text-tertiary] hover:text-[--text-primary] transition-colors text-xl leading-none"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-[--text-primary] mb-4">
              How It Works
            </h2>

            <div className="space-y-4 text-sm text-[--text-secondary] leading-relaxed">
              <div>
                <h3 className="font-semibold text-[--text-primary] mb-1">1. Query Expansion</h3>
                <p>
                  Your topic is expanded into 3–4 distinct subtopic queries using AI, covering
                  different angles like history, current state, and key players. This ensures
                  comprehensive coverage rather than a single narrow perspective.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[--text-primary] mb-1">2. Multi-Model Analysis</h3>
                <p>
                  Each subtopic is sent to multiple AI models (Claude, GPT, Gemini) in parallel.
                  Each model independently generates a detailed response about the topic.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[--text-primary] mb-1">3. Word Cloud Generation</h3>
                <p>
                  All responses are tokenized and filtered — stop words and the topic terms
                  themselves are removed to avoid bias. The top 100 most frequent terms are
                  visualized as an interactive word cloud. Click any word to see it in context.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[--text-primary] mb-1">4. Entity Extraction</h3>
                <p>
                  People and organizations mentioned across all responses are extracted and
                  deduplicated. When available, reference URLs are included.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[--text-primary] mb-1">5. Citation Merging</h3>
                <p>
                  Recommended sources from each model are merged and ranked by how many
                  models independently cited them — giving higher weight to sources with
                  cross-model agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
