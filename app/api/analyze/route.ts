import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeWithClaude } from "@/lib/ai-clients/claude";
import { analyzeWithOpenAI } from "@/lib/ai-clients/openai";
import { analyzeWithGemini } from "@/lib/ai-clients/gemini";
import { analyzeWithPerplexity } from "@/lib/ai-clients/perplexity";
import { analyzeWithGrok } from "@/lib/ai-clients/grok";
import { expandQuery } from "@/lib/analysis/query-expansion";
import {
  calculateWordFrequency,
  mergeWordFrequencies,
  topicToWords,
} from "@/lib/analysis/word-frequency";
import { mergeEntities } from "@/lib/analysis/merge-entities";
import { mergeCitations } from "@/lib/analysis/merge-citations";
import { mergeKeyThemes } from "@/lib/analysis/merge-themes";
import type {
  AIResponse,
  AnalysisResult,
  Provider,
  WordFrequency,
  KeyTheme,
  ExtractedEntities,
  Citation,
  TokenUsage,
} from "@/lib/types";

type AnalyzeFn = (query: string) => Promise<AIResponse>;

const PROVIDER_TIMEOUT_MS = 45_000; // 45 seconds per provider query

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

function getConfiguredProviders(): { provider: Provider; analyze: AnalyzeFn }[] {
  const providers: { provider: Provider; analyze: AnalyzeFn }[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({ provider: "claude", analyze: analyzeWithClaude });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ provider: "openai", analyze: analyzeWithOpenAI });
  }
  if (process.env.GOOGLE_AI_API_KEY) {
    providers.push({ provider: "gemini", analyze: analyzeWithGemini });
  }
  if (process.env.PERPLEXITY_API_KEY) {
    providers.push({ provider: "perplexity", analyze: analyzeWithPerplexity });
  }
  if (process.env.XAI_API_KEY) {
    providers.push({ provider: "grok", analyze: analyzeWithGrok });
  }

  return providers;
}

/** Merge multiple AIResponses from subtopic queries into a single AIResponse per provider */
function mergeProviderResponses(responses: AIResponse[]): AIResponse {
  const rawTexts = responses.map((r) => r.rawText);
  const provider = responses[0].provider;
  const allEntities = responses.map((r) => ({ provider, entities: r.entities }));
  const allCitations = responses.flatMap((r) => r.citations);
  const allKeyThemes = responses.map((r) => r.keyThemes);
  const allUsage = responses.flatMap((r) => r.usage || []);
  const allRelatedQuestions = [
    ...new Set(responses.flatMap((r) => r.relatedQuestions || [])),
  ];
  const allQuotedPhrases = [
    ...new Map(
      responses
        .flatMap((r) => r.quotedPhrases || [])
        .map((q) => [q.phrase.toLowerCase(), q] as const)
    ).values(),
  ]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);

  return {
    provider,
    rawText: rawTexts.join("\n\n"),
    entities: mergeEntities(allEntities),
    citations: allCitations,
    keyThemes: mergeKeyThemes(...allKeyThemes),
    model: responses[0].model,
    usage: allUsage,
    ...(allRelatedQuestions.length > 0 && { relatedQuestions: allRelatedQuestions }),
    ...(allQuotedPhrases.length > 0 && { quotedPhrases: allQuotedPhrases }),
  };
}

export async function POST(request: NextRequest) {
  // Kill switch
  if (process.env.ANALYSIS_ENABLED === "false") {
    return NextResponse.json(
      { error: "Analysis is temporarily unavailable" },
      { status: 503 }
    );
  }

  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const retryMinutes = Math.ceil((rateLimit.retryAfterMs || 0) / 60000);
    return NextResponse.json(
      {
        error: `You've reached the analysis limit. Try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  // Parse and validate input
  let topic: string;
  try {
    const body = await request.json();
    topic = body.topic;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a topic to analyze" },
      { status: 400 }
    );
  }

  topic = topic.trim();

  // Get configured providers
  const providers = getConfiguredProviders();
  if (providers.length === 0) {
    return NextResponse.json(
      { error: "No AI providers are configured" },
      { status: 500 }
    );
  }

  // Stream SSE events for real-time progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Step 1: Query expansion
        emit({ stage: "expanding" });

        const allUsage: TokenUsage[] = [];
        let expandedQueries: string[];
        try {
          const expansion = await expandQuery(topic);
          expandedQueries = expansion.queries;
          if (expansion.usage.inputTokens > 0) {
            allUsage.push(expansion.usage);
          }
          console.log(
            `[Query Expansion] "${topic}" → ${expandedQueries.length} queries:`,
            expandedQueries
          );
        } catch (e) {
          console.warn("Query expansion failed, using original topic:", e);
          expandedQueries = [topic];
        }

        // Step 2: Run all queries × all providers in parallel
        const providerNames = providers.map((p) => p.provider);
        emit({ stage: "querying", providers: providerNames });

        const providerResults = await Promise.allSettled(
          providers.map(async ({ provider, analyze }) => {
            try {
              const queryResults = await Promise.allSettled(
                expandedQueries.map((query) =>
                  withTimeout(analyze(query), PROVIDER_TIMEOUT_MS, `${provider}`)
                )
              );

              const successful = queryResults
                .filter(
                  (r): r is PromiseFulfilledResult<AIResponse> =>
                    r.status === "fulfilled"
                )
                .map((r) => r.value);

              const failed = queryResults.filter((r) => r.status === "rejected");
              if (failed.length > 0) {
                console.warn(
                  `[${provider}] ${failed.length}/${expandedQueries.length} subtopic queries failed`
                );
              }

              if (successful.length === 0) {
                throw new Error(
                  `All ${expandedQueries.length} subtopic queries failed for ${provider}`
                );
              }

              const merged = mergeProviderResponses(successful);
              emit({ stage: "provider_done", provider });
              return merged;
            } catch (err) {
              emit({ stage: "provider_failed", provider });
              throw err;
            }
          })
        );

        // Process results
        const responses: AnalysisResult["responses"] = {
          claude: null,
          openai: null,
          gemini: null,
          perplexity: null,
          grok: null,
        };
        const errors: AnalysisResult["errors"] = {};
        const wordFreqLists: WordFrequency[][] = [];
        const keyThemeLists: KeyTheme[][] = [];
        const entityLists: { provider: Provider; entities: ExtractedEntities }[] = [];
        const citationsByProvider: { provider: Provider; citations: Citation[] }[] = [];
        const topicWordSet = topicToWords(topic);

        for (let i = 0; i < providers.length; i++) {
          const { provider } = providers[i];
          const result = providerResults[i];

          if (result.status === "fulfilled") {
            responses[provider] = result.value;

            if (provider !== "perplexity" && provider !== "grok") {
              wordFreqLists.push(calculateWordFrequency(result.value.rawText, topicWordSet));
              keyThemeLists.push(result.value.keyThemes);
              entityLists.push({ provider, entities: result.value.entities });
            }

            citationsByProvider.push({
              provider,
              citations: result.value.citations,
            });
            if (result.value.usage) {
              allUsage.push(...result.value.usage);
            }
          } else {
            errors[provider] = result.reason?.message || "Analysis failed";
          }
        }

        // Log total usage
        const totalInput = allUsage.reduce((sum, u) => sum + u.inputTokens, 0);
        const totalOutput = allUsage.reduce((sum, u) => sum + u.outputTokens, 0);
        const expansionUsage = allUsage.filter((u) => u.purpose === "expansion");
        const analysisUsage = allUsage.filter((u) => u.purpose === "analysis");
        console.log(
          `[Token Usage] Total: ${totalInput} in / ${totalOutput} out | ` +
            `Expansion: ${expansionUsage.reduce((s, u) => s + u.inputTokens + u.outputTokens, 0)} | ` +
            `Analysis: ${analysisUsage.reduce((s, u) => s + u.inputTokens + u.outputTokens, 0)}`
        );

        // Check if all providers failed
        const successCount = Object.values(responses).filter(Boolean).length;
        if (successCount === 0) {
          emit({ stage: "error", message: "All AI providers failed" });
          controller.close();
          return;
        }

        // Step 3: Merge results
        emit({ stage: "merging" });

        const combinedWordFrequencies = mergeWordFrequencies(...wordFreqLists);
        const combinedKeyThemes = mergeKeyThemes(...keyThemeLists);
        const combinedEntities = mergeEntities(entityLists);
        const combinedCitations = mergeCitations(citationsByProvider);

        const analysisResult: AnalysisResult = {
          topic,
          expandedQueries,
          responses,
          errors,
          combinedWordFrequencies,
          combinedKeyThemes,
          combinedEntities,
          combinedCitations,
          tokenUsage: allUsage,
        };

        // Save to database
        let analysisId: string | null = null;
        try {
          const analysis = await prisma.analysis.create({
            data: {
              topic,
              result: JSON.parse(JSON.stringify(analysisResult)),
            },
          });
          analysisId = analysis.id;
        } catch (e) {
          console.error("Failed to save analysis to database:", e);
        }

        emit({ stage: "complete", id: analysisId });
      } catch (err) {
        console.error("Analysis stream error:", err);
        emit({ stage: "error", message: "Analysis failed. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
