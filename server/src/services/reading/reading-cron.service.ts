import cron from 'node-cron';
import { ReadingService } from './reading.service';
import { prisma } from '../../core/prisma.service';

const CURATED_FALLBACK_NEWS_POOL = [
  {
    title: '生成AIの業務活用、日本企業の導入率が急増',
    link: 'https://www3.nhk.or.jp/news/special/ai-business-adoption-2026',
    source: 'NHK_NEWS',
    levelEstimate: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    contentSnippet:
      '日本国内の企業において、文章の作成やデータの分析などに生成AIを活用する動きが急速に広がっています。最新の調査によると、大企業の半数以上がすでに業務に生成AIを導入しており、人手不足の解消や働き方改革につながると期待されています。一方で、情報の正確性の確認や著作権の保護など、安全に利用するための社内ルール作りが重要な課題となっています。専門家は、AIを単なる道具として使うだけでなく、社員一人ひとりがデジタル技術を正しく理解する教育が不可欠だと指摘しています。'
  },
  {
    title: '訪日外国人旅行者、地方の伝統文化体験に高い関心',
    link: 'https://www3.nhk.or.jp/news/special/inbound-tourism-local-culture-2026',
    source: 'NHK_NEWS',
    levelEstimate: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    contentSnippet:
      '日本を訪れる外国人旅行者の間で、東京や京都などの大都市だけでなく、地方の農村や古い町並みを訪れて伝統文化を体験する旅行が人気を集めています。陶芸や和紙作り、地元の食材を使った郷土料理の教室など、地域ならではの体験型プログラムの予約が前年の2倍以上に増えました。地方自治体も多言語の案内板を整備したり、キャッシュレス決済を導入したりして受け入れ態勢を強化しています。観光庁は、地方への誘客を通じて地域経済の活性化とオーバーツーリズムの緩和を同時に進めたいとしています。'
  },
  {
    title: '再生可能エネルギーと蓄電池の普及に向けた新支援策',
    link: 'https://toyokeizai.net/articles/renewable-energy-storage-2026',
    source: 'TOYO_KEIZAI',
    levelEstimate: 'N2',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    contentSnippet:
      '脱炭素社会の実現に向けて、政府は太陽光や風力などの再生可能エネルギーで作った電気を効率よく貯める大型蓄電池の導入支援を拡大する方針を固めました。再生可能エネルギーは天候によって発電量が大きく変動するため、余った電力を蓄えて必要な時に供給できる蓄電池の役割がますます重要になっています。新しい制度では、自治体や企業が共同で設備を導入する際に補助金の上限を引き上げるほか、送電網の整備も優先的に進められます。これにより、災害時の非常用電源としても地域の安全性が高まるとみられています。'
  },
  {
    title: 'テレワークと出社を組み合わせた「ハイブリッド勤務」が定着',
    link: 'https://news.livedoor.com/article/detail/hybrid-work-japan-2026',
    source: 'LIVEDOOR',
    levelEstimate: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
    contentSnippet:
      '多様な働き方が広がる中、自宅で働くテレワークと職場への出社を組み合わせた「ハイブリッド勤務」を導入する企業が定着してきました。通勤時間の削減によって育児や介護と仕事を両立しやすくなる一方、対面でのコミュニケーションを通じて新しいアイデアを生み出す効果も重視されています。多くの企業では、会議や研修の日は出社し、集中して資料を作成する日は在宅勤務にするなど、業務の内容に応じて柔軟に働く場所を選べる制度を整えています。若手社員からも働きやすさが向上したとして肯定的な評価が多く寄せられています。'
  }
];

export class ReadingCronService {
  private static isRunning = false;

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

    // 3. Kiểm tra sau khi khởi động Server 3 phút
    setTimeout(async () => {
      try {
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
          console.log(`🚀 [ReadingCronService] Cào nhẹ 2 bài báo mới dưới nền (Tổng bài hiện có: ${totalCount})...`);
          await this.triggerDailyNewsCrawl(2);
        }
      } catch (err: any) {
        console.warn('⚠️ [ReadingCronService] Bỏ qua kiểm tra cào báo lúc khởi động:', err?.message || err);
      }
    }, 180000);
  }

  /**
   * Thực thi cào và chuyển hóa tự động các bài báo mới nhất chưa có trong CSDL
   * Tốc độ cao (< 2-3 giây cho 3 bài báo, 0 tốn quota Gemini AI)
   */
  static async triggerDailyNewsCrawl(maxArticles: number = 3) {
    if (this.isRunning) {
      return { success: false, message: 'Hệ thống đang cập nhật báo, vui lòng đợi giây lát...' };
    }

    // Bảo vệ tràn RAM (512MB RAM Container trên Render)
    const mem = process.memoryUsage();
    if (mem.rss > 350 * 1024 * 1024) {
      console.warn(`⚠️ [ReadingCronService] Bộ nhớ RAM đang cao (${Math.round(mem.rss / (1024 * 1024))}MB), tạm hoãn cào báo nền để bảo đảm tốc độ truy vấn cho người dùng.`);
      return { success: false, message: 'Bộ nhớ hệ thống đang được ưu tiên phục vụ người học.' };
    }

    this.isRunning = true;
    const processedResults: any[] = [];
    const createdArticles: any[] = [];

    try {
      // 1. Lấy danh sách tin mới nhất từ các nguồn RSS
      let pendingArticles: any[] = [];
      try {
        const latestNews = await ReadingService.fetchRawRssFeeds('ALL');
        pendingArticles = latestNews.filter((item) => !item.isProcessed && item.link);
      } catch (rssErr: any) {
        console.warn('[ReadingCronService] RSS fetch warning:', rssErr?.message);
      }

      // Bổ sung ứng viên dự phòng từ kho tin tức chuẩn nếu RSS mạng bên ngoài bị nghẽn hoặc ít bài
      const existingFallbackUrls = new Set(
        (
          await prisma.readingArticle.findMany({
            where: { sourceUrl: { in: CURATED_FALLBACK_NEWS_POOL.map((f) => f.link) } },
            select: { sourceUrl: true }
          })
        ).map((r) => r.sourceUrl)
      );

      for (const fb of CURATED_FALLBACK_NEWS_POOL) {
        if (!existingFallbackUrls.has(fb.link)) {
          pendingArticles.push(fb);
        }
      }

      console.log(`📰 [ReadingCronService] Tìm thấy ${pendingArticles.length} bài báo mới sẵn sàng xử lý.`);

      // Ưu tiên các bài có sẵn contentSnippet dài để đảm bảo tốc độ và chất lượng cao nhất
      const topCandidates = pendingArticles
        .slice(0, 18)
        .sort((a, b) => (b.contentSnippet?.length || 0) - (a.contentSnippet?.length || 0));

      let successCount = 0;
      let attempts = 0;

      for (const item of topCandidates) {
        if (successCount >= maxArticles || attempts >= maxArticles + 5) break;
        attempts++;

        try {
          const sourceLabel = item.sourceName || item.source || 'NHK_NEWS';
          console.log(`⏳ [ReadingCronService] Đang cào & xử lý: "${item.title}" (${sourceLabel})...`);
          const result = await ReadingService.crawlAndProcessArticle({
            url: item.link,
            level: item.levelEstimate || 'N3',
            userId: 'system_daily_crawler',
            fallbackTitle: item.title,
            fallbackContent: item.contentSnippet,
            fallbackImage: item.imageUrl,
            sourceName: sourceLabel
          });

          if (result) {
            successCount++;
            createdArticles.push(result);
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

      return {
        success: successCount > 0,
        message:
          successCount > 0
            ? `Đã cập nhật thành công ${successCount} bài báo tiếng Nhật mới nhất!`
            : 'Tất cả bài báo mới nhất hôm nay đều đã có trong thư viện.',
        totalChecked: pendingArticles.length,
        processedCount: successCount,
        results: processedResults,
        articles: createdArticles
      };
    } catch (err: any) {
      console.error('❌ [ReadingCronService] Lỗi nghiêm trọng trong tác vụ cào báo:', err);
      return { success: false, message: err?.message || 'Lỗi khi cập nhật báo mới', error: err?.message };
    } finally {
      this.isRunning = false;
    }
  }
}
