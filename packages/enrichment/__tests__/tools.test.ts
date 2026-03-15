import { describe, it, expect } from 'vitest';
import { enrichmentTools } from '../src/tools.js';
import { EnrichmentService } from '../src/enrichment-service.js';

describe('enrichmentTools', () => {
  const service = new EnrichmentService({});
  const tools = enrichmentTools(service);

  it('defines exactly 5 tools', () => {
    expect(tools).toHaveLength(5);
  });

  it('all tools have required fields', () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.handler).toBe('function');
    }
  });

  it.each([
    ['enrich_company'],
    ['enrich_contact'],
    ['verify_email'],
    ['verify_phone'],
    ['find_email'],
  ])('includes tool "%s"', (toolName) => {
    expect(tools.find((t) => t.name === toolName)).toBeDefined();
  });

  it('enrich_company handler returns mock data', async () => {
    const tool = tools.find((t) => t.name === 'enrich_company')!;
    const result = (await tool.handler({ domain: 'stripe.com' })) as { success: boolean };
    expect(result.success).toBe(true);
  });

  it('verify_email handler returns mock data', async () => {
    const tool = tools.find((t) => t.name === 'verify_email')!;
    const result = (await tool.handler({ email: 'test@example.com' })) as {
      success: boolean;
      valid: boolean;
    };
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('find_email handler returns mock data', async () => {
    const tool = tools.find((t) => t.name === 'find_email')!;
    const result = (await tool.handler({
      firstName: 'Jane',
      lastName: 'Doe',
      domain: 'example.com',
    })) as { success: boolean; email: string };
    expect(result.success).toBe(true);
    expect(result.email).toBe('jane.doe@example.com');
  });
});
