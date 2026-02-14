"use client";

import { useState, useRef, useEffect } from "react";

const CHANGELOG = [
  {
    date: "Feb 14, 11:21 AM",
    description: "Add changelog modal to footer",
  },
  {
    date: "Feb 14, 11:18 AM",
    description:
      "Add GA4 analytics, event tracking, and increase max AI response length",
  },
  {
    date: "Feb 14, 10:55 AM",
    description:
      "Add OpenAI, Gemini, and Perplexity providers for multi-AI comparison",
  },
  {
    date: "Feb 13, 6:50 AM",
    description:
      "Fix mobile overflow on Key Themes, Citations, and main content area",
  },
  {
    date: "Feb 13, 12:02 AM",
    description:
      "Add OG/Twitter metadata, expand floating keywords, and improve UI polish",
  },
];

export default function Footer() {
  const [showChangelog, setShowChangelog] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showChangelog) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setShowChangelog(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showChangelog]);

  return (
    <>
      <footer className="py-8 px-8 border-t border-black/5 text-center">
        <p className="text-xs text-[--text-tertiary]">
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/joshuacanter/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-[--accent-cyan] transition-colors"
          >
            The Canter Company
          </a>
          <span className="mx-1.5">&middot;</span>
          <button
            onClick={() => setShowChangelog(true)}
            className="hover:text-[--accent-cyan] transition-colors underline underline-offset-2"
          >
            Changelog
          </button>
        </p>
      </footer>

      {showChangelog && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) setShowChangelog(false);
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative glass-tier-3 max-w-md w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowChangelog(false)}
              className="absolute top-4 right-4 text-[--text-tertiary] hover:text-[--text-primary] transition-colors text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-[--text-primary] mb-5">
              Changelog
            </h2>

            <div className="space-y-4">
              {CHANGELOG.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-semibold text-[--accent-cyan] whitespace-nowrap pt-0.5">
                    {entry.date}
                  </span>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
