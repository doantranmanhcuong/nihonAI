import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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
  }

  /**
   * Sinh danh sách chuỗi model ưu tiên với cơ chế Fallback tự động
   */
  static getCandidateModels(requestedModel?: string): string[] {
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const envFallbacks = process.env.GEMINI_MODEL_FALLBACKS
      ? process.env.GEMINI_MODEL_FALLBACKS.split(',').map(s => s.trim()).filter(Boolean)
      : ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview'];

    const fullList = [
      requestedModel,
      primaryModel,
      ...envFallbacks
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

          // 2. Nếu lỗi Quota (429) hoặc lỗi tạm thời: Xoay vòng API key
          if (status === 429 || message.includes('429') || message.includes('exhausted') || message.includes('quota') || status >= 500) {
            console.warn(`[GeminiPool] Key tại index ${this.currentIndex} cho model '${currentModel}' bị nghẽn (${status || 'Quota'}). Đang chuyển key tiếp theo...`);
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
