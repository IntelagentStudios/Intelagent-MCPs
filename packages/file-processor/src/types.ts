/** Supported MIME types for file processing. */
export const SUPPORTED_MIME_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  TEXT: 'text/plain',
  MARKDOWN: 'text/markdown',
  JSON: 'application/json',
  CSV: 'text/csv',
  JAVASCRIPT: 'text/javascript',
  TYPESCRIPT: 'text/typescript',
  PYTHON: 'text/x-python',
  JAVA: 'text/x-java',
  GO: 'text/x-go',
  RUST: 'text/x-rust',
  CPP: 'text/x-c++',
  HTML: 'text/html',
  XML: 'application/xml',
} as const;

/** Map from file extension to MIME type. */
export const EXTENSION_MAP: Record<string, string> = {
  '.pdf': SUPPORTED_MIME_TYPES.PDF,
  '.docx': SUPPORTED_MIME_TYPES.DOCX,
  '.doc': SUPPORTED_MIME_TYPES.DOC,
  '.txt': SUPPORTED_MIME_TYPES.TEXT,
  '.md': SUPPORTED_MIME_TYPES.MARKDOWN,
  '.json': SUPPORTED_MIME_TYPES.JSON,
  '.csv': SUPPORTED_MIME_TYPES.CSV,
  '.js': SUPPORTED_MIME_TYPES.JAVASCRIPT,
  '.mjs': SUPPORTED_MIME_TYPES.JAVASCRIPT,
  '.ts': SUPPORTED_MIME_TYPES.TYPESCRIPT,
  '.tsx': SUPPORTED_MIME_TYPES.TYPESCRIPT,
  '.jsx': SUPPORTED_MIME_TYPES.JAVASCRIPT,
  '.py': SUPPORTED_MIME_TYPES.PYTHON,
  '.java': SUPPORTED_MIME_TYPES.JAVA,
  '.go': SUPPORTED_MIME_TYPES.GO,
  '.rs': SUPPORTED_MIME_TYPES.RUST,
  '.cpp': SUPPORTED_MIME_TYPES.CPP,
  '.c': SUPPORTED_MIME_TYPES.CPP,
  '.h': SUPPORTED_MIME_TYPES.CPP,
  '.html': SUPPORTED_MIME_TYPES.HTML,
  '.xml': SUPPORTED_MIME_TYPES.XML,
};

/** Result from text extraction. */
export interface ExtractTextResult {
  success: boolean;
  text?: string;
  wordCount?: number;
  pageCount?: number;
  metadata?: Record<string, unknown>;
  processingTimeMs?: number;
  error?: string;
}

/** Result from keyword extraction. */
export interface ExtractKeywordsResult {
  success: boolean;
  keywords?: Array<{ word: string; frequency: number }>;
  totalWords?: number;
  error?: string;
}

/** Result from language detection. */
export interface DetectLanguageResult {
  success: boolean;
  /** 'code', 'natural', or 'mixed' */
  contentType?: 'code' | 'natural' | 'mixed';
  /** Detected programming language if contentType is 'code' */
  programmingLanguage?: string;
  error?: string;
}

/** A single chunk of text. */
export interface TextChunk {
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
  wordCount: number;
}

/** Result from text chunking. */
export interface ChunkTextResult {
  success: boolean;
  chunks?: TextChunk[];
  totalChunks?: number;
  totalCharacters?: number;
  error?: string;
}

/** All-in-one processing result. */
export interface ProcessFileResult {
  success: boolean;
  text?: string;
  wordCount?: number;
  pageCount?: number;
  contentType?: 'code' | 'natural' | 'mixed';
  programmingLanguage?: string;
  keywords?: Array<{ word: string; frequency: number }>;
  chunks?: TextChunk[];
  totalChunks?: number;
  processingTimeMs?: number;
  error?: string;
}
