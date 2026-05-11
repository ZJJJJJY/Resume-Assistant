"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ResultPanel from "@/components/ResultPanel";
import { analyzeInputQuality, getCompletenessLabel } from "@/lib/analyzeInputQuality";
import { appVersion } from "@/lib/constants";
import {
  addTrialHistoryItem,
  readLatestForm,
  saveLatestForm,
  updateTrialHistoryResult,
} from "@/lib/trialHistory";
import { recordTrialEvent } from "@/lib/trialEvents";
import type { CareerFormData, GenerateResult, InputQualityAnalysis } from "@/lib/types";

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
  const [qualityAnalysis, setQualityAnalysis] = useState<InputQualityAnalysis | null>(null);
  const [qualityWarning, setQualityWarning] = useState("");
  const [regenerateError, setRegenerateError] = useState("");
  const [currentHistoryId, setCurrentHistoryId] = useState("");
  const [hasStartedForm, setHasStartedForm] = useState(false);

  const loadingText = useMemo(
    () => loadingMessages[loadingIndex % loadingMessages.length],
    [loadingIndex],
  );

  useEffect(() => {
    if (window.location.search.includes("fromHistory=1")) {
      const latestForm = readLatestForm();
      if (latestForm) {
        setForm(latestForm);
      }
    }
  }, []);

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
    if (!hasStartedForm) {
      recordTrialEvent({ eventName: "form_started" });
      setHasStartedForm(true);
    }

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
    setQualityWarning("");
    setRegenerateError("");
    recordTrialEvent({
      eventName: "example_filled",
      targetRole: sampleForm.targetRole,
      projectType: sampleForm.projectType,
    });
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentQuality = analyzeInputQuality(form);
    setQualityAnalysis(currentQuality);
    recordTrialEvent({
      eventName: "generate_clicked",
      targetRole: form.targetRole,
      projectType: form.projectType,
      completenessLevel: currentQuality.completenessLevel,
    });
    setQualityWarning(
      currentQuality.completenessLevel === "low"
        ? "当前输入完整度较低，生成结果可能偏泛。你可以继续生成，也可以先补充更多细节。"
        : "",
    );

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("请先补全标红字段，再生成求职材料。");
      return;
    }

    saveLatestForm(form);
    setIsLoading(true);
    setError("");
    setRegenerateError("");
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
      const historyItem = addTrialHistoryItem({
        formData: form,
        result: data,
        completenessLevel: currentQuality.completenessLevel,
      });
      setCurrentHistoryId(historyItem.id);
      recordTrialEvent({
        eventName: "generate_success",
        targetRole: form.targetRole,
        projectType: form.projectType,
        source: data.source || "mock",
        completenessLevel: currentQuality.completenessLevel,
      });
    } catch (currentError) {
      recordTrialEvent({
        eventName: "generate_failed",
        targetRole: form.targetRole,
        projectType: form.projectType,
        completenessLevel: currentQuality.completenessLevel,
      });
      setError(currentError instanceof Error ? currentError.message : "生成失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate() {
    const latestForm = readLatestForm();

    if (!latestForm) {
      setRegenerateError("没有找到上一次填写的表单，请先在左侧填写并生成一次。");
      return;
    }

    const currentQuality = analyzeInputQuality(latestForm);
    setQualityAnalysis(currentQuality);
    recordTrialEvent({
      eventName: "regenerate_clicked",
      targetRole: latestForm.targetRole,
      projectType: latestForm.projectType,
      completenessLevel: currentQuality.completenessLevel,
    });
    setQualityWarning(
      currentQuality.completenessLevel === "low"
        ? "当前输入完整度较低，重新生成结果可能仍然偏泛。建议补充细节后再试。"
        : "",
    );
    setForm(latestForm);
    setIsLoading(true);
    setError("");
    setRegenerateError("");

    try {
      const responsePromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latestForm),
      });
      const minimumLoadingPromise = new Promise<void>((resolve) => {
        window.setTimeout(resolve, 900);
      });

      const [response] = await Promise.all([responsePromise, minimumLoadingPromise]);

      if (!response.ok) {
        throw new Error("重新生成失败，请稍后重试。");
      }

      const data = (await response.json()) as GenerateResult;
      setResult(data);
      const historyItem = addTrialHistoryItem({
        formData: latestForm,
        result: data,
        completenessLevel: currentQuality.completenessLevel,
      });
      setCurrentHistoryId(historyItem.id);
      recordTrialEvent({
        eventName: "generate_success",
        targetRole: latestForm.targetRole,
        projectType: latestForm.projectType,
        source: data.source || "mock",
        completenessLevel: currentQuality.completenessLevel,
      });
    } catch {
      recordTrialEvent({
        eventName: "generate_failed",
        targetRole: latestForm.targetRole,
        projectType: latestForm.projectType,
        completenessLevel: currentQuality.completenessLevel,
      });
      setRegenerateError("重新生成失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-4 py-8 text-[#1F2933]">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_42px_rgba(31,41,51,0.06)] md:p-6">
          <div>
            <a href="/" className="text-sm font-semibold text-[#16876F] transition hover:text-[#1F2933]">
              返回首页
            </a>
            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                    Career Material Assistant
                  </p>
                  <span className="rounded-full bg-[#E8F8F3] px-3 py-1 text-xs font-bold text-[#16876F]">
                    {appVersion} 试用版
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-bold text-[#1F2933]">填写项目信息</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
                  不需要写得很完美，先把真实信息填进去。系统会帮你整理成简历表达、面试追问和修改建议。
                </p>
              </div>

              <button
                type="button"
                onClick={fillSampleProject}
                disabled={isLoading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#2FBF9B] bg-white px-4 text-sm font-semibold text-[#16876F] transition hover:bg-[#2FBF9B] hover:text-white disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:text-[#94A3B8]"
              >
                填入示例项目
              </button>
              <Link
                href="/history"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
              >
                查看历史记录
              </Link>
            </div>
          </div>

          <StepStrip />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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

            {qualityWarning ? (
              <p className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-sm leading-6 text-[#1F2933]">
                {qualityWarning}
                {qualityAnalysis ? ` 当前信息完整度：${getCompletenessLabel(qualityAnalysis.completenessLevel)}。` : ""}
              </p>
            ) : null}

            {isLoading ? (
              <div className="rounded-2xl border border-[#BBF7D0] bg-white px-4 py-3 text-sm font-semibold text-[#1F2933] shadow-[0_10px_24px_rgba(47,191,155,0.12)]">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#2FBF9B] align-middle" />{" "}
                {loadingText}
              </div>
            ) : null}

            <div className="sticky bottom-4 z-10">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-[56px] min-h-[56px] w-full items-center justify-center rounded-2xl bg-[#2FBF9B] px-7 text-base font-bold text-white shadow-[0_18px_36px_rgba(47,191,155,0.28)] transition hover:bg-[#16876F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16876F] disabled:cursor-not-allowed disabled:bg-[#94A3B8] disabled:shadow-none"
              >
                {isLoading ? loadingText : "生成求职材料"}
              </button>
            </div>

            <p className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs leading-5 text-[#64748B]">
              本工具仍在测试阶段，生成内容仅供简历初稿参考，请根据真实经历修改后使用。请勿填写身份证号、手机号、银行卡号等敏感信息。
            </p>
          </form>

          <ResultPanel
            result={result}
            qualityAnalysis={qualityAnalysis}
            onRegenerate={handleRegenerate}
            isRegenerating={isLoading}
            regenerateError={regenerateError}
            formData={form}
            historyItemId={currentHistoryId}
            onResultChange={(nextResult) => {
              setResult(nextResult);
              if (currentHistoryId) {
                updateTrialHistoryResult(currentHistoryId, nextResult);
              }
            }}
          />
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
    <section
      id={group.id}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_34px_rgba(31,41,51,0.05)]"
    >
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2FBF9B]" />
          <h2 className="text-lg font-semibold text-[#1F2933]">{group.title}</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{group.description}</p>
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
  const sharedClassName = `mt-2 w-full rounded-2xl border px-3 text-sm outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
    error
      ? "border-[#FDBA74] bg-[#FFF7ED] focus:border-[#D97706] focus:ring-2 focus:ring-[#FED7AA]"
      : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1] focus:border-[#2FBF9B] focus:bg-white focus:ring-2 focus:ring-[#2FBF9B]/20"
  }`;

  return (
    <label className={field.multiline ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-[#1F2933]">
        {field.label}
        {field.required ? <span className="ml-1 text-[#D97706]">*</span> : null}
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
      {error ? <p className="mt-1 text-xs leading-5 text-[#D97706]">{error}</p> : null}
    </label>
  );
}

function StepStrip() {
  const steps = ["基本信息", "项目经历", "目标岗位"];

  return (
    <div className="mt-6 grid gap-3 border-t border-[#E5E7EB] pt-5 sm:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-2xl bg-[#F7FAF8] px-3 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F8F3] text-xs font-bold text-[#16876F]">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-[#1F2933]">{step}</span>
        </div>
      ))}
    </div>
  );
}
