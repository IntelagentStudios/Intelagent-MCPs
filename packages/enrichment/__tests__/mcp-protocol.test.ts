/**
 * Phase 2: MCP Protocol Testing
 *
 * Tests every tool through the enrichment service layer exactly as the MCP
 * protocol would invoke them — valid input, invalid input, missing params,
 * and edge cases.
 */
import { describe, it, expect } from 'vitest';
import { enrichmentTools } from '../src/tools.js';
import { EnrichmentService } from '../src/enrichment-service.js';

const service = new EnrichmentService({});
const tools = enrichmentTools(service);

function findTool(name: string) {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool "${name}" not found`);
  return tool;
}

describe('Phase 2: MCP Protocol — enrich_company', () => {
  const tool = findTool('enrich_company');

  it('returns data for a known domain', async () => {
    const result = (await tool.handler({ domain: 'anthropic.com' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.company).toBeDefined();
    expect(result.provider).toBe('mock');
    expect(result.cached).toBe(false);
    expect(result.timestamp).toBeDefined();
  });

  it('returns data for a company name', async () => {
    const result = (await tool.handler({ companyName: 'Anthropic' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.company).toBeDefined();
  });

  it('returns error when both params missing', async () => {
    const result = (await tool.handler({})) as Record<string, unknown>;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for empty string domain', async () => {
    const result = (await tool.handler({ domain: '' })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('handles unknown domain gracefully', async () => {
    const result = (await tool.handler({ domain: 'thisdoesnotexist12345.xyz' })) as Record<
      string,
      unknown
    >;
    expect(result.success).toBe(true); // mock mode returns data for any domain
    expect(result.provider).toBe('mock');
  });

  it('response structure matches expected schema', async () => {
    const result = (await tool.handler({ domain: 'stripe.com' })) as Record<string, unknown>;
    const company = result.company as Record<string, unknown>;
    expect(company).toHaveProperty('name');
    expect(company).toHaveProperty('domain');
    expect(company).toHaveProperty('industry');
    expect(company).toHaveProperty('employees');
    expect(company).toHaveProperty('location');
    expect(company).toHaveProperty('socialProfiles');
  });
});

describe('Phase 2: MCP Protocol — enrich_contact', () => {
  const tool = findTool('enrich_contact');

  it('returns data for email lookup', async () => {
    const result = (await tool.handler({ email: 'jane@stripe.com' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.contact).toBeDefined();
    expect(result.provider).toBe('mock');
  });

  it('returns data for linkedinUrl lookup', async () => {
    const result = (await tool.handler({
      linkedinUrl: 'https://linkedin.com/in/janedoe',
    })) as Record<string, unknown>;
    expect(result.success).toBe(true);
  });

  it('uses optional hint params', async () => {
    const result = (await tool.handler({
      email: 'jane@stripe.com',
      firstName: 'Jane',
      lastName: 'Doe',
      company: 'Stripe',
      domain: 'stripe.com',
    })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    const contact = result.contact as Record<string, unknown>;
    expect(contact.firstName).toBe('Jane');
  });

  it('returns error when both email and linkedinUrl missing', async () => {
    const result = (await tool.handler({})) as Record<string, unknown>;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for empty email', async () => {
    const result = (await tool.handler({ email: '' })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('response structure matches expected schema', async () => {
    const result = (await tool.handler({ email: 'test@example.com' })) as Record<string, unknown>;
    const contact = result.contact as Record<string, unknown>;
    expect(contact).toHaveProperty('email');
    expect(contact).toHaveProperty('firstName');
    expect(contact).toHaveProperty('lastName');
    expect(contact).toHaveProperty('title');
    expect(contact).toHaveProperty('company');
  });
});

describe('Phase 2: MCP Protocol — verify_email', () => {
  const tool = findTool('verify_email');

  it('verifies a valid email', async () => {
    const result = (await tool.handler({ email: 'test@example.com' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('detects invalid email', async () => {
    const result = (await tool.handler({ email: 'invalid@invalid.com' })) as Record<
      string,
      unknown
    >;
    expect(result.success).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('detects disposable email domain', async () => {
    const result = (await tool.handler({ email: 'user@tempmail.com' })) as Record<
      string,
      unknown
    >;
    expect(result.disposable).toBe(true);
  });

  it('detects free provider', async () => {
    const result = (await tool.handler({ email: 'user@gmail.com' })) as Record<string, unknown>;
    expect(result.freeProvider).toBe(true);
  });

  it('detects role-based email', async () => {
    const result = (await tool.handler({ email: 'support@example.com' })) as Record<
      string,
      unknown
    >;
    expect(result.role).toBe(true);
  });

  it('returns error for missing email', async () => {
    const result = (await tool.handler({})) as Record<string, unknown>;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for empty email', async () => {
    const result = (await tool.handler({ email: '' })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('response includes all validation fields', async () => {
    const result = (await tool.handler({ email: 'test@example.com' })) as Record<string, unknown>;
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('deliverable');
    expect(result).toHaveProperty('disposable');
    expect(result).toHaveProperty('freeProvider');
    expect(result).toHaveProperty('role');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('provider');
  });
});

describe('Phase 2: MCP Protocol — verify_phone', () => {
  const tool = findTool('verify_phone');

  it('validates a phone number with country code', async () => {
    const result = (await tool.handler({ phone: '+447700900000' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('validates phone with spaces', async () => {
    const result = (await tool.handler({ phone: '+44 7700 900 000' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('validates phone with dashes', async () => {
    const result = (await tool.handler({ phone: '+44-7700-900-000' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
  });

  it('validates phone without country code (uses default)', async () => {
    const result = (await tool.handler({ phone: '07700900000' })) as Record<string, unknown>;
    expect(result.success).toBe(true);
  });

  it('accepts custom countryCode', async () => {
    const result = (await tool.handler({ phone: '2125551234', countryCode: '1' })) as Record<
      string,
      unknown
    >;
    expect(result.success).toBe(true);
  });

  it('returns error for missing phone', async () => {
    const result = (await tool.handler({})) as Record<string, unknown>;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for empty phone', async () => {
    const result = (await tool.handler({ phone: '' })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('response includes type and carrier info', async () => {
    const result = (await tool.handler({ phone: '+447700900000' })) as Record<string, unknown>;
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('carrier');
    expect(result).toHaveProperty('location');
  });
});

describe('Phase 2: MCP Protocol — find_email', () => {
  const tool = findTool('find_email');

  it('finds email for valid name + domain', async () => {
    const result = (await tool.handler({
      firstName: 'Jane',
      lastName: 'Smith',
      domain: 'stripe.com',
    })) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.email).toBe('jane.smith@stripe.com');
    expect(result.score).toBeGreaterThan(0);
    expect(result.sources).toBeDefined();
  });

  it('returns error when firstName missing', async () => {
    const result = (await tool.handler({
      firstName: '',
      lastName: 'Smith',
      domain: 'stripe.com',
    })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('returns error when lastName missing', async () => {
    const result = (await tool.handler({
      firstName: 'Jane',
      lastName: '',
      domain: 'stripe.com',
    })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('returns error when domain missing', async () => {
    const result = (await tool.handler({
      firstName: 'Jane',
      lastName: 'Smith',
      domain: '',
    })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('returns error when all params missing', async () => {
    const result = (await tool.handler({})) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });

  it('response matches expected schema', async () => {
    const result = (await tool.handler({
      firstName: 'Jane',
      lastName: 'Doe',
      domain: 'example.com',
    })) as Record<string, unknown>;
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('provider');
    expect(result).toHaveProperty('cached');
  });
});
