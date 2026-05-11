import Link from "next/link";

const valueCards = [
  {
    title: "经历挖掘",
    body: "把零散的课程项目、社团实践和实习经历整理成可证明的简历表达。",
  },
  {
    title: "岗位定制",
    body: "结合目标岗位 JD，突出相关能力，但不替你编造没有发生过的经历。",
  },
  {
    title: "面试准备",
    body: "生成可能追问和回答思路，帮助你提前想清楚项目细节和证据。",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7FAF8] text-[#1F2933]">
      <section className="mx-auto flex min-h-screen max-w-[1120px] flex-col justify-center px-5 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_60px_rgba(31,41,51,0.08)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#16876F]">
              Career Material Assistant
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-normal text-[#1F2933] sm:text-5xl">
              把课程项目整理成能投递的简历项目经历
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#64748B] sm:text-lg">
              面向大学生求职场景，帮你把项目背景、个人贡献、工具方法和成果沉淀成更清晰的简历表达、面试追问和修改建议。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/form"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2FBF9B] px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,191,155,0.28)] transition hover:bg-[#16876F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16876F]"
              >
                开始整理项目经历
              </Link>
              <a
                href="#values"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-7 text-sm font-semibold text-[#1F2933] transition hover:border-[#2FBF9B] hover:text-[#16876F]"
              >
                了解能做什么
              </a>
            </div>

            <p className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F7FAF8] px-4 py-3 text-sm leading-6 text-[#64748B]">
              不虚构经历，生成内容需本人确认。最终简历请以真实经历和可解释证据为准。
            </p>
          </div>
        </div>

        <div id="values" className="mt-6 grid gap-4 sm:grid-cols-3">
          {valueCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_36px_rgba(31,41,51,0.06)]"
            >
              <span className="inline-flex rounded-full bg-[#E8F8F3] px-3 py-1 text-xs font-bold text-[#16876F]">
                {card.title}
              </span>
              <p className="mt-4 text-sm leading-7 text-[#64748B]">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
