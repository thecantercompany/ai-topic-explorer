"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MethodologySection from "@/components/MethodologySection";
import Footer from "@/components/Footer";

const EXAMPLE_TOPICS = [
  "Climate change policy",
  "Artificial intelligence ethics",
  "Renewable energy in Texas",
  "Oil and gas in New Mexico",
  "Space exploration missions",
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center px-4 pt-28 pb-16">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0 hero-mesh-bg animate-gradient-shift pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-2xl w-full text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[--text-primary] via-[--accent-cyan] to-[--accent-violet] bg-clip-text text-transparent">
              AI Topic Explorer
            </h1>
            <p className="text-lg text-[--text-secondary] mb-12 max-w-2xl mx-auto leading-relaxed">
              Enter any topic and see what AI knows about it. We query multiple
              AI models and combine their responses into word clouds, named
              entities, and citations.
            </p>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder='Enter a topic... (e.g., "oil and gas in New Mexico")'
                  className="w-full px-6 py-4 text-lg rounded-2xl bg-white/60 border border-black/8 text-[--text-primary] placeholder-[--text-tertiary] focus:outline-none focus:border-[--accent-cyan]/50 focus:ring-2 focus:ring-[--accent-cyan]/15 focus:bg-white/80 backdrop-blur-xl transition-all duration-300"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[--accent-cyan] to-[--accent-violet] rounded-2xl hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] focus:outline-none focus:ring-2 focus:ring-[--accent-cyan]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    "Explore Topic"
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-4 text-red-500 font-medium">{error}</p>
              )}
            </form>

            {/* Example Topics */}
            <div className="text-sm text-[--text-secondary]">
              <p className="mb-3">Try an example:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_TOPICS.map((example) => (
                  <button
                    key={example}
                    onClick={() => setTopic(example)}
                    className="px-4 py-2 bg-white/50 border border-black/6 rounded-full hover:border-[--accent-cyan]/40 hover:text-[--accent-cyan] hover:bg-[--accent-cyan-muted] transition-all duration-200 text-sm"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Section */}
        <MethodologySection />
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
