import { ref, computed, reactive } from 'vue';
import type { Model, Message, ChatRequest, AppState } from '@/types';
import { ollamaService } from '@/services/ollama';

export function useOllama() {
  // ==================== 状态定义 ====================
  // 从 localStorage 读取主题
  const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';

  const state = reactive<AppState>({
    // 模型状态
    models: [],
    currentModel: null,
    modelsLoading: false,
    modelsError: null,

    // 消息状态
    messages: [],
    isGenerating: false,
    currentResponse: '',
    abortController: null,

    // UI 状态
    theme: savedTheme,
    inputText: '',
    isInputDisabled: false,
  });

  // 错误提示状态
  const errorNotification = ref<{ message: string; type: 'error' | 'warning' } | null>(null);

  // ==================== 计算属性 ====================
  const canSendMessage = computed(() => {
    return Boolean(state.currentModel &&
                   !state.isGenerating &&
                   state.inputText.trim().length > 0);
  });

  const hasModels = computed(() => Boolean(state.models.length > 0));

  // ==================== 模型操作 ====================
  async function loadModels() {
    state.modelsLoading = true;
    state.modelsError = null;

    try {
      const models = await ollamaService.fetchModels();
      state.models = models;

      // 自动选择第一个模型
      if (models.length > 0 && !state.currentModel) {
        state.currentModel = models[0] || null;
      }

      if (models.length === 0) {
        showError('No models available. Please make sure Ollama is running.', 'warning');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
      state.modelsError = errorMessage;
      showError('Failed to connect to Ollama. Please check if Ollama is running.', 'error');
      console.error('Failed to load models:', error);
    } finally {
      state.modelsLoading = false;
    }
  }

  function selectModel(model: Model) {
    state.currentModel = model;
    // 切换模型时保留历史对话，不清空（根据 spec.md 2.2.4 需求）
    state.currentResponse = '';
  }

  // ==================== 消息操作 ====================
  function createMessage(role: 'user' | 'assistant', content: string): Message {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
    };
  }

  async function sendMessage() {
    if (!canSendMessage.value || !state.currentModel) return;

    const userContent = state.inputText.trim();
    const userMessage = createMessage('user', userContent);

    // 添加用户消息
    state.messages.push(userMessage);
    state.inputText = '';

    // 准备流式请求 - 只发送已有的消息历史，不包括空 AI 消息
    const chatRequest: ChatRequest = {
      model: state.currentModel.name,
      messages: state.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    };

    // 创建 AbortController
    state.abortController = new AbortController();
    state.isGenerating = true;
    state.currentResponse = '';

    // 创建 AI 消息占位
    const aiMessage = createMessage('assistant', '');
    state.messages.push(aiMessage);

    try {
      // 流式接收响应（默认 120 秒超时）
      for await (const response of ollamaService.chatStream(
        chatRequest,
        state.abortController.signal,
        30000 // 30 秒超时
      )) {
        // 处理 content 或 thinking 字段（某些模型使用 thinking）
        const content = response.message.content || '';
        const thinking = (response.message as any).thinking || '';
        const textToAdd = content || thinking;
        state.currentResponse += textToAdd;
        // 通过数组引用直接修改属性，保持对象引用不变
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage) {
          lastMessage.content = state.currentResponse;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // 用户中止，不显示错误
          aiMessage.content = state.currentResponse || '[Generation stopped by user]';
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          // 超时错误 - 重置界面
          handleTimeout();
          return;
        } else {
          // 其他错误
          aiMessage.content = state.currentResponse || `Error: ${error.message}`;
          showError(`Connection error: ${error.message}`, 'error');
        }
      }
    } finally {
      state.isGenerating = false;
      state.abortController = null;
      state.currentResponse = '';
    }
  }

  function abortGeneration() {
    if (state.abortController) {
      state.abortController.abort();
      state.abortController = null;
    }
    state.isGenerating = false;
  }

  // 处理超时错误
  function handleTimeout() {
    // 移除正在生成的 AI 消息和对应的用户消息
    if (state.messages.length >= 2) {
      state.messages.splice(-2, 2);
    }

    // 重置状态
    state.isGenerating = false;
    state.abortController = null;
    state.currentResponse = '';
    state.inputText = '';

    // 显示错误提示
    showError('Request timeout. Ollama did not respond in time. Please try again.', 'error');

    // 重新加载模型列表
    loadModels();
  }

  function clearHistory() {
    state.messages = [];
    state.currentResponse = '';
  }

  // ==================== 主题操作 ====================
  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  function setTheme(theme: 'dark' | 'light') {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // ==================== 错误提示 ====================
  function showError(message: string, type: 'error' | 'warning' = 'error') {
    errorNotification.value = { message, type };
    setTimeout(() => {
      errorNotification.value = null;
    }, 5000);
  }

  function clearError() {
    errorNotification.value = null;
  }

  // ==================== 初始化 ====================
  function init() {
    // 应用保存的主题
    setTheme(state.theme);
    // 加载模型
    loadModels();
  }

  return {
    // 状态
    state,
    errorNotification,
    // 计算属性
    canSendMessage,
    hasModels,
    // 方法
    loadModels,
    selectModel,
    sendMessage,
    abortGeneration,
    clearHistory,
    toggleTheme,
    setTheme,
    showError,
    clearError,
    init,
  };
}
