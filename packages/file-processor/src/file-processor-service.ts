import {
  SUPPORTED_MIME_TYPES,
  EXTENSION_MAP,
  type ExtractTextResult,
  type ExtractKeywordsResult,
  type DetectLanguageResult,
  type ChunkTextResult,
  type TextChunk,
  type ProcessFileResult,
} from './types.js';

/**
 * File Processor Service — extracts text from multiple file formats,
 * detects content type, extracts keywords, and chunks text for RAG pipelines.
 *
 * Accepts file content as base64 or raw text (never reads from filesystem directly).
 */
export class FileProcessorService {
  /**
   * Extract text content from a file.
   *
   * @param content - File content as base64 string or raw text
   * @param fileType - MIME type or file extension (e.g. '.pdf', 'application/pdf')
   */
  async extractText(content: string, fileType: string): Promise<ExtractTextResult> {
    const startTime = Date.now();

    if (!content) {
      return { success: false, error: 'Content is required' };
    }

    const mimeType = this.resolveMimeType(fileType);
    if (!mimeType) {
      return { success: false, error: `Unsupported file type: ${fileType}` };
    }

    try {
      const buffer = this.toBuffer(content, mimeType);
      let text: string;
      let pageCount: number | undefined;
      let metadata: Record<string, unknown> | undefined;

      if (mimeType === SUPPORTED_MIME_TYPES.PDF) {
        const result = await this.processPDF(buffer);
        text = result.text;
        pageCount = result.pageCount;
        metadata = result.metadata;
      } else if (
        mimeType === SUPPORTED_MIME_TYPES.DOCX ||
        mimeType === SUPPORTED_MIME_TYPES.DOC
      ) {
        text = await this.processDOCX(buffer);
      } else {
        text = buffer.toString('utf-8');
      }

      return {
        success: true,
        text,
        wordCount: this.countWords(text),
        pageCount,
        metadata,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Text extraction failed',
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract keywords from text.
   *
   * @param text - Text to extract keywords from
   * @param limit - Maximum number of keywords to return (default: 20)
   */
  extractKeywords(text: string, limit: number = 20): ExtractKeywordsResult {
    if (!text) {
      return { success: false, error: 'Text is required' };
    }

    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
      'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
      'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
      'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
      'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
      'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
      'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
      'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
      'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
      'any', 'these', 'give', 'day', 'most', 'us', 'are', 'has', 'was', 'been',
      'were', 'being', 'had', 'did', 'does', 'is', 'am',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    const freq: Record<string, number> = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }

    const keywords = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word, frequency]) => ({ word, frequency }));

    return {
      success: true,
      keywords,
      totalWords: words.length,
    };
  }

  /**
   * Detect whether content is code, natural language, or mixed.
   *
   * @param text - Text content to analyse
   * @param fileName - Optional file name for extension-based detection
   */
  detectLanguage(text: string, fileName?: string): DetectLanguageResult {
    if (!text) {
      return { success: false, error: 'Text is required' };
    }

    // Check file extension first
    if (fileName) {
      const ext = this.getExtension(fileName);
      const codeExtensions = [
        '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs',
        '.cpp', '.c', '.h', '.rb', '.php', '.swift', '.kt',
      ];
      if (codeExtensions.includes(ext)) {
        return {
          success: true,
          contentType: 'code',
          programmingLanguage: this.detectProgrammingLanguage(ext),
        };
      }
    }

    // Analyse content patterns
    const codeIndicators = text.match(
      /^(function|class|import|export|const|let|var|def|pub|fn|func|package|interface|struct|enum|return|if|else|for|while)\s/gm
    ) || [];

    const naturalIndicators = text.match(/[.!?]\s+[A-Z]/g) || [];

    let contentType: 'code' | 'natural' | 'mixed';
    if (codeIndicators.length > naturalIndicators.length * 2) {
      contentType = 'code';
    } else if (naturalIndicators.length > codeIndicators.length * 2) {
      contentType = 'natural';
    } else {
      contentType = 'mixed';
    }

    return {
      success: true,
      contentType,
      programmingLanguage:
        contentType === 'code' && fileName
          ? this.detectProgrammingLanguage(this.getExtension(fileName))
          : undefined,
    };
  }

  /**
   * Split text into chunks suitable for RAG/embedding pipelines.
   *
   * @param text - Text to chunk
   * @param chunkSize - Target chunk size in characters (default: 1000)
   * @param overlap - Overlap between chunks in characters (default: 200)
   */
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): ChunkTextResult {
    if (!text) {
      return { success: false, error: 'Text is required' };
    }

    if (chunkSize < 1) {
      return { success: false, error: 'Chunk size must be at least 1' };
    }

    if (overlap >= chunkSize) {
      return { success: false, error: 'Overlap must be less than chunk size' };
    }

    const chunks: TextChunk[] = [];
    const step = chunkSize - overlap;
    let index = 0;

    for (let start = 0; start < text.length; start += step) {
      const end = Math.min(start + chunkSize, text.length);
      const chunkText = text.slice(start, end);

      chunks.push({
        index,
        text: chunkText,
        startOffset: start,
        endOffset: end,
        wordCount: this.countWords(chunkText),
      });

      index++;

      // If we've reached the end, stop
      if (end >= text.length) break;
    }

    return {
      success: true,
      chunks,
      totalChunks: chunks.length,
      totalCharacters: text.length,
    };
  }

  /**
   * All-in-one: extract text, detect language, extract keywords, and chunk.
   *
   * @param content - File content as base64 or raw text
   * @param fileType - MIME type or file extension
   * @param chunkSize - Chunk size for splitting (default: 1000)
   * @param chunkOverlap - Overlap between chunks (default: 200)
   * @param keywordLimit - Max keywords to extract (default: 20)
   */
  async processFile(
    content: string,
    fileType: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200,
    keywordLimit: number = 20
  ): Promise<ProcessFileResult> {
    const startTime = Date.now();

    const extracted = await this.extractText(content, fileType);
    if (!extracted.success || !extracted.text) {
      return {
        success: false,
        error: extracted.error || 'Text extraction failed',
        processingTimeMs: Date.now() - startTime,
      };
    }

    const language = this.detectLanguage(extracted.text);
    const keywords = this.extractKeywords(extracted.text, keywordLimit);
    const chunked = this.chunkText(extracted.text, chunkSize, chunkOverlap);

    return {
      success: true,
      text: extracted.text,
      wordCount: extracted.wordCount,
      pageCount: extracted.pageCount,
      contentType: language.contentType,
      programmingLanguage: language.programmingLanguage,
      keywords: keywords.keywords,
      chunks: chunked.chunks,
      totalChunks: chunked.totalChunks,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /** Get list of supported file types. */
  getSupportedTypes(): { mimeTypes: string[]; extensions: string[] } {
    return {
      mimeTypes: Object.values(SUPPORTED_MIME_TYPES),
      extensions: Object.keys(EXTENSION_MAP),
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────

  private resolveMimeType(fileType: string): string | null {
    // Already a MIME type
    if (fileType.includes('/')) {
      const values = Object.values(SUPPORTED_MIME_TYPES) as string[];
      if (values.includes(fileType) || fileType.startsWith('text/')) {
        return fileType;
      }
      return null;
    }

    // File extension
    const ext = fileType.startsWith('.') ? fileType : `.${fileType}`;
    return EXTENSION_MAP[ext.toLowerCase()] || null;
  }

  private toBuffer(content: string, mimeType: string): Buffer {
    // Binary formats (PDF, DOCX) are expected as base64
    const isBinary =
      mimeType === SUPPORTED_MIME_TYPES.PDF ||
      mimeType === SUPPORTED_MIME_TYPES.DOCX ||
      mimeType === SUPPORTED_MIME_TYPES.DOC;

    if (isBinary) {
      // Strip data URI prefix if present
      const base64Data = content.replace(/^data:[^;]+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    }

    return Buffer.from(content, 'utf-8');
  }

  private async processPDF(
    buffer: Buffer
  ): Promise<{ text: string; pageCount: number; metadata: Record<string, unknown> }> {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: { info: data.info, version: data.version },
    };
  }

  private async processDOCX(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private getExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : '';
  }

  private detectProgrammingLanguage(ext: string): string | undefined {
    const langMap: Record<string, string> = {
      '.js': 'javascript', '.mjs': 'javascript', '.jsx': 'javascript',
      '.ts': 'typescript', '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'c++', '.c': 'c', '.h': 'c',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
    };
    return langMap[ext];
  }
}
