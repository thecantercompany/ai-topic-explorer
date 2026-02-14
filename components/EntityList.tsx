import type { CombinedEntities, Provider } from "@/lib/types";

interface Props {
  entities: CombinedEntities;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  grok: "Grok",
};

const PROVIDER_COLORS: Record<Provider, string> = {
  claude: "bg-orange-100 text-orange-700",
  openai: "bg-emerald-100 text-emerald-700",
  gemini: "bg-blue-100 text-blue-700",
  perplexity: "bg-purple-100 text-purple-700",
  grok: "bg-red-100 text-red-700",
};

const CATEGORIES: { key: keyof CombinedEntities; label: string }[] = [
  { key: "people", label: "People" },
  { key: "organizations", label: "Organizations" },
];

export default function EntityList({ entities }: Props) {
  const hasAny = CATEGORIES.some(({ key }) => entities[key].length > 0);

  if (!hasAny) {
    return (
      <div className="glass-tier-2 rounded-2xl p-8 text-center">
        <p className="text-[--text-tertiary]">No named entities identified.</p>
      </div>
    );
  }

  return (
    <div className="glass-tier-2 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <h4 className="font-semibold text-[--accent-cyan] mb-3">{label}</h4>
            {entities[key].length > 0 ? (
              <ul className="space-y-1.5">
                {entities[key].map((entity, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-[--text-secondary]">
                    <span className="truncate">
                      {entity.url ? (
                        <a
                          href={entity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-black/15 hover:text-[--accent-cyan] hover:decoration-[--accent-cyan]/40 transition-colors"
                        >
                          {entity.name}
                        </a>
                      ) : (
                        entity.name
                      )}
                    </span>
                    {entity.providers && entity.providers.length > 0 && (
                      <span className="flex gap-1 shrink-0">
                        {entity.providers.map((provider) => (
                          <span
                            key={provider}
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${PROVIDER_COLORS[provider]}`}
                          >
                            {PROVIDER_LABELS[provider]}
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[--text-tertiary] italic">None identified</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
