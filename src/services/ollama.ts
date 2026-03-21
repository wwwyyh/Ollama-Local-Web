import type { Model, ModelsResponse, ChatRequest, ChatResponse } from '@/types';

// Ollama API 基础 URL，支持通过环境变量配置
// 在开发环境使用相对路径，通过 Vite 代理转发到 Ollama
const API_BASE_URL = import.meta.env.VITE_OLLAMA_API_URL || '/api';

class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 获取可用模型列表
   */
  async fetchModels(timeoutMs: number = 10000): Promise<Model[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/tags`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data: ModelsResponse = await response.json();
      return data.models || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: Failed to connect to Ollama');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 流式对话 - 使用 Server-Sent Events
   */
  async *chatStream(
    request: ChatRequest,
    signal?: AbortSignal,
    timeoutMs: number = 30000
  ): AsyncGenerator<ChatResponse, void, unknown> {
    // 创建超时控制器
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    // 组合 abort 信号
    const abortController = new AbortController();

    // 监听用户取消信号
    if (signal) {
      signal.addEventListener('abort', () => abortController.abort(), { once: true });
    }

    // 监听超时信号
    timeoutController.signal.addEventListener('abort', () => abortController.abort(), { once: true });

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // 处理剩余的 buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const data: ChatResponse = JSON.parse(line);
                    yield data;
                    if (data.done) return;
                  } catch {
                    // 忽略解析错误
                  }
                }
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data: ChatResponse = JSON.parse(line);
                yield data;
                if (data.done) return;
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      } catch (readError) {
        // 检查是否是超时错误
        if (timeoutController.signal.aborted) {
          throw new Error('Request timeout: Ollama did not respond in time');
        }
        throw readError;
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      // 检查是否是超时错误
      if (timeoutController.signal.aborted) {
        throw new Error('Request timeout: Ollama did not respond in time');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 非流式对话 (备用方案)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const ollamaService = new OllamaService();
