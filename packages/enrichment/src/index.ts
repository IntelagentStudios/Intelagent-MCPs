#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createMCPServer } from '@intelagent/mcp-shared';
import { EnrichmentService } from './enrichment-service.js';
import { enrichmentTools } from './tools.js';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const service = new EnrichmentService({
  clearbitApiKey: process.env.CLEARBIT_API_KEY,
  hunterApiKey: process.env.HUNTER_API_KEY,
  apolloApiKey: process.env.APOLLO_API_KEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  cacheTtl: parseInt(process.env.ENRICHMENT_CACHE_TTL || '86400', 10),
});

createMCPServer({
  name: pkg.name,
  version: pkg.version,
  tools: enrichmentTools(service),
  resources: [
    {
      uri: 'enrichment://status',
      name: 'Provider Status',
      description: 'Shows which enrichment API providers are configured and active',
      handler: async () => JSON.stringify(service.getStatus(), null, 2),
    },
  ],
});
