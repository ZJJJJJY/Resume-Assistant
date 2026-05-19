"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appVersion, feedbackStorageKey } from "@/lib/constants";
import {
  deleteTrialHistoryItem,
  readTrialHistory,
  saveLatestForm,
} from "@/lib/trialHistory";
import { readTrialEvents, recordTrialEvent } from "@/lib/trialEvents";
import type { ResultFeedback, TrialEvent, TrialHistoryItem } from "@/lib/types";

const completenessLabels = {
  high: "高",
  medium: "中",
  low: "低",
} satisfies Record<TrialHistoryItem["completenessLevel"], string>;

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function buildCopyText(item: TrialHistoryItem) {
  const { result } = item;

  return [
    "推荐放入简历的项目经历",
    ...(result.recommendedResumeVersion || result.enhancedVersion).map(
      (content, index) => `${index + 1}. ${content}`,
    ),
    "",
    "保守版项目经历",
    ...result.conservativeVersion.map((content, index) => `${index + 1}. ${content}`),
    "",
    "岗位强化版项目经历",
    ...result.enhancedVersion.map((content, index) => `${index + 1}. ${content}`),
    "",
    "面试追问",
    ...result.interviewQuestions.map(
      (question, index) => `${index + 1}. ${question.question}\n回答思路：${question.answerGuide}`,
    ),
    "",
    "简历真实性风险提示",
    ...result.riskWarnings.map((content, index) => `${index + 1}. ${content}`),
    "",
    "下一步修改建议",
    ...result.suggestions.map((content, index) => `${index + 1}. ${content}`),
  ].join("\n");
}

function readSavedFeedback() {
  const storedFeedback = window.localStorage.getItem(feedbackStorageKey);
  if (!storedFeedback) return [];

  try {
    return JSON.parse(storedFeedback) as ResultFeedback[];
  } catch {
    return [];
  }
}

function countBy<T extends string>(values: T[]) {
  return values.reduce(
    (summary, value) => ({
      ...summary,
      [value]: (summary[value] || 0) + 1,
    }),
    {} as Record<T, number>,
  );
}

function buildTrialDataPackage(items: TrialHistoryItem[], events: TrialEvent[]) {
  const feedback = readSavedFeedback();
  const sourceSummary = countBy(items.map((item) => item.source));
  const completenessSummary = countBy(items.map((item) => item.completenessLevel));
  const eventSummary = countBy(events.map((event) => event.eventName));

  return [
    "求职材料生成助手试用数据包",
    `当前版本：${appVersion}`,
    `导出时间：${new Date().toLocaleString("zh-CN")}`,
    "",
    "概览",
    `历史记录数：${items.length}`,
    `反馈条数：${feedback.length}`,
    `试用事件数：${events.length}`,
    `生成来源统计：AI ${sourceSummary.ai || 0} 次 / Mock ${sourceSummary.mock || 0} 次`,
    `完整度统计：高 ${completenessSummary.high || 0} 次 / 中 ${completenessSummary.medium || 0} 次 / 低 ${completenessSummary.low || 0} 次`,
    "",
    "事件统计",
    ...Object.entries(eventSummary).map(([eventName, count]) => `${eventName}：${count}`),
    "",
    "最近历史记录",
    ...items.slice(0, 10).map((item, index) =>
      [
        `${index + 1}. ${item.formData.projectName || "未命名项目"}`,
        `目标岗位：${item.formData.targetRole || "未填写"}`,
        `项目类型：${item.formData.projectType || "未填写"}`,
        `生成时间：${formatDate(item.createdAt)}`,
        `来源：${item.source}`,
        `完整度：${item.completenessLevel}`,
      ].join("\n"),
    ),
    "",
    "最近反馈",
    ...feedback.slice(-10).map((item, index) =>
      [
        `${index + 1}. ${item.rating}`,
        `项目：${item.projectName || "未填写"}`,
        `目标岗位：${item.targetRole || "未填写"}`,
        `反馈：${item.comment || "未填写"}`,
        `时间：${formatDate(item.createdAt)}`,
      ].join("\n"),
    ),
  ].join("\n");
}

export default function HistoryPage() {
  const [items, setItems] = useState<TrialHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [trialDataCopied, setTrialDataCopied] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  useEffect(() => {
    setItems(readTrialHistory());
  }, []);

  function deleteItem(id: string) {
    deleteTrialHistoryItem(id);
    const nextItems = readTrialHistory();
    setItems(nextItems);
    if (selectedId === id) {
      setSelectedId("");
    }
  }

  async function copyItem(item: TrialHistoryItem) {
    await navigator.clipboard.writeText(buildCopyText(item));
    setCopiedId(item.id);
    recordTrialEvent({
      eventName: "copy_all_clicked",
      targetRole: item.formData.targetRole,
      projectType: item.formData.projectType,
      source: item.source,
      completenessLevel: item.completenessLevel,
    });
    window.setTimeout(() => setCopiedId(""), 1600);
  }

  function continueEditing(item: TrialHistoryItem) {
    saveLatestForm(item.formData);
    window.location.href = "/form?fromHistory=1";
  }

  async function copyTrialDataPackage() {
    await navigator.clipboard.writeText(buildTrialDataPackage(items, readTrialEvents()));
    setTrialDataCopied(true);
    window.setTimeout(() => setTrialDataCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-4 py-8 text-[#1F2933]">
      <div className="mx-auto max-w-[1120px]">
        <header className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_42px_rgba(31,41,51,0.06)] md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/form" className="text-sm font-semibold text-[#16876F] hover:text-[#1F2933]">
                返回表单
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  Trial History
                </p>
                <span className="rounded-full bg-[#E8F8F3] px-3 py-1 text-xs font-bold text-[#16876F]">
                  {appVersion} 试用版
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-[#1F2933]">历史记录</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
                查看每次生成的表单、结果和来源，适合对比不同版本，也方便继续修改。
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={copyTrialDataPackage}
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-2xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
              >
                {trialDataCopied ? "已复制试用数据包" : "复制试用数据包"}
              </button>
              <Link
                href="/form"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-2xl bg-[#2FBF9B] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,191,155,0.24)] transition hover:bg-[#16876F]"
              >
                新建一次生成
              </Link>
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed border-[#2FBF9B]/35 bg-white p-8 text-center shadow-[0_12px_34px_rgba(31,41,51,0.05)]">
            <h2 className="text-xl font-bold text-[#1F2933]">还没有历史记录</h2>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              生成一次求职材料后，历史记录会自动保存在这里。
            </p>
            <Link
              href="/form"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#2FBF9B] px-5 text-sm font-bold text-white transition hover:bg-[#16876F]"
            >
              去填写项目
            </Link>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_34px_rgba(31,41,51,0.05)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#1F2933]">
                        {item.formData.projectName || "未命名项目"}
                      </h2>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {item.formData.targetRole || "未填写目标岗位"} / {item.formData.projectType || "未填写项目类型"}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        item.source === "ai"
                          ? "bg-[#E8F8F3] text-[#059669]"
                          : "bg-[#FFF7ED] text-[#D97706]"
                      }`}
                    >
                      {item.source === "ai" ? "AI" : "Mock"}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-[#1F2933]">生成时间</dt>
                      <dd>{formatDate(item.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#1F2933]">信息完整度</dt>
                      <dd>{completenessLabels[item.completenessLevel]}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="h-10 rounded-2xl bg-[#2FBF9B] px-4 text-sm font-semibold text-white transition hover:bg-[#16876F]"
                    >
                      查看详情
                    </button>
                    <button
                      type="button"
                      onClick={() => copyItem(item)}
                      className="h-10 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
                    >
                      {copiedId === item.id ? "已复制" : "复制全部结果"}
                    </button>
                    <button
                      type="button"
                      onClick={() => continueEditing(item)}
                      className="h-10 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
                    >
                      返回表单修改
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="h-10 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 text-sm font-semibold text-[#D97706] transition hover:bg-white"
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_34px_rgba(31,41,51,0.05)] lg:sticky lg:top-6">
              {selectedItem ? (
                <HistoryDetail item={selectedItem} />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F7FAF8] p-6">
                  <h2 className="text-lg font-bold text-[#1F2933]">选择一条记录查看详情</h2>
                  <p className="mt-3 text-sm leading-6 text-[#64748B]">
                    详情会展示本次生成的简历表达、面试追问、风险提示和修改建议。
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function HistoryDetail({ item }: { item: TrialHistoryItem }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Detail</p>
      <h2 className="mt-2 text-xl font-bold text-[#1F2933]">{item.formData.projectName}</h2>
      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        {item.formData.targetRole} / {formatDate(item.createdAt)}
      </p>
      <div className="mt-5 space-y-4">
        <DetailSection
          title="推荐放入简历的项目经历"
          items={item.result.recommendedResumeVersion || item.result.enhancedVersion}
        />
        <DetailSection title="保守版项目经历" items={item.result.conservativeVersion} />
        <DetailSection title="岗位强化版项目经历" items={item.result.enhancedVersion} />
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="text-sm font-bold text-[#16876F]">面试追问</h3>
          <ol className="mt-3 space-y-3">
            {item.result.interviewQuestions.map((question, index) => (
              <li key={question.question} className="rounded-2xl bg-[#F7FAF8] p-3 text-sm leading-6">
                <p className="font-semibold text-[#1F2933]">
                  {index + 1}. {question.question}
                </p>
                <p className="mt-1 text-[#64748B]">回答思路：{question.answerGuide}</p>
              </li>
            ))}
          </ol>
        </section>
        <DetailSection title="简历真实性风险提示" items={item.result.riskWarnings} />
        <DetailSection title="下一步修改建议" items={item.result.suggestions} />
      </div>
    </div>
  );
}

function DetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="text-sm font-bold text-[#16876F]">{title}</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#64748B]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
