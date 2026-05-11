"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeInputQuality, getCompletenessLabel } from "@/lib/analyzeInputQuality";
import type {
  CareerFormData,
  FeedbackRating,
  GenerateResult,
  InputQualityAnalysis,
  ResultFeedback,
} from "@/lib/types";

type ResultPanelProps = {
  result: GenerateResult | null;
  qualityAnalysis?: InputQualityAnalysis | null;
  onRegenerate?: () => Promise<void> | void;
  isRegenerating?: boolean;
  regenerateError?: string;
};

const feedbackOptions: FeedbackRating[] = ["有帮助", "一般", "没帮助"];
const feedbackStorageKey = "career-material-feedback";
const savedFormStorageKey = "career-material-latest-form";

export default function ResultPanel({
  result,
  qualityAnalysis,
  onRegenerate,
  isRegenerating = false,
  regenerateError = "",
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackCopied, setFeedbackCopied] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | "">("");
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [latestForm, setLatestForm] = useState<CareerFormData | null>(null);
  const [fallbackQuality, setFallbackQuality] = useState<InputQualityAnalysis | null>(null);

  const visibleQuality = qualityAnalysis || fallbackQuality;

  const copyText = useMemo(() => {
    if (!result) return "";

    return [
      "保守版项目经历",
      ...result.conservativeVersion.map((item, index) => `${index + 1}. ${item}`),
      "",
      "岗位强化版项目经历",
      ...result.enhancedVersion.map((item, index) => `${index + 1}. ${item}`),
      "",
      "面试追问",
      ...result.interviewQuestions.map(
        (item, index) => `${index + 1}. ${item.question}\n回答思路：${item.answerGuide}`,
      ),
      "",
      "简历真实性风险提示",
      ...result.riskWarnings.map((item, index) => `${index + 1}. ${item}`),
      "",
      "下一步修改建议",
      ...result.suggestions.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");
  }, [result]);

  useEffect(() => {
    setCopied(false);
    setFeedbackCopied(false);
    setRating("");
    setComment("");
    setFeedbackSubmitted(false);
    setFeedbackError("");

    const storedForm = readLatestForm();
    setLatestForm(storedForm);
    setFallbackQuality(storedForm ? analyzeInputQuality(storedForm) : null);
  }, [result]);

  async function handleCopy() {
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleFeedbackSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const feedback: ResultFeedback = {
      rating: rating || "一般",
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      targetRole: latestForm?.targetRole,
      projectName: latestForm?.projectName,
    };
    const existingFeedback = window.localStorage.getItem(feedbackStorageKey);
    const feedbackList = existingFeedback
      ? (JSON.parse(existingFeedback) as ResultFeedback[])
      : [];

    window.localStorage.setItem(
      feedbackStorageKey,
      JSON.stringify([...feedbackList, feedback]),
    );
    setFeedbackSubmitted(true);
    setFeedbackError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error("Feedback webhook failed.");
      }
    } catch {
      setFeedbackError("反馈已保存在本地，远程同步暂时不可用。");
    }
  }

  async function handleCopyFeedbackPackage() {
    const packageText = [
      "求职材料生成反馈",
      `用户选择：${rating || "未选择"}`,
      `用户文字反馈：${comment.trim() || "未填写"}`,
      `目标岗位：${latestForm?.targetRole || "未填写"}`,
      `项目名称：${latestForm?.projectName || "未填写"}`,
      `当前时间：${new Date().toLocaleString("zh-CN")}`,
    ].join("\n");

    await navigator.clipboard.writeText(packageText);
    setFeedbackCopied(true);
    window.setTimeout(() => setFeedbackCopied(false), 1600);
  }

  if (!result) {
    return (
      <aside className="rounded-2xl border border-dashed border-[#2FBF9B]/35 bg-white p-5 shadow-[0_12px_34px_rgba(31,41,51,0.05)] lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Preview</p>
        <h2 className="mt-2 text-lg font-semibold text-[#1F2933]">生成结果会显示在这里</h2>
        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          填写左侧信息后，你会得到简历表达、面试追问、真实性风险提示和下一步修改建议。
        </p>
        <div className="mt-5 space-y-3">
          {["保守真实版项目经历", "岗位强化版项目经历", "面试追问与回答思路"].map((item) => (
            <div key={item} className="rounded-2xl border border-[#E5E7EB] bg-[#F7FAF8] px-4 py-3">
              <div className="h-2 w-20 rounded-full bg-[#2FBF9B]/20" />
              <p className="mt-3 text-sm font-semibold text-[#1F2933]">{item}</p>
              <div className="mt-2 h-2 w-full rounded-full bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_46px_rgba(31,41,51,0.07)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Report
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#1F2933]">求职材料报告</h2>
          {result.source ? (
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              生成来源：
              <span className={result.source === "ai" ? "text-[#059669]" : "text-[#D97706]"}>
                {result.source === "ai" ? "真实 AI API" : "Mock fallback"}
              </span>
            </p>
          ) : null}
          {result.source === "mock" && result.fallbackReason ? (
            <p className="mt-1 text-xs leading-5 text-amber-700">
              回退原因：{result.fallbackReason}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href="#project-experience"
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
          >
            返回修改
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="h-10 rounded-2xl bg-[#2FBF9B] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(47,191,155,0.22)] transition hover:bg-[#16876F]"
          >
            {copied ? "已复制全部结果" : "复制全部结果"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="h-10 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
          >
            {isRegenerating ? "重新生成中..." : "重新生成一次"}
          </button>
        </div>
      </div>

      {regenerateError ? (
        <p className="mt-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-sm text-[#D97706]">
          {regenerateError}
        </p>
      ) : null}

      {visibleQuality ? <QualityReference analysis={visibleQuality} /> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryBadge label="简历表达" value={`${result.conservativeVersion.length + result.enhancedVersion.length} 条`} />
        <SummaryBadge label="面试追问" value={`${result.interviewQuestions.length} 个`} />
        <SummaryBadge label="修改建议" value={`${result.suggestions.length} 条`} />
      </div>

      <div className="mt-5 space-y-5">
        <Section title="保守版项目经历">
          <ResultList items={result.conservativeVersion} />
        </Section>
        <Section title="岗位强化版项目经历">
          <ResultList items={result.enhancedVersion} />
        </Section>
        <Section title="5 个面试追问">
          <ol className="space-y-3">
            {result.interviewQuestions.map((item, index) => (
              <li
                key={item.question}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F7FAF8] p-4"
              >
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F8F3] text-xs font-bold text-[#16876F]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1F2933]">{item.question}</p>
                    <p className="mt-2 text-[#64748B]">回答思路：{item.answerGuide}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        <Section title="简历真实性风险提示">
          <ResultList items={result.riskWarnings} />
        </Section>
        <Section title="下一步修改建议">
          <ResultList items={result.suggestions} />
        </Section>
      </div>

      <div className="mt-6 rounded-2xl border border-[#CFF5EA] bg-[#F0FBF7] p-4">
        <p className="text-sm leading-6 text-[#1F2933]">
          如果结果不够具体，可以返回表单补充更多细节，例如具体负责的模块、使用的工具、项目成果和遇到的问题。
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
        <p className="text-sm leading-6 text-[#1F2933]">
          AI 可能会优化表达，但不应替你虚构经历。请确认每一条内容都能在面试中解释清楚。
        </p>
      </div>

      <FeedbackForm
        rating={rating}
        comment={comment}
        submitted={feedbackSubmitted}
        error={feedbackError}
        feedbackCopied={feedbackCopied}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onSubmit={handleFeedbackSubmit}
        onCopyFeedbackPackage={handleCopyFeedbackPackage}
      />
    </aside>
  );
}

function QualityReference({ analysis }: { analysis: InputQualityAnalysis }) {
  return (
    <section className="mt-5 rounded-2xl border border-[#CFF5EA] bg-[#F7FAF8] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-[#1F2933]">本次生成质量参考</h3>
        <span className="inline-flex w-fit items-center rounded-full bg-[#E8F8F3] px-3 py-1 text-xs font-bold text-[#16876F]">
          完整度：{getCompletenessLabel(analysis.completenessLevel)}
        </span>
      </div>
      <QualityList title="主要问题" items={analysis.issues} emptyText="目前没有明显问题。" />
      <QualityList title="建议补充的信息" items={analysis.suggestions} emptyText="信息已经比较充分。" />
    </section>
  );
}

function QualityList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-[#64748B]">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-[#64748B]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-[#64748B]">{emptyText}</p>
      )}
    </div>
  );
}

function FeedbackForm({
  rating,
  comment,
  submitted,
  error,
  feedbackCopied,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onCopyFeedbackPackage,
}: {
  rating: FeedbackRating | "";
  comment: string;
  submitted: boolean;
  error: string;
  feedbackCopied: boolean;
  onRatingChange: (rating: FeedbackRating) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCopyFeedbackPackage: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F7FAF8] p-4">
      <h3 className="text-sm font-semibold text-[#1F2933]">这个结果对你有帮助吗？</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {feedbackOptions.map((option) => {
          const isSelected = rating === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onRatingChange(option)}
              className={`h-10 rounded-2xl border px-4 text-sm font-semibold transition ${
                isSelected
                  ? "border-[#2FBF9B] bg-[#2FBF9B] text-white"
                  : "border-[#E5E7EB] bg-white text-[#1F2933] hover:border-[#2FBF9B] hover:text-[#16876F]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-[#1F2933]">你觉得哪里还不够好？</span>
        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="例如：希望项目经历更量化、面试问题更贴近岗位、表达更像我自己的语气"
          rows={3}
          className="mt-2 w-full resize-y rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#2FBF9B] focus:ring-2 focus:ring-[#2FBF9B]/20"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#1F2933] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2FBF9B] sm:w-auto"
        >
          提交反馈
        </button>
        <button
          type="button"
          onClick={onCopyFeedbackPackage}
          className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F] sm:w-auto"
        >
          {feedbackCopied ? "已复制反馈包" : "复制反馈包"}
        </button>
        {submitted ? <p className="text-sm font-semibold text-[#059669]">感谢反馈</p> : null}
      </div>
      {error ? <p className="mt-3 text-sm text-[#64748B]">{error}</p> : null}
    </form>
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
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <SectionLabel title={title} />
      <div className="mt-3 text-sm leading-7 text-[#64748B]">{children}</div>
    </section>
  );
}

function SummaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7FAF8] px-4 py-3">
      <p className="text-xs font-semibold text-[#64748B]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#1F2933]">{value}</p>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  const isEnhanced = title.includes("强化");
  const isRisk = title.includes("风险");

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        isRisk
          ? "bg-[#FFF7ED] text-[#D97706]"
          : isEnhanced
            ? "bg-[#E8F8F3] text-[#16876F]"
            : "bg-[#F1F5F9] text-[#1F2933]"
      }`}
    >
      {title}
    </span>
  );
}

function readLatestForm() {
  const storedForm = window.localStorage.getItem(savedFormStorageKey);
  if (!storedForm) return null;

  try {
    return JSON.parse(storedForm) as CareerFormData;
  } catch {
    return null;
  }
}

function ResultList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
