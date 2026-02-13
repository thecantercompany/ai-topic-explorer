import type { CombinedEntities } from "@/lib/types";

interface Props {
  entities: CombinedEntities;
}

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
                  <li key={idx} className="text-sm text-[--text-secondary]">
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
