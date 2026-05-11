import { NextResponse } from "next/server";
import {
  buildCareerGenerationPrompt,
  careerGenerationInstructions,
  careerResultJsonSchema,
} from "@/lib/generatePrompt";
import { generateMockResult } from "@/lib/mockGenerate";
import { normalizeGenerateResult } from "@/lib/normalizeGenerateResult";
import type { CareerFormData } from "@/lib/types";
import { isGenerateResult } from "@/lib/validateGenerateResult";

type ChatCompletionResult = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const deepSeekBaseUrl = "https://api.deepseek.com";
const openAiBaseUrl = "https://api.openai.com/v1";
const defaultDeepSeekModel = "deepseek-v4-pro";
const defaultOpenAiModel = "gpt-5.4-mini";
const defaultMaxTokens = 4096;

export async function POST(request: Request) {
  const data = (await request.json()) as CareerFormData;
  const config = getAiConfig();

  if (!config.apiKey) {
    return NextResponse.json(generateMockResult(data, "未读取到 API Key，已使用本地 mock。"));
  }

  try {
    const result = await generateWithChatCompletion(data, config);
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      `AI generation failed for model "${config.model}" at "${config.baseUrl}", falling back to mock result.`,
      error,
    );
    return NextResponse.json(generateMockResult(data, getFallbackReason(error)));
  }
}

function getAiConfig() {
  const hasDeepSeekKey = Boolean(process.env.DEEPSEEK_API_KEY);
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
  const baseUrl =
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    (hasDeepSeekKey ? deepSeekBaseUrl : openAiBaseUrl);
  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    (hasDeepSeekKey ? defaultDeepSeekModel : defaultOpenAiModel);

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
  };
}

async function generateWithChatCompletion(
  data: CareerFormData,
  config: { apiKey: string; baseUrl: string; model: string },
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `${careerGenerationInstructions}\n\nJSON schema:\n${JSON.stringify(
            careerResultJsonSchema,
          )}`,
        },
        {
          role: "user",
          content: buildCareerGenerationPrompt(data),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: getMaxTokens(),
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ChatCompletionResult;
  const outputText = payload.choices?.[0]?.message?.content;

  if (!outputText) {
    throw new Error("AI response did not include output text.");
  }

  const parsedResult = parseAiJson(outputText);
  const normalizedResult = normalizeGenerateResult(parsedResult, data);

  if (!isGenerateResult(normalizedResult)) {
    throw new Error("AI response could not be normalized to GenerateResult.");
  }

  return normalizedResult;
}

function parseAiJson(outputText: string) {
  try {
    return JSON.parse(outputText) as unknown;
  } catch {
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response was not valid JSON.");
    }

    return JSON.parse(jsonMatch[0]) as unknown;
  }
}

function getFallbackReason(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "AI 生成失败，已使用本地 mock。";
}

function getMaxTokens() {
  const configuredMaxTokens = Number(process.env.AI_MAX_TOKENS);

  if (Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0) {
    return configuredMaxTokens;
  }

  return defaultMaxTokens;
}
