import type { Provider } from "@/lib/types";

interface ProviderStatus {
  provider: Provider;
  status: "pending" | "loading" | "done" | "failed";
}

interface Props {
  providers: ProviderStatus[];
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
};

export default function ProgressTracker({ providers }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 glass-tier-1 px-6 py-4 rounded-2xl">
      {providers.map(({ provider, status }) => (
        <div key={provider} className="flex items-center gap-2">
          {status === "pending" && (
            <span className="w-3 h-3 rounded-full bg-black/10" />
          )}
          {status === "loading" && (
            <span className="w-3 h-3 rounded-full bg-[--accent-cyan-bright] animate-pulse-glow glow-dot" />
          )}
          {status === "done" && (
            <span className="w-3 h-3 rounded-full bg-[--accent-cyan-bright] glow-dot" />
          )}
          {status === "failed" && (
            <span className="w-3 h-3 rounded-full bg-orange-500 glow-dot" />
          )}
          <span
            className={`text-sm font-medium ${
              status === "done"
                ? "text-[--accent-cyan]"
                : status === "failed"
                  ? "text-orange-600"
                  : status === "loading"
                    ? "text-[--text-secondary]"
                    : "text-[--text-tertiary]"
            }`}
          >
            {PROVIDER_LABELS[provider]}
          </span>
        </div>
      ))}
    </div>
  );
}
