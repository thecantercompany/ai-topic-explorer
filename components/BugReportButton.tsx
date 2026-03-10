"use client";

import { useState, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    setStatus("idle");
    setDescription("");
    trackEvent({ action: "bug_report_opened" });
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setStatus("submitting");
    trackEvent({ action: "bug_report_submitted" });

    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setStatus("success");
        setDescription("");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Floating pill button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full glass-tier-2 text-sm font-medium text-[--text-secondary] hover:text-[--accent-cyan] hover:border-[--accent-cyan]/30 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Report a Bug"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 014-4h4a4 4 0 014 4v3c0 3.3-2.7 6-6 6z" />
          <path d="M12 20v2M6 13H2M22 13h-4M6 17H3.5M20.5 17H18M6 9H3.5M20.5 9H18" />
        </svg>
        Report a Bug
      </button>

      {/* Modal */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative glass-tier-3 max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-[--text-tertiary] hover:text-[--text-primary] transition-colors text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-[--text-primary] mb-2">
              Report a Bug
            </h2>
            <p className="text-sm text-[--text-secondary] mb-4">
              Describe what went wrong and we&apos;ll look into it.
            </p>

            {status === "success" ? (
              <div className="text-center py-6">
                <p className="text-[--accent-cyan] font-semibold">
                  Thank you!
                </p>
                <p className="text-sm text-[--text-tertiary] mt-1">
                  Your report has been submitted.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect?"
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-white/80 border border-black/12 text-[--text-primary] placeholder-[--text-tertiary] focus:outline-none focus:border-[--accent-cyan]/50 focus:ring-2 focus:ring-[--accent-cyan]/15 focus:bg-white/90 backdrop-blur-xl transition-all duration-300 resize-none"
                  disabled={status === "submitting"}
                  aria-label="Bug description"
                />
                <div className="flex items-center justify-between mt-1 mb-4">
                  <p className="text-xs text-[--text-tertiary]">
                    Page URL and browser info included automatically.
                  </p>
                  <span className="text-xs text-[--text-tertiary]">
                    {description.length}/2000
                  </span>
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500 mb-3">
                    Failed to submit. Please try again.
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!description.trim() || status === "submitting"}
                  className="btn-primary w-full px-4 py-2.5 rounded-xl text-sm"
                >
                  {status === "submitting" ? "Submitting..." : "Submit Report"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
