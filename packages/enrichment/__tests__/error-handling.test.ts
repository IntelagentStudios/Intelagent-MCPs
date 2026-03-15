/**
 * Phase 5: Error Handling and Edge Cases
 *
 * Verifies every failure mode produces a clear, structured error response.
 * No unhandled exceptions, no leaked internals, no crashes.
 */
import { describe, it, expect } from 'vitest';
import { EnrichmentService } from '../src/enrichment-service.js';
import { enrichmentTools } from '../src/tools.js';

const service = new EnrichmentService({});
const tools = enrichmentTools(service);

function findTool(name: string) {
  return tools.find((t) => t.name === name)!;
}

describe('Phase 5: Error Handling — Malformed Input', () => {
  it('handles number where string expected (domain)', async () => {
    const tool = findTool('enrich_company');
    // MCP may pass wrong types — service should not crash
    const result = (await tool.handler({ domain: 12345 as unknown as string })) as Record<
      string,
      unknown
    >;
    // Should either succeed with mock data or return structured error
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('provider');
  });

  it('handles object where string expected (email)', async () => {
    const tool = findTool('verify_email');
    const result = (await tool.handler({
      email: { nested: 'object' } as unknown as string,
    })) as Record<string, unknown>;
    expect(result).toHaveProperty('success');
  });

  it('handles null params gracefully', async () => {
    const tool = findTool('enrich_company');
    const result = (await tool.handler({
      domain: null as unknown as string,
    })) as Record<string, unknown>;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles undefined params gracefully', async () => {
    const tool = findTool('find_email');
    const result = (await tool.handler({
      firstName: undefined as unknown as string,
      lastName: undefined as unknown as string,
      domain: undefined as unknown as string,
    })) as Record<string, unknown>;
    expect(result.success).toBe(false);
  });
});

describe('Phase 5: Error Handling — Very Long Input', () => {
  it('handles extremely long domain string', async () => {
    const longDomain = 'a'.repeat(10000) + '.com';
    const result = await service.enrichCompany({ domain: longDomain });
    expect(result).toHaveProperty('success');
    // Should not hang or crash
  });

  it('handles extremely long email string', async () => {
    const longEmail = 'a'.repeat(10000) + '@example.com';
    const result = await service.verifyEmail({ email: longEmail });
    expect(result).toHaveProperty('success');
  });

  it('handles extremely long phone number', async () => {
    const longPhone = '+' + '1'.repeat(10000);
    const result = await service.verifyPhone({ phone: longPhone });
    expect(result).toHaveProperty('success');
  });

  it('handles extremely long name for find_email', async () => {
    const longName = 'A'.repeat(10000);
    const result = await service.findEmail({
      firstName: longName,
      lastName: longName,
      domain: 'example.com',
    });
    expect(result).toHaveProperty('success');
  });
});

describe('Phase 5: Error Handling — Unicode and Special Characters', () => {
  it('handles accented characters in company name', async () => {
    const result = await service.enrichCompany({ companyName: 'Société Générale' });
    expect(result.success).toBe(true);
    expect(result.company?.name).toBe('Société Générale');
  });

  it('handles CJK characters in name', async () => {
    const result = await service.findEmail({
      firstName: '太郎',
      lastName: '山田',
      domain: 'example.jp',
    });
    expect(result.success).toBe(true);
    expect(result.email).toContain('example.jp');
  });

  it('handles emoji in company name', async () => {
    const result = await service.enrichCompany({ companyName: '🚀 Rocket Corp' });
    expect(result.success).toBe(true);
  });

  it('handles special characters in domain', async () => {
    const result = await service.enrichCompany({ domain: 'ex@mple.com' });
    expect(result).toHaveProperty('success');
    // Should not crash even with weird domain
  });

  it('handles unicode in email', async () => {
    const result = await service.verifyEmail({ email: 'ñoño@example.com' });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('valid');
  });
});

describe('Phase 5: Error Handling — Concurrent Calls', () => {
  it('handles 10 concurrent enrichCompany calls without race conditions', async () => {
    const domains = Array.from({ length: 10 }, (_, i) => `company${i}.com`);
    const results = await Promise.all(
      domains.map((domain) => service.enrichCompany({ domain }))
    );

    // All should succeed
    expect(results).toHaveLength(10);
    for (const result of results) {
      expect(result.success).toBe(true);
    }

    // Each should have the correct domain (not mixed up)
    for (let i = 0; i < 10; i++) {
      expect(results[i].company?.domain).toBe(`company${i}.com`);
    }
  });

  it('handles mixed concurrent tool calls', async () => {
    const results = await Promise.all([
      service.enrichCompany({ domain: 'a.com' }),
      service.enrichContact({ email: 'a@a.com' }),
      service.verifyEmail({ email: 'b@b.com' }),
      service.verifyPhone({ phone: '+447700900000' }),
      service.findEmail({ firstName: 'A', lastName: 'B', domain: 'c.com' }),
    ]);

    expect(results).toHaveLength(5);
    for (const result of results) {
      expect(result.success).toBe(true);
    }
  });
});

describe('Phase 5: Error Handling — Empty Response Handling', () => {
  it('all tools return structured responses (never null/undefined)', async () => {
    const calls = [
      service.enrichCompany({ domain: 'x.com' }),
      service.enrichContact({ email: 'x@x.com' }),
      service.verifyEmail({ email: 'x@x.com' }),
      service.verifyPhone({ phone: '+44123' }),
      service.findEmail({ firstName: 'X', lastName: 'Y', domain: 'x.com' }),
    ];

    const results = await Promise.all(calls);
    for (const result of results) {
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('cached');
    }
  });

  it('error responses always include error message', async () => {
    const errorCalls = [
      service.enrichCompany({}),
      service.enrichContact({}),
      service.verifyEmail({ email: '' }),
      service.verifyPhone({ phone: '' }),
      service.findEmail({ firstName: '', lastName: '', domain: '' }),
    ];

    const results = await Promise.all(errorCalls);
    for (const result of results) {
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    }
  });
});
