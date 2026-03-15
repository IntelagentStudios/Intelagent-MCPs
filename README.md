# Intelagent MCPs

Open-source [Model Context Protocol](https://modelcontextprotocol.io/) servers by [Intelagent](https://intelagent.com). Each server is a standalone npm package usable with Claude Code, Claude Desktop, Cursor, and any MCP-compatible client.

## Servers

| Package | Description | Status |
|---------|-------------|--------|
| [`@intelagent/mcp-enrichment`](./packages/enrichment) | Company, contact, email & phone enrichment via Clearbit, Hunter.io, Twilio | Available |
| `@intelagent/mcp-file-processor` | Document text extraction, keyword detection, chunking | Planned |
| `@intelagent/mcp-web-research` | Web search, page fetch, research synthesis | Planned |
| `@intelagent/mcp-approval-queue` | Human-in-the-loop approval workflows | Planned |
| `@intelagent/mcp-knowledge-grid` | Document indexing, semantic search, context composition | Planned |

## Quick Start

```bash
# Clone and install
git clone https://github.com/IntelagentStudios/Intelagent-MCPs.git
cd Intelagent-MCPs
npm install
npm run build

# Run the enrichment server (mock mode — no API keys needed)
node packages/enrichment/dist/index.js
```

### Add to Claude Code

Create or edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "enrichment": {
      "command": "node",
      "args": ["/path/to/Intelagent-MCPs/packages/enrichment/dist/index.js"],
      "env": {
        "CLEARBIT_API_KEY": "sk-...",
        "HUNTER_API_KEY": "...",
        "TWILIO_ACCOUNT_SID": "...",
        "TWILIO_AUTH_TOKEN": "..."
      }
    }
  }
}
```

All servers work in **mock mode** when API keys are omitted — great for development and testing.

## Development

```bash
npm install          # Install all dependencies
npm run build        # Build all packages
npm test             # Run all tests
```

### Adding a New Server

1. Create `packages/<server-name>/` with `package.json`, `tsconfig.json`, and `src/`
2. Use `@intelagent/mcp-shared` for the server bootstrap (`createMCPServer`)
3. Define tools in `tools.ts`, wire up in `index.ts`
4. Add tests in `__tests__/`

See [`packages/enrichment`](./packages/enrichment) as a reference implementation.

## Shared Utilities

[`@intelagent/mcp-shared`](./packages/shared) provides:

- **`createMCPServer()`** — Reusable MCP server bootstrap with tool/resource registration and stdio transport
- **Validation helpers** — Email, domain, phone format validation

## License

MIT
