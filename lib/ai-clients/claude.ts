import Anthropic from "@anthropic-ai/sdk";
import type { AIResponse, ExtractedEntities, Citation, KeyTheme, TokenUsage } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROMPT_TEMPLATE = (topic: string) => `Analyze the topic: "${topic}"

Provide a comprehensive, fact-rich analysis of this topic. Include key facts, current context, major entities involved, and important developments.

After your analysis, output a JSON block (and nothing else after it) in exactly this format:

\`\`\`json
{
  "entities": {
    "people": [{"name": "Person Name", "url": "https://en.wikipedia.org/wiki/Person_Name"}],
    "organizations": [{"name": "Org Name", "url": "https://example.com"}]
  },
  "citations": [
    {"title": "Source Title", "url": "https://example.com/article"}
  ],
  "keyThemes": [
    {"phrase": "carbon tax policy", "relevance": 5},
    {"phrase": "water contamination risks", "relevance": 4}
  ]
}
\`\`\`

For entities, only include proper nouns (specific people and named organizations). Provide Wikipedia or official website URLs where possible. For citations, list 5-10 real sources you would recommend for learning more about this topic. For keyThemes, identify 15-20 key themes as short 2-4 word phrases that capture the most important specific concepts in your analysis. These should be meaningful and specific (e.g. "methane flaring regulations" not "environmental issues"). Score each 1-5 for relevance to the topic.`;

interface ParsedJSON {
  entities?: {
    people?: { name: string; url?: string }[];
    organizations?: { name: string; url?: string }[];
  };
  citations?: { title: string; url: string }[];
  keyThemes?: { phrase: string; relevance: number }[];
}

function parseStructuredData(text: string): {
  entities: ExtractedEntities;
  citations: Citation[];
  keyThemes: KeyTheme[];
} {
  const fallback = {
    entities: {
      people: [],
      organizations: [],
    },
    citations: [],
    keyThemes: [] as KeyTheme[],
  };

  try {
    // Try to extract JSON from code block
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const parsed: ParsedJSON = JSON.parse(codeBlockMatch[1]);
      return {
        entities: {
          people: parsed.entities?.people || [],
          organizations: parsed.entities?.organizations || [],
        },
        citations: parsed.citations || [],
        keyThemes: parsed.keyThemes || [],
      };
    }

    // Fallback: try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*"entities"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed: ParsedJSON = JSON.parse(jsonMatch[0]);
      return {
        entities: {
          people: parsed.entities?.people || [],
          organizations: parsed.entities?.organizations || [],
        },
        citations: parsed.citations || [],
        keyThemes: parsed.keyThemes || [],
      };
    }
  } catch (e) {
    console.warn("Failed to parse entities/citations JSON from Claude response:", e);
  }

  return fallback;
}

function extractRawText(text: string): string {
  // Remove the JSON code block from the text to get just the analysis
  return text.replace(/```json[\s\S]*?```/, "").trim();
}

export async function analyzeWithClaude(query: string): Promise<AIResponse> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: PROMPT_TEMPLATE(query),
      },
    ],
  });

  const usage: TokenUsage = {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    purpose: "analysis",
  };

  console.log(
    `[Analysis: Claude] Query: "${query.slice(0, 60)}..." — Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`
  );

  if (message.stop_reason === "max_tokens") {
    console.warn("Claude response was truncated due to max_tokens limit");
  }

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const { entities, citations, keyThemes } = parseStructuredData(responseText);

  return {
    provider: "claude",
    rawText: extractRawText(responseText),
    entities,
    citations,
    keyThemes,
    model: "claude-sonnet-4-5-20250929",
    usage: [usage],
  };
}
