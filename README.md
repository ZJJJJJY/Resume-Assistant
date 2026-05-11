# 大学生求职材料整理助手

一个基于 Next.js、React、Tailwind CSS 和 TypeScript 的求职材料整理 Web 应用，用于帮助大学生整理项目经历、面试追问和简历真实性风险提示。

## 功能

- 首页展示产品介绍和开始按钮
- 表单页收集学校、专业、目标岗位、项目经历和岗位 JD，并支持必填校验
- 支持填入示例项目、生成 loading 状态和结果反馈
- 调用 `/api/generate` 后端接口生成结构化求职材料
- 配置 `OPENAI_API_KEY` 后使用真实 AI 生成；未配置时自动使用 mock fallback
- 结果页支持一键复制

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 配置真实 AI 生成

复制 `.env.example` 为 `.env.local`，并填入 OpenAI API Key：

```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

未配置 `OPENAI_API_KEY` 时，应用仍会使用本地 mock 逻辑返回可试用结果。
