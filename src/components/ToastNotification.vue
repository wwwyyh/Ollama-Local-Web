<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface Props {
  message: string | null;
  type?: 'error' | 'warning';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
});

const visible = ref(false);
const animationClass = ref('');

// 监听消息变化
watch(() => props.message, async (newMessage) => {
  if (newMessage) {
    visible.value = true;
    animationClass.value = 'slide-in';
    await nextTick();

    // 5秒后自动隐藏
    setTimeout(() => {
      hide();
    }, 5000);
  }
});

function hide() {
  animationClass.value = 'slide-out';
  setTimeout(() => {
    visible.value = false;
  }, 300);
}
</script>

<template>
  <Transition name="notification">
    <div v-if="visible" :class="['notification', `notification--${type}`, animationClass]">
      <div class="notification-content">
        <!-- 图标 -->
        <span class="notification-icon">
          <svg v-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </span>

        <!-- 消息 -->
        <span class="notification-message">{{ message }}</span>

        <!-- 关闭按钮 -->
        <button class="notification-close" @click="hide" aria-label="Close notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  position: fixed;
  top: var(--header-height);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
  max-width: 90vw;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-xl);
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.notification--error {
  background-color: rgba(239, 68, 68, 0.95);
  color: white;
}

.notification--error.slide-in {
  animation: shakeError 0.5s ease-out forwards;
}

@keyframes shakeError {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-50%) translateY(0) translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(-50%) translateY(0) translateX(5px);
  }
}

.notification--warning {
  background-color: rgba(245, 158, 11, 0.95);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.notification-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.notification-message {
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
}

.notification-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  opacity: 1;
}

/* 动画 */
.slide-in {
  animation-name: slideInDown;
}

.slide-out {
  animation-name: slideOutUp;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideOutUp {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

/* Vue Transition */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .notification {
    max-width: 80vw;
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .notification {
    min-width: auto;
    width: calc(100% - var(--spacing-lg) * 2);
    top: calc(var(--header-height) + var(--spacing-sm));
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .notification-message {
    font-size: var(--font-size-xs);
  }

  .notification-icon {
    width: 18px;
    height: 18px;
  }

  .notification-close {
    width: 18px;
    height: 18px;
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .notification {
    width: calc(100% - var(--spacing-md) * 2);
    top: calc(var(--header-height) + var(--spacing-xs));
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
  }

  .notification-message {
    font-size: 0.7rem;
  }

  .notification-icon {
    width: 16px;
    height: 16px;
  }

  .notification-close {
    width: 16px;
    height: 16px;
  }
}
</style>
