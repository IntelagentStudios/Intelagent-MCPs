import { describe, it, expect } from 'vitest';
import { FileProcessorService } from '../src/file-processor-service.js';

const service = new FileProcessorService();

describe('Edge Cases', () => {
  describe('empty and malformed input', () => {
    it('handles null-like content gracefully', async () => {
      const result = await service.extractText(null as unknown as string, '.txt');
      expect(result.success).toBe(false);
    });

    it('handles undefined content gracefully', async () => {
      const result = await service.extractText(undefined as unknown as string, '.txt');
      expect(result.success).toBe(false);
    });

    it('handles whitespace-only text for keywords', () => {
      const result = service.extractKeywords('   \n\t  ');
      expect(result.success).toBe(true);
      expect(result.keywords).toHaveLength(0);
    });

    it('handles single character text', async () => {
      const result = await service.extractText('x', '.txt');
      expect(result.success).toBe(true);
      expect(result.wordCount).toBe(1);
    });
  });

  describe('unicode and special characters', () => {
    it('handles unicode text', async () => {
      const text = '日本語のテキスト。これはテストです。';
      const result = await service.extractText(text, '.txt');
      expect(result.success).toBe(true);
      expect(result.text).toBe(text);
    });

    it('handles emoji', async () => {
      const result = await service.extractText('Hello 🌍 World 🚀', '.txt');
      expect(result.success).toBe(true);
      expect(result.text).toContain('🌍');
    });

    it('handles accented characters in keywords', () => {
      const result = service.extractKeywords('café résumé naïve café résumé');
      expect(result.success).toBe(true);
      expect(result.keywords!.some((k) => k.word === 'café')).toBe(true);
    });
  });

  describe('very long input', () => {
    it('handles very long text for extraction', async () => {
      const text = 'word '.repeat(100000);
      const result = await service.extractText(text, '.txt');
      expect(result.success).toBe(true);
      expect(result.wordCount).toBe(100000);
    });

    it('handles very long text for chunking', () => {
      const text = 'a'.repeat(50000);
      const result = service.chunkText(text, 1000, 200);
      expect(result.success).toBe(true);
      expect(result.totalChunks).toBeGreaterThan(40);
    });
  });

  describe('concurrent calls', () => {
    it('handles multiple concurrent extract calls', async () => {
      const calls = Array.from({ length: 10 }, (_, i) =>
        service.extractText(`Content number ${i}`, '.txt')
      );
      const results = await Promise.all(calls);
      expect(results).toHaveLength(10);
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('structured error responses', () => {
    it('all error responses have consistent structure', async () => {
      const errors = [
        await service.extractText('', '.txt'),
        await service.extractText('data', '.xyz'),
        service.extractKeywords(''),
        service.detectLanguage(''),
        service.chunkText(''),
        service.chunkText('hello', 10, 10),
      ];

      for (const result of errors) {
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
        expect(typeof result.error).toBe('string');
      }
    });
  });
});
