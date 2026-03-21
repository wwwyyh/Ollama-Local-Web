<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import yaml from 'highlight.js/lib/languages/yaml';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('php', php);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);

// 引入样式
import 'highlight.js/styles/github-dark.css';

import type { Message } from '@/types';

interface Props {
  message: Message;
  isTyping?: boolean;
}

const props = defineProps<Props>();

// 自定义渲染器 - 为代码块添加包装器
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }: { text: string | { text: string; lang: string }; lang?: string }) {
  // 处理旧版本 marked 兼容性
  let codeText: string;
  let language: string;

  if (typeof text === 'object' && text !== null) {
    // 旧版本格式: text 就是 { text, lang } 对象
    codeText = text.text || '';
    language = text.lang || 'code';
  } else {
    // 新版本格式
    codeText = String(text || '');
    language = lang || 'code';
  }

  // 确保 code 是字符串类型，处理空代码块或边缘情况
  const codeString = typeof codeText === 'string' ? codeText : String(codeText || '');
  const langClass = language || 'code';

  // 如果代码内容为空，返回空代码块
  if (!codeString.trim()) {
    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">${langClass}</span>
        </div>
        <pre><code class="hljs language-${langClass}"></code></pre>
      </div>
    `;
  }

  const highlighted = hljs.getLanguage(langClass)
    ? hljs.highlight(codeString, { language: langClass }).value
    : hljs.highlightAuto(codeString).value;

  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-language">${langClass}</span>
        <button class="copy-button" data-code="${encodeURIComponent(codeString)}">Copy</button>
      </div>
      <pre><code class="hljs language-${langClass}">${highlighted}</code></pre>
    </div>
  `;
};

// 配置 marked
marked.setOptions({
  renderer: renderer,
  breaks: true,
  gfm: true,
});

const renderedContent = computed(() => {
  if (props.message.role !== 'assistant') {
    return props.message.content;
  }

  // 使用 DOMPurify 清理 HTML
  const rawHtml = marked(props.message.content) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'code', 'pre', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'button'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'data-code'],
    ALLOW_DATA_ATTR: true,
  });
});

const isUser = computed(() => props.message.role === 'user');

// 复制代码
async function copyCode(encodedCode: string, button: HTMLButtonElement) {
  try {
    const code = decodeURIComponent(encodedCode);
    await navigator.clipboard.writeText(code);
    button.textContent = 'Copied!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    button.textContent = 'Failed';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  }
}

// 处理点击事件
function handleClick(event: Event) {
  const target = event.target as HTMLElement;
  if (target.classList.contains('copy-button')) {
    const encodedCode = target.getAttribute('data-code');
    if (encodedCode) {
      copyCode(encodedCode, target as HTMLButtonElement);
    }
  }
}
</script>

<template>
  <div :class="['message-item', `message-item--${message.role}`]">
    <div class="message-content">
      <!-- 用户消息 -->
      <div v-if="isUser" class="user-message">
        {{ message.content }}
      </div>

      <!-- AI 消息 (Markdown) -->
      <div
        v-else
        class="ai-message markdown-body"
        v-html="renderedContent"
        @click="handleClick"
      />

      <!-- 打字光标 -->
      <span v-if="isTyping && !isUser" class="typing-cursor"></span>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  width: 100%;
  animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-item--user {
  animation: userMessageIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-item--assistant {
  animation: aiMessageIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  60% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 用户消息动画 */
@keyframes userMessageIn {
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
  }
  50% {
    transform: translateX(-10px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* AI 消息动画 */
@keyframes aiMessageIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-item--user {
  justify-content: flex-end;
}

.message-item--assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  position: relative;
}

.message-item--user .message-content {
  justify-content: flex-end;
}

.message-item--assistant .message-content {
  justify-content: flex-start;
}

.user-message {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: var(--shadow-sm);
}

.ai-message {
  background-color: transparent;
  color: var(--text-primary);
  width: auto;
  max-width: 100%;
  padding: 0;
  text-align: left;
}

.markdown-body {
  line-height: var(--line-height-relaxed);
}

/* Markdown 样式 - 标题 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.markdown-body :deep(h1) {
  font-size: var(--font-size-2xl);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
  margin-top: var(--spacing-xl);
}

.markdown-body :deep(h2) {
  font-size: var(--font-size-xl);
}

.markdown-body :deep(h3) {
  font-size: var(--font-size-lg);
}

.markdown-body :deep(p) {
  margin-bottom: var(--spacing-md);
}

.markdown-body :deep(p:first-child) {
  margin-top: 0;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

/* 行内代码 */
.markdown-body :deep(code) {
  background-color: var(--bg-code-block);
  padding: 3px 8px;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: 0.9em;
  color: var(--text-code);
  border: 1px solid var(--border-color);
}

/* 代码块 - 使用自定义包装器 */
.markdown-body :deep(.code-block-wrapper) {
  background-color: var(--bg-code-block);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  margin: var(--spacing-md) 0;
  border: 1px solid var(--border-color);
}

.markdown-body :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-color);
}

.markdown-body :deep(.code-language) {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
}

.markdown-body :deep(.copy-button) {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.markdown-body :deep(.copy-button:hover) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.markdown-body :deep(.copy-button:active) {
  transform: translateY(0);
}

.markdown-body :deep(.copy-button.copied) {
  background-color: var(--color-success);
}

/* pre 和 code 在包装器内 */
.markdown-body :deep(.code-block-wrapper pre) {
  background-color: transparent;
  padding: 0;
  border: none;
  margin: 0;
}

.markdown-body :deep(.code-block-wrapper pre code) {
  background: none;
  padding: var(--spacing-md);
  display: block;
  color: inherit;
  border: none;
  overflow-x: auto;
}

/* 列表 */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-left: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-md);
}

.markdown-body :deep(li) {
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-normal);
}

.markdown-body :deep(li::marker) {
  color: var(--accent-color);
}

/* 链接 */
.markdown-body :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.markdown-body :deep(a:hover) {
  color: var(--accent-hover);
  border-bottom-color: var(--accent-hover);
}

/* 引用 */
.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--accent-color);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--text-secondary);
  font-style: italic;
  background-color: var(--bg-hover);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

/* 表格 */
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing-md) 0;
  overflow-x: auto;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: var(--bg-hover);
  font-weight: var(--font-weight-semibold);
}

.markdown-body :deep(tr:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

.markdown-body :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 分隔线 */
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--spacing-xl) 0;
}

/* 打字光标 */
.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  background-color: var(--text-primary);
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
  border-radius: 1px;
}

@keyframes blink {
  0%, 45% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .message-content {
    max-width: 85%;
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .message-content {
    max-width: 90%;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .markdown-body :deep(h1) {
    font-size: var(--font-size-xl);
  }

  .markdown-body :deep(h2) {
    font-size: var(--font-size-lg);
  }

  .markdown-body :deep(h3) {
    font-size: var(--font-size-md);
  }

  .markdown-body :deep(ul),
  .markdown-body :deep(ol) {
    margin-left: var(--spacing-md);
    padding-left: var(--spacing-sm);
  }

  .markdown-body :deep(.code-block-wrapper) {
    margin-left: calc(-1 * var(--spacing-sm));
    margin-right: calc(-1 * var(--spacing-sm));
    border-radius: var(--border-radius-sm);
    border-left: none;
    border-right: none;
  }

  .markdown-body :deep(.code-block-wrapper pre code) {
    padding: var(--spacing-sm);
    font-size: 0.85em;
  }

  .typing-cursor {
    width: 6px;
    height: 16px;
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .message-content {
    max-width: 95%;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .markdown-body :deep(h1) {
    font-size: var(--font-size-lg);
    border-bottom: none;
    padding-bottom: 0;
  }

  .markdown-body :deep(h2) {
    font-size: var(--font-size-md);
  }

  .markdown-body :deep(h3) {
    font-size: var(--font-size-sm);
  }

  .markdown-body :deep(p) {
    margin-bottom: var(--spacing-sm);
  }

  .markdown-body :deep(ul),
  .markdown-body :deep(ol) {
    margin-left: var(--spacing-sm);
  }

  .markdown-body :deep(.code-block-wrapper) {
    margin-left: calc(-1 * var(--spacing-xs));
    margin-right: calc(-1 * var(--spacing-xs));
  }

  .markdown-body :deep(.code-block-header) {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .markdown-body :deep(.copy-button) {
    padding: 2px 8px;
    font-size: 0.7rem;
  }

  .markdown-body :deep(.code-block-wrapper pre code) {
    padding: var(--spacing-xs);
    font-size: 0.8em;
  }

  .markdown-body :deep(code) {
    padding: 2px 5px;
    font-size: 0.85em;
  }

  .markdown-body :deep(th),
  .markdown-body :deep(td) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .typing-cursor {
    width: 5px;
    height: 14px;
  }
}

</style>
