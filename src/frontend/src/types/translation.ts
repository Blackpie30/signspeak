export interface Translation {
  id: bigint;
  text: string;
  confidence: number;
  timestamp: bigint;
}

export interface TranslationDisplay {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
}

export type SignLanguage = "ASL" | "BSL" | "JSL";

export function toTranslationDisplay(t: Translation): TranslationDisplay {
  return {
    id: t.id.toString(),
    text: t.text,
    confidence: t.confidence,
    timestamp: new Date(Number(t.timestamp) / 1_000_000),
  };
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "Very High";
  if (confidence >= 0.75) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.75) return "text-accent";
  if (confidence >= 0.5) return "text-primary";
  return "text-muted-foreground";
}
