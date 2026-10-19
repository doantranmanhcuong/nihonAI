import cron from 'node-cron';
import { ReadingService } from './reading.service';

export class ReadingCronService {
  private static isRunning = false;

  /**
   * Khởi chạy bộ lập lịch cào báo tự động
   * Mặc định: Chạy vào lúc 02:00 sáng mỗi ngày ('0 6 * * *')
   */
  static initReadingNewsCron() {
    console.log('⏰ [ReadingCronService] Đã kích hoạt bộ lập lịch cào báo tự động (02:00 AM) & dọn dẹp CSDL (04:00 AM)');

    // 1. Dọn dẹp các bài báo cũ ít tương tác vào lúc 04:00 sáng mỗi ngày để CSDL luôn gọn gàng
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 [ReadingCronService] Bắt đầu tác vụ định kỳ dọn dẹp bài báo cũ (> 60 ngày)...');
      try {
        await ReadingService.cleanupStaleArticles(7);
      } catch (err: any) {
        console.error('❌ [ReadingCronService] Lỗi khi dọn dẹp CSDL:', err?.message || err);
      }
    });

    // 2. Chạy lúc 02:00 sáng mỗi ngày: Cào sẵn 3 bài báo nổi bật nhất
    cron.schedule('0 2 * * *', async () => {
      console.log('🌅 [ReadingCronService] Bắt đầu tác vụ cào báo buổi sáng tự động (02:00 AM)...');
      await this.triggerDailyNewsCrawl(3);
    });
  }

  /**
   * Thực thi cào và chuyển hóa tự động các bài báo mới nhất chưa có trong CSDL
   * @param maxArticles Số lượng bài tối đa cần cào và chuyển hóa (mặc định 3 bài)
   */
  static async triggerDailyNewsCrawl(maxArticles: number = 3) {
    if (this.isRunning) {
      console.log('⚠️ [ReadingCronService] Tác vụ cào báo đang chạy, bỏ qua lượt này để tránh trùng lặp.');
      return { success: false, message: 'Crawler is currently running' };
    }

    this.isRunning = true;
    const processedResults: any[] = [];

    try {
      // 1. Lấy danh sách tin mới nhất từ các nguồn RSS
      const latestNews = await ReadingService.fetchRawRssFeeds('ALL');

      // 2. Lọc ra những bài chưa từng được xử lý/lưu vào MySQL
      console.log('LATEST NEWS LENGTH:', latestNews.length);
        const pendingArticles = latestNews.filter((item) => !item.isProcessed && item.link);
      console.log(`📰 [ReadingCronService] Tìm thấy ${pendingArticles.length} bài báo mới chưa qua xử lý.`);

      // 3. Chọn 2 - 3 bài báo tiêu biểu (Ưu tiên NHK, MAINICHI)
      // Trộn ngẫu nhiên để đa dạng hóa chủ đề và nguồn báo thay vì lấy top đầu
      const shuffled = pendingArticles.sort(() => 0.5 - Math.random());
      const targetArticles = shuffled.slice(0, maxArticles);

      for (const item of targetArticles) {
        try {
          console.log(`⏳ [ReadingCronService] Đang cào & xử lý: "${item.title}" (${item.source || 'Tin tức'})...`);
          const result = await ReadingService.crawlAndProcessArticle({
            url: item.link,
            level: item.levelEstimate || 'N3',
            userId: 'system_daily_crawler'
          });

          processedResults.push({
            id: result.id,
            title: result.title,
            source: item.source,
            imageUrl: result.imageUrl,
            status: 'SUCCESS'
          });

          console.log(`✅ [ReadingCronService] Thành công cào bài: "${result.title}" (ID: ${result.id})`);
        } catch (itemErr: any) {
          console.error(`❌ [ReadingCronService] Lỗi khi cào bài "${item.title}":`, itemErr?.message || itemErr);
          processedResults.push({
            title: item.title,
            source: item.source,
            status: 'FAILED',
            error: itemErr?.message
          });
        }
      }

      console.log(`🎉 [ReadingCronService] Hoàn thành đợt cào báo. Thành công: ${processedResults.filter(r => r.status === 'SUCCESS').length}/${targetArticles.length}`);

      return {
        success: true,
        totalChecked: pendingArticles.length,
        processedCount: processedResults.length,
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
