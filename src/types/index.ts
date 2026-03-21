// ==================== 模型相关 ====================
export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest?: string;
  details?: ModelDetails;
}

export interface ModelDetails {
  parent_model?: string;
  format?: string;
  family?: string;
  families?: string[];
  parameter_size?: string;
  quantization_level?: string;
}

// ==================== 消息相关 ====================
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: string;
  content: string;
}

// ==================== API 请求 ====================
export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream: true;
  options?: ChatOptions;
}

export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
}

// ==================== API 响应 ====================
export interface ChatResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
  context?: number[];
  total_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface ModelsResponse {
  models: Model[];
}

// ==================== 应用状态 ====================
export interface AppState {
  // 模型状态
  models: Model[];
  currentModel: Model | null;
  modelsLoading: boolean;
  modelsError: string | null;

  // 消息状态
  messages: Message[];
  isGenerating: boolean;
  currentResponse: string;
  abortController: AbortController | null;

  // UI 状态
  theme: 'dark' | 'light';
  inputText: string;
  isInputDisabled: boolean;
}

// ==================== 组件 Props ====================
export interface MessageItemProps {
  message: Message;
  isTyping?: boolean;
}

export interface ModelSelectorProps {
  models: Model[];
  currentModel: Model | null;
  loading: boolean;
  disabled: boolean;
}

export interface InputAreaProps {
  disabled: boolean;
  placeholder?: string;
}
