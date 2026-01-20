import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ttsCache } from '../../services/ttsCache';

/**
 * Tests for TTSCache class functionality.
 *
 * Note: Tests for generateTTSAudio and preloadTTSAudios require
 * complex mocking of the @google/genai module which is challenging
 * in the current Vitest setup. Those functions should be tested
 * via integration tests or manual testing.
 */
describe('services/ttsCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    ttsCache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('TTSCache class', () => {
    it('should return null for non-existent cache entry', () => {
      const result = ttsCache.get('non-existent text');
      expect(result).toBeNull();
    });

    it('should store and retrieve audio buffer', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const mockBuffer = ctx.createBuffer(1, 100, 24000);

      ttsCache.set('test text', mockBuffer);
      const result = ttsCache.get('test text');

      expect(result).toBe(mockBuffer);
    });

    it('should return null for expired cache entry', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const mockBuffer = ctx.createBuffer(1, 100, 24000);

      ttsCache.set('test text', mockBuffer);

      // Advance time beyond cache duration (30 minutes)
      vi.advanceTimersByTime(31 * 60 * 1000);

      const result = ttsCache.get('test text');
      expect(result).toBeNull();
    });

    it('should keep cache entry within duration', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const mockBuffer = ctx.createBuffer(1, 100, 24000);

      ttsCache.set('test text', mockBuffer);

      // Advance time but stay within cache duration
      vi.advanceTimersByTime(29 * 60 * 1000);

      const result = ttsCache.get('test text');
      expect(result).toBe(mockBuffer);
    });

    it('should clear all cache entries', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const mockBuffer = ctx.createBuffer(1, 100, 24000);

      ttsCache.set('text1', mockBuffer);
      ttsCache.set('text2', mockBuffer);

      ttsCache.clear();

      expect(ttsCache.get('text1')).toBeNull();
      expect(ttsCache.get('text2')).toBeNull();
    });

    it('should cleanup old entries', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const mockBuffer = ctx.createBuffer(1, 100, 24000);

      ttsCache.set('old text', mockBuffer);

      // Advance time beyond cache duration
      vi.advanceTimersByTime(31 * 60 * 1000);

      // Add new entry
      ttsCache.set('new text', mockBuffer);

      // Cleanup should remove old entries
      ttsCache.cleanup();

      expect(ttsCache.get('old text')).toBeNull();
      expect(ttsCache.get('new text')).toBe(mockBuffer);
    });

    it('should handle multiple cache entries independently', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const buffer1 = ctx.createBuffer(1, 100, 24000);
      const buffer2 = ctx.createBuffer(1, 200, 24000);
      const buffer3 = ctx.createBuffer(1, 300, 24000);

      ttsCache.set('text1', buffer1);
      ttsCache.set('text2', buffer2);
      ttsCache.set('text3', buffer3);

      expect(ttsCache.get('text1')).toBe(buffer1);
      expect(ttsCache.get('text2')).toBe(buffer2);
      expect(ttsCache.get('text3')).toBe(buffer3);
    });

    it('should overwrite existing cache entry with same key', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const buffer1 = ctx.createBuffer(1, 100, 24000);
      const buffer2 = ctx.createBuffer(1, 200, 24000);

      ttsCache.set('text', buffer1);
      expect(ttsCache.get('text')).toBe(buffer1);

      ttsCache.set('text', buffer2);
      expect(ttsCache.get('text')).toBe(buffer2);
    });

    it('should update timestamp when overwriting entry', () => {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const buffer1 = ctx.createBuffer(1, 100, 24000);
      const buffer2 = ctx.createBuffer(1, 200, 24000);

      ttsCache.set('text', buffer1);

      // Advance time 20 minutes
      vi.advanceTimersByTime(20 * 60 * 1000);

      // Overwrite with new buffer
      ttsCache.set('text', buffer2);

      // Advance time 20 more minutes (total 40 from first set, 20 from second)
      vi.advanceTimersByTime(20 * 60 * 1000);

      // Should still be valid because it was reset with the second set
      expect(ttsCache.get('text')).toBe(buffer2);

      // Advance time beyond the new entry's cache duration
      vi.advanceTimersByTime(15 * 60 * 1000);

      // Now it should be expired
      expect(ttsCache.get('text')).toBeNull();
    });
  });
});
