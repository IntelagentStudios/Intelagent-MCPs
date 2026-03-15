/**
 * Phase 3: Mock Mode Testing
 *
 * Verifies the MCP works fully without any API keys configured.
 * Mock responses must have identical structure to real responses.
 */
import { describe, it, expect } from 'vitest';
import { EnrichmentService } from '../src/enrichment-service.js';

describe('Phase 3: Mock Mode', () => {
  const service = new EnrichmentService({});

  it('activates mock mode when no keys configured', () => {
    const status = service.getStatus();
    expect(status.usingMocks).toBe(true);
    expect(status.clearbit).toBe(false);
    expect(status.hunter).toBe(false);
    expect(status.twilio).toBe(false);
  });

  it('enrichCompany returns mock data with full structure', async () => {
    const result = await service.enrichCompany({ domain: 'stripe.com' });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.cached).toBe(false);
    expect(result.timestamp).toBeInstanceOf(Date);
    // Verify all company fields present
    const c = result.company!;
    expect(c.name).toBeTruthy();
    expect(c.domain).toBeTruthy();
    expect(c.description).toBeTruthy();
    expect(c.industry).toBeTruthy();
    expect(c.employees).toBeTypeOf('number');
    expect(c.location).toBeDefined();
    expect(c.socialProfiles).toBeDefined();
    expect(c.techStack).toBeInstanceOf(Array);
  });

  it('enrichContact returns mock data with full structure', async () => {
    const result = await service.enrichContact({ email: 'jane@example.com' });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    const c = result.contact!;
    expect(c.email).toBeTruthy();
    expect(c.firstName).toBeTruthy();
    expect(c.lastName).toBeTruthy();
    expect(c.title).toBeTruthy();
    expect(c.company).toBeDefined();
    expect(c.location).toBeDefined();
  });

  it('verifyEmail returns mock data with full structure', async () => {
    const result = await service.verifyEmail({ email: 'test@example.com' });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.email).toBe('test@example.com');
    expect(result.valid).toBeTypeOf('boolean');
    expect(result.score).toBeTypeOf('number');
    expect(result.deliverable).toBeTypeOf('boolean');
    expect(result.disposable).toBeTypeOf('boolean');
    expect(result.freeProvider).toBeTypeOf('boolean');
    expect(result.role).toBeTypeOf('boolean');
  });

  it('verifyPhone returns mock data with full structure', async () => {
    const result = await service.verifyPhone({ phone: '+447700900000' });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.valid).toBeTypeOf('boolean');
    expect(result.type).toBeTruthy();
    expect(result.carrier).toBeTruthy();
    expect(result.location).toBeDefined();
  });

  it('findEmail returns mock data with full structure', async () => {
    const result = await service.findEmail({
      firstName: 'Jane',
      lastName: 'Doe',
      domain: 'example.com',
    });
    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.email).toBeTruthy();
    expect(result.score).toBeTypeOf('number');
    expect(result.sources).toBeInstanceOf(Array);
  });

  describe('per-tool fallback', () => {
    it('uses real clearbit but mock hunter when only clearbit key set', () => {
      const partial = new EnrichmentService({ clearbitApiKey: 'sk-test' });
      const status = partial.getStatus();
      expect(status.clearbit).toBe(true);
      expect(status.hunter).toBe(false);
      expect(status.usingMocks).toBe(false); // not fully in mock mode
    });

    it('uses real hunter but mock clearbit when only hunter key set', () => {
      const partial = new EnrichmentService({ hunterApiKey: 'hunter-test' });
      const status = partial.getStatus();
      expect(status.clearbit).toBe(false);
      expect(status.hunter).toBe(true);
      expect(status.usingMocks).toBe(false);
    });
  });
});
