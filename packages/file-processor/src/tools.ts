import type { ToolDefinition } from '@intelagent/mcp-shared';
import type { FileProcessorService } from './file-processor-service.js';

export function fileProcessorTools(service: FileProcessorService): ToolDefinition[] {
  return [
    {
      name: 'extract_text',
      description:
        'Extract text content from a file. Supports PDF, DOCX, CSV, JSON, Markdown, HTML, and code files. Pass file content as base64 (for binary formats like PDF/DOCX) or raw text (for text formats). Returns extracted text, word count, and processing time.',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'File content — base64-encoded for binary formats (PDF, DOCX), raw text for text formats',
          },
          fileType: {
            type: 'string',
            description: 'MIME type (e.g. "application/pdf") or file extension (e.g. ".pdf", "pdf", ".ts")',
          },
        },
        required: ['content', 'fileType'],
      },
      handler: async (args) => {
        return service.extractText(args.content as string, args.fileType as string);
      },
    },
    {
      name: 'extract_keywords',
      description:
        'Extract ranked keywords from text. Returns keywords sorted by frequency, useful for tagging, search indexing, and topic identification.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to extract keywords from',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of keywords to return (default: 20)',
          },
        },
        required: ['text'],
      },
      handler: async (args) => {
        return service.extractKeywords(args.text as string, args.limit as number | undefined);
      },
    },
    {
      name: 'detect_language',
      description:
        'Detect whether content is code, natural language, or mixed. Optionally detects the programming language from file extension. Useful for routing content to appropriate processing pipelines.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text content to analyse',
          },
          fileName: {
            type: 'string',
            description: 'Optional file name for extension-based detection (e.g. "app.ts")',
          },
        },
        required: ['text'],
      },
      handler: async (args) => {
        return service.detectLanguage(args.text as string, args.fileName as string | undefined);
      },
    },
    {
      name: 'chunk_text',
      description:
        'Split text into overlapping chunks suitable for RAG/embedding pipelines. Configurable chunk size and overlap. Returns chunks with positional metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to split into chunks',
          },
          chunkSize: {
            type: 'number',
            description: 'Target chunk size in characters (default: 1000)',
          },
          overlap: {
            type: 'number',
            description: 'Overlap between chunks in characters (default: 200)',
          },
        },
        required: ['text'],
      },
      handler: async (args) => {
        return service.chunkText(
          args.text as string,
          args.chunkSize as number | undefined,
          args.overlap as number | undefined
        );
      },
    },
    {
      name: 'process_file',
      description:
        'All-in-one file processing: extract text, detect content type, extract keywords, and chunk for RAG. Returns the complete processed result in a single call.',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'File content — base64-encoded for binary formats (PDF, DOCX), raw text for text formats',
          },
          fileType: {
            type: 'string',
            description: 'MIME type or file extension (e.g. "application/pdf", ".md", "csv")',
          },
          chunkSize: {
            type: 'number',
            description: 'Target chunk size in characters (default: 1000)',
          },
          chunkOverlap: {
            type: 'number',
            description: 'Overlap between chunks in characters (default: 200)',
          },
          keywordLimit: {
            type: 'number',
            description: 'Maximum keywords to extract (default: 20)',
          },
        },
        required: ['content', 'fileType'],
      },
      handler: async (args) => {
        return service.processFile(
          args.content as string,
          args.fileType as string,
          args.chunkSize as number | undefined,
          args.chunkOverlap as number | undefined,
          args.keywordLimit as number | undefined
        );
      },
    },
  ];
}
