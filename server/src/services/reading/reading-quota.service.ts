import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';

export interface QuotaStatus {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  canGenerate: boolean;
  resetAt: string;
}

export class ReadingQuotaService {
  private static readonly DEFAULT_DAILY_LIMIT = 5;
  private static cachedLimit: number = 5;
  private static cachedGlobalEnabled: boolean = true;
  private static lastConfigFetch: number = 0;

  static invalidateConfigCache(): void {
    this.lastConfigFetch = 0;
  }

  static async getDynamicConfig(): Promise<{ dailyLimit: number; aiGlobalEnabled: boolean }> {
    const now = Date.now();
    if (now - this.lastConfigFetch < 30000) {
      return { dailyLimit: this.cachedLimit, aiGlobalEnabled: this.cachedGlobalEnabled };
    }
    try {
      const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['daily_ai_quota', 'AI_LIMIT', 'AI_GLOBAL_ENABLED'] } }
      });
      const map: Record<string, string> = {};
      for (const s of settings) {
        map[s.key] = s.value;
      }
      const rawLimit = map['daily_ai_quota'] ?? map['AI_LIMIT'];
      const parsedLimit = rawLimit !== undefined ? parseInt(rawLimit, 10) : this.DEFAULT_DAILY_LIMIT;
      this.cachedLimit = Number.isNaN(parsedLimit) ? this.DEFAULT_DAILY_LIMIT : Math.max(0, parsedLimit);
      this.cachedGlobalEnabled = map['AI_GLOBAL_ENABLED'] !== 'false';
      this.lastConfigFetch = now;
    } catch {}
    return { dailyLimit: this.cachedLimit, aiGlobalEnabled: this.cachedGlobalEnabled };
  }

  private static getTodayDateKey(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private static getEndOfDayIso(): string {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }

  /**
   * Lấy trạng thái hạn mức AI trong ngày của người dùng
   */
  static async getQuotaStatus(userId: string = 'guest_user'): Promise<QuotaStatus> {
    const dateKey = this.getTodayDateKey();
    const redisKey = `ratelimit:ai_reading:${userId}:${dateKey}`;

    let usedToday = 0;

    // 1. Kiểm tra Redis trước
    try {
      const redisVal = await RedisService.get<number>(redisKey);
      if (redisVal.data !== null && typeof redisVal.data === 'number') {
        usedToday = redisVal.data;
      } else {
        // Fallback đọc từ MySQL
        const dbQuota = await prisma.readingDailyQuota.findUnique({
          where: {
            userId_dateKey: {
              userId,
              dateKey
            }
          }
        });
        usedToday = dbQuota?.count || 0;
        await RedisService.set(redisKey, usedToday, 86400);
      }
    } catch (err) {
      // Fallback khi Redis có lỗi
      const dbQuota = await prisma.readingDailyQuota.findUnique({
        where: {
          userId_dateKey: {
            userId,
            dateKey
          }
        }
      });
      usedToday = dbQuota?.count || 0;
    }

    const { dailyLimit, aiGlobalEnabled } = await this.getDynamicConfig();
    const effectiveLimit = aiGlobalEnabled ? dailyLimit : 0;
    const remaining = Math.max(0, effectiveLimit - usedToday);
    const canGenerate = aiGlobalEnabled && remaining > 0;

    return {
      dailyLimit: effectiveLimit,
      usedToday,
      remaining,
      canGenerate,
      resetAt: this.getEndOfDayIso()
    };
  }

  /**
   * Tiêu tốn 1 lượt tạo bài đọc AI (Atomic increment)
   */
  static async consumeQuota(userId: string = 'guest_user'): Promise<{ success: boolean; status: QuotaStatus }> {
    const currentStatus = await this.getQuotaStatus(userId);
    if (!currentStatus.canGenerate) {
      return { success: false, status: currentStatus };
    }

    const dateKey = this.getTodayDateKey();
    const redisKey = `ratelimit:ai_reading:${userId}:${dateKey}`;
    const newCount = currentStatus.usedToday + 1;

    // Ghi vào Redis với TTL 24h
    try {
      await RedisService.set(redisKey, newCount, 86400);
    } catch (e) {
      // ignore
    }

    // Ghi vĩnh viễn vào MySQL
    try {
      await prisma.readingDailyQuota.upsert({
        where: {
          userId_dateKey: {
            userId,
            dateKey
          }
        },
        create: {
          userId,
          dateKey,
          count: newCount
        },
        update: {
          count: newCount
        }
      });
    } catch (dbErr) {
      console.error('Error updating DB quota:', dbErr);
    }

    const updatedStatus: QuotaStatus = {
      dailyLimit: currentStatus.dailyLimit,
      usedToday: newCount,
      remaining: Math.max(0, currentStatus.dailyLimit - newCount),
      canGenerate: newCount < currentStatus.dailyLimit,
      resetAt: this.getEndOfDayIso()
    };

    return { success: true, status: updatedStatus };
  }
}
