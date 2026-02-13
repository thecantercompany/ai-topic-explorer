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
  openai: "bg-green-100 text-green-700",
  gemini: "bg-blue-100 text-blue-700",
};

export default function CitationList({ citations }: Props) {
  if (citations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No citations suggested.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <ul className="space-y-4">
        {citations.map((citation, idx) => (
          <li key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium leading-snug"
              >
                {citation.title}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 truncate max-w-md">
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
      <p className="mt-6 text-xs text-slate-400 border-t border-slate-100 pt-4">
        Sources suggested by AI models — links may not be accurate.
      </p>

      {/* AEO Checker callout */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          Want your website cited by AI?{" "}
          <a
            href="https://aeochecker.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            Check out AEO Checker
          </a>
        </p>
      </div>
    </div>
  );
}
