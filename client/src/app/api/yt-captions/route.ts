import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface RawSnippet {
  startMs: number;
  endMs: number;
  text: string;
}

function parseWebVttOrXml(content: string): RawSnippet[] {
  if (!content) return [];

  // 1. Try XML (<text start="..." dur="...">...</text>)
  if (content.includes('<text')) {
    const regex = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
    const rawXml: Array<{ startMs: number; durationMs: number; text: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(content)) !== null) {
      const startMs = Math.round(parseFloat(m[1]) * 1000);
      const durMs = Math.round(parseFloat(m[2] || '2.5') * 1000);
      const text = m[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      if (!text || /^(\[.*?\]|（.*?）|\(.*?\)|♪+)$/.test(text)) continue;
      rawXml.push({ startMs, durationMs: durMs, text });
    }
    return rawXml.map((ev, i) => {
      const nextStart = rawXml[i + 1]?.startMs;
      const rawEnd = ev.startMs + ev.durationMs;
      const endMs = nextStart ? Math.min(rawEnd, nextStart) : rawEnd;
      return {
        startMs: ev.startMs,
        endMs: Math.max(ev.startMs + 200, endMs),
        text: ev.text
      };
    });
  }

  // 2. Try WebVTT / SRT
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const snippets: RawSnippet[] = [];
  const timeRegex =
    /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;
  let cur: RawSnippet | null = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line === 'WEBVTT' || /^\d+$/.test(line)) {
      if (cur && cur.text) {
        snippets.push(cur);
        cur = null;
      }
      continue;
    }
    const match = line.match(timeRegex);
    if (match) {
      if (cur && cur.text) snippets.push(cur);
      const startMs =
        Number(match[1] || 0) * 3600000 +
        Number(match[2]) * 60000 +
        Number(match[3]) * 1000 +
        Number(match[4]);
      const endMs =
        Number(match[5] || 0) * 3600000 +
        Number(match[6]) * 60000 +
        Number(match[7]) * 1000 +
        Number(match[8]);
      cur = { startMs, endMs, text: '' };
    } else if (cur) {
      const clean = line.replace(/<[^>]+>/g, '').trim();
      if (clean && !/^(\[.*?\]|（.*?）|\(.*?\)|♪+)$/.test(clean)) {
        cur.text = cur.text ? `${cur.text} ${clean}` : clean;
      }
    }
  }
  if (cur && cur.text) snippets.push(cur);
  return snippets;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('v') || '';
  let youtubeId = rawUrl.trim();
  const match = youtubeId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (match && match[1]) {
    youtubeId = match[1];
  }

  if (!youtubeId || youtubeId.length !== 11) {
    return NextResponse.json({ success: false, snippets: [] }, { status: 400 });
  }

  let cookieHeader = '';
  let apiKey = '';
  let videoDetails: any = undefined;

  // 1. Lấy INNERTUBE_API_KEY và Session Cookies từ trang Watch
  try {
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${youtubeId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8'
      }
    });
    const setCookies = (watchRes.headers as any).getSetCookie
      ? (watchRes.headers as any).getSetCookie()
      : [];
    cookieHeader = setCookies.map((c: string) => c.split(';')[0]).join('; ');
    const html = await watchRes.text();
    const keyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
    if (keyMatch && keyMatch[1]) {
      apiKey = keyMatch[1];
    }
  } catch {}

  // 2. Gọi Innertube Player API (ANDROID -> IOS)
  const clients = [
    { clientName: 'ANDROID', clientVersion: '20.10.38' },
    { clientName: 'IOS', clientVersion: '20.10.4' }
  ];

  let captionTracks: any[] = [];
  for (const client of clients) {
    try {
      const playerUrl = apiKey
        ? `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`
        : 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
      const playerRes = await fetch(playerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {})
        },
        body: JSON.stringify({
          context: { client },
          videoId: youtubeId
        })
      });
      const playerData: any = await playerRes.json();
      if (playerData?.videoDetails && !videoDetails) {
        videoDetails = {
          title: playerData.videoDetails.title,
          shortDescription: playerData.videoDetails.shortDescription,
          lengthSeconds: Number(playerData.videoDetails.lengthSeconds) || undefined,
          author: playerData.videoDetails.author
        };
      }
      const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks) && tracks.length > 0) {
        captionTracks = tracks;
        break;
      }
    } catch {}
  }

  if (captionTracks.length > 0) {
    const manualJa = captionTracks.find(
      (t: any) => t.languageCode?.startsWith('ja') && t.kind !== 'asr'
    );
    const asrJa = captionTracks.find(
      (t: any) => t.languageCode?.startsWith('ja') && t.kind === 'asr'
    );
    const translatableTrack = captionTracks.find((t: any) => t.isTranslatable);
    const selected = manualJa || asrJa || translatableTrack;

    if (selected && selected.baseUrl) {
      const isGenerated = selected.kind === 'asr' || (!manualJa && !asrJa);
      let cleanBaseUrl = String(selected.baseUrl).replace('&fmt=srv3', '');
      if (!manualJa && !asrJa && translatableTrack) {
        cleanBaseUrl += '&tlang=ja';
      }

      // 2a. JSON3
      try {
        const json3Url = cleanBaseUrl.includes('fmt=')
          ? cleanBaseUrl.replace(/fmt=[^&]+/, 'fmt=json3')
          : `${cleanBaseUrl}&fmt=json3`;
        const jRes = await fetch(json3Url, {
          headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) }
        });
        if (jRes.ok) {
          const jData: any = await jRes.json();
          if (jData && Array.isArray(jData.events)) {
            const rawEvents: Array<{ startMs: number; durationMs: number; text: string }> = [];
            for (const ev of jData.events) {
              if (!ev.segs || typeof ev.tStartMs !== 'number') continue;
              const text = ev.segs
                .map((s: any) => s.utf8 || '')
                .join('')
                .replace(/\n+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (!text || /^(\[.*?\]|（.*?）|\(.*?\)|♪+)$/.test(text)) continue;
              rawEvents.push({
                startMs: ev.tStartMs,
                durationMs: ev.dDurationMs || 2500,
                text
              });
            }
            const snippets: RawSnippet[] = rawEvents.map((ev, i) => {
              const nextStart = rawEvents[i + 1]?.startMs;
              const rawEnd = ev.startMs + ev.durationMs;
              const endMs = nextStart ? Math.min(rawEnd, nextStart) : rawEnd;
              return {
                startMs: ev.startMs,
                endMs: Math.max(ev.startMs + 200, endMs),
                text: ev.text
              };
            });
            if (snippets.length > 0) {
              return NextResponse.json({
                success: true,
                isGenerated,
                snippets,
                videoDetails
              });
            }
          }
        }
      } catch {}

      // 2b. XML
      try {
        const xmlRes = await fetch(cleanBaseUrl, {
          headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) }
        });
        if (xmlRes.ok) {
          const xml = await xmlRes.text();
          const snippets = parseWebVttOrXml(xml);
          if (snippets.length > 0) {
            return NextResponse.json({
              success: true,
              isGenerated,
              snippets,
              videoDetails
            });
          }
        }
      } catch {}
    }
  }

  // 3. Fallback qua cụm Invidious / Piped Public Caption Mirrors
  const mirrors = [
    'https://inv.nadeko.net',
    'https://yewtu.be',
    'https://invidious.nerdvpn.de'
  ];
  for (const host of mirrors) {
    try {
      const listRes = await fetch(`${host}/api/v1/captions/${youtubeId}`);
      if (!listRes.ok) continue;
      const listData: any = await listRes.json();
      const caps = listData?.captions || [];
      const jaCap =
        caps.find((c: any) => c.languageCode?.startsWith('ja') && !c.label?.includes('auto')) ||
        caps.find((c: any) => c.languageCode?.startsWith('ja'));
      if (jaCap && jaCap.url) {
        const vttRes = await fetch(`${host}${jaCap.url}`);
        if (vttRes.ok) {
          const vtt = await vttRes.text();
          const snippets = parseWebVttOrXml(vtt);
          if (snippets.length > 0) {
            return NextResponse.json({
              success: true,
              isGenerated: Boolean(jaCap.label?.includes('auto')),
              snippets,
              videoDetails
            });
          }
        }
      }
    } catch {}
  }

  return NextResponse.json({
    success: false,
    isGenerated: false,
    snippets: [],
    videoDetails
  });
}
