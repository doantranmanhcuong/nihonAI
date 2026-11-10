import { prisma } from './prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiPoolService {
  private static keys: string[] = [];
  private static currentIndex = 0;

  static init() {
    this.keys = [
      process.env.GEMINI_KEY_KANJI,
      process.env.GEMINI_KEY_VOCAB,
      process.env.GEMINI_KEY_SHADOWING,
      process.env.GEMINI_KEY_GRAMMAR,
      process.env.GEMINI_KEY_EXAM,
      process.env.GEMINI_KEY_BACKUP_1,
      process.env.GEMINI_KEY_BACKUP_2,
      process.env.GEMINI_API_KEY
    ]
      .filter((k): k is string => !!k)
      .map(k => String(k).replace(/^["']|["']$/g, '').trim())
      .filter(k => k.length > 0);
    
    // De-duplicate keys
    this.keys = [...new Set(this.keys)];

    const validGoogleKeys = this.keys.filter(k => k.startsWith('AIzaSy'));
    if (validGoogleKeys.length === 0 && this.keys.length > 0) {
      console.warn('⚠️ [GeminiPool] Cảnh báo: Các API key hiện tại không bắt đầu bằng "AIzaSy". Vui lòng kiểm tra lại Google Gemini API Key tại https://aistudio.google.com/app/apikey');
    }
  }

  /**
   * Sinh danh sách chuỗi model ưu tiên với cơ chế Fallback tự động
   */
  static getCandidateModels(requestedModel?: string): string[] {
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const defaultValidFallbacks = [
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-lite-latest'
    ];
    const envFallbacks = process.env.GEMINI_MODEL_FALLBACKS
      ? process.env.GEMINI_MODEL_FALLBACKS.split(',')
          .map(s => s.trim())
          .filter(s => Boolean(s) && !s.includes('3.6') && !s.includes('3.5'))
      : defaultValidFallbacks;

    const fullList = [
      requestedModel,
      primaryModel,
      ...envFallbacks,
      ...defaultValidFallbacks
    ].filter(Boolean) as string[];

    return [...new Set(fullList)];
  }

  static async generateContent(modelName?: string, prompt?: any, generationConfig?: any, userId?: string): Promise<any> {
    if (this.keys.length === 0) this.init();
    if (this.keys.length === 0) throw new Error('No Gemini API keys available in environment.');

    const candidateModels = this.getCandidateModels(modelName);
    let lastError: any = null;

    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];
      let attempts = 0;
      const maxAttempts = this.keys.length;
      let modelFailed = false;

      while (attempts < maxAttempts) {
        const key = this.keys[this.currentIndex];
        const genAI = new GoogleGenerativeAI(key);

        const modelOpts: any = { model: currentModel };
        if (generationConfig) {
          modelOpts.generationConfig = generationConfig;
        }

        const model = genAI.getGenerativeModel(modelOpts);

        try {
          const result = await model.generateContent(prompt);

          // Optional: Save Audit Log if userId is provided
          if (userId) {
            let promptStr = '';
            if (typeof prompt === 'string') promptStr = prompt;
            else if (Array.isArray(prompt)) promptStr = prompt.map(p => typeof p === 'string' ? p : JSON.stringify(p)).join('\n');
            else promptStr = JSON.stringify(prompt);

            prisma.aiAuditLog.create({
              data: {
                userId,
                query: promptStr,
                response: result.response.text(),
                tokens: result.response.usageMetadata?.totalTokenCount || null
              }
            }).catch(err => console.error('Error saving AI Audit Log:', err));
          }

          return result;

        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.response?.status;
          const message = err?.message || '';

          // 1. Nếu Model bị 404 (không tồn tại/deprecated) hoặc 503 (quá tải) hoặc 400 (chưa hỗ trợ):
          // Chuyển sang model tiếp theo trong danh sách dự phòng
          if (status === 404 || status === 503 || message.includes('503') || message.includes('404') || message.includes('not found')) {
            console.warn(`[GeminiPool] Model '${currentModel}' gặp sự cố (${status || 'Demand Spike'}). Chuyển sang model dự phòng tiếp theo...`);
            modelFailed = true;
            break; // Thoát vòng lặp key để chuyển model
          }

          // 2. Nếu lỗi Quota (429), 401 Unauthorized (Key sai/hết hạn) hoặc lỗi tạm thời: Xoay vòng API key
          if (
            status === 429 ||
            status === 401 ||
            message.includes('429') ||
            message.includes('401') ||
            message.includes('API key not valid') ||
            message.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            message.includes('exhausted') ||
            message.includes('quota') ||
            status >= 500
          ) {
            console.warn(`[GeminiPool] Key tại index ${this.currentIndex} (${key.substring(0, 8)}...) không khả dụng (${status || 'Quota/Invalid'}). Đang chuyển key tiếp theo...`);
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
          } else {
            console.warn(`[GeminiPool] Lỗi khi gọi '${currentModel}': ${message}. Đang thử fallback...`);
            modelFailed = true;
            break;
          }
        }
      }

      if (modelFailed) {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      }
    }

    throw new Error(`Toàn bộ cụm model [${candidateModels.join(', ')}] và các API key đều thất bại. Lỗi cuối cùng: ${lastError?.message}`);
  }
}
