
/**
 * Wake Lock API를 사용하여 화면이 꺼지지 않도록 방지
 * 지원하지 않는 브라우저에서는 조용히 실패
 */

let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    console.log('Wake Lock API is not supported in this browser.');
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock activated');

    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
    });

    return true;
  } catch (err) {
    console.error('Failed to activate Wake Lock:', err);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error('Failed to release Wake Lock:', err);
    }
  }
}

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}
