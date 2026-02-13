"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingKeywords from "@/components/FloatingKeywords";
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
      <main className="flex-1 flex flex-col">
        {/* Split hero section */}
        <div className="flex-1 relative flex items-center">
          {/* Mesh bg overlay */}
          <div className="absolute inset-0 hero-mesh-bg animate-gradient-shift pointer-events-none" aria-hidden="true" />

          <div className="relative w-full max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:min-h-[calc(100vh-80px)] md:items-center">
            {/* LEFT — Search */}
            <div className="col-span-1 md:col-span-7 py-16 md:py-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[--text-primary] via-[--accent-cyan] to-[--accent-violet] bg-clip-text text-transparent">
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
                <p className="mb-3">Try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_TOPICS.map((example) => (
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
    </div>
  );
}
