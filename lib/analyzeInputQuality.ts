import type { CareerFormData, InputQualityAnalysis } from "@/lib/types";

function normalizedLength(value: string) {
  return value.trim().replace(/\s+/g, "").length;
}

export function analyzeInputQuality(data: CareerFormData): InputQualityAnalysis {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (normalizedLength(data.responsibilities) < 20) {
    issues.push("我负责的内容偏少，生成结果可能不够具体。");
    suggestions.push("补充你具体负责的模块、动作和产出，例如调研、原型、开发、测试或协作推进。");
  }

  if (!data.tools.trim() || normalizedLength(data.tools) < 6) {
    issues.push("使用的技术/工具/方法信息不足。");
    suggestions.push("补充实际使用过的工具、方法或技术栈，例如 Figma、React、Excel、问卷访谈、数据分析方法。");
  }

  if (!data.results.trim() || normalizedLength(data.results) < 10) {
    issues.push("项目成果信息不足，简历表达可能缺少说服力。");
    suggestions.push("补充可证明的结果，例如 Demo、文档、用户数、效率变化、获奖情况或交付物。");
  }

  if (!data.challenges.trim()) {
    issues.push("遇到的困难为空，面试追问准备会比较泛。");
    suggestions.push("补充一个真实困难，例如需求不清、数据不足、协作阻塞、技术限制或时间压力。");
  }

  if (!data.jobDescription.trim()) {
    issues.push("目标岗位 JD 为空，岗位强化版的匹配度会受影响。");
    suggestions.push("粘贴目标岗位的职责或任职要求中最关键的几条，帮助结果更贴近岗位。");
  }

  let completenessLevel: InputQualityAnalysis["completenessLevel"] = "high";
  if (issues.length >= 4) {
    completenessLevel = "low";
  } else if (issues.length >= 2) {
    completenessLevel = "medium";
  }

  return {
    completenessLevel,
    issues,
    suggestions,
  };
}

export function getCompletenessLabel(level: InputQualityAnalysis["completenessLevel"]) {
  const labels = {
    high: "高",
    medium: "中",
    low: "低",
  } satisfies Record<InputQualityAnalysis["completenessLevel"], string>;

  return labels[level];
}
