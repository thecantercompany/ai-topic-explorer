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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-4 pt-24 pb-12">
          <div className="max-w-3xl w-full text-center">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              AI Topic Explorer
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
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
                  className="w-full px-6 py-4 text-lg border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? "Analyzing..." : "Explore Topic"}
                </button>
              </div>
              {error && (
                <p className="mt-4 text-red-600 font-medium">{error}</p>
              )}
            </form>

            {/* Example Topics */}
            <div className="text-sm text-slate-500">
              <p className="mb-3">Try an example:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_TOPICS.map((example) => (
                  <button
                    key={example}
                    onClick={() => setTopic(example)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-full hover:border-blue-500 hover:text-blue-600 transition text-sm"
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

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
