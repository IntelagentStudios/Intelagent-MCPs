# MCP Directory Submissions

Draft PR entries and submission instructions for `@intelagent/mcp-enrichment`.

---

## 1. awesome-mcp-servers (punkpeye/awesome-mcp-servers)

**Repository:** https://github.com/punkpeye/awesome-mcp-servers
**Stars:** Most-starred awesome-mcp-servers list on GitHub.
**How to submit:** Open a PR adding the entry to the README under the appropriate category, sorted alphabetically within the section.

### Target Section

**Customer Data Platforms** (`### 👤 <a name="customer-data-platforms"></a>Customer Data Platforms`)

This is the best fit — the section description reads "Provides access to customer profiles inside of customer data platforms" and the existing `tomba-io` entry in a nearby section covers similar territory (email discovery, verification, enrichment).

### Draft Entry

```markdown
- [IntelagentStudios/Intelagent-MCPs](https://github.com/IntelagentStudios/Intelagent-MCPs) 📇 ☁️ 🍎 🪟 🐧 - Multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery via Clearbit, Hunter.io, and Twilio APIs. Mock mode and pluggable cache included.
```

**Format notes:**
- `📇` = TypeScript codebase
- `☁️` = Cloud service (calls external APIs)
- `🍎 🪟 🐧` = Cross-platform (stdio transport runs anywhere)
- Alphabetical placement: insert after entries starting with "I" in the section

---

## 2. modelcontextprotocol/servers

**Repository:** https://github.com/modelcontextprotocol/servers

> **Important:** The README states: "The server lists in this README are no longer maintained and will eventually be removed." The recommended path is the **MCP Registry** instead.

### Option A: MCP Registry (Recommended)

**Registry:** https://registry.modelcontextprotocol.io/
**Publishing guide:** https://github.com/modelcontextprotocol/registry/tree/main/docs/modelcontextprotocol-io/quickstart.mdx

#### Steps

1. **Add `mcpName` to `package.json`:**
   ```json
   "mcpName": "io.github.intelagentstudios/enrichment"
   ```

2. **Publish to npm** (already done: `@intelagent/mcp-enrichment`).

3. **Install `mcp-publisher` CLI:**
   ```bash
   npm install -g @anthropic-ai/mcp-publisher
   ```

4. **Create `server.json`:**
   ```json
   {
     "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
     "name": "io.github.intelagentstudios/enrichment",
     "description": "Multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery via Clearbit, Hunter.io, and Twilio APIs.",
     "title": "Intelagent Enrichment",
     "websiteUrl": "https://github.com/IntelagentStudios/Intelagent-MCPs",
     "repository": {
       "url": "https://github.com/IntelagentStudios/Intelagent-MCPs",
       "source": "github",
       "subfolder": "packages/mcp-enrichment"
     },
     "version": "1.0.0",
     "packages": [
       {
         "registryType": "npm",
         "registryBaseUrl": "https://registry.npmjs.org",
         "identifier": "@intelagent/mcp-enrichment",
         "version": "1.0.0",
         "transport": {
           "type": "stdio"
         },
         "environmentVariables": [
           {
             "name": "CLEARBIT_API_KEY",
             "description": "Clearbit API key for company and contact enrichment",
             "isRequired": false,
             "isSecret": true
           },
           {
             "name": "HUNTER_API_KEY",
             "description": "Hunter.io API key for email discovery and verification",
             "isRequired": false,
             "isSecret": true
           },
           {
             "name": "TWILIO_ACCOUNT_SID",
             "description": "Twilio Account SID for phone validation",
             "isRequired": false,
             "isSecret": true
           },
           {
             "name": "TWILIO_AUTH_TOKEN",
             "description": "Twilio Auth Token for phone validation",
             "isRequired": false,
             "isSecret": true
           }
         ]
       }
     ]
   }
   ```

5. **Authenticate and publish:**
   ```bash
   mcp-publisher login --github
   mcp-publisher publish server.json
   ```

### Option B: Legacy README PR (Not Recommended)

If you still want a README entry, the format under "Third-Party Servers > Community Servers" would be:

```markdown
- **[Intelagent Enrichment](https://github.com/IntelagentStudios/Intelagent-MCPs)** - Multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery via Clearbit, Hunter.io, and Twilio APIs.
```

However, since the list is deprecated, prefer the MCP Registry route above.

---

## 3. PulseMCP (pulsemcp.com)

**Website:** https://pulsemcp.com
**Submission URL:** https://pulsemcp.com/submit

### Submission Process

PulseMCP offers two paths:

1. **Automatic ingestion:** PulseMCP ingests entries from the Official MCP Registry daily and processes them weekly. If you publish to the MCP Registry (see section 2 above), your server will appear automatically within a week.

2. **Manual submission:** Visit https://pulsemcp.com/submit and fill out the form. The form lets you choose between "MCP Server" or "MCP Client". Exact fields are not publicly documented beyond the form itself.

3. **Email:** Contact hello@pulsemcp.com for adjustments to your listing or expedited processing.

### Recommended Approach

Publish to the MCP Registry first (section 2), then wait for automatic ingestion. If it does not appear within a week, submit manually or email hello@pulsemcp.com.

### Fields to Prepare

Based on typical directory requirements:
- **Name:** @intelagent/mcp-enrichment
- **URL:** https://github.com/IntelagentStudios/Intelagent-MCPs
- **npm:** https://www.npmjs.com/package/@intelagent/mcp-enrichment
- **Description:** Multi-source entity enrichment — company data, contact lookup, email verification, phone validation, and email discovery via Clearbit, Hunter.io, and Twilio APIs. Mock mode, pluggable cache, 17.3 kB.
- **Category:** Data Enrichment / Customer Data
- **License:** MIT
- **Transport:** stdio

---

## 4. MCPlane (mcplane.com)

**Website:** https://mcplane.com
**Submission URL:** https://mcplane.com/mcp_servers/new

### Submission Process

MCPlane has a streamlined submission form:

1. Navigate to https://mcplane.com/mcp_servers/new
2. Enter the **GitHub Repository URL**: `https://github.com/IntelagentStudios/Intelagent-MCPs`
3. Submit

MCPlane auto-extracts metadata from the repository. No additional fields are visible on the public form.

### Categories Available on MCPlane

MCPlane uses 15 categories. The best fit would be one of: Analytics, Communication, or a general/other category. Select the closest match during submission.

---

## Summary Checklist

| Directory | Method | Status |
|-----------|--------|--------|
| awesome-mcp-servers | PR to punkpeye/awesome-mcp-servers | Draft ready above |
| MCP Registry | `mcp-publisher` CLI tool | server.json drafted above |
| PulseMCP | Auto-ingests from MCP Registry; manual form at /submit | Waiting on MCP Registry publish |
| MCPlane | Submit GitHub URL at /mcp_servers/new | Ready to submit |
