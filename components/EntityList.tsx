import type { CombinedEntities } from "@/lib/types";

interface Props {
  entities: CombinedEntities;
}

const CATEGORIES: { key: keyof CombinedEntities; label: string }[] = [
  { key: "people", label: "People" },
  { key: "organizations", label: "Organizations" },
  { key: "locations", label: "Locations" },
  { key: "concepts", label: "Concepts" },
];

export default function EntityList({ entities }: Props) {
  const hasAny = CATEGORIES.some(({ key }) => entities[key].length > 0);

  if (!hasAny) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
        <p className="text-green-500">No named entities identified.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <h4 className="font-semibold text-green-800 mb-3">{label}</h4>
            {entities[key].length > 0 ? (
              <ul className="space-y-1.5">
                {entities[key].map((entity, idx) => (
                  <li key={idx} className="text-sm text-green-700">
                    {entity.url ? (
                      <a
                        href={entity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-900 transition-colors"
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
              <p className="text-sm text-green-400 italic">None identified</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
