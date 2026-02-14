import type { Provider } from "@/lib/types";

interface ProviderStatus {
  provider: Provider;
  status: "pending" | "loading" | "done" | "failed" | "unavailable";
}

interface Props {
  providers: ProviderStatus[];
  layout?: "horizontal" | "vertical";
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

export default function ProgressTracker({ providers, layout = "vertical" }: Props) {
  return (
    <div className={layout === "vertical" ? "flex flex-col gap-3" : "flex items-center gap-4"}>
      {providers.map(({ provider, status }) => (
        <div key={provider} className="flex items-center gap-2.5">
          {status === "pending" && (
            <span className="w-3 h-3 rounded-full bg-black/15" />
          )}
          {status === "loading" && (
            <span className="w-3 h-3 rounded-full bg-[--accent-cyan-bright] animate-pulse-glow glow-dot" style={{ color: 'var(--accent-cyan-bright)' }} />
          )}
          {status === "done" && (
            <span className="w-3 h-3 rounded-full bg-emerald-500 glow-dot" style={{ color: '#10b981' }} />
          )}
          {status === "failed" && (
            <span className="w-3 h-3 rounded-full bg-orange-500 glow-dot" style={{ color: '#f97316' }} />
          )}
          {status === "unavailable" && (
            <span className="w-3 h-3 rounded-full bg-red-400/60" />
          )}
          <span
            className={`text-sm font-medium ${
              status === "done"
                ? "text-emerald-600"
                : status === "failed"
                  ? "text-orange-600"
                  : status === "unavailable"
                    ? "text-red-400"
                    : status === "loading"
                      ? "text-[--text-secondary]"
                      : "text-[--text-tertiary]"
            }`}
          >
            {PROVIDER_LABELS[provider]}
            {status === "unavailable" && (
              <span className="text-xs ml-1 opacity-60">(coming soon)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
