import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import axios from 'axios';
import { TranscriptParserService, RawTranscriptSnippet, kataToHira } from './transcript-parser.service';

// L1 In-Memory LRU Cache (Siêu tốc < 0.5ms trong tiến trình Node.js)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const l1Cache = new Map<string, CacheEntry<any>>();
const L1_TTL_MS = 10 * 60 * 1000; // 10 phút
const MAX_L1_ENTRIES = 100;

function setL1<T>(key: string, data: T): void {
  if (l1Cache.size >= MAX_L1_ENTRIES) {
    // Xóa entry cũ nhất
    const oldestKey = l1Cache.keys().next().value;
    if (oldestKey) l1Cache.delete(oldestKey);
  }
  l1Cache.set(key, { data, expiresAt: Date.now() + L1_TTL_MS });
}

function getL1<T>(key: string): T | null {
  const entry = l1Cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    l1Cache.delete(key);
    return null;
  }
  return entry.data;
}

export class ShadowingService {
  /**
   * ADMIN METHOD: C?p nh?t d?ng lo?t startTimeMs v� endTimeMs cho to�n b? ph? d? c?a 1 b�i h?c (Permanent Sync)
   */
  static async syncSubtitlesOffset(lessonId: string, offsetMs: number) {
    const lesson = await prisma.videoShadowingLesson.findUnique({
      where: { id: lessonId },
      include: { subtitles: true }
    });

    if (!lesson) throw new Error("Lesson not found");
    if (offsetMs === 0) return lesson;

    // Use a transaction to update all subtitles
    const updates = lesson.subtitles.map(sub => {
      return prisma.videoSubtitle.update({
        where: { id: sub.id },
        data: {
          startTimeMs: Math.max(0, sub.startTimeMs + offsetMs),
          endTimeMs: Math.max(100, sub.endTimeMs + offsetMs)
        }
      });
    });

    await prisma.$transaction(updates);
    
    // Clear cache
    const redisKey = `shadowing_detail_${lessonId}`;
    try {
      const RedisService = require("../../services/redis.service").RedisService;
      await RedisService.del(redisKey);
    } catch(e) {}
    
    return { success: true, updatedCount: updates.length };
  }

  /**
   * Lấy danh sách video bài học theo bộ lọc
   * Đánh index: @@index([level, isPublic]), @@index([category, level])
   */
  static async listLessons(params: {
    level?: string;
    category?: string;
    channelTitle?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `shadowing:list:${params.level || 'ALL'}:${params.category || 'ALL'}:${params.channelTitle || 'ALL'}:${params.search || ''}:${page}:${limit}`;

    // Kiểm tra L1 Cache
    const l1Hit = getL1<any>(cacheKey);
    if (l1Hit) return l1Hit;

    // Kiểm tra L2 Redis Cache
    const l2Hit = await RedisService.get<any>(cacheKey);
    if (l2Hit.data) {
      setL1(cacheKey, l2Hit.data);
      return l2Hit.data;
    }

    const where: any = { isPublic: true };

    if (params.level && params.level !== 'ALL') {
      where.level = params.level.toUpperCase();
    }
    if (params.category && params.category !== 'ALL') {
      where.category = params.category.toUpperCase();
    }
    if (params.channelTitle && params.channelTitle !== 'ALL') {
      where.channelTitle = params.channelTitle;
    }
    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { channelTitle: { contains: q } },
        { author: { contains: q } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.videoShadowingLesson.count({ where }),
      prisma.videoShadowingLesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { subtitles: true }
          }
        }
      })
    ]);

    const result = {
      items: items.map((item) => ({
        ...item,
        subtitlesCount: item._count.subtitles
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Ghi cache 2 tầng (L1 + L2 Redis TTL 15 phút cho danh sách)
    setL1(cacheKey, result);
    await RedisService.set(cacheKey, result, 900);

    return result;
  }

  /**
   * Lấy chi tiết bài học video kèm danh sách phụ đề theo mốc thời gian mili-giây
   * Tối ưu phản hồi < 2ms với Caching 2 tầng
   */
  static async getLessonDetail(lessonId: string) {
    const cacheKey = `shadowing:lesson:${lessonId}`;

    // 1. Kiểm tra L1 In-Memory
    const l1Hit = getL1<any>(cacheKey);
    if (l1Hit) {
      this.recordViewAsync(lessonId);
      return l1Hit;
    }

    // 2. Kiểm tra L2 Redis
    const l2Hit = await RedisService.get<any>(cacheKey);
    if (l2Hit.data) {
      setL1(cacheKey, l2Hit.data);
      this.recordViewAsync(lessonId);
      return l2Hit.data;
    }

    // 3. Đọc từ MySQL với quan hệ 1-N sắp xếp theo orderIndex (tận dụng @@index([lessonId, orderIndex]))
    const lesson = await prisma.videoShadowingLesson.findUnique({
      where: { id: lessonId },
      include: {
        subtitles: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!lesson) return null;

    // Phân tích các trường JSON keyWords & grammarNotes an toàn
    const formattedLesson = {
      ...lesson,
      subtitles: lesson.subtitles.map((s) => ({
        ...s,
        keyWordsList: (() => {
          try {
            return s.keyWords ? JSON.parse(s.keyWords) : [];
          } catch {
            return [];
          }
        })(),
        grammarNotesList: (() => {
          try {
            return s.grammarNotes ? JSON.parse(s.grammarNotes) : [];
          } catch {
            return [];
          }
        })()
      }))
    };

    // Ghi cache 2 tầng (TTL 24 giờ cho bài học)
    setL1(cacheKey, formattedLesson);
    await RedisService.set(cacheKey, formattedLesson, 86400);

    this.recordViewAsync(lessonId);

    return formattedLesson;
  }

  /**
   * Tăng lượt xem bất đồng bộ (Fire-and-forget không làm chậm response)
   */
  private static recordViewAsync(lessonId: string): void {
    prisma.videoShadowingLesson
      .update({
        where: { id: lessonId },
        data: { viewCount: { increment: 1 } }
      })
      .catch(() => {});
  }

  /**
   * Tạo bài học video mới (Admin / Người dùng tải lên / AI trích xuất)
   */
  static async createLesson(data: {
    title: string;
    youtubeId: string;
    level?: string;
    topic?: string;
    category?: string;
    durationSeconds?: number;
    thumbnailUrl?: string;
    description?: string;
    subtitles: Array<{
      orderIndex: number;
      startTimeMs: number;
      endTimeMs: number;
      japanese: string;
      furigana?: string;
      romaji?: string;
      vietnamese: string;
      keyWords?: any[];
      grammarNotes?: any[];
    }>;
  }) {
    // Trích xuất youtubeId nếu người dùng paste cả link YouTube
    let cleanYoutubeId = data.youtubeId.trim();
    const match = cleanYoutubeId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      cleanYoutubeId = match[1];
    }

    const created = await prisma.videoShadowingLesson.create({
      data: {
        title: data.title,
        youtubeId: cleanYoutubeId,
        level: (data.level || 'N3').toUpperCase(),
        topic: data.topic || 'Giao tiếp đời sống',
        category: (data.category || 'DAILY_LIFE').toUpperCase(),
        durationSeconds: data.durationSeconds || 0,
        thumbnailUrl: data.thumbnailUrl || `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`,
        description: data.description || '',
        isPublic: true,
        subtitles: {
          createMany: { data: data.subtitles.map((s, idx) => ({
            orderIndex: s.orderIndex ?? (idx + 1),
            startTimeMs: s.startTimeMs,
            endTimeMs: s.endTimeMs,
            japanese: s.japanese,
            furigana: s.furigana || null,
            romaji: s.romaji || null,
            vietnamese: s.vietnamese,
            keyWords: s.keyWords ? JSON.stringify(s.keyWords) : null,
            grammarNotes: s.grammarNotes ? JSON.stringify(s.grammarNotes) : null
          }))
          } }
      },
      include: {
        subtitles: { orderBy: { orderIndex: 'asc' } }
      }
    });

    // Xóa cache danh sách để người học thấy ngay bài mới
    l1Cache.clear();

    return created;
  }

  /**
   * Tối ưu xử lý khi người dùng nhập link YouTube tiếng Nhật:
   * 1. Trích xuất ID và kiểm tra CSDL (nếu đã có -> trả về ngay < 2ms)
   * 2. Gọi oEmbed lấy Title, Channel/Author, Thumbnail
   * 3. Sử dụng Gemini AI bóc tách / tạo cấu trúc phụ đề mili-giây chuẩn cho Shadowing
   * 4. Lưu MySQL với Transaction quan hệ 1-N (Lesson + Subtitles)
   * 5. Ghi Cache Redis và L1, trả về lesson sẵn sàng học ngay
   */
  static async processYouTubeUrl(params: {
    url: string;
    level?: string;
    category?: string;
    rawTranscript?: RawTranscriptSnippet[];
    srtContent?: string;
    autoSync?: boolean;
    forceRefresh?: boolean;
  }) {
    let cleanYoutubeId = params.url.trim();
    const match = cleanYoutubeId.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) {
      cleanYoutubeId = match[1];
    } else if (cleanYoutubeId.length === 11) {
      // Direct YouTube ID
    } else {
      throw new Error(
        'Đường dẫn YouTube không hợp lệ. Vui lòng dán link video dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/...'
      );
    }

    // 1. Kiểm tra CSDL: Nếu đã có bài học với >= 10 câu phụ đề, trả về ngay lập tức
    const existing = await prisma.videoShadowingLesson.findFirst({
      where: { youtubeId: cleanYoutubeId },
      include: {
        _count: { select: { subtitles: true } }
      }
    });

    if (existing && existing._count.subtitles >= 20 && !params.srtContent && !params.forceRefresh) {
      console.log(`[Fast-Path] Lesson ${cleanYoutubeId} already exists with ${existing._count.subtitles} subtitles. Returning directly.`);
      return this.getLessonDetail(existing.id);
    }

    // 2. Lấy thông tin metadata qua oEmbed API của YouTube (< 200ms)
    let oEmbedTitle = 'Video Luyện Nghe Tiếng Nhật';
    let authorName = 'YouTube Creator';
    let thumbnailUrl = `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`;

    try {
      const oEmbedRes = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanYoutubeId}&format=json`,
        { timeout: 4000 }
      );
      if (oEmbedRes.data) {
        oEmbedTitle = oEmbedRes.data.title || oEmbedTitle;
        authorName = oEmbedRes.data.author_name || authorName;
        thumbnailUrl = oEmbedRes.data.thumbnail_url || thumbnailUrl;
      }
    } catch (err) {
      console.warn('oEmbed fetch warning:', (err as any)?.message);
    }

    const level = (params.level || 'N3').toUpperCase();

    // 3. FAST-PATH: Thu thập toàn bộ transcript thật từ YouTube hoặc dữ liệu SRT/VTT
    let rawSnippets: RawTranscriptSnippet[] = [];

    if (params.rawTranscript && Array.isArray(params.rawTranscript) && params.rawTranscript.length > 0) {
      console.log(`[Fast-Path] Using client-provided raw transcript: ${params.rawTranscript.length} snippets`);
      rawSnippets = params.rawTranscript;
    } else if (params.srtContent && params.srtContent.trim()) {
      console.log(`[Fast-Path] Parsing user-provided SRT/VTT content...`);
      rawSnippets = TranscriptParserService.parseSrtOrVtt(params.srtContent);
    } else {
      console.log(`[Fast-Path] Fetching YouTube transcript for ${cleanYoutubeId}...`);
      const fetchRes = await TranscriptParserService.fetchYouTubeTranscript(cleanYoutubeId);
        rawSnippets = fetchRes.snippets;
        
        // AUTO-SYNC: If requested, subtract 1500ms from Auto-Generated captions
        if (params.autoSync && fetchRes.isGenerated) {
            rawSnippets = rawSnippets.map(s => ({
                ...s,
                startMs: Math.max(0, s.startMs - 1500),
                endMs: Math.max(100, s.endMs - 1500)
            }));
            console.log("[Fast-Path] Auto-Synced YouTube Auto CC by -1500ms");
        }
    }

    let subtitlesData: any[] = [];

    // 4. Phân tích ngữ pháp, ghép câu tự nhiên và gắn Furigana siêu tốc bằng Kuromoji (< 100ms)
    if (rawSnippets.length > 0) {
      console.log(`[Fast-Path] Processing ${rawSnippets.length} raw snippets with local Kuromoji engine...`);
      subtitlesData = await TranscriptParserService.enrichTranscript(rawSnippets);
      console.log(`[Fast-Path] Generated ${subtitlesData.length} complete, continuous sentences!`);
    }

    // 5. Removed AI fallback - AI cannot transcribe videos from title. If no transcript, we fail immediately.

    // 6. Nếu hoàn toàn không thể lấy được phụ đề, thông báo rõ ràng cho học viên
    if (subtitlesData.length === 0) {
      throw new Error(
        'Video YouTube này không có phụ đề tiếng Nhật (CC) tự động. Vui lòng dán nội dung tệp .srt / .vtt hoặc chọn video có phụ đề tiếng Nhật để học tập.'
      );
    }

    // 7. Xóa dữ liệu cũ nếu đã tồn tại bản ghi chưa đầy đủ
    if (existing) {
      await prisma.videoSubtitle.deleteMany({ where: { lessonId: existing.id } });
      await prisma.videoShadowingLesson.delete({ where: { id: existing.id } });
    }

    // 8. Lưu bài học hoàn chỉnh vào MySQL trong 1 transaction (hỗ trợ video 50p = 3000s)
    const lastSubEndTime = subtitlesData[subtitlesData.length - 1]?.endTimeMs || 30000;
    const durationSeconds = Math.max(60, Math.ceil(lastSubEndTime / 1000) + 10);

    const createdLesson = await this.createLesson({
      title: oEmbedTitle,
      youtubeId: cleanYoutubeId,
      level,
      category: params.category || 'Văn Hóa & Đời Sống',
      topic: 'Luyện nghe & Shadowing',
      durationSeconds,
      thumbnailUrl,
      description: `Bài học trích xuất tự động từ video YouTube của kênh "${authorName}". Hỗ trợ đầy đủ ${subtitlesData.length} câu phụ đề tiếng Nhật, Furigana và nhịp đọc chuẩn.`,
      subtitles: subtitlesData
    });

    return this.getLessonDetail(createdLesson.id);
  }

  /**
   * Tra cứu từ vựng & ngữ pháp tức thì theo phong cách Corodomo (On-demand)
   */
  static async explainWord(word: string, contextSentence?: string) {
    const tokenizer = await TranscriptParserService.getTokenizer();
    const tokens = tokenizer.tokenize(word);
    const mainToken = tokens[0] || {};
    
    return {
      word,
      reading: mainToken.reading ? kataToHira(mainToken.reading) : word,
      pos: mainToken.pos || 'Từ vựng',
      posDetail: mainToken.pos_detail_1 || '',
      basicForm: mainToken.basic_form !== '*' ? mainToken.basic_form : word
    };
  }
}
