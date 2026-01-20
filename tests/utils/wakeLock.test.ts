import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to test the wakeLock module in isolation since it has module-level state
describe('utils/wakeLock', () => {
  let mockWakeLockRelease: ReturnType<typeof vi.fn>;
  let mockWakeLockSentinel: {
    release: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Reset module to clear internal state
    vi.resetModules();

    mockWakeLockRelease = vi.fn().mockResolvedValue(undefined);
    mockWakeLockSentinel = {
      release: mockWakeLockRelease,
      addEventListener: vi.fn(),
    };

    // Setup mock for wakeLock
    vi.stubGlobal('navigator', {
      wakeLock: {
        request: vi.fn().mockResolvedValue(mockWakeLockSentinel),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('isWakeLockSupported', () => {
    it('should return true when wakeLock is available', async () => {
      const { isWakeLockSupported } = await import('../../utils/wakeLock');
      expect(isWakeLockSupported()).toBe(true);
    });

    it('should return false when wakeLock is not available', async () => {
      vi.stubGlobal('navigator', {});
      const { isWakeLockSupported } = await import('../../utils/wakeLock');
      expect(isWakeLockSupported()).toBe(false);
    });
  });

  describe('requestWakeLock', () => {
    it('should request screen wake lock and return true', async () => {
      const { requestWakeLock } = await import('../../utils/wakeLock');
      const result = await requestWakeLock();

      expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
      expect(result).toBe(true);
    });

    it('should add release event listener', async () => {
      const { requestWakeLock } = await import('../../utils/wakeLock');
      await requestWakeLock();

      expect(mockWakeLockSentinel.addEventListener).toHaveBeenCalledWith(
        'release',
        expect.any(Function)
      );
    });

    it('should return false when wakeLock is not supported', async () => {
      vi.stubGlobal('navigator', {});
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { requestWakeLock } = await import('../../utils/wakeLock');
      const result = await requestWakeLock();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Wake Lock API is not supported in this browser.'
      );

      consoleSpy.mockRestore();
    });

    it('should return false and log error on failure', async () => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { requestWakeLock } = await import('../../utils/wakeLock');
      const result = await requestWakeLock();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to activate Wake Lock:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('releaseWakeLock', () => {
    it('should release wake lock when active', async () => {
      const { requestWakeLock, releaseWakeLock } = await import('../../utils/wakeLock');

      // First acquire the lock
      await requestWakeLock();

      // Then release it
      await releaseWakeLock();

      expect(mockWakeLockRelease).toHaveBeenCalled();
    });

    it('should do nothing when no wake lock is active', async () => {
      const { releaseWakeLock } = await import('../../utils/wakeLock');

      // Release without acquiring first - should not throw
      await releaseWakeLock();

      expect(mockWakeLockRelease).not.toHaveBeenCalled();
    });

    it('should handle release errors gracefully', async () => {
      mockWakeLockRelease.mockRejectedValue(new Error('Release failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { requestWakeLock, releaseWakeLock } = await import('../../utils/wakeLock');
      await requestWakeLock();

      // Should not throw
      await expect(releaseWakeLock()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to release Wake Lock:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
