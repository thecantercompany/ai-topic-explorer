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

// Pre-defined slots spread across the container to guarantee no overlaps.
// Each slot is a {top%, left%} region. Words are assigned to shuffled slots.
const SLOTS: { top: number; left: number }[] = [
  // Top band
  { top: 3, left: 5 },
  { top: 5, left: 35 },
  { top: 2, left: 65 },
  { top: 8, left: 85 },
  // Upper quarter
  { top: 16, left: 10 },
  { top: 18, left: 50 },
  { top: 14, left: 78 },
  // Upper-middle
  { top: 30, left: 3 },
  { top: 28, left: 35 },
  { top: 32, left: 68 },
  // Middle (avoid centre where the orb sits)
  { top: 44, left: 5 },
  { top: 42, left: 75 },
  { top: 46, left: 88 },
  // Lower-middle
  { top: 56, left: 8 },
  { top: 58, left: 42 },
  { top: 55, left: 80 },
  // Lower quarter
  { top: 70, left: 3 },
  { top: 68, left: 35 },
  { top: 72, left: 65 },
  { top: 66, left: 88 },
  // Bottom band
  { top: 84, left: 8 },
  { top: 82, left: 40 },
  { top: 86, left: 72 },
  { top: 90, left: 20 },
];

function generateWords(): FloatingWord[] {
  const picked = shufflePick(WORDS, SLOTS.length);
  const slots = shufflePick(SLOTS, SLOTS.length);
  return picked.map((text, i) => ({
    text,
    top: slots[i].top + randomBetween(-2, 2),
    left: slots[i].left + randomBetween(-3, 3),
    size: Math.round(randomBetween(12, 20)),
    duration: randomBetween(18, 30),
    delay: randomBetween(0, 6),
    driftX: randomBetween(4, 12) * (Math.random() > 0.5 ? 1 : -1),
    driftY: randomBetween(4, 10) * (Math.random() > 0.5 ? 1 : -1),
    rotate: randomBetween(0.5, 2) * (Math.random() > 0.5 ? 1 : -1),
    colorIndex: i,
  }));
}

export default function FloatingKeywords() {
  const words = useMemo(() => generateWords(), []);

  return (
    <div className="relative w-full h-full overflow-hidden">
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
