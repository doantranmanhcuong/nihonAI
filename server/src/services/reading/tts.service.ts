import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class TtsService {
  /**
   * Sinh file âm thanh MP3 từ danh sách câu tiếng Nhật qua Edge-TTS,
   * ghép nối file âm thanh và trả về mốc thời gian (startTimeMs, endTimeMs) cho từng câu.
   * Xử lý bất đồng bộ (Non-blocking), có cơ chế Circuit Breaker (ngắt sớm khi lỗi mạng)
   * để không bao giờ làm nghẽn Event Loop của Node.js API Gateway.
   */
  static async generateArticleAudio(
    articleId: string, 
    sentencesJp: string[]
  ): Promise<{ audioUrl: string | null; timings: { startTimeMs: number; endTimeMs: number }[] }> {
    const tmpDir = path.join(__dirname, '../../../../client/public/audio');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const outputMp3Path = path.join(tmpDir, `${articleId}.mp3`);
    const timings: { startTimeMs: number; endTimeMs: number }[] = [];
    let finalMp3Buffer = Buffer.alloc(0);
    let currentOffsetMs = 0;
    let consecutiveFailures = 0;
    let ttsAvailable = true;

    for (let i = 0; i < sentencesJp.length; i++) {
      const sentence = sentencesJp[i];
      const estimatedDurationMs = Math.max(2000, sentence.length * 250);

      // Nếu TTS đã bị lỗi liên tiếp (mạng chặn, rate limit, thiếu CLI), ngắt gọi TTS để tránh nghẽn
      if (!ttsAvailable) {
        timings.push({
          startTimeMs: currentOffsetMs,
          endTimeMs: currentOffsetMs + estimatedDurationMs
        });
        currentOffsetMs += estimatedDurationMs;
        continue;
      }

      const tmpTxt = path.join(tmpDir, `tmp_${articleId}_${i}.txt`);
      const tmpMp3 = path.join(tmpDir, `tmp_${articleId}_${i}.mp3`);
      const tmpVtt = path.join(tmpDir, `tmp_${articleId}_${i}.vtt`);

      try {
        await fs.promises.writeFile(tmpTxt, sentence, 'utf8');

        // Gọi edge-tts bất đồng bộ không chặn Event Loop, timeout tối đa 8s
        await execAsync(`edge-tts -f "${tmpTxt}" --voice ja-JP-NanamiNeural --write-media "${tmpMp3}" --write-subtitles "${tmpVtt}"`, {
          timeout: 8000,
          windowsHide: true
        });

        let durationMs = estimatedDurationMs;
        if (fs.existsSync(tmpVtt)) {
          const vttContent = await fs.promises.readFile(tmpVtt, 'utf8');
          const matches = [...vttContent.matchAll(/--> \d\d:\d\d:(\d\d),(\d\d\d)/g)];
          if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const endSec = parseInt(lastMatch[1], 10);
            const endMs = parseInt(lastMatch[2], 10);
            durationMs = (endSec * 1000) + endMs;
          }
        }

        if (fs.existsSync(tmpMp3)) {
          const mp3Buffer = await fs.promises.readFile(tmpMp3);
          if (mp3Buffer.length > 0) {
            finalMp3Buffer = Buffer.concat([finalMp3Buffer, mp3Buffer]);
            consecutiveFailures = 0; // Reset đếm lỗi khi thành công
          }
        }

        timings.push({
          startTimeMs: currentOffsetMs,
          endTimeMs: currentOffsetMs + durationMs
        });
        currentOffsetMs += durationMs;

      } catch (err: any) {
        consecutiveFailures++;
        console.warn(`[TtsService] Cảnh báo sinh audio câu ${i} (${consecutiveFailures}/2 lỗi): ${err?.message || err}`);

        timings.push({
          startTimeMs: currentOffsetMs,
          endTimeMs: currentOffsetMs + estimatedDurationMs
        });
        currentOffsetMs += estimatedDurationMs;

        // Circuit breaker: Nếu lỗi 2 lần liên tiếp, dừng toàn bộ gọi edge-tts cho bài này
        if (consecutiveFailures >= 2) {
          ttsAvailable = false;
          console.warn(`[TtsService] Edge-TTS gặp sự cố liên tiếp. Kích hoạt Circuit Breaker, tự động chuyển sang tính toán mốc thời gian ước lượng cho các câu còn lại.`);
        }
      } finally {
        try {
          if (fs.existsSync(tmpTxt)) await fs.promises.unlink(tmpTxt);
          if (fs.existsSync(tmpMp3)) await fs.promises.unlink(tmpMp3);
          if (fs.existsSync(tmpVtt)) await fs.promises.unlink(tmpVtt);
        } catch {}
      }
    }

    // Chỉ lưu file MP3 nếu có dữ liệu âm thanh hợp lệ (tránh sinh file 0-byte làm hỏng player)
    if (finalMp3Buffer.length > 0) {
      await fs.promises.writeFile(outputMp3Path, finalMp3Buffer);
      return {
        audioUrl: `/audio/${articleId}.mp3`,
        timings
      };
    }

    return {
      audioUrl: null,
      timings
    };
  }
}
