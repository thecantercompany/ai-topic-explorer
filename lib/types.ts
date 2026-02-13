export type Provider = "claude" | "openai" | "gemini";

export interface Entity {
  name: string;
  url?: string;
}

export interface ExtractedEntities {
  people: Entity[];
  organizations: Entity[];
  locations: Entity[];
  concepts: Entity[];
}

export interface Citation {
  title: string;
  url: string;
}

export interface AIResponse {
  provider: Provider;
  rawText: string;
  entities: ExtractedEntities;
  citations: Citation[];
  model: string;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface CombinedCitation {
  title: string;
  url: string;
  providers: Provider[];
}

export interface CombinedEntities {
  people: Entity[];
  organizations: Entity[];
  locations: Entity[];
  concepts: Entity[];
}

export interface AnalysisResult {
  topic: string;
  responses: {
    claude: AIResponse | null;
    openai: AIResponse | null;
    gemini: AIResponse | null;
  };
  errors: {
    claude?: string;
    openai?: string;
    gemini?: string;
  };
  combinedWordFrequencies: WordFrequency[];
  combinedEntities: CombinedEntities;
  combinedCitations: CombinedCitation[];
}
