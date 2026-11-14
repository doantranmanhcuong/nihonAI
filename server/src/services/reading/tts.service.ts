import * as fs from 'fs';
import * as path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

interface SentenceCue {
  startMs: number;
  endMs: number;
  text: string;
}

function escapeXmlForSsml(input: string): string {
  return (input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeForMatch(s: string): string {
  return (s || '')
    .replace(/【\/?下線】/g, '')
    .replace(/[\s　、。！？「」『』・（）().,!?…]/g, '');
}

function parseBoundaryMetadataChunk(
  rawText: string,
  cues: SentenceCue[]
): string {
  let carry = rawText;
  const parts = carry.split(/(?<=})\s*(?={"Metadata")/);
  carry = parts.pop() || '';

  const tryExtract = (jsonStr: string): boolean => {
    try {
      const obj = JSON.parse(jsonStr);
      for (const m of obj?.Metadata || []) {
        if (m?.Type === 'SentenceBoundary' && m?.Data) {
          const startMs = Math.round((m.Data.Offset || 0) / 10000);
          const durMs = Math.round((m.Data.Duration || 0) / 10000);
          cues.push({
            startMs,
            endMs: startMs + durMs,
            text: m.Data.text?.Text || ''
          });
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  for (const part of parts) {
    tryExtract(part);
  }
  if (carry.trim().endsWith('}') && tryExtract(carry)) {
    return '';
  }
  return carry;
}

export class TtsService {
  /**
   * Ước lượng thời lượng phát âm theo số phách âm Mora chuẩn xác (~148ms/mora + nhịp ngắt câu)
   */
  static estimateSentenceTimings(sentencesJp: string[]): { startTimeMs: number; endTimeMs: number }[] {
    const timings: { startTimeMs: number; endTimeMs: number }[] = [];
    let offsetMs = 0;

    for (const raw of sentencesJp) {
      const clean = (raw || '').replace(/【\/?下線】/g, '').trim();
      const kanaMoras = (clean.match(/[ぁ-んァ-ン][ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]?|[ーっッ]/g) || []).length;
      const kanjiCount = (clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []).length;
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
   * Căn chỉnh danh sách SentenceBoundary cue trả về từ Edge-TTS khớp chính xác từng câu tiếng Nhật
   */
  private static alignCuesToSentences(
    sentencesJp: string[],
    cues: SentenceCue[]
  ): { startTimeMs: number; endTimeMs: number }[] {
    if (cues.length === 0) {
      return this.estimateSentenceTimings(sentencesJp);
    }

    const totalAudioEndMs = cues[cues.length - 1].endMs;
    const sentLengths = sentencesJp.map((s) => Math.max(1, normalizeForMatch(s).length));
    const totalNormLen = sentLengths.reduce((a, b) => a + b, 0);

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

      // Nếu 1 câu dài bị tách thành nhiều boundary cues, gom các cues tiếp theo cho tới khi đủ độ dài câu
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
   * Sinh file âm thanh MP3 + timestamp từng câu bằng msedge-tts thuần Node.js (không cần CLI Python trên Render/Linux).
   * Trả về URL phục vụ qua API (/api/reading/audio/:id.mp3) kèm timings đồng bộ từng câu.
   */
  static async generateArticleAudio(
    articleId: string,
    sentencesJp: string[]
  ): Promise<{ audioUrl: string | null; timings: { startTimeMs: number; endTimeMs: number }[] }> {
    const cleanSentences = sentencesJp
      .map((s) => (s || '').replace(/【\/?下線】/g, '').trim())
      .filter(Boolean);

    if (cleanSentences.length === 0) {
      return {
        audioUrl: null,
        timings: []
      };
    }

    const audioDir = path.resolve(__dirname, '../../../../client/public/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const outputMp3Path = path.join(audioDir, `${articleId}.mp3`);
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 12000,
      synthesisTimeoutMs: 30000
    });

    try {
      await tts.setMetadata(
        'ja-JP-NanamiNeural',
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
        {
          sentenceBoundaryEnabled: true,
          wordBoundaryEnabled: false
        }
      );

      const ssmlSafeInput = cleanSentences.map(escapeXmlForSsml).join('\n\n');
      const { audioStream, metadataStream } = tts.toStream(ssmlSafeInput);

      const audioChunks: Buffer[] = [];
      const cues: SentenceCue[] = [];
      let metaCarry = '';

      audioStream.on('data', (chunk: Buffer) => {
        audioChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      if (metadataStream) {
        metadataStream.on('data', (chunk: Buffer) => {
          metaCarry = parseBoundaryMetadataChunk(
            metaCarry + chunk.toString('utf8'),
            cues
          );
        });
      }

      await new Promise<void>((resolve, reject) => {
        audioStream.once('end', resolve);
        audioStream.once('error', reject);
      });

      if (metaCarry.trim()) {
        parseBoundaryMetadataChunk(metaCarry, cues);
      }

      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length > 512) {
        await fs.promises.writeFile(outputMp3Path, audioBuffer);
        return {
          audioUrl: `/api/reading/audio/${articleId}.mp3`,
          timings: this.alignCuesToSentences(cleanSentences, cues)
        };
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[TtsService] msedge-tts error for ${articleId}: ${msg}`);
    } finally {
      try {
        tts.close();
      } catch {}
    }

    return {
      audioUrl: null,
      timings: this.estimateSentenceTimings(cleanSentences)
    };
  }
}
