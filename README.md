# 大学生求职材料整理助手

一个基于 Next.js、React、Tailwind CSS 和 TypeScript 的 MVP Web 应用，用于帮助大学生整理项目经历、面试追问和简历真实性风险提示。

## 功能

- 首页展示产品介绍和开始按钮
- 表单页收集学校、专业、目标岗位、项目经历和岗位 JD
- 调用 `/api/generate` 后端接口
- 当前接口使用 mock 数据返回生成结果
- 结果页支持一键复制

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 后续接入 OpenAI API

后续可以替换 `app/api/generate/route.ts` 中的 mock 逻辑，在该 API Route 中读取环境变量中的 OpenAI API Key，并调用模型生成结构化 JSON 结果。前端已经通过 `GenerateResult` 类型约束结果结构。
