"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeedbackRating, GenerateResult, ResultFeedback } from "@/lib/types";

type ResultPanelProps = {
  result: GenerateResult | null;
};

const feedbackOptions: FeedbackRating[] = ["有帮助", "一般", "没帮助"];
const feedbackStorageKey = "career-material-feedback";

export default function ResultPanel({ result }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | "">("");
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
    setRating("");
    setComment("");
    setFeedbackSubmitted(false);
  }, [result]);

  async function handleCopy() {
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleFeedbackSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const feedback: ResultFeedback = {
      rating: rating || "一般",
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
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

      <FeedbackForm
        rating={rating}
        comment={comment}
        submitted={feedbackSubmitted}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onSubmit={handleFeedbackSubmit}
      />
    </aside>
  );
}

function FeedbackForm({
  rating,
  comment,
  submitted,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: {
  rating: FeedbackRating | "";
  comment: string;
  submitted: boolean;
  onRatingChange: (rating: FeedbackRating) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
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
        {submitted ? <p className="text-sm font-semibold text-mint">感谢反馈</p> : null}
      </div>
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

function ResultList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
