import { describe, it, expect } from 'vitest';
import { fileProcessorTools } from '../src/tools.js';
import { FileProcessorService } from '../src/file-processor-service.js';

describe('fileProcessorTools', () => {
  const service = new FileProcessorService();
  const tools = fileProcessorTools(service);

  it('defines exactly 5 tools', () => {
    expect(tools).toHaveLength(5);
  });

  it('all tools have required fields', () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.handler).toBe('function');
    }
  });

  it.each([
    ['extract_text'],
    ['extract_keywords'],
    ['detect_language'],
    ['chunk_text'],
    ['process_file'],
  ])('includes tool "%s"', (toolName) => {
    expect(tools.find((t) => t.name === toolName)).toBeDefined();
  });

  it('extract_text handler works', async () => {
    const tool = tools.find((t) => t.name === 'extract_text')!;
    const result = (await tool.handler({ content: 'Hello world', fileType: '.txt' })) as { success: boolean };
    expect(result.success).toBe(true);
  });

  it('extract_keywords handler works', async () => {
    const tool = tools.find((t) => t.name === 'extract_keywords')!;
    const result = (await tool.handler({ text: 'testing keyword extraction testing' })) as {
      success: boolean;
      keywords: Array<{ word: string }>;
    };
    expect(result.success).toBe(true);
    expect(result.keywords[0].word).toBe('testing');
  });

  it('detect_language handler works', async () => {
    const tool = tools.find((t) => t.name === 'detect_language')!;
    const result = (await tool.handler({ text: 'const x = 1;', fileName: 'app.ts' })) as {
      success: boolean;
      contentType: string;
    };
    expect(result.success).toBe(true);
    expect(result.contentType).toBe('code');
  });

  it('chunk_text handler works', async () => {
    const tool = tools.find((t) => t.name === 'chunk_text')!;
    const result = (await tool.handler({ text: 'a'.repeat(2000) })) as {
      success: boolean;
      totalChunks: number;
    };
    expect(result.success).toBe(true);
    expect(result.totalChunks).toBeGreaterThan(1);
  });

  it('process_file handler works', async () => {
    const tool = tools.find((t) => t.name === 'process_file')!;
    const result = (await tool.handler({ content: 'Hello world testing', fileType: 'txt' })) as {
      success: boolean;
      text: string;
    };
    expect(result.success).toBe(true);
    expect(result.text).toContain('Hello');
  });
});
