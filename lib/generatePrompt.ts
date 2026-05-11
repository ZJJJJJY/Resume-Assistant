import type { CareerFormData } from "@/lib/types";

export const careerResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "conservativeVersion",
    "enhancedVersion",
    "interviewQuestions",
    "riskWarnings",
    "suggestions",
  ],
  properties: {
    conservativeVersion: {
      type: "array",
      items: { type: "string" },
    },
    enhancedVersion: {
      type: "array",
      items: { type: "string" },
    },
    interviewQuestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answerGuide"],
        properties: {
          question: { type: "string" },
          answerGuide: { type: "string" },
        },
      },
    },
    riskWarnings: {
      type: "array",
      items: { type: "string" },
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export const careerGenerationInstructions = `
你是一名面向中国大学生求职场景的简历与面试表达助手。
你的任务是根据用户提交的真实项目信息，生成结构化求职材料。

必须遵守：
1. 不虚构用户未提供的重要经历、角色、奖项、数据或结果。
2. 不随意添加无法证明的数字，不夸大成果。
3. 如果信息不足，在 suggestions 中提醒用户补充具体模块、工具、结果或困难。
4. 输出适合大学生简历和面试准备场景，表达清晰、克制、真实。
5. 岗位强化版可以优化表达和突出匹配度，但不能编造事实。
6. 使用中文输出，语气专业、具体，不要写成营销文案。
7. 只返回符合 JSON schema 的 JSON，不要返回 Markdown 或解释文字。
`.trim();

export function buildCareerGenerationPrompt(data: CareerFormData) {
  return `
请根据下面的表单信息生成求职材料：

学校：${data.school || "未填写"}
专业：${data.major || "未填写"}
年级：${data.grade || "未填写"}
目标岗位：${data.targetRole || "未填写"}
项目名称：${data.projectName || "未填写"}
项目类型：${data.projectType || "未填写"}
项目背景：${data.projectBackground || "未填写"}
我负责的内容：${data.responsibilities || "未填写"}
使用的技术/工具/方法：${data.tools || "未填写"}
项目成果：${data.results || "未填写"}
遇到的困难：${data.challenges || "未填写"}
目标岗位 JD：${data.jobDescription || "未填写"}

字段含义：
- conservativeVersion：保守真实版项目经历，适合直接放入简历，重视真实和可证明。
- enhancedVersion：岗位强化版项目经历，在不编造事实的前提下更突出目标岗位相关能力。
- interviewQuestions：5 个面试官可能追问的问题，每个问题必须包含回答思路。
- riskWarnings：简历真实性风险提示，指出可能夸大、边界不清或证据不足的地方。
- suggestions：下一步修改建议，提醒用户补充哪些细节可以让结果更具体。
`.trim();
}
