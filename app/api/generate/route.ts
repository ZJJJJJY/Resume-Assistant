import { NextResponse } from "next/server";
import type { CareerFormData, GenerateResult } from "@/lib/types";

export async function POST(request: Request) {
  const data = (await request.json()) as CareerFormData;

  const result: GenerateResult = {
    conservativeExperience: `在「${data.projectName || "项目"}」中，围绕${
      data.projectBackground || "业务需求"
    }参与项目建设，主要负责${
      data.responsibilities || "需求梳理、功能实现与资料整理"
    }。过程中使用${data.tools || "相关技术和工具"}完成核心任务，并根据${
      data.challenges || "项目推进中的问题"
    }进行调整优化，最终产出${data.results || "可复用的项目成果"}。`,
    roleFocusedExperience: `面向「${data.targetRole || "目标岗位"}」的能力要求，在「${
      data.projectName || "项目"
    }」中重点承担${data.responsibilities || "核心模块推进"}，结合${
      data.tools || "岗位相关工具"
    }完成从问题分析到结果落地的过程。该经历体现了与 JD 中「${
      data.jobDescription || "岗位职责"
    }」相关的执行、协作和复盘能力，最终带来${
      data.results || "明确项目产出"
    }。`,
    interviewQuestions: [
      "你为什么选择这个项目方向？它解决了什么具体问题？",
      "你在项目中最核心的贡献是什么？如何证明是你完成的？",
      "项目中遇到的最大困难是什么？你具体采取了哪些行动？",
      "如果重新做一次，你会优先优化哪个环节？为什么？",
      `这个项目经历和${data.targetRole || "目标岗位"}之间的关联是什么？`,
    ],
    riskTips: [
      "避免把团队成果全部写成个人成果，建议明确自己的职责边界。",
      "项目成果最好补充可量化指标，如用户数、效率提升、准确率、交付周期等。",
      "技术/工具表述要和实际掌握程度一致，面试中容易被深入追问。",
      "岗位强化版可以突出相关能力，但不要新增没有真实发生的经历。",
    ],
  };

  return NextResponse.json(result);
}
