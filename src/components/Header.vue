<script setup lang="ts">
import type { Model } from '@/types';
import ModelSelector from './ModelSelector.vue';

interface Props {
  currentModel: Model | null;
  models: Model[];
  loading: boolean;
  disabled: boolean;
  theme: 'dark' | 'light';
}

interface Emits {
  (e: 'modelChange', model: Model): void;
  (e: 'toggleTheme'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleModelChange(model: Model) {
  emit('modelChange', model);
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <div class="header-left">
        <div class="logo">O</div>
        <h1 class="title">Ollama Local Web</h1>
      </div>

      <!-- Right side -->
      <div class="header-right">
        <!-- Model Selector -->
        <ModelSelector
          :models="models"
          :current-model="currentModel"
          :loading="loading"
          :disabled="disabled"
          @change="handleModelChange"
        />

        <!-- Theme Toggle -->
        <button
          class="theme-toggle"
          @click="emit('toggleTheme')"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        >
          <svg v-if="theme === 'dark'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  transition: background-color var(--transition-base), border-color var(--transition-base);
  flex-shrink: 0;
}

.header-container {
  max-width: var(--message-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo {
  transition: all var(--transition-fast);
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.theme-toggle {
  transition: all var(--transition-fast);
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  padding: 0;
  color: var(--text-primary);
}

.theme-toggle:hover {
  background-color: var(--bg-input);
  border-color: var(--accent-color);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.98);
}

.theme-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .header-container {
    padding: 0 var(--spacing-lg);
  }

  .title {
    font-size: var(--font-size-md);
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .header-container {
    padding: 0 var(--spacing-md);
  }

  .title {
    display: none;
  }

  .logo {
  transition: all var(--transition-fast);
    width: 32px;
    height: 32px;
    font-size: var(--font-size-md);
  }

  .theme-toggle {
  transition: all var(--transition-fast);
    width: 32px;
    height: 32px;
  }

  .theme-icon {
    width: 16px;
    height: 16px;
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .header-right {
    gap: var(--spacing-sm);
  }

  .logo {
  transition: all var(--transition-fast);
    width: 28px;
    height: 28px;
    font-size: var(--font-size-sm);
  }

  .theme-toggle {
  transition: all var(--transition-fast);
    width: 28px;
    height: 28px;
  }

  .theme-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
