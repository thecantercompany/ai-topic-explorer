import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toWordCloudData, topicToWords } from "@/lib/analysis/word-frequency";
import type { AnalysisResult, KeyTheme, Provider } from "@/lib/types";
import ResultsContent from "./ResultsContent";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
  });

  if (!analysis) {
    notFound();
  }

  const result = analysis.result as unknown as AnalysisResult;
  const topicWords = topicToWords(result.topic);
  const filteredFrequencies = result.combinedWordFrequencies.filter(
    (f) => !topicWords.has(f.word)
  );
  const wordCloudData = toWordCloudData(filteredFrequencies);
  const keyThemes: KeyTheme[] = result.combinedKeyThemes || [];

  // Determine which providers succeeded/failed/unavailable
  const allProviders: Provider[] = ["claude", "openai", "gemini", "perplexity"];
  const providerStatuses: { provider: Provider; status: "done" | "failed" | "unavailable" }[] =
    allProviders.map((provider) => {
      if (result.responses[provider]) {
        return { provider, status: "done" };
      } else if (result.errors[provider]) {
        return { provider, status: "failed" };
      }
      return { provider, status: "unavailable" };
    });

  // Build partial failure message
  const failedProviders = providerStatuses
    .filter((p) => p.status === "failed")
    .map((p) => p.provider);
  const succeededProviders = providerStatuses
    .filter((p) => p.status === "done")
    .map((p) => p.provider);

  const PROVIDER_LABELS: Record<Provider, string> = {
    claude: "Claude",
    openai: "GPT",
    gemini: "Gemini",
    perplexity: "Perplexity",
  };

  let partialFailureMessage: string | null = null;
  if (failedProviders.length > 0 && succeededProviders.length > 0) {
    const failedNames = failedProviders
      .map((p) => PROVIDER_LABELS[p])
      .join(", ");
    const succeededNames = succeededProviders
      .map((p) => PROVIDER_LABELS[p])
      .join(" and ");
    partialFailureMessage = `${failedNames} unavailable — showing results from ${succeededNames}`;
  }

  // Build provider raw text map for word context lookups (exclude Perplexity — web search, not training data)
  const providerTexts: Record<string, string> = {};
  for (const provider of allProviders) {
    if (provider === "perplexity") continue;
    const resp = result.responses[provider];
    if (resp) {
      providerTexts[provider] = resp.rawText;
    }
  }

  return (
    <ResultsContent
      topic={result.topic}
      wordCloudData={wordCloudData}
      keyThemes={keyThemes}
      entities={result.combinedEntities}
      citations={result.combinedCitations}
      providerStatuses={providerStatuses}
      partialFailureMessage={partialFailureMessage}
      analysisId={id}
      providerTexts={providerTexts}
    />
  );
}
