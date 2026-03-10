"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "beta-banner-dismissed";

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-[--accent-cyan]/[0.07] border-b border-[--accent-cyan]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <p className="text-sm text-[--text-secondary]">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[--accent-cyan]/10 text-[--accent-cyan] mr-2">
            Beta
          </span>
          This site is in beta &mdash; if something seems off, let us know via
          Report a Bug below.
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-[--text-tertiary] hover:text-[--text-primary] transition-colors text-lg leading-none p-1"
          aria-label="Dismiss beta banner"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
