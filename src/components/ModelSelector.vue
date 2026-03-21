<script setup lang="ts">
import type { Model } from '@/types';

interface Props {
  models: Model[];
  currentModel: Model | null;
  loading: boolean;
  disabled: boolean;
}

interface Emits {
  (e: 'change', model: Model): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const model = props.models.find(m => m.name === select.value);
  if (model) {
    emit('change', model);
  }
}
</script>

<template>
  <div class="model-selector">
    <select
      :value="currentModel?.name || ''"
      :disabled="disabled || loading"
      @change="handleChange"
      class="select"
    >
      <option value="" disabled>
        {{ loading ? 'Loading models...' : 'Select a model' }}
      </option>
      <option
        v-for="model in models"
        :key="model.name"
        :value="model.name"
      >
        {{ model.name }}
      </option>
    </select>
    <span class="icon">▼</span>
  </div>
</template>

<style scoped>
.model-selector {
  position: relative;
  min-width: 200px;
}

.select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-xl);
  padding-right: var(--spacing-3xl);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  appearance: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family-base);
}

.select:hover:not(:disabled) {
  border-color: var(--border-hover);
  background-color: var(--bg-input);
}

.select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
}

.select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--text-secondary);
  pointer-events: none;
  transition: color var(--transition-fast);
}

.model-selector:hover .icon {
  color: var(--text-primary);
}

/* ===== 平板端适配 (768px - 1023px) ===== */
@media screen and (max-width: 1023px) {
  .model-selector {
    min-width: 160px;
  }

  .select {
    font-size: var(--font-size-xs);
  }
}

/* ===== 移动端适配 (< 768px) ===== */
@media screen and (max-width: 767px) {
  .model-selector {
    min-width: 130px;
  }

  .select {
    padding: var(--spacing-sm) var(--spacing-md);
    padding-right: var(--spacing-2xl);
    font-size: var(--font-size-xs);
  }
}

/* ===== 小屏移动端适配 (< 480px) ===== */
@media screen and (max-width: 479px) {
  .model-selector {
    min-width: 90px;
  }

  .select {
    padding: var(--spacing-xs) var(--spacing-sm);
    padding-right: var(--spacing-xl);
    font-size: 0.7rem;
  }

  .icon {
    right: var(--spacing-sm);
    font-size: 8px;
  }
}
</style>
