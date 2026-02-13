import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeWithClaude } from "@/lib/ai-clients/claude";
import {
  calculateWordFrequency,
  mergeWordFrequencies,
} from "@/lib/analysis/word-frequency";
import { mergeEntities } from "@/lib/analysis/merge-entities";
import { mergeCitations } from "@/lib/analysis/merge-citations";
import type {
  AIResponse,
  AnalysisResult,
  Provider,
  WordFrequency,
  ExtractedEntities,
  Citation,
} from "@/lib/types";

type AnalyzeFn = (topic: string) => Promise<AIResponse>;

function getConfiguredProviders(): { provider: Provider; analyze: AnalyzeFn }[] {
  const providers: { provider: Provider; analyze: AnalyzeFn }[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({ provider: "claude", analyze: analyzeWithClaude });
  }

  // OpenAI and Gemini will be added in Phase 5
  // if (process.env.OPENAI_API_KEY) {
  //   providers.push({ provider: "openai", analyze: analyzeWithOpenAI });
  // }
  // if (process.env.GOOGLE_AI_API_KEY) {
  //   providers.push({ provider: "gemini", analyze: analyzeWithGemini });
  // }

  return providers;
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

  // Run all configured AI calls in parallel
  const results = await Promise.allSettled(
    providers.map(({ analyze }) => analyze(topic))
  );

  // Process results
  const responses: AnalysisResult["responses"] = {
    claude: null,
    openai: null,
    gemini: null,
  };
  const errors: AnalysisResult["errors"] = {};
  const wordFreqLists: WordFrequency[][] = [];
  const entityLists: ExtractedEntities[] = [];
  const citationsByProvider: { provider: Provider; citations: Citation[] }[] =
    [];

  for (let i = 0; i < providers.length; i++) {
    const { provider } = providers[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      responses[provider] = result.value;
      wordFreqLists.push(calculateWordFrequency(result.value.rawText));
      entityLists.push(result.value.entities);
      citationsByProvider.push({
        provider,
        citations: result.value.citations,
      });
    } else {
      errors[provider] = result.reason?.message || "Analysis failed";
    }
  }

  // Check if all providers failed
  const successCount = Object.values(responses).filter(Boolean).length;
  if (successCount === 0) {
    return NextResponse.json(
      { error: "All AI providers failed", details: errors },
      { status: 500 }
    );
  }

  // Merge results
  const combinedWordFrequencies = mergeWordFrequencies(...wordFreqLists);
  const combinedEntities = mergeEntities(...entityLists);
  const combinedCitations = mergeCitations(citationsByProvider);

  const analysisResult: AnalysisResult = {
    topic,
    responses,
    errors,
    combinedWordFrequencies,
    combinedEntities,
    combinedCitations,
  };

  // Save to database
  const analysis = await prisma.analysis.create({
    data: {
      topic,
      result: JSON.parse(JSON.stringify(analysisResult)),
    },
  });

  return NextResponse.json({ id: analysis.id, ...analysisResult });
}
