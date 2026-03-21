<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';

interface Props {
  modelValue: string;
  disabled: boolean;
  canSend: boolean;
  isGenerating?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'send'): void;
  (e: 'abort'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
});
const emit = defineEmits<Emits>();

const textarea = ref<HTMLTextAreaElement | null>(null);
const isAbortMode = ref(props.isGenerating);

// 自动调整高度
function adjustHeight() {
  if (!textarea.value) return;
  textarea.value.style.height = '24px';
  const scrollHeight = textarea.value.scrollHeight;
  const newHeight = Math.min(Math.max(scrollHeight, 24), 200);
  textarea.value.style.height = `${newHeight}px`;
}

// 监听输入变化
watch(() => props.modelValue, () => {
  nextTick(adjustHeight);
});

// 监听生成状态
watch(() => props.isGenerating, (generating) => {
  isAbortMode.value = generating;
  if (generating) {
    adjustHeight();
  }
});

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (isAbortMode.value) {
      emit('abort');
    } else if (props.canSend) {
      emit('send');
    }
  }
}

// 发送或中止
function handleClick() {
  if (isAbortMode.value) {
    emit('abort');
  } else if (props.canSend) {
    emit('send');
  }
}

// 聚焦输入框
function focus() {
  textarea.value?.focus();
}

// 组件挂载后调整高度
onMounted(() => {
  adjustHeight();
});

// 暴露方法
defineExpose({
  focus,
});
</script>

<template>
  <div class="input-area">
    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          ref="textarea"
          :value="modelValue"
          :disabled="disabled"
          :placeholder="disabled ? 'Generating...' : 'Send a message... (Shift+Enter for new line)'"
          class="input-textarea"
          rows="1"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          @keydown="handleKeydown"
        />

        <!-- 发送/中止按钮 -->
        <button
          :class="['send-button', { 'send-button--abort': isAbortMode }]"
          :disabled="!canSend && !isAbortMode"
          @click="handleClick"
          :aria-label="isAbortMode ? 'Stop generating' : 'Send message'"
          :title="isAbortMode ? 'Stop generating (Enter)' : 'Send message (Enter)'"
        >
          <svg v-if="isAbortMode" class="icon abort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <svg v-else class="icon send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <!-- 提示文字 -->
      <div class="input-hint">
        <span v-if="isGenerating">Press Enter to stop generation</span>
        <span v-else>Shift + Enter for new line</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
  flex-shrink: 0;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.input-container {
  max-width: var(--input-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
}

.input-textarea {
  flex: 1;
  min-height: 24px;
  max-height: 200px;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: var(--font-family-base);
}

.input-textarea::placeholder {
  color: var(--text-tertiary);
}

.input-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-md);
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  border: none;
  padding: 0;
}

.send-button:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
  transition-duration: 50ms;
}

.send-button:active:not(:disabled) {
  transform: scale(0.98);
}

.send-button:disabled {
  background-color: var(--accent-disabled);
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

.send-button--abort {
  background-color: var(--color-error);
}

.send-button--abort:hover:not(:disabled) {
  background-color: #dc2626;
}

.icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.input-hint {
  margin-top: var(--spacing-sm);
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .input-container {
    padding: 0 var(--spacing-lg);
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .input-area {
    padding: var(--spacing-md) 0;
  }

  .input-container {
    padding: 0 var(--spacing-md);
  }

  .input-wrapper {
    padding: var(--spacing-sm);
  }

  .send-button {
    width: 32px;
    height: 32px;
  }

  .icon {
    width: 16px;
    height: 16px;
  }

  .input-textarea {
    font-size: var(--font-size-sm);
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .input-area {
    padding: var(--spacing-sm) 0;
  }

  .input-container {
    padding: 0 var(--spacing-sm);
  }

  .input-wrapper {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .input-textarea {
    font-size: var(--font-size-sm);
    min-height: 20px;
  }

  .send-button {
    width: 28px;
    height: 28px;
  }

  .icon {
    width: 14px;
    height: 14px;
  }

  .input-hint {
    font-size: 0.65rem;
  }
}

/* ===== 横屏模式优化 ===== */
@media screen and (max-height: 500px) and (orientation: landscape) {
  .input-area {
    padding: var(--spacing-sm) 0;
  }

  .input-hint {
    display: none;
  }
}
</style>
