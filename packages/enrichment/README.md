# @intelagent/mcp-enrichment

MCP server for multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery.

## Tools

| Tool | Description | Required Params |
|------|-------------|-----------------|
| `enrich_company` | Company data from domain/name | `domain` OR `companyName` |
| `enrich_contact` | Person data from email/LinkedIn | `email` OR `linkedinUrl` |
| `verify_email` | Email deliverability check | `email` |
| `verify_phone` | Phone number validation | `phone` |
| `find_email` | Discover email for a person | `firstName`, `lastName`, `domain` |

## Resources

| Resource | Description |
|----------|-------------|
| `enrichment://status` | Provider configuration status |

## Setup

### Claude Code / Claude Desktop

Add to your MCP config (`.mcp.json` or `~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "enrichment": {
      "command": "node",
      "args": ["packages/mcp/enrichment/dist/index.js"],
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

### Mock Mode

When no API keys are configured, all tools return realistic mock data — useful for development and testing.

## Environment Variables

| Variable | Provider | Required For |
|----------|----------|-------------|
| `CLEARBIT_API_KEY` | Clearbit | `enrich_company`, `enrich_contact` |
| `HUNTER_API_KEY` | Hunter.io | `verify_email`, `find_email` |
| `TWILIO_ACCOUNT_SID` | Twilio | `verify_phone` |
| `TWILIO_AUTH_TOKEN` | Twilio | `verify_phone` |
| `APOLLO_API_KEY` | Apollo.io | Future use |
| `ENRICHMENT_CACHE_TTL` | — | Cache TTL in seconds (default: 86400) |

## Development

```bash
npm run build    # Compile TypeScript
npm run dev      # Run with tsx (no build needed)
npm test         # Run tests
```

## Custom Cache Provider

The service accepts a pluggable cache via the `CacheProvider` interface:

```typescript
import { EnrichmentService, CacheProvider } from '@intelagent/mcp-enrichment';

const redisCache: CacheProvider = {
  async get(key) { /* ... */ },
  async set(key, data, ttlMs) { /* ... */ },
  async delete(key) { /* ... */ },
  async clear() { /* ... */ },
};

const service = new EnrichmentService({
  clearbitApiKey: '...',
  cache: redisCache,
});
```
