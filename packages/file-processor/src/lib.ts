/**
 * Library exports for using the file processor service programmatically.
 *
 * Import from '@intelagent/mcp-file-processor/service' for library usage.
 * The default entry point starts the MCP server.
 */
export { FileProcessorService } from './file-processor-service.js';
export { fileProcessorTools } from './tools.js';
export { SUPPORTED_MIME_TYPES, EXTENSION_MAP } from './types.js';
export type {
  ExtractTextResult,
  ExtractKeywordsResult,
  DetectLanguageResult,
  ChunkTextResult,
  TextChunk,
  ProcessFileResult,
} from './types.js';
