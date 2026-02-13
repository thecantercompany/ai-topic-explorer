"use client";

import { useMemo } from "react";

const WORDS = [
  // Science & Nature
  "climate", "quantum", "fusion", "gravity", "neurons", "genome", "photons",
  "plasma", "entropy", "atoms", "protein", "enzyme", "molecule", "isotope",
  "spectrum", "catalyst", "mutation", "ecology", "fossil", "crystal",
  // Technology
  "algorithm", "neural net", "machine learning", "blockchain", "robotics",
  "encryption", "firmware", "bandwidth", "protocol", "interface", "compiler",
  "runtime", "kernel", "database", "pipeline", "framework", "endpoint",
  "microchip", "sensor", "circuit",
  // AI & Computing
  "GPT", "tokens", "embeddings", "inference", "weights", "transformer",
  "diffusion", "latent space", "fine-tune", "prompt", "attention", "dropout",
  "gradient", "batch size", "epochs", "loss function", "RLHF", "context",
  "multimodal", "alignment",
  // Energy & Environment
  "solar", "wind", "hydrogen", "carbon", "methane", "geothermal", "biomass",
  "tidal", "nuclear", "lithium", "cobalt", "grid", "voltage", "turbine",
  "emission", "sequester", "rewilding", "permafrost", "aquifer", "biome",
  // Space
  "orbit", "nebula", "pulsar", "quasar", "galaxy", "cosmos", "exoplanet",
  "supernova", "asteroid", "dark matter", "redshift", "telescope", "rover",
  "payload", "propulsion", "lunar", "stellar", "void", "singularity", "warp",
  // Health & Medicine
  "CRISPR", "mRNA", "antibody", "stem cell", "microbiome", "synapse",
  "cortisol", "genome", "therapy", "vaccine", "pathogen", "biomarker",
  "probiotic", "telomere", "dopamine", "serotonin", "placebo", "triage",
  "oncology", "diagnosis",
  // Society & Culture
  "democracy", "equity", "migration", "literacy", "discourse", "paradigm",
  "narrative", "empathy", "identity", "autonomy", "consensus", "reform",
  "activism", "diaspora", "urbanize", "commons", "heritage", "pluralism",
  "agency", "solidarity",
  // Economics
  "inflation", "yield", "liquidity", "arbitrage", "hedge", "tariff",
  "subsidy", "deficit", "equity", "futures", "leverage", "volatility",
  "supply chain", "fintech", "dividend", "monopoly", "austerity", "GDP",
  "stimulus", "capital",
  // Philosophy & Ideas
  "ethics", "stoicism", "dialectic", "ontology", "axiom", "paradox",
  "empiricism", "entropy", "emergence", "duality", "synthesis", "logos",
  "telos", "praxis", "zeitgeist", "gestalt", "sublime", "tabula rasa",
  "cogito", "dharma",
  // Data & Research
  "analysis", "dataset", "model", "metrics", "signal", "noise", "outlier",
  "hypothesis", "variable", "sample", "bias", "correlation", "regression",
  "cluster", "vector", "tensor", "schema", "benchmark", "validate", "iterate",
];

function shufflePick<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface FloatingWord {
  text: string;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  rotate: number;
  colorIndex: number;
}

function generateWords(): FloatingWord[] {
  const picked = shufflePick(WORDS, 18);
  return picked.map((text, i) => ({
    text,
    top: randomBetween(3, 90),
    left: randomBetween(3, 85),
    size: Math.round(randomBetween(12, 22)),
    duration: randomBetween(5, 12),
    delay: randomBetween(0, 4),
    driftX: randomBetween(8, 30) * (Math.random() > 0.5 ? 1 : -1),
    driftY: randomBetween(8, 25) * (Math.random() > 0.5 ? 1 : -1),
    rotate: randomBetween(1, 4) * (Math.random() > 0.5 ? 1 : -1),
    colorIndex: i,
  }));
}

export default function FloatingKeywords() {
  const words = useMemo(() => generateWords(), []);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Central glass orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full glass-tier-2 flex items-center justify-center animate-pulse-glow">
        <span className="text-2xl font-bold bg-gradient-to-r from-[--accent-cyan] to-[--accent-violet] bg-clip-text text-transparent">
          AI
        </span>
      </div>

      {/* Floating keyword pills */}
      {words.map((w) => (
        <div
          key={w.text}
          className="absolute glass-tier-2 rounded-full px-3 py-1.5 font-semibold whitespace-nowrap animate-float-drift"
          style={{
            top: `${w.top}%`,
            left: `${w.left}%`,
            fontSize: `${w.size}px`,
            color: w.colorIndex % 3 === 0
              ? "var(--accent-cyan)"
              : w.colorIndex % 3 === 1
              ? "var(--accent-violet)"
              : "var(--text-secondary, #6b7280)",
            animationDuration: `${w.duration}s`,
            animationDelay: `${w.delay}s`,
            ["--drift-x" as string]: `${w.driftX}px`,
            ["--drift-y" as string]: `${w.driftY}px`,
            ["--drift-rotate" as string]: `${w.rotate}deg`,
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}
