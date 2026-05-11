"use client";

import { useEffect, useMemo, useState } from "react";
import ResultPanel from "@/components/ResultPanel";
import type { CareerFormData, GenerateResult } from "@/lib/types";

type FieldConfig = {
  name: keyof CareerFormData;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
};

type FieldGroup = {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
};

type FormErrors = Partial<Record<keyof CareerFormData, string>>;

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

const sampleForm: CareerFormData = {
  school: "华东师范大学",
  major: "信息管理与信息系统",
  grade: "大三",
  targetRole: "产品经理实习生",
  projectName: "学生信息管理系统",
  projectType: "课程项目",
  projectBackground:
    "学校课程团队需要一个用于管理学生基础信息、课程成绩和班级分组的系统，减少 Excel 手工维护带来的查找慢、更新容易出错等问题。",
  responsibilities:
    "我负责需求梳理、功能原型和前端页面实现。前期访谈了 6 名同学和 1 位助教，整理学生信息录入、成绩查询、班级筛选等核心流程；中期用 Figma 设计主要页面，并用 React 完成列表、搜索、编辑弹窗和表单校验；后期根据测试反馈优化了字段提示和空状态展示。",
  tools: "React、TypeScript、Figma、Excel、问卷访谈、Git",
  results:
    "完成了可演示 Demo，支持 200 条学生数据的录入、查询、编辑和筛选；把助教查找学生记录的时间从约 3 分钟缩短到 30 秒以内，并沉淀了需求文档、原型图和测试记录。",
  challenges:
    "一开始需求比较分散，不同角色关注点不一致。我先把需求按高频场景排序，再和组员确认 MVP 范围，优先保证信息录入、查询和编辑流程可用。",
  jobDescription:
    "参与产品需求调研和竞品分析，协助输出需求文档和产品原型，推动设计、研发、测试协作落地，并根据用户反馈持续优化产品体验。",
};

const requiredFields: Array<keyof CareerFormData> = [
  "targetRole",
  "projectName",
  "projectType",
  "responsibilities",
  "tools",
  "results",
];

const loadingMessages = [
  "正在整理你的项目经历...",
  "正在生成简历表达...",
  "正在准备面试追问...",
];

const fieldGroups: FieldGroup[] = [
  {
    id: "basic-info",
    title: "基本信息",
    description: "这些信息会帮助结果更贴近你的身份和目标方向。",
    fields: [
      { name: "school", label: "学校", placeholder: "例如：华东师范大学" },
      { name: "major", label: "专业", placeholder: "例如：计算机科学与技术" },
      { name: "grade", label: "年级", placeholder: "例如：大三 / 研一" },
      {
        name: "targetRole",
        label: "目标岗位",
        placeholder: "例如：产品经理实习生",
        required: true,
      },
    ],
  },
  {
    id: "project-experience",
    title: "项目经历",
    description: "尽量写清楚你做了什么、怎么做、最后带来了什么结果。",
    fields: [
      {
        name: "projectName",
        label: "项目名称",
        placeholder: "例如：校园二手交易平台",
        required: true,
      },
      {
        name: "projectType",
        label: "项目类型",
        placeholder: "课程项目 / 竞赛 / 实习 / 社团项目",
        required: true,
      },
      {
        name: "projectBackground",
        label: "项目背景",
        placeholder: "这个项目为什么要做？面向谁？",
        multiline: true,
      },
      {
        name: "responsibilities",
        label: "我负责的内容",
        placeholder: "写 2-4 点即可，例如：需求调研、原型设计、前端开发",
        multiline: true,
        required: true,
      },
      {
        name: "tools",
        label: "使用的技术/工具/方法",
        placeholder: "例如：React、Figma、Python、Excel、问卷访谈",
        multiline: true,
        required: true,
      },
      {
        name: "results",
        label: "项目成果",
        placeholder: "例如：完成 Demo、获得奖项、服务 100 名同学、提升效率",
        multiline: true,
        required: true,
      },
      {
        name: "challenges",
        label: "遇到的困难",
        placeholder: "例如：需求不清、数据不足、协作推进慢",
        multiline: true,
      },
    ],
  },
  {
    id: "job-description",
    title: "目标岗位 JD",
    description: "可选。粘贴岗位描述后，岗位强化版会更容易对齐真实招聘要求。",
    fields: [
      {
        name: "jobDescription",
        label: "岗位描述（可选）",
        placeholder: "粘贴岗位职责或任职要求中你最关注的部分",
        multiline: true,
      },
    ],
  },
];

export default function FormPage() {
  const [form, setForm] = useState<CareerFormData>(initialForm);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loadingIndex, setLoadingIndex] = useState(0);

  const loadingText = useMemo(
    () => loadingMessages[loadingIndex % loadingMessages.length],
    [loadingIndex],
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingIndex((current) => current + 1);
    }, 900);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  function updateField(name: keyof CareerFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function validateForm(currentForm: CareerFormData) {
    const nextErrors: FormErrors = {};

    requiredFields.forEach((fieldName) => {
      if (!currentForm[fieldName].trim()) {
        nextErrors[fieldName] = "这个字段是必填项。";
      }
    });

    const responsibilityLength = currentForm.responsibilities.trim().length;
    if (responsibilityLength > 0 && responsibilityLength < 20) {
      nextErrors.responsibilities = "请补充更具体的负责内容，至少写 20 个字。";
    }

    return nextErrors;
  }

  function fillSampleProject() {
    setForm(sampleForm);
    setFieldErrors({});
    setError("");
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("请先补全标红字段，再生成求职材料。");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const responsePromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const minimumLoadingPromise = new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1100);
      });

      const [response] = await Promise.all([responsePromise, minimumLoadingPromise]);

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/" className="text-sm font-semibold text-mint hover:text-ink">
              返回首页
            </a>
            <h1 className="mt-4 text-3xl font-bold text-ink">填写项目信息</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              不需要写得很完美，先把真实信息填进去。生成结果会给你一个可修改的初稿。
            </p>
          </div>

          <button
            type="button"
            onClick={fillSampleProject}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-md border border-mint px-4 text-sm font-semibold text-mint transition hover:bg-mint hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            填入示例项目
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fieldGroups.map((group) => (
              <FormSection key={group.id} group={group}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      value={form[field.name]}
                      error={fieldErrors[field.name]}
                      disabled={isLoading}
                      onChange={updateField}
                    />
                  ))}
                </div>
              </FormSection>
            ))}

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            {isLoading ? (
              <div className="rounded-md border border-mint/40 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-mint align-middle" />{" "}
                {loadingText}
              </div>
            ) : null}

            <div className="sticky bottom-4 z-10">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-[52px] min-h-[52px] w-full items-center justify-center rounded-md bg-[#1f9d8b] px-7 text-base font-bold text-white shadow-lg shadow-mint/35 ring-2 ring-[#17202a]/10 transition hover:bg-[#188a7a] hover:shadow-xl hover:shadow-mint/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:ring-0"
              >
                {isLoading ? loadingText : "生成求职材料"}
              </button>
            </div>
          </form>

          <ResultPanel result={result} />
        </div>
      </div>
    </main>
  );
}

function FormSection({
  group,
  children,
}: {
  group: FieldGroup;
  children: React.ReactNode;
}) {
  return (
    <section id={group.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink">{group.title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
      </div>
      {children}
    </section>
  );
}

function FormField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (name: keyof CareerFormData, value: string) => void;
}) {
  const sharedClassName = `mt-2 w-full rounded-md border px-3 text-sm outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-mint focus:ring-2 focus:ring-mint/20"
  }`;

  return (
    <label className={field.multiline ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-ink">
        {field.label}
        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          rows={field.name === "jobDescription" ? 5 : 4}
          disabled={disabled}
          className={`${sharedClassName} resize-y py-2 leading-6`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={`${sharedClassName} h-11`}
        />
      )}
      {error ? <p className="mt-1 text-xs leading-5 text-red-600">{error}</p> : null}
    </label>
  );
}
