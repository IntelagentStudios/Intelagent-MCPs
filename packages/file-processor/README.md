# @intelagent/mcp-file-processor

MCP server for universal text extraction, keyword extraction, language detection, and text chunking — designed for RAG pipelines.

Supports PDF, DOCX, CSV, JSON, Markdown, HTML, and code files. Zero platform dependencies.

## Installation

```bash
npm install @intelagent/mcp-file-processor
```

Requires **Node.js 20+**.

## Quick Start

### Add to Claude Code / Claude Desktop

```json
{
  "mcpServers": {
    "file-processor": {
      "command": "npx",
      "args": ["@intelagent/mcp-file-processor"]
    }
  }
}
```

No API keys needed — everything runs locally.

## Tools

### `extract_text`

Extract text content from a file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | File content — base64 for binary formats (PDF, DOCX), raw text for text formats |
| `fileType` | string | Yes | MIME type (e.g. `"application/pdf"`) or extension (e.g. `".pdf"`, `"pdf"`) |

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "text": "Extracted text content here...",
  "wordCount": 142,
  "pageCount": 3,
  "processingTimeMs": 45
}
```
</details>

### `extract_keywords`

Extract ranked keywords from text. Filters stop words, sorted by frequency.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to extract keywords from |
| `limit` | number | No | Max keywords to return (default: 20) |

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "keywords": [
    { "word": "javascript", "frequency": 8 },
    { "word": "framework", "frequency": 4 },
    { "word": "react", "frequency": 3 }
  ],
  "totalWords": 156
}
```
</details>

### `detect_language`

Detect whether content is code, natural language, or mixed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to analyse |
| `fileName` | string | No | File name for extension-based detection (e.g. `"app.ts"`) |

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "contentType": "code",
  "programmingLanguage": "typescript"
}
```
</details>

### `chunk_text`

Split text into overlapping chunks for RAG/embedding pipelines.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to chunk |
| `chunkSize` | number | No | Target chunk size in characters (default: 1000) |
| `overlap` | number | No | Overlap between chunks in characters (default: 200) |

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "chunks": [
    { "index": 0, "text": "...", "startOffset": 0, "endOffset": 1000, "wordCount": 167 },
    { "index": 1, "text": "...", "startOffset": 800, "endOffset": 1800, "wordCount": 172 }
  ],
  "totalChunks": 5,
  "totalCharacters": 4200
}
```
</details>

### `process_file`

All-in-one: extract text, detect content type, extract keywords, and chunk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | File content (base64 or raw text) |
| `fileType` | string | Yes | MIME type or file extension |
| `chunkSize` | number | No | Chunk size in characters (default: 1000) |
| `chunkOverlap` | number | No | Overlap in characters (default: 200) |
| `keywordLimit` | number | No | Max keywords (default: 20) |

### `server_info` (built-in)

Returns server metadata, registered tools, and resources.

## Resources

| Resource | Description |
|----------|-------------|
| `file-processor://supported-types` | Lists all supported MIME types and file extensions |

## Supported Formats

| Format | Extension | Input |
|--------|-----------|-------|
| PDF | `.pdf` | base64 |
| Word | `.docx`, `.doc` | base64 |
| Plain text | `.txt` | raw text |
| Markdown | `.md` | raw text |
| CSV | `.csv` | raw text |
| JSON | `.json` | raw text |
| HTML | `.html` | raw text |
| XML | `.xml` | raw text |
| JavaScript | `.js`, `.jsx`, `.mjs` | raw text |
| TypeScript | `.ts`, `.tsx` | raw text |
| Python | `.py` | raw text |
| Java | `.java` | raw text |
| Go | `.go` | raw text |
| Rust | `.rs` | raw text |
| C/C++ | `.c`, `.cpp`, `.h` | raw text |

## Development

```bash
npm run build    # Compile TypeScript
npm run dev      # Run with tsx
npm test         # Run tests
npm start        # Run compiled server
```

## Library Usage

```typescript
import { FileProcessorService } from '@intelagent/mcp-file-processor/service';

const service = new FileProcessorService();

const result = await service.processFile(
  'Hello world, this is a document.',
  '.txt',
  500,  // chunk size
  100   // overlap
);
```

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/IntelagentStudios/Intelagent-MCPs/issues).

## License

MIT — see [LICENSE](./LICENSE).
