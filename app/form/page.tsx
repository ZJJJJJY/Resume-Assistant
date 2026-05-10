"use client";

import { useState } from "react";
import ResultPanel from "@/components/ResultPanel";
import type { CareerFormData, GenerateResult } from "@/lib/types";

const initialForm: CareerFormData = {
  school: "",
  major: "",
  grade: "",
  targetRole: "",
  projectName: "",
  projectType: "",
  projectBackground: "",
  responsibilities: "",
  tools: "",
  results: "",
  challenges: "",
  jobDescription: "",
};

const fields: Array<{
  name: keyof CareerFormData;
  label: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  { name: "school", label: "学校", placeholder: "例如：华东师范大学" },
  { name: "major", label: "专业", placeholder: "例如：计算机科学与技术" },
  { name: "grade", label: "年级", placeholder: "例如：大三 / 研一" },
  { name: "targetRole", label: "目标岗位", placeholder: "例如：产品经理实习生" },
  { name: "projectName", label: "项目名称", placeholder: "例如：校园二手交易平台" },
  { name: "projectType", label: "项目类型", placeholder: "课程项目 / 竞赛 / 实习 / 社团项目" },
  {
    name: "projectBackground",
    label: "项目背景",
    placeholder: "这个项目为什么要做？面向谁？",
    multiline: true,
  },
  {
    name: "responsibilities",
    label: "你负责的内容",
    placeholder: "写 2-4 点即可，例如：需求调研、原型设计、前端开发",
    multiline: true,
  },
  {
    name: "tools",
    label: "使用技术/工具",
    placeholder: "例如：React、Figma、Python、Excel、问卷星",
    multiline: true,
  },
  {
    name: "results",
    label: "项目成果",
    placeholder: "例如：完成 Demo、获得奖项、服务 100 名同学、提升效率",
    multiline: true,
  },
  {
    name: "challenges",
    label: "遇到的困难",
    placeholder: "例如：需求不清、数据不足、协作推进慢",
    multiline: true,
  },
  {
    name: "jobDescription",
    label: "目标岗位 JD",
    placeholder: "粘贴岗位职责或任职要求中你最关注的部分",
    multiline: true,
  },
];

export default function FormPage() {
  const [form, setForm] = useState<CareerFormData>(initialForm);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(name: keyof CareerFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("生成失败，请稍后重试。");
      }

      const data = (await response.json()) as GenerateResult;
      setResult(data);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "生成失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <a href="/" className="text-sm font-semibold text-mint hover:text-ink">
            返回首页
          </a>
          <h1 className="mt-4 text-3xl font-bold text-ink">填写项目信息</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            不需要写得很完美，先把真实信息填进去。生成结果会给你一个可修改的初稿。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.name}
                  className={field.multiline ? "sm:col-span-2" : undefined}
                >
                  <span className="text-sm font-semibold text-ink">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      value={form[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-mint focus:ring-2 focus:ring-mint/20"
                    />
                  ) : (
                    <input
                      value={form[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-mint focus:ring-2 focus:ring-mint/20"
                    />
                  )}
                </label>
              ))}
            </div>

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-ink px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {isLoading ? "生成中..." : "生成求职材料"}
            </button>
          </form>

          <ResultPanel result={result} />
        </div>
      </div>
    </main>
  );
}
