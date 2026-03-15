#!/usr/bin/env node

import { createMCPServer } from '@intelagent/mcp-shared';
import { EnrichmentService } from './enrichment-service.js';
import { enrichmentTools } from './tools.js';

const service = new EnrichmentService({
  clearbitApiKey: process.env.CLEARBIT_API_KEY,
  hunterApiKey: process.env.HUNTER_API_KEY,
  apolloApiKey: process.env.APOLLO_API_KEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  cacheTtl: parseInt(process.env.ENRICHMENT_CACHE_TTL || '86400', 10),
});

createMCPServer({
  name: 'intelagent-enrichment',
  version: '1.0.0',
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
