
/**
 * API 재시도 로직 with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도였다면 에러를 던짐
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1초, 2초, 4초, 8초...
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * 사용자 친화적인 에러 메시지 변환
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const errorMessage = error?.message || String(error);

  if (errorMessage.includes('API key not valid') || errorMessage.includes('invalid api key')) {
    return 'API key가 유효하지 않습니다. API key를 확인해주세요.';
  }

  if (errorMessage.includes('403')) {
    return 'API 접근 권한이 없습니다. API key 권한을 확인해주세요.';
  }

  if (errorMessage.includes('429') || errorMessage.includes('quota')) {
    return 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return '네트워크 연결이 원활하지 않습니다. 안정적인 Wi-Fi 환경을 권장합니다.';
  }

  if (errorMessage.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  return 'AI 서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
}
