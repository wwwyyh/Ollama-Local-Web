# Ollama Local Web

**This project were fully  developed by AI(GLM4.7/5.0).**
一个类似 ChatGPT 的 Web 界面，为本地 [Ollama](https://ollama.ai/) 大语言模型提供友好的交互体验。

## 功能特性

- **基本对话** - 支持 Enter 发送、Shift+Enter 换行的多行文本输入
- **多模型切换** - 支持切换 Ollama 中已加载的不同模型，切换时保留对话历史
- **流式输出** - 使用 SSE (Server-Sent Events) 实现逐字显示，支持中断生成
- **Markdown 渲染** - 支持 Markdown 格式渲染，包括代码块
- **代码高亮** - 使用 highlight.js 对代码块进行语法高亮，支持一键复制
- **主题切换** - 支持深色/浅色主题切换
- **响应式设计** - 完美适配桌面、平板和移动端
- **丰富动画** - 消息滑入、按钮交互、打字效果等动画
- **请求超时** - 自动处理网络超时 (获取模型 10 秒、对话 30 秒)

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.5.0 | 渐进式 JavaScript 框架 (Composition API) |
| Vite | ^7.0.0 | 下一代前端构建工具 |
| TypeScript | ~5.9.0 | 类型安全的 JavaScript 超集 |
| marked | ^15.0.0 | Markdown 解析器 |
| highlight.js | ^11.0.0 | 代码语法高亮 |
| DOMPurify | ^3.0.0 | HTML 净化，防止 XSS 攻击 |

## 环境要求

- **Node.js**: >= 18.0.0
- **Ollama**: 已安装并运行于 `localhost:11434`

## 快速开始

### 1. 启动 Ollama

```bash
OLLAMA_ORIGINS="*" ollama serve
```

### 2. 安装依赖

```bash
cd front
npm install
```

### 3. 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 生产构建

```bash
npm run build
npm run preview
```

## Ollama API 集成

| 功能 | 端点 | 方法 |
|------|------|------|
| 获取模型列表 | `/api/tags` | GET |
| 发送对话（流式） | `/api/chat` | POST |

开发环境通过 Vite 代理转发请求到 Ollama，无需额外配置 CORS。


## 浏览器兼容性

- Chrome 103+
- Firefox 100+
- Safari 16+

> 注: `AbortSignal.timeout()` 在较旧浏览器中不支持


## 许可证

MIT
