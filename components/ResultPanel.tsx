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
      <aside className="rounded-md border border-dashed border-slate-300 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">生成结果</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          填写左侧信息后，结果会显示在这里。你可以直接复制，也可以再手动调整成自己的语气。
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">生成结果</h2>
          {result.source ? (
            <p className="mt-1 text-xs font-semibold text-slate-500">
              生成来源：
              <span className={result.source === "ai" ? "text-mint" : "text-amber-700"}>
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
          <button
            type="button"
            onClick={handleCopy}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint"
          >
            {copied ? "已复制全部结果" : "复制全部结果"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="h-10 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f9f91] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isRegenerating ? "重新生成中..." : "重新生成一次"}
          </button>
        </div>
      </div>

      {regenerateError ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {regenerateError}
        </p>
      ) : null}

      {visibleQuality ? <QualityReference analysis={visibleQuality} /> : null}

      <div className="mt-5 space-y-5">
        <Section title="保守版项目经历">
          <ResultList items={result.conservativeVersion} />
        </Section>
        <Section title="岗位强化版项目经历">
          <ResultList items={result.enhancedVersion} />
        </Section>
        <Section title="5 个面试追问">
          <ol className="list-decimal space-y-2 pl-5">
            {result.interviewQuestions.map((item) => (
              <li key={item.question}>
                <p className="font-semibold text-ink">{item.question}</p>
                <p className="mt-1 text-slate-600">回答思路：{item.answerGuide}</p>
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

      <div className="mt-6 rounded-md border border-mint/30 bg-[#f4fbf9] p-4">
        <p className="text-sm leading-6 text-ink">
          如果结果不够具体，可以返回表单补充更多细节，例如具体负责的模块、使用的工具、项目成果和遇到的问题。
        </p>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-ink">
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
    <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-ink">本次生成质量参考</h3>
      <p className="mt-2 text-sm text-slate-700">
        信息完整度：
        <span className="font-semibold text-mint">
          {getCompletenessLabel(analysis.completenessLevel)}
        </span>
      </p>
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
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-600">{emptyText}</p>
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
    <form onSubmit={onSubmit} className="mt-6 border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold text-ink">这个结果对你有帮助吗？</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {feedbackOptions.map((option) => {
          const isSelected = rating === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onRatingChange(option)}
              className={`h-10 rounded-md border px-4 text-sm font-semibold transition ${
                isSelected
                  ? "border-mint bg-mint text-white"
                  : "border-slate-300 text-ink hover:border-mint hover:text-mint"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">你觉得哪里还不够好？</span>
        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="例如：希望项目经历更量化、面试问题更贴近岗位、表达更像我自己的语气"
          rows={3}
          className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-mint focus:ring-2 focus:ring-mint/20"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint sm:w-auto"
        >
          提交反馈
        </button>
        <button
          type="button"
          onClick={onCopyFeedbackPackage}
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint sm:w-auto"
        >
          {feedbackCopied ? "已复制反馈包" : "复制反馈包"}
        </button>
        {submitted ? <p className="text-sm font-semibold text-mint">感谢反馈</p> : null}
      </div>
      {error ? <p className="mt-3 text-sm text-slate-500">{error}</p> : null}
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
    <section className="border-t border-slate-200 pt-4">
      <h3 className="mb-2 text-sm font-semibold text-mint">{title}</h3>
      <div className="text-sm leading-7 text-slate-700">{children}</div>
    </section>
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
