# 大学生求职材料整理助手

一个基于 Next.js 16、React、TypeScript 和 Tailwind CSS 的求职材料整理 Web 应用，帮助大学生把课程项目、竞赛项目和实践经历整理成更适合简历投递与面试准备的材料。

当前版本：V0.3.1 试用版。

## 当前进度

- 首页 `/`：产品化 hero、价值说明、试用版提示和明显 CTA。
- 表单页 `/form`：分区表单、必填校验、示例填充、输入完整度检测、生成 loading、隐私与真实性提示。
- 生成接口 `/api/generate`：支持 DeepSeek/OpenAI-compatible API，失败或无 key 时 fallback 到 mock。
- 结果展示：推荐简历版本、保守版、岗位强化版、面试追问、风险提示、下一步建议、复制全部、复制推荐版本、重新生成、返回修改、反馈收集。
- 历史记录 `/history`：保存每次成功生成的表单、结果、生成时间、生成来源和输入完整度，支持查看、删除、复制和继续修改。
- 试用数据闭环：本地记录试用事件，历史页支持复制试用数据包，方便收集真实同学试用情况。

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

如果需要把用户反馈或试用事件同步到外部工具，可以配置：

```bash
FEEDBACK_WEBHOOK_URL=https://your-webhook-url
```

## 常用脚本

```bash
npm run dev
npm run build
npm run start
```

## 试用注意

本工具仍在测试阶段，生成内容仅供简历初稿参考。AI 可以优化表达，但不应替用户虚构经历；最终简历请根据真实经历修改后使用。
