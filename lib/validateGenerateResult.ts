import type { GenerateResult } from "@/lib/types";

function isStringArray(value: unknown, minLength: number) {
  return (
    Array.isArray(value) &&
    value.length >= minLength &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

export function isGenerateResult(value: unknown): value is GenerateResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Partial<GenerateResult>;

  return (
    isStringArray(result.conservativeVersion, 1) &&
    isStringArray(result.enhancedVersion, 1) &&
    Array.isArray(result.interviewQuestions) &&
    result.interviewQuestions.length === 5 &&
    result.interviewQuestions.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.question === "string" &&
        item.question.trim().length > 0 &&
        typeof item.answerGuide === "string" &&
        item.answerGuide.trim().length > 0,
    ) &&
    isStringArray(result.riskWarnings, 1) &&
    isStringArray(result.suggestions, 1) &&
    (!result.source || result.source === "ai" || result.source === "mock")
  );
}
