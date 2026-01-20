import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, getUserFriendlyErrorMessage } from '../../utils/apiHelpers';

describe('utils/apiHelpers', () => {
  describe('retryWithBackoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, 3, 1000);

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);

      // Wait for delay (1000ms for first retry)
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after maxRetries attempts', async () => {
      // Use real timers for this test to avoid unhandled rejection issues
      vi.useRealTimers();

      const error = new Error('Persistent failure');
      const fn = vi.fn().mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Use very short delay for faster test execution
      await expect(retryWithBackoff(fn, 2, 1)).rejects.toThrow('Persistent failure');
      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries

      consoleSpy.mockRestore();

      // Restore fake timers for other tests
      vi.useFakeTimers();
    });

    it('should use exponential backoff delays', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValueOnce('success');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const promise = retryWithBackoff(fn, 3, 1000);

      // First attempt (immediate)
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // First retry after 1000ms (1000 * 2^0)
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Second retry after 2000ms (1000 * 2^1)
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(3);

      // Third retry after 4000ms (1000 * 2^2)
      await vi.advanceTimersByTimeAsync(4000);
      expect(fn).toHaveBeenCalledTimes(4);

      const result = await promise;
      expect(result).toBe('success');

      consoleSpy.mockRestore();
    });

    it('should use default parameters when not provided', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await retryWithBackoff(fn);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return API key invalid message for invalid key errors', () => {
      const error = new Error('API key not valid');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'API key가 유효하지 않습니다. API key를 확인해주세요.'
      );
    });

    it('should handle case-insensitive invalid api key message', () => {
      const error = new Error('invalid api key provided');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'API key가 유효하지 않습니다. API key를 확인해주세요.'
      );
    });

    it('should return permission denied message for 403 errors', () => {
      const error = new Error('Request failed with status 403');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'API 접근 권한이 없습니다. API key 권한을 확인해주세요.'
      );
    });

    it('should return quota exceeded message for 429 errors', () => {
      const error = new Error('429 Too Many Requests');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      );
    });

    it('should return quota exceeded message for quota errors', () => {
      const error = new Error('quota exceeded for the model');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      );
    });

    it('should return network error message for network errors', () => {
      const error = new Error('network error occurred');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        '네트워크 연결이 원활하지 않습니다. 안정적인 Wi-Fi 환경을 권장합니다.'
      );
    });

    it('should return network error message for fetch errors', () => {
      const error = new Error('fetch failed');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        '네트워크 연결이 원활하지 않습니다. 안정적인 Wi-Fi 환경을 권장합니다.'
      );
    });

    it('should return timeout message for timeout errors', () => {
      const error = new Error('Request timeout after 30s');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        '요청 시간이 초과되었습니다. 다시 시도해주세요.'
      );
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Something unexpected happened');
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'AI 서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.'
      );
    });

    it('should handle error objects without message property', () => {
      const error = { code: 500 };
      expect(getUserFriendlyErrorMessage(error)).toBe(
        'AI 서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.'
      );
    });

    it('should handle string errors', () => {
      expect(getUserFriendlyErrorMessage('API key not valid')).toBe(
        'API key가 유효하지 않습니다. API key를 확인해주세요.'
      );
    });

    it('should handle null/undefined errors', () => {
      expect(getUserFriendlyErrorMessage(null)).toBe(
        'AI 서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.'
      );
      expect(getUserFriendlyErrorMessage(undefined)).toBe(
        'AI 서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.'
      );
    });
  });
});
