# @intelagent/mcp-enrichment

MCP server for multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery.

Uses [Clearbit](https://clearbit.com/), [Hunter.io](https://hunter.io/), and [Twilio](https://www.twilio.com/) APIs. Works in **mock mode** with no API keys configured.

## Installation

```bash
# Clone and build from source
git clone https://github.com/IntelagentStudios/Intelagent-MCPs.git
cd Intelagent-MCPs
npm install && npm run build
```

Requires **Node.js 20+**.

## Quick Start

### Add to Claude Code / Claude Desktop

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

Omit the `env` block to run in mock mode.

## Tools

### `enrich_company`

Enrich company data from a domain name or company name. Returns industry, employee count, funding, tech stack, social profiles, and more.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | One of `domain` or `companyName` | Company website domain (e.g. `"stripe.com"`) |
| `companyName` | string | One of `domain` or `companyName` | Company name |

**Provider:** Clearbit

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "company": {
    "name": "Company for stripe.com",
    "domain": "stripe.com",
    "description": "A leading technology company specializing in innovative solutions.",
    "industry": "Technology",
    "sector": "Software",
    "employees": 150,
    "employeesRange": "101-250",
    "founded": 2015,
    "location": { "city": "London", "country": "United Kingdom" },
    "socialProfiles": { "linkedin": "https://linkedin.com/company/example" },
    "techStack": ["React", "Node.js", "PostgreSQL", "AWS"],
    "type": "private"
  },
  "provider": "mock",
  "cached": false,
  "timestamp": "2026-03-15T00:00:00.000Z"
}
```
</details>

### `enrich_contact`

Enrich contact/person data from an email address or LinkedIn URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | One of `email` or `linkedinUrl` | Email address |
| `linkedinUrl` | string | One of `email` or `linkedinUrl` | LinkedIn profile URL |
| `firstName` | string | No | First name (optional hint) |
| `lastName` | string | No | Last name (optional hint) |
| `company` | string | No | Company name (optional hint) |
| `domain` | string | No | Company domain (optional hint) |

**Provider:** Clearbit

### `verify_email`

Verify an email address for deliverability. Returns validity, deliverability score, disposable/free provider detection, role-based detection, and SMTP validation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address to verify |

**Provider:** Hunter.io

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "email": "test@example.com",
  "valid": true,
  "deliverable": true,
  "disposable": false,
  "freeProvider": false,
  "role": false,
  "score": 95,
  "provider": "mock",
  "cached": false
}
```
</details>

### `verify_phone`

Validate and look up a phone number. Returns validity, formatted number, line type (mobile/landline/voip), carrier info, and location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Phone number (any format, E.164 preferred) |
| `countryCode` | string | No | Country dialing code without `+` (e.g. `"1"` for US, `"44"` for UK). **Defaults to `"44"` (UK).** |

**Provider:** Twilio

### `find_email`

Find the email address for a specific person at a company.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | Person's first name |
| `lastName` | string | Yes | Person's last name |
| `domain` | string | Yes | Company domain (e.g. `"stripe.com"`) |

**Provider:** Hunter.io

<details>
<summary>Example response</summary>

```json
{
  "success": true,
  "email": "jane.smith@stripe.com",
  "score": 85,
  "sources": ["LinkedIn", "Company Website"],
  "provider": "mock",
  "cached": false
}
```
</details>

### `server_info` (built-in)

Returns server metadata: name, version, registered tools, and resources. Added automatically by `@intelagent/mcp-shared`.

## Resources

| Resource | Description |
|----------|-------------|
| `enrichment://status` | Provider configuration status (which APIs are active, mock mode) |

## Mock Mode

When no API keys are configured, all tools return realistic mock data. This is great for development and testing — you can build against the MCP without any API accounts.

Mock mode activates automatically:
- **Globally** when none of `CLEARBIT_API_KEY`, `HUNTER_API_KEY`, or `TWILIO_ACCOUNT_SID` are set
- **Per-tool** when the specific provider key is missing (e.g. if you only set `CLEARBIT_API_KEY`, company/contact tools use real data while email/phone tools fall back to mock)

Check `enrichment://status` resource or the `server_info` tool to see which providers are active.

## Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CLEARBIT_API_KEY` | string | — | Clearbit API key for `enrich_company`, `enrich_contact` |
| `HUNTER_API_KEY` | string | — | Hunter.io API key for `verify_email`, `find_email` |
| `TWILIO_ACCOUNT_SID` | string | — | Twilio Account SID for `verify_phone` |
| `TWILIO_AUTH_TOKEN` | string | — | Twilio Auth Token for `verify_phone` |
| `APOLLO_API_KEY` | string | — | Apollo.io API key (reserved for future use) |
| `ENRICHMENT_CACHE_TTL` | number (seconds) | `86400` (24h) | How long to cache enrichment results |

## Development

```bash
npm run build    # Compile TypeScript
npm run dev      # Run with tsx (no build needed)
npm test         # Run tests
npm start        # Run compiled server
```

## Library Usage

The enrichment service can be used programmatically (not just as an MCP server):

```typescript
import { EnrichmentService } from '@intelagent/mcp-enrichment/service';
import type { CacheProvider } from '@intelagent/mcp-enrichment/service';

const service = new EnrichmentService({
  clearbitApiKey: 'sk-...',
  hunterApiKey: '...',
});

const result = await service.enrichCompany({ domain: 'stripe.com' });
```

## Custom Cache Provider

The default in-memory cache works out of the box. For Redis, SQLite, or any custom store, implement the `CacheProvider` interface:

```typescript
import { EnrichmentService } from '@intelagent/mcp-enrichment/service';
import type { CacheProvider } from '@intelagent/mcp-enrichment/service';

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

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/IntelagentStudios/Intelagent-MCPs/issues).

Pull requests welcome — see the [main repo](https://github.com/IntelagentStudios/Intelagent-MCPs) for development setup.

## License

MIT — see [LICENSE](./LICENSE).
