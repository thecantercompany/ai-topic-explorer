import type { CombinedCitation, Provider } from "@/lib/types";

interface Props {
  citations: CombinedCitation[];
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
};

const PROVIDER_COLORS: Record<Provider, string> = {
  claude: "bg-orange-100 text-orange-700",
  openai: "bg-emerald-100 text-emerald-700",
  gemini: "bg-blue-100 text-blue-700",
};

export default function CitationList({ citations }: Props) {
  if (citations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
        <p className="text-green-500">No citations suggested.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <ul className="space-y-4">
        {citations.map((citation, idx) => (
          <li key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline hover:text-green-900 text-sm font-medium leading-snug transition-colors"
              >
                {citation.title}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 truncate max-w-md">
                {citation.url}
              </span>
              <div className="flex gap-1">
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

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-green-400 border-t border-green-100 pt-4">
        Sources suggested by AI models — links may not be accurate.
      </p>

      {/* AEO Checker callout */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <p className="text-sm text-green-800">
          Want your website cited by AI?{" "}
          <a
            href="https://aeochecker.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-green-900 transition-colors"
          >
            Check out AEO Checker
          </a>
        </p>
      </div>
    </div>
  );
}
