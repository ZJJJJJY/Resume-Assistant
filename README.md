# 大学生求职材料整理助手

一个基于 Next.js、React、Tailwind CSS 和 TypeScript 的求职材料整理 Web 应用，用于帮助大学生整理项目经历、面试追问和简历真实性风险提示。

## 功能

- 首页展示产品介绍和开始按钮
- 表单页收集学校、专业、目标岗位、项目经历和岗位 JD，并支持必填校验
- 支持填入示例项目、输入完整度检测、生成 loading 状态和结果反馈
- 调用 `/api/generate` 后端接口生成结构化求职材料
- 配置 DeepSeek 或 OpenAI-compatible API 后使用真实 AI 生成；未配置时自动使用 mock fallback
- 结果页支持复制全部结果、重新生成、质量参考和反馈包复制

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 配置真实 AI 生成

复制 `.env.example` 为 `.env.local`，并填入 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-pro
AI_MAX_TOKENS=4096
```

未配置 API Key 时，应用仍会使用本地 mock 逻辑返回可试用结果。

如果需要把用户反馈同步到外部工具，可以配置：

```bash
FEEDBACK_WEBHOOK_URL=https://your-webhook-url
```
