import cron from 'node-cron';
import { ReadingService } from './reading.service';
import { prisma } from '../../core/prisma.service';

export class ReadingCronService {
  private static isRunning = false;

  /**
   * Khởi chạy bộ lập lịch cào báo tự động
   * - Tự động kiểm tra ngay khi khởi động server (nếu chưa có bài báo mới trong 12 giờ qua sẽ tự cào bù)
   * - Chạy định kỳ mỗi 6 giờ để đảm bảo trên Render luôn có báo mới mỗi ngày
   */
  static initReadingNewsCron() {
    console.log('⏰ [ReadingCronService] Đã kích hoạt bộ lập lịch cào báo tự động (mỗi 6 giờ) & dọn dẹp CSDL (04:00 AM)');

    // 1. Dọn dẹp các bài báo cũ (> 14 ngày) vào lúc 04:00 sáng mỗi ngày
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 [ReadingCronService] Bắt đầu tác vụ định kỳ dọn dẹp bài báo cũ (> 14 ngày)...');
      try {
        await ReadingService.cleanupStaleArticles(14);
      } catch (err: any) {
        console.error('❌ [ReadingCronService] Lỗi khi dọn dẹp CSDL:', err?.message || err);
      }
    });

    // 2. Chạy định kỳ mỗi 6 giờ: Cào 2 bài báo nổi bật mới nhất
    cron.schedule('0 */6 * * *', async () => {
      console.log('🌅 [ReadingCronService] Bắt đầu tác vụ cào báo tự động định kỳ...');
      await this.triggerDailyNewsCrawl(2);
    });

    // 3. Kiểm tra ngay sau khi khởi động Server (sau 8 giây để không chặn cổng khởi động)
    setTimeout(async () => {
      try {
        await ReadingService.cleanupStaleArticles(14);
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const [totalCount, recentCount] = await Promise.all([
          prisma.readingArticle.count({ where: { isPublic: true } }),
          prisma.readingArticle.count({
            where: {
              isPublic: true,
              sourceType: { in: ['EXTERNAL_NEWS', 'NHK_NEWS'] },
              createdAt: { gte: twelveHoursAgo }
            }
          })
        ]);

        if (totalCount < 6 || recentCount === 0) {
          console.log(`🚀 [ReadingCronService] Phát hiện chưa có báo mới trong 12h qua (Tổng bài: ${totalCount}). Tự động cào 3 bài báo mới...`);
          await this.triggerDailyNewsCrawl(3);
        }
      } catch (err: any) {
        console.warn('⚠️ [ReadingCronService] Bỏ qua kiểm tra cào báo lúc khởi động:', err?.message || err);
      }
    }, 8000);
  }

  /**
   * Thực thi cào và chuyển hóa tự động các bài báo mới nhất chưa có trong CSDL
   * @param maxArticles Số lượng bài tối đa cần cào thành công (mặc định 3 bài)
   */
  static async triggerDailyNewsCrawl(maxArticles: number = 3) {
    if (this.isRunning) {
      console.log('⚠️ [ReadingCronService] Tác vụ cào báo đang chạy, bỏ qua lượt này để tránh trùng lặp.');
      return { success: false, message: 'Hệ thống đang cập nhật báo, vui lòng đợi giây lát...' };
    }

    this.isRunning = true;
    const processedResults: any[] = [];

    try {
      // 1. Lấy danh sách tin mới nhất từ các nguồn RSS
      const latestNews = await ReadingService.fetchRawRssFeeds('ALL');
      const pendingArticles = latestNews.filter((item) => !item.isProcessed && item.link);
      console.log(`📰 [ReadingCronService] Tìm thấy ${pendingArticles.length} bài báo mới chưa qua xử lý.`);

      // 2. Xáo trộn nhẹ trong top 15 bài mới nhất để đa dạng nguồn báo, thử tối đa 6 ứng viên cho đến khi đủ maxArticles bài thành công
      const topCandidates = pendingArticles.slice(0, 15).sort(() => 0.5 - Math.random());
      let successCount = 0;
      let attempts = 0;

      for (const item of topCandidates) {
        if (successCount >= maxArticles || attempts >= maxArticles + 3) break;
        attempts++;

        try {
          const sourceLabel = item.sourceName || item.source || 'Tin tức';
          console.log(`⏳ [ReadingCronService] Đang cào & xử lý: "${item.title}" (${sourceLabel})...`);
          const result = await ReadingService.crawlAndProcessArticle({
            url: item.link,
            level: item.levelEstimate || 'N3',
            userId: 'system_daily_crawler'
          });

          if (result) {
            successCount++;
            processedResults.push({
              id: result.id,
              title: result.title,
              source: sourceLabel,
              imageUrl: result.imageUrl,
              status: 'SUCCESS'
            });
            console.log(`✅ [ReadingCronService] Thành công cào bài (${successCount}/${maxArticles}): "${result.title}"`);
          }
        } catch (itemErr: any) {
          console.error(`❌ [ReadingCronService] Lỗi khi cào bài "${item.title}":`, itemErr?.message || itemErr);
          processedResults.push({
            title: item.title,
            source: item.sourceName || item.source,
            status: 'FAILED',
            error: itemErr?.message
          });
        }
      }

      console.log(`🎉 [ReadingCronService] Hoàn thành đợt cào báo. Thành công: ${successCount}/${maxArticles}`);

      return {
        success: successCount > 0,
        totalChecked: pendingArticles.length,
        processedCount: successCount,
        results: processedResults
      };
    } catch (err: any) {
      console.error('❌ [ReadingCronService] Lỗi nghiêm trọng trong tác vụ cào báo:', err);
      return { success: false, error: err?.message };
    } finally {
      this.isRunning = false;
    }
  }
}
