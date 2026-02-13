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
    <div className="flex items-center justify-center gap-6 bg-white rounded-2xl shadow-sm border border-green-100 px-6 py-4">
      {providers.map(({ provider, status }) => (
        <div key={provider} className="flex items-center gap-2">
          {status === "pending" && (
            <span className="w-3 h-3 rounded-full bg-green-200" />
          )}
          {status === "loading" && (
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          )}
          {status === "done" && (
            <span className="w-3 h-3 rounded-full bg-green-500" />
          )}
          {status === "failed" && (
            <span className="w-3 h-3 rounded-full bg-orange-500" />
          )}
          <span
            className={`text-sm font-medium ${
              status === "done"
                ? "text-green-700"
                : status === "failed"
                  ? "text-orange-600"
                  : status === "loading"
                    ? "text-green-600"
                    : "text-green-400"
            }`}
          >
            {PROVIDER_LABELS[provider]}
          </span>
        </div>
      ))}
    </div>
  );
}
