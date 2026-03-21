<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import type { Message } from '@/types';
import MessageItem from './MessageItem.vue';

interface Props {
  messages: Message[];
  isGenerating: boolean;
  currentResponse: string;
}

const props = defineProps<Props>();

const chatContainer = ref<HTMLElement | null>(null);
const showScrollButton = ref(false);

// 自动滚动到底部
async function scrollToBottom(smooth = true) {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }
}

// 监听消息变化，自动滚动
watch(
  () => props.messages,
  () => scrollToBottom(),
  { deep: true }
);

// 监听生成状态变化
watch(
  () => props.currentResponse,
  () => scrollToBottom(true),
  { deep: true }
);

// 检测滚动位置
function handleScroll() {
  if (!chatContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;
  showScrollButton.value = distanceToBottom > 200;
}

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom(false);
});
</script>

<template>
  <div
    ref="chatContainer"
    class="chat-area"
    @scroll="handleScroll"
  >
    <div class="chat-container">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-logo">O</div>
        <h2>Welcome to Ollama Local Web</h2>
        <p>Your local AI assistant powered by Ollama</p>
      </div>

      <!-- 消息列表 -->
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-typing="isGenerating && message === messages[messages.length - 1]"
      />

      <!-- 生成中占位消息 -->
      <div v-if="isGenerating && messages.length === 0" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <button
      v-if="showScrollButton && messages.length > 0"
      class="scroll-to-bottom"
      @click="scrollToBottom(true)"
      aria-label="Scroll to bottom"
    >
      ↓
    </button>
  </div>
</template>

<style scoped>
.chat-area {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.chat-container {
  max-width: var(--message-max-width);
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.welcome-message {
  text-align: center;
  margin-top: 15vh;
  color: var(--text-secondary);
  animation: fadeIn 0.5s ease-in;
}

.welcome-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 auto var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.welcome-message h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.welcome-message p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.typing-indicator {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  justify-content: flex-start;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-to-bottom {
  position: absolute;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 40px;
  height: 40px;
  background-color: var(--bg-header);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-to-bottom:hover {
  background-color: var(--bg-hover);
  transform: scale(1.1) translateY(-2px);
  box-shadow: var(--shadow-lg), 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-to-bottom:active {
  transform: scale(0.95);
  transition-duration: 50ms;
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .chat-container {
    padding: var(--spacing-lg);
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .chat-container {
    padding: var(--spacing-md);
  }

  .welcome-logo {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-2xl);
  }

  .welcome-message h2 {
    font-size: var(--font-size-xl);
  }

  .welcome-message p {
    font-size: var(--font-size-sm);
  }

  .scroll-to-bottom {
    width: 36px;
    height: 36px;
    bottom: var(--spacing-md);
    right: var(--spacing-md);
    font-size: var(--font-size-md);
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .chat-container {
    padding: var(--spacing-sm);
  }

  .welcome-logo {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-xl);
  }

  .welcome-message h2 {
    font-size: var(--font-size-lg);
  }

  .welcome-message p {
    font-size: var(--font-size-xs);
  }

  .scroll-to-bottom {
    width: 32px;
    height: 32px;
    bottom: var(--spacing-sm);
    right: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}

/* ===== 横屏模式优化 ===== */
@media screen and (max-height: 500px) and (orientation: landscape) {
  .welcome-message {
    margin-top: 5vh;
  }

  .welcome-logo {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-xl);
  }

  .welcome-message h2 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  .welcome-message p {
    font-size: var(--font-size-sm);
  }
}
</style>
