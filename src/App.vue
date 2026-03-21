<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useOllama } from '@/composables/useOllama';
import Header from '@/components/Header.vue';
import ChatArea from '@/components/ChatArea.vue';
import InputArea from '@/components/InputArea.vue';
import ToastNotification from '@/components/ToastNotification.vue';

const {
  state,
  errorNotification,
  canSendMessage,
  hasModels,
  selectModel,
  sendMessage,
  abortGeneration,
  toggleTheme,
  init,
} = useOllama();

// 计算错误通知属性
const notificationMessage = computed(() => errorNotification.value?.message || null);
const notificationType = computed(() => errorNotification.value?.type || 'error');

onMounted(() => {
  init();
});
</script>

<template>
  <div class="app" :data-theme="state.theme">
    <!-- Header -->
    <Header
      :current-model="state.currentModel"
      :models="state.models"
      :loading="state.modelsLoading"
      :disabled="state.isGenerating"
      :theme="state.theme"
      @model-change="selectModel"
      @toggle-theme="toggleTheme"
    />

    <!-- Chat Area -->
    <ChatArea
      :messages="state.messages"
      :is-generating="state.isGenerating"
      :current-response="state.currentResponse"
    />

    <!-- Input Area -->
    <InputArea
      v-model="state.inputText"
      :disabled="state.isGenerating || !hasModels"
      :can-send="canSendMessage"
      :is-generating="state.isGenerating"
      @send="sendMessage"
      @abort="abortGeneration"
    />

    <!-- Error Notification -->
    <ToastNotification
      :message="notificationMessage"
      :type="notificationType"
    />
  </div>
</template>

<style>
/* Global styles for the app */
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Smooth transitions for theme changes */
.app * {
  transition: background-color var(--transition-base),
              color var(--transition-base),
              border-color var(--transition-base);
}
</style>
