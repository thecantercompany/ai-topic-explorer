import Anthropic from "@anthropic-ai/sdk";
import type { AIResponse, ExtractedEntities, Citation } from "@/lib/types";

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
    "organizations": [{"name": "Org Name", "url": "https://example.com"}],
    "locations": [{"name": "Place Name", "url": "https://en.wikipedia.org/wiki/Place_Name"}],
    "concepts": [{"name": "Concept Name", "url": "https://en.wikipedia.org/wiki/Concept_Name"}]
  },
  "citations": [
    {"title": "Source Title", "url": "https://example.com/article"}
  ]
}
\`\`\`

For entities, provide Wikipedia or official website URLs where possible. For citations, list 5-10 real sources you would recommend for learning more about this topic.`;

interface ParsedJSON {
  entities?: {
    people?: { name: string; url?: string }[];
    organizations?: { name: string; url?: string }[];
    locations?: { name: string; url?: string }[];
    concepts?: { name: string; url?: string }[];
  };
  citations?: { title: string; url: string }[];
}

function parseStructuredData(text: string): {
  entities: ExtractedEntities;
  citations: Citation[];
} {
  const fallback = {
    entities: {
      people: [],
      organizations: [],
      locations: [],
      concepts: [],
    },
    citations: [],
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
          locations: parsed.entities?.locations || [],
          concepts: parsed.entities?.concepts || [],
        },
        citations: parsed.citations || [],
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
          locations: parsed.entities?.locations || [],
          concepts: parsed.entities?.concepts || [],
        },
        citations: parsed.citations || [],
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

export async function analyzeWithClaude(topic: string): Promise<AIResponse> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: PROMPT_TEMPLATE(topic),
      },
    ],
  });

  if (message.stop_reason === "max_tokens") {
    console.warn("Claude response was truncated due to max_tokens limit");
  }

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const { entities, citations } = parseStructuredData(responseText);

  return {
    provider: "claude",
    rawText: extractRawText(responseText),
    entities,
    citations,
    model: "claude-haiku-4-5-20251001",
  };
}
