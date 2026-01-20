import { describe, it, expect } from 'vitest';
import { encode, decode, decodeAudioData, createBlob } from '../../utils/audio';

describe('utils/audio', () => {
  describe('encode', () => {
    it('should encode Uint8Array to base64 string', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = encode(input);
      expect(result).toBe('SGVsbG8=');
    });

    it('should handle empty array', () => {
      const input = new Uint8Array([]);
      const result = encode(input);
      expect(result).toBe('');
    });

    it('should encode binary data correctly', () => {
      const input = new Uint8Array([0, 127, 255]);
      const result = encode(input);
      expect(result).toBe('AH//');
    });
  });

  describe('decode', () => {
    it('should decode base64 string to Uint8Array', () => {
      const input = 'SGVsbG8='; // "Hello"
      const result = decode(input);
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should handle empty string', () => {
      const input = '';
      const result = decode(input);
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should decode binary data correctly', () => {
      const input = 'AH//';
      const result = decode(input);
      expect(result).toEqual(new Uint8Array([0, 127, 255]));
    });
  });

  describe('encode/decode round trip', () => {
    it('should return original data after encode then decode', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 100, 200, 255]);
      const encoded = encode(original);
      const decoded = decode(encoded);
      expect(decoded).toEqual(original);
    });

    it('should handle PCM audio-like data', () => {
      // Simulate PCM audio data (Int16)
      const int16Data = new Int16Array([0, 16384, 32767, -32768, -16384]);
      const uint8Data = new Uint8Array(int16Data.buffer);
      const encoded = encode(uint8Data);
      const decoded = decode(encoded);
      expect(decoded).toEqual(uint8Data);
    });
  });

  describe('decodeAudioData', () => {
    it('should convert Int16 PCM data to AudioBuffer', async () => {
      // Create mock Int16 PCM data (4 samples, mono)
      const int16Data = new Int16Array([0, 16384, 32767, -32768]);
      const uint8Data = new Uint8Array(int16Data.buffer);

      // Create a mock AudioContext
      const ctx = new AudioContext({ sampleRate: 24000 });

      const buffer = await decodeAudioData(uint8Data, ctx, 24000, 1);

      expect(buffer.numberOfChannels).toBe(1);
      expect(buffer.length).toBe(4);
      expect(buffer.sampleRate).toBe(24000);

      const channelData = buffer.getChannelData(0);
      // Check conversion: Int16 / 32768.0 = Float32
      expect(channelData[0]).toBeCloseTo(0, 5);
      expect(channelData[1]).toBeCloseTo(16384 / 32768.0, 5);
      expect(channelData[2]).toBeCloseTo(32767 / 32768.0, 5);
      expect(channelData[3]).toBeCloseTo(-32768 / 32768.0, 5);
    });

    it('should handle stereo audio data', async () => {
      // Create stereo data (2 samples per channel, interleaved)
      const int16Data = new Int16Array([1000, 2000, 3000, 4000]);
      const uint8Data = new Uint8Array(int16Data.buffer);

      const ctx = new AudioContext({ sampleRate: 24000 });

      const buffer = await decodeAudioData(uint8Data, ctx, 24000, 2);

      expect(buffer.numberOfChannels).toBe(2);
      expect(buffer.length).toBe(2); // 4 samples / 2 channels = 2 frames
    });
  });

  describe('createBlob', () => {
    it('should create Blob from Float32Array', () => {
      const input = new Float32Array([0, 0.5, 1.0, -0.5, -1.0]);
      const result = createBlob(input);

      expect(result.mimeType).toBe('audio/pcm;rate=16000');
      expect(typeof result.data).toBe('string');
      // Verify it's valid base64
      expect(() => decode(result.data)).not.toThrow();
    });

    it('should convert Float32 to Int16 correctly', () => {
      const input = new Float32Array([0, 0.5, 1.0, -0.5, -1.0]);
      const result = createBlob(input);

      // Decode and check values
      const decoded = decode(result.data);
      const int16Data = new Int16Array(decoded.buffer);

      // 0 -> 0
      expect(int16Data[0]).toBe(0);
      // 0.5 (positive) -> 0.5 * 32767 = 16383.5 -> 16383
      expect(int16Data[1]).toBeCloseTo(16383, 0);
      // 1.0 (positive) -> 1.0 * 32767 = 32767
      expect(int16Data[2]).toBe(32767);
      // -0.5 (negative) -> -0.5 * 32768 = -16384
      expect(int16Data[3]).toBe(-16384);
      // -1.0 (negative) -> -1.0 * 32768 = -32768
      expect(int16Data[4]).toBe(-32768);
    });

    it('should handle empty array', () => {
      const input = new Float32Array([]);
      const result = createBlob(input);

      expect(result.mimeType).toBe('audio/pcm;rate=16000');
      expect(result.data).toBe('');
    });
  });
});
