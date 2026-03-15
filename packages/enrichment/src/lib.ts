/**
 * Library exports for using the enrichment service programmatically.
 *
 * Import from '@intelagent/mcp-enrichment/service' for library usage.
 * The default entry point ('@intelagent/mcp-enrichment') starts the MCP server.
 */
export { EnrichmentService } from './enrichment-service.js';
export { enrichmentTools } from './tools.js';
export { InMemoryCacheProvider } from './cache.js';
export type {
  CacheProvider,
  EnrichmentConfig,
  EnrichmentStatus,
  CompanyEnrichmentInput,
  CompanyEnrichmentResult,
  ContactEnrichmentInput,
  ContactEnrichmentResult,
  EmailVerificationInput,
  EmailVerificationResult,
  PhoneVerificationInput,
  PhoneVerificationResult,
  EmailFinderInput,
  EmailFinderResult,
} from './types.js';
