
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audio';

interface CachedAudio {
  audioBuffer: AudioBuffer;
  timestamp: number;
}

class TTSCache {
  private cache: Map<string, CachedAudio> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30분

  /**
   * 캐시에서 오디오 버퍼 가져오기
   */
  get(text: string): AudioBuffer | null {
    const cached = this.cache.get(text);
    if (!cached) return null;

    // 캐시가 만료되었는지 확인
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(text);
      return null;
    }

    return cached.audioBuffer;
  }

  /**
   * 캐시에 오디오 버퍼 저장
   */
  set(text: string, audioBuffer: AudioBuffer): void {
    this.cache.set(text, {
      audioBuffer,
      timestamp: Date.now(),
    });
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 오래된 캐시 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

// 싱글톤 인스턴스
export const ttsCache = new TTSCache();

/**
 * TTS 오디오 생성 (캐시 활용)
 */
export async function generateTTSAudio(
  text: string,
  apiKey: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  // 캐시에서 먼저 확인
  const cached = ttsCache.get(text);
  if (cached) {
    console.log('TTS audio loaded from cache');
    return cached;
  }

  // 캐시에 없으면 API 호출
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data received from TTS API.");
  }

  const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);

  // 캐시에 저장
  ttsCache.set(text, audioBuffer);

  return audioBuffer;
}

/**
 * 여러 텍스트에 대한 TTS 오디오를 사전 로딩
 */
export async function preloadTTSAudios(
  texts: string[],
  apiKey: string,
  audioContext: AudioContext,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const promises = texts.map(async (text, index) => {
    try {
      await generateTTSAudio(text, apiKey, audioContext);
      if (onProgress) {
        onProgress(index + 1, texts.length);
      }
    } catch (error) {
      console.error(`Failed to preload TTS for text: ${text.substring(0, 50)}...`, error);
    }
  });

  await Promise.all(promises);
}
