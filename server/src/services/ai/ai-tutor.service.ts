import { prisma } from '../../core/prisma.service';
import { GeminiPoolService } from '../../core/ai-pool.service';
import { ReadingQuotaService } from '../reading/reading-quota.service';

export class AiTutorService {
  static async getActivePrompt(key: string, defaultPrompt: string): Promise<string> {
    const config = await prisma.aiPromptConfig.findUnique({ where: { key } });
    if (config && config.isActive) return config.promptText;
    return defaultPrompt;
  }

  static async chat(userId: string, message: string, history: any[] = []): Promise<string> {
    const { aiGlobalEnabled } = await ReadingQuotaService.getDynamicConfig();
    if (!aiGlobalEnabled) {
      throw new Error('Tính năng trợ lý AI hiện đang tạm tắt bởi Quản trị viên.');
    }

    const systemPrompt = await this.getActivePrompt(
      'DEFAULT_TUTOR',
      'Bạn là một trợ lý ảo tên là NihonAI Sensei, chuyên giúp học viên học tiếng Nhật. Hãy trả lời ngắn gọn, thân thiện và khuyến khích học viên. Giải thích ngữ pháp dễ hiểu.'
    );

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\nDưới đây là cuộc hội thoại:' }] },
      { role: 'model', parts: [{ text: 'Đã rõ. Tôi sẽ tuân thủ vai trò NihonAI Sensei.' }] },
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const result = await GeminiPoolService.generateContent(
      process.env.GEMINI_MODEL || 'gemini-flash-latest',
      { contents },
      undefined,
      userId
    );
    return result.response.text();
  }
}
