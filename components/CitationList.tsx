import type { CombinedCitation, Provider } from "@/lib/types";

interface Props {
  citations: CombinedCitation[];
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

/** Group consecutive citations that share the same domain. */
function groupByDomain(
  citations: CombinedCitation[]
): { domain: string; items: CombinedCitation[] }[] {
  const groups: { domain: string; items: CombinedCitation[] }[] = [];

  for (const citation of citations) {
    const last = groups[groups.length - 1];
    if (last && last.domain === citation.domain) {
      last.items.push(citation);
    } else {
      groups.push({ domain: citation.domain, items: [citation] });
    }
  }

  return groups;
}

export default function CitationList({ citations }: Props) {
  if (citations.length === 0) {
    return (
      <div className="glass-tier-2 rounded-2xl p-8 text-center">
        <p className="text-[--text-tertiary]">No citations suggested.</p>
      </div>
    );
  }

  const groups = groupByDomain(citations);

  return (
    <div className="glass-tier-2 rounded-2xl p-6">
      <p className="text-xs text-[--text-tertiary] mb-5">
        Sources are ranked by how many AI models cited them, then grouped by
        domain. Colored tags show which models suggested each source.
      </p>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.domain}>
            {group.items.length > 1 && (
              <p className="text-[11px] font-medium text-[--text-tertiary] uppercase tracking-wide mb-2">
                {group.domain}
              </p>
            )}
            <ul className={`space-y-3 ${group.items.length > 1 ? "border-l-2 border-black/5 pl-4" : ""}`}>
              {group.items.map((citation, idx) => (
                <li key={idx} className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-start gap-2 min-w-0">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--text-primary] underline decoration-black/15 hover:text-[--accent-cyan] hover:decoration-[--accent-cyan]/40 text-sm font-medium leading-snug transition-colors break-words"
                    >
                      {citation.title}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-[--text-tertiary] truncate">
                      {citation.url}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      {citation.providers.map((provider) => (
                        <span
                          key={provider}
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${PROVIDER_COLORS[provider]}`}
                        >
                          {PROVIDER_LABELS[provider]}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-[--text-tertiary] border-t border-black/5 pt-4">
        Sources suggested by AI models — links may not be accurate.
      </p>

      {/* AEO Checker callout */}
      <div className="mt-4 bg-[--accent-cyan-muted] border border-[color:var(--accent-cyan)]/15 rounded-2xl p-4 text-center">
        <p className="text-sm text-[--text-secondary]">
          Want your website cited by AI?{" "}
          <a
            href="https://aeochecker.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[--accent-cyan] underline hover:text-[--text-primary] transition-colors"
          >
            Check out AEO Checker
          </a>
        </p>
      </div>
    </div>
  );
}
