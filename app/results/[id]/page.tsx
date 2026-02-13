import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toWordCloudData } from "@/lib/analysis/word-frequency";
import type { AnalysisResult, Provider } from "@/lib/types";
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
  const wordCloudData = toWordCloudData(result.combinedWordFrequencies);

  // Determine which providers succeeded/failed
  const providerStatuses: { provider: Provider; status: "done" | "failed" }[] =
    [];
  const allProviders: Provider[] = ["claude", "openai", "gemini"];
  for (const provider of allProviders) {
    if (result.responses[provider]) {
      providerStatuses.push({ provider, status: "done" });
    } else if (result.errors[provider]) {
      providerStatuses.push({ provider, status: "failed" });
    }
  }

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

  return (
    <ResultsContent
      topic={result.topic}
      wordCloudData={wordCloudData}
      entities={result.combinedEntities}
      citations={result.combinedCitations}
      providerStatuses={providerStatuses}
      partialFailureMessage={partialFailureMessage}
      analysisId={id}
    />
  );
}
