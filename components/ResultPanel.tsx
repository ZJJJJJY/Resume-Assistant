"use client";

import { useMemo, useState } from "react";
import type { GenerateResult } from "@/lib/types";

type ResultPanelProps = {
  result: GenerateResult | null;
};

export default function ResultPanel({ result }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const copyText = useMemo(() => {
    if (!result) return "";

    return [
      "保守版项目经历",
      result.conservativeExperience,
      "",
      "岗位强化版项目经历",
      result.roleFocusedExperience,
      "",
      "面试追问",
      ...result.interviewQuestions.map((item, index) => `${index + 1}. ${item}`),
      "",
      "简历真实性风险提示",
      ...result.riskTips.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");
  }, [result]);

  async function handleCopy() {
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!result) {
    return (
      <aside className="rounded-md border border-dashed border-slate-300 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">生成结果</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          填写左侧信息后，结果会显示在这里。你可以直接复制，也可以再手动调整成自己的语气。
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">生成结果</h2>
        <button
          type="button"
          onClick={handleCopy}
          className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint"
        >
          {copied ? "已复制" : "一键复制"}
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <Section title="保守版项目经历">
          <p>{result.conservativeExperience}</p>
        </Section>
        <Section title="岗位强化版项目经历">
          <p>{result.roleFocusedExperience}</p>
        </Section>
        <Section title="5 个面试追问">
          <ol className="list-decimal space-y-2 pl-5">
            {result.interviewQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </Section>
        <Section title="简历真实性风险提示">
          <ol className="list-decimal space-y-2 pl-5">
            {result.riskTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-4">
      <h3 className="mb-2 text-sm font-semibold text-mint">{title}</h3>
      <div className="text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}
