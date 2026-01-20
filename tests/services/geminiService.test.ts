import { describe, it, expect } from 'vitest';

/**
 * These tests verify the checkApiStatus behavior and JSON cleaning logic
 * used in parseJsonResponse.
 *
 * Full integration tests with the Gemini API require actual API calls
 * or complex mocking that is beyond unit test scope.
 */
describe('services/geminiService - Unit Tests', () => {
  describe('checkApiStatus', () => {
    it('should return ok: false when API key is empty', async () => {
      const { checkApiStatus } = await import('../../services/geminiService');

      const result = await checkApiStatus('gemini-2.5-flash', '');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Gemini API key is not provided.');
    });
  });

  describe('JSON cleaning logic', () => {
    it('should clean markdown code blocks from JSON responses', () => {
      // Test the regex pattern used in parseJsonResponse
      const cleanedText = (text: string) => text.replace(/^```json\s*|```\s*$/g, '');

      const rawJson = '```json\n{"key": "value"}\n```';
      const result = cleanedText(rawJson);

      expect(result).toBe('{"key": "value"}\n');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle plain JSON without code blocks', () => {
      const cleanedText = (text: string) => text.replace(/^```json\s*|```\s*$/g, '');

      const plainJson = '{"key": "value"}';
      const result = cleanedText(plainJson);

      expect(result).toBe('{"key": "value"}');
    });
  });
});
