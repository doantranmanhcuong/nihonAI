import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface VttCue {
  startMs: number;
  endMs: number;
  text: string;
}

function parseVttTimestamp(ts: string): number {
  const m = ts.trim().match(/(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{3})/);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2], 10);
  const sec = parseInt(m[3], 10);
  const ms = parseInt(m[4], 10);
  return ((h * 3600 + min * 60 + sec) * 1000) + ms;
}

function parseVttCues(vttContent: string): VttCue[] {
  const cues: VttCue[] = [];
  const blocks = vttContent.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const arrowIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowIdx === -1) continue;
    const [rawStart, rawEnd] = lines[arrowIdx].split('-->');
    if (!rawStart || !rawEnd) continue;
    const text = lines.slice(arrowIdx + 1).join(' ').trim();
    cues.push({
      startMs: parseVttTimestamp(rawStart),
      endMs: parseVttTimestamp(rawEnd),
      text
    });
  }
  return cues;
}

function normalizeForMatch(s: string): string {
  return (s || '')
    .replace(/【\/?下線】/g, '')
    .replace(/[\s　、。！？「」『』・（）().,!?…]/g, '');
}

export class TtsService {
  private static edgeTtsAvailable: boolean | null = null;

  /**
   * Ước lượng thời lượng phát âm theo số phách âm Mora chuẩn xác (~145ms/mora + nhịp ngắt câu)
   */
  static estimateSentenceTimings(sentencesJp: string[]): { startTimeMs: number; endTimeMs: number }[] {
    const timings: { startTimeMs: number; endTimeMs: number }[] = [];
    let offsetMs = 0;

    for (const raw of sentencesJp) {
      const clean = (raw || '').replace(/【\/?下線】/g, '').trim();
      const kanaMoras = (clean.match(/[ぁ-んァ-ン][ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]?|[ーっッ]/g) || []).length;
      const kanjiCount = (clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []).length;
      // Mỗi chữ Kanji đọc trung bình ~2.05 mora
      const estMoras = Math.max(2, kanaMoras + Math.round(kanjiCount * 2.05));
      const commas = (clean.match(/[、,]/g) || []).length;
      const ends = (clean.match(/[。!?！？]/g) || []).length;
      const durMs = Math.max(1800, Math.round(estMoras * 148 + commas * 280 + ends * 380));

      timings.push({ startTimeMs: offsetMs, endTimeMs: offsetMs + durMs });
      offsetMs += durMs;
    }

    return timings;
  }

  /**
   * Căn chỉnh danh sách VTT cue trả về từ Edge-TTS khớp chính xác từng câu tiếng Nhật
   */
  private static alignCuesToSentences(
    sentencesJp: string[],
    cues: VttCue[]
  ): { startTimeMs: number; endTimeMs: number }[] {
    if (cues.length === 0) {
      return this.estimateSentenceTimings(sentencesJp);
    }

    const totalAudioEndMs = cues[cues.length - 1].endMs;
    const sentLengths = sentencesJp.map((s) => Math.max(1, normalizeForMatch(s).length));
    const totalNormLen = sentLengths.reduce((a, b) => a + b, 0);

    // Nếu số lượng cues khớp hoặc gần khớp từng dòng (do truyền \n\n giữa các câu)
    const timings: { startTimeMs: number; endTimeMs: number }[] = [];
    let cueCursor = 0;

    for (let i = 0; i < sentencesJp.length; i++) {
      const targetNorm = normalizeForMatch(sentencesJp[i]);
      const targetLen = targetNorm.length;

      if (cueCursor >= cues.length) {
        const prevEnd = timings.length > 0 ? timings[timings.length - 1].endTimeMs : 0;
        const propDur = Math.max(1500, Math.round((sentLengths[i] / totalNormLen) * totalAudioEndMs));
        timings.push({ startTimeMs: prevEnd, endTimeMs: prevEnd + propDur });
        continue;
      }

      const startMs = cueCursor === 0 ? cues[0].startMs : Math.max(timings[i - 1]?.endTimeMs ?? 0, cues[cueCursor].startMs);
      let endMs = cues[cueCursor].endMs;
      let accCueText = normalizeForMatch(cues[cueCursor].text);
      cueCursor++;

      // Nếu 1 câu dài bị edge-tts tách thành nhiều VTT cues, gom các cues tiếp theo cho tới khi đủ độ dài câu
      while (
        cueCursor < cues.length &&
        accCueText.length < Math.max(4, Math.floor(targetLen * 0.72)) &&
        sentencesJp.length - i <= cues.length - cueCursor + 1
      ) {
        const nextNorm = normalizeForMatch(cues[cueCursor].text);
        if (i + 1 < sentencesJp.length) {
          const nextSentNorm = normalizeForMatch(sentencesJp[i + 1]);
          if (nextSentNorm && nextNorm && nextSentNorm.startsWith(nextNorm.slice(0, Math.min(6, nextNorm.length)))) {
            break;
          }
        }
        accCueText += nextNorm;
        endMs = cues[cueCursor].endMs;
        cueCursor++;
      }

      timings.push({
        startTimeMs: Math.min(startMs, endMs),
        endTimeMs: Math.max(startMs + 800, endMs)
      });
    }

    return timings;
  }

  /**
   * Sinh file âm thanh MP3 + phụ đề VTT trong 1 lượt chạy Single-Pass Edge-TTS (< 4s cho cả bài báo).
   * Trả về URL phục vụ qua API (/api/reading/audio/:id.mp3) kèm timestamp chính xác từng câu.
   */
  static async generateArticleAudio(
    articleId: string,
    sentencesJp: string[]
  ): Promise<{ audioUrl: string | null; timings: { startTimeMs: number; endTimeMs: number }[] }> {
    const cleanSentences = sentencesJp
      .map((s) => (s || '').replace(/【\/?下線】/g, '').trim())
      .filter(Boolean);

    if (cleanSentences.length === 0 || this.edgeTtsAvailable === false) {
      return {
        audioUrl: null,
        timings: this.estimateSentenceTimings(cleanSentences)
      };
    }

    const audioDir = path.resolve(__dirname, '../../../../client/public/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const outputMp3Path = path.join(audioDir, `${articleId}.mp3`);
    const tmpTxt = path.join(audioDir, `tmp_${articleId}.txt`);
    const tmpVtt = path.join(audioDir, `tmp_${articleId}.vtt`);

    try {
      // Ngăn cách câu bằng 2 dấu xuống dòng để Edge-TTS tạo ranh giới VTT cue theo từng câu
      await fs.promises.writeFile(tmpTxt, cleanSentences.join('\n\n'), 'utf8');

      await execAsync(
        `edge-tts -f "${tmpTxt}" --voice ja-JP-NanamiNeural --write-media "${outputMp3Path}" --write-subtitles "${tmpVtt}"`,
        {
          timeout: 25000,
          windowsHide: true
        }
      );

      let cues: VttCue[] = [];
      if (fs.existsSync(tmpVtt)) {
        const vttContent = await fs.promises.readFile(tmpVtt, 'utf8');
        cues = parseVttCues(vttContent);
      }

      if (fs.existsSync(outputMp3Path)) {
        const stat = await fs.promises.stat(outputMp3Path);
        if (stat.size > 512) {
          this.edgeTtsAvailable = true;
          return {
            audioUrl: `/api/reading/audio/${articleId}.mp3`,
            timings: this.alignCuesToSentences(cleanSentences, cues)
          };
        }
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[TtsService] Edge-TTS error for ${articleId}: ${msg}`);
      if (msg.includes('not found') || msg.includes('not recognized')) {
        this.edgeTtsAvailable = false;
      }
    } finally {
      try {
        if (fs.existsSync(tmpTxt)) await fs.promises.unlink(tmpTxt);
        if (fs.existsSync(tmpVtt)) await fs.promises.unlink(tmpVtt);
      } catch {}
    }

    return {
      audioUrl: null,
      timings: this.estimateSentenceTimings(cleanSentences)
    };
  }
}
