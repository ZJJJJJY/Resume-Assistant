import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-mint">
            Career Material Assistant
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            大学生求职材料整理助手
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            把零散的项目经历、岗位 JD 和个人背景整理成可用于简历、面试准备的表达材料。第一版先帮你生成两种项目经历写法、面试追问和真实性风险提示。
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/form"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#17202a] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f3b47] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4FB3A3]"
            >
              开始整理
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 px-6 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint"
            >
              了解功能
            </a>
          </div>
        </div>

        <div
          id="features"
          className="mt-16 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3"
        >
          {[
            ["简历表达", "生成保守版和岗位强化版项目经历。"],
            ["面试准备", "根据项目和岗位生成 5 个可能追问。"],
            ["真实可信", "提示可能夸大或表述不清的风险点。"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-md border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
