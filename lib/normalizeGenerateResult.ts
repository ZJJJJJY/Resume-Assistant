import { generateMockResult } from "@/lib/mockGenerate";
import type { CareerFormData, GenerateResult } from "@/lib/types";

type PartialQuestion = {
  question?: unknown;
  answerGuide?: unknown;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map(cleanString).filter(Boolean);
}

function cleanQuestions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: PartialQuestion) => ({
      question: cleanString(item?.question),
      answerGuide: cleanString(item?.answerGuide),
    }))
    .filter((item) => item.question && item.answerGuide);
}

export function normalizeGenerateResult(value: unknown, formData: CareerFormData): GenerateResult {
  const fallback = generateMockResult(formData);

  if (!value || typeof value !== "object") {
    throw new Error("AI response was not an object.");
  }

  const raw = value as Partial<GenerateResult>;
  const interviewQuestions = cleanQuestions(raw.interviewQuestions);
  const normalizedQuestions = [
    ...interviewQuestions,
    ...fallback.interviewQuestions.filter(
      (fallbackQuestion) =>
        !interviewQuestions.some((item) => item.question === fallbackQuestion.question),
    ),
  ].slice(0, 5);

  return {
    recommendedResumeVersion:
      cleanStringArray(raw.recommendedResumeVersion).length > 0
        ? cleanStringArray(raw.recommendedResumeVersion)
        : cleanStringArray(raw.enhancedVersion).length > 0
          ? cleanStringArray(raw.enhancedVersion)
          : fallback.recommendedResumeVersion || fallback.enhancedVersion,
    conservativeVersion:
      cleanStringArray(raw.conservativeVersion).length > 0
        ? cleanStringArray(raw.conservativeVersion)
        : fallback.conservativeVersion,
    enhancedVersion:
      cleanStringArray(raw.enhancedVersion).length > 0
        ? cleanStringArray(raw.enhancedVersion)
        : fallback.enhancedVersion,
    interviewQuestions: normalizedQuestions,
    riskWarnings:
      cleanStringArray(raw.riskWarnings).length > 0
        ? cleanStringArray(raw.riskWarnings)
        : fallback.riskWarnings,
    suggestions:
      cleanStringArray(raw.suggestions).length > 0
        ? cleanStringArray(raw.suggestions)
        : fallback.suggestions,
    source: "ai",
  };
}
