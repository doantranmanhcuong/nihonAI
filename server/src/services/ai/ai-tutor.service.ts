import { PrismaClient } from '@prisma/client';
import { GeminiPoolService } from '../../core/ai-pool.service';

const prisma = new PrismaClient();

export class AiTutorService {
  static async getActivePrompt(key: string, defaultPrompt: string): Promise<string> {
    const config = await prisma.aiPromptConfig.findUnique({ where: { key } });
    if (config && config.isActive) return config.promptText;
    return defaultPrompt;
  }

  static async chat(userId: string, message: string, history: any[] = []): Promise<string> {
    const systemPrompt = await this.getActivePrompt(
      'DEFAULT_TUTOR',
      'B?n là m?t tr? lý ?o tên là NihonAI Sensei, chuyên giúp h?c viên h?c ti?ng Nh?t. Hãy tr? l?i ng?n g?n, thân thi?n và khuy?n khích h?c viên. Gi?i thích ng? pháp d? hi?u.'
    );

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt + "\n\nDu?i dây là cu?c h?i tho?i:" }] },
      { role: 'model', parts: [{ text: "Ðã rõ. Tôi s? tuân th? vai trò NihonAI Sensei." }] },
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const result = await GeminiPoolService.generateContent(process.env.GEMINI_MODEL || 'gemini-flash-latest', { contents }, undefined, userId);
    return result.response.text();
  }
}
