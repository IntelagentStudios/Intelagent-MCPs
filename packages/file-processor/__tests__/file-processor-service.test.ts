import { describe, it, expect } from 'vitest';
import { FileProcessorService } from '../src/file-processor-service.js';

const service = new FileProcessorService();

describe('FileProcessorService', () => {
  describe('extractText', () => {
    it('extracts text from plain text content', async () => {
      const result = await service.extractText('Hello world, this is a test.', '.txt');
      expect(result.success).toBe(true);
      expect(result.text).toBe('Hello world, this is a test.');
      expect(result.wordCount).toBe(6);
      expect(result.processingTimeMs).toBeTypeOf('number');
    });

    it('extracts text from markdown', async () => {
      const result = await service.extractText('# Title\n\nSome **bold** text.', 'text/markdown');
      expect(result.success).toBe(true);
      expect(result.text).toContain('Title');
    });

    it('extracts text from JSON content', async () => {
      const json = JSON.stringify({ name: 'test', value: 42 });
      const result = await service.extractText(json, '.json');
      expect(result.success).toBe(true);
      expect(result.text).toContain('test');
    });

    it('extracts text from CSV content', async () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      const result = await service.extractText(csv, '.csv');
      expect(result.success).toBe(true);
      expect(result.text).toContain('Alice');
      expect(result.text).toContain('Bob');
    });

    it('extracts text from code files', async () => {
      const code = 'function hello() {\n  console.log("hello");\n}';
      const result = await service.extractText(code, '.js');
      expect(result.success).toBe(true);
      expect(result.text).toContain('function hello');
    });

    it('returns error for empty content', async () => {
      const result = await service.extractText('', '.txt');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Content is required');
    });

    it('returns error for unsupported file type', async () => {
      const result = await service.extractText('data', '.xyz');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('accepts MIME type strings', async () => {
      const result = await service.extractText('Hello', 'text/plain');
      expect(result.success).toBe(true);
      expect(result.text).toBe('Hello');
    });

    it('accepts extension without dot', async () => {
      const result = await service.extractText('Hello', 'txt');
      expect(result.success).toBe(true);
    });
  });

  describe('extractKeywords', () => {
    it('extracts keywords sorted by frequency', () => {
      const text = 'javascript is great. javascript frameworks like react and vue make javascript even better.';
      const result = service.extractKeywords(text);
      expect(result.success).toBe(true);
      expect(result.keywords![0].word).toBe('javascript');
      expect(result.keywords![0].frequency).toBe(3);
    });

    it('filters out stop words', () => {
      const text = 'the cat sat on the mat and the dog sat on the rug';
      const result = service.extractKeywords(text);
      expect(result.success).toBe(true);
      const words = result.keywords!.map((k) => k.word);
      expect(words).not.toContain('the');
      expect(words).not.toContain('and');
      expect(words).toContain('sat');
    });

    it('respects limit parameter', () => {
      const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda';
      const result = service.extractKeywords(text, 3);
      expect(result.keywords).toHaveLength(3);
    });

    it('returns error for empty text', () => {
      const result = service.extractKeywords('');
      expect(result.success).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('detects code from file extension', () => {
      const result = service.detectLanguage('const x = 1;', 'app.ts');
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('code');
      expect(result.programmingLanguage).toBe('typescript');
    });

    it('detects natural language from content', () => {
      const text = 'The quick brown fox jumps over the lazy dog. It was a sunny day. Birds were singing.';
      const result = service.detectLanguage(text);
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('natural');
    });

    it('detects code from content patterns', () => {
      const code = 'function hello() {\n  const x = 1;\n  return x;\n}\nclass Foo {\n  constructor() {}\n}';
      const result = service.detectLanguage(code);
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('code');
    });

    it('detects python from extension', () => {
      const result = service.detectLanguage('def hello():', 'main.py');
      expect(result.programmingLanguage).toBe('python');
    });

    it('returns error for empty text', () => {
      const result = service.detectLanguage('');
      expect(result.success).toBe(false);
    });
  });

  describe('chunkText', () => {
    it('chunks text with default settings', () => {
      const text = 'a'.repeat(2500);
      const result = service.chunkText(text);
      expect(result.success).toBe(true);
      expect(result.totalChunks).toBeGreaterThan(1);
      expect(result.totalCharacters).toBe(2500);
    });

    it('creates overlapping chunks', () => {
      const text = 'a'.repeat(2000);
      const result = service.chunkText(text, 1000, 200);
      expect(result.success).toBe(true);
      // First chunk: 0-1000, second: 800-1800, third: 1600-2000
      expect(result.totalChunks).toBe(3);
      expect(result.chunks![0].startOffset).toBe(0);
      expect(result.chunks![0].endOffset).toBe(1000);
      expect(result.chunks![1].startOffset).toBe(800);
    });

    it('returns single chunk for short text', () => {
      const result = service.chunkText('Hello world', 1000, 200);
      expect(result.totalChunks).toBe(1);
      expect(result.chunks![0].text).toBe('Hello world');
    });

    it('includes word count per chunk', () => {
      const result = service.chunkText('hello world foo bar', 10, 0);
      expect(result.chunks![0].wordCount).toBeGreaterThan(0);
    });

    it('returns error for empty text', () => {
      const result = service.chunkText('');
      expect(result.success).toBe(false);
    });

    it('returns error when overlap >= chunkSize', () => {
      const result = service.chunkText('hello', 10, 10);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Overlap must be less than chunk size');
    });

    it('returns error for zero chunk size', () => {
      const result = service.chunkText('hello', 0);
      expect(result.success).toBe(false);
    });
  });

  describe('processFile', () => {
    it('processes text file end-to-end', async () => {
      const text = 'JavaScript is a versatile programming language. JavaScript runs in browsers and servers. Node.js enables JavaScript on the server side.';
      const result = await service.processFile(text, '.txt');
      expect(result.success).toBe(true);
      expect(result.text).toBe(text);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.contentType).toBe('natural');
      expect(result.keywords).toBeDefined();
      expect(result.keywords!.length).toBeGreaterThan(0);
      expect(result.chunks).toBeDefined();
      expect(result.totalChunks).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeTypeOf('number');
    });

    it('returns error for empty content', async () => {
      const result = await service.processFile('', '.txt');
      expect(result.success).toBe(false);
    });

    it('returns error for unsupported type', async () => {
      const result = await service.processFile('data', '.xyz');
      expect(result.success).toBe(false);
    });

    it('respects custom chunk size', async () => {
      const text = 'word '.repeat(500);
      const result = await service.processFile(text, '.txt', 100, 20);
      expect(result.totalChunks).toBeGreaterThan(10);
    });
  });

  describe('getSupportedTypes', () => {
    it('returns MIME types and extensions', () => {
      const types = service.getSupportedTypes();
      expect(types.mimeTypes).toContain('application/pdf');
      expect(types.mimeTypes).toContain('text/plain');
      expect(types.extensions).toContain('.pdf');
      expect(types.extensions).toContain('.txt');
      expect(types.extensions).toContain('.ts');
    });
  });
});
