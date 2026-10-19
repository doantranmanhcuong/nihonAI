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
  private static readonly DAILY_LIMIT = 5;

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

    const remaining = Math.max(0, this.DAILY_LIMIT - usedToday);
    const canGenerate = remaining > 0;

    return {
      dailyLimit: this.DAILY_LIMIT,
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
      dailyLimit: this.DAILY_LIMIT,
      usedToday: newCount,
      remaining: Math.max(0, this.DAILY_LIMIT - newCount),
      canGenerate: newCount < this.DAILY_LIMIT,
      resetAt: this.getEndOfDayIso()
    };

    return { success: true, status: updatedStatus };
  }
}
