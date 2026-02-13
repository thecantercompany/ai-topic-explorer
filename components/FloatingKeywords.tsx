"use client";

const KEYWORDS = [
  { text: "climate", top: 8, left: 10, size: 16, alt: false },
  { text: "energy", top: 18, left: 65, size: 20, alt: true },
  { text: "policy", top: 35, left: 5, size: 14, alt: true },
  { text: "technology", top: 28, left: 55, size: 18, alt: false },
  { text: "research", top: 52, left: 15, size: 22, alt: false },
  { text: "analysis", top: 48, left: 70, size: 16, alt: true },
  { text: "ethics", top: 65, left: 8, size: 15, alt: false },
  { text: "innovation", top: 72, left: 58, size: 19, alt: true },
  { text: "data", top: 85, left: 25, size: 17, alt: false },
  { text: "models", top: 15, left: 38, size: 14, alt: true },
  { text: "science", top: 80, left: 65, size: 15, alt: false },
  { text: "global", top: 42, left: 40, size: 13, alt: true },
];

export default function FloatingKeywords() {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ top: "10%", left: "20%", background: "var(--accent-cyan)" }}
      />
      <div
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ top: "50%", right: "10%", background: "var(--accent-violet)", animationDelay: "1s" }}
      />

      {/* Central glass orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full glass-tier-2 flex items-center justify-center animate-pulse-glow">
        <span className="text-2xl font-bold bg-gradient-to-r from-[--accent-cyan] to-[--accent-violet] bg-clip-text text-transparent">
          AI
        </span>
      </div>

      {/* Floating keyword pills */}
      {KEYWORDS.map((kw, i) => (
        <div
          key={kw.text}
          className={`absolute glass-tier-2 rounded-full px-3 py-1.5 font-semibold whitespace-nowrap ${
            kw.alt ? "animate-float-keyword-alt" : "animate-float-keyword"
          }`}
          style={{
            top: `${kw.top}%`,
            left: `${kw.left}%`,
            animationDelay: `${i * 0.5}s`,
            fontSize: `${kw.size}px`,
            color: i % 2 === 0 ? "var(--accent-cyan)" : "var(--accent-violet)",
          }}
        >
          {kw.text}
        </div>
      ))}
    </div>
  );
}
