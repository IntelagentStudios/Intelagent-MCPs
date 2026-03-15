import { describe, it, expect } from 'vitest';
import { EnrichmentService } from '../src/enrichment-service.js';

describe('EnrichmentService (mock mode)', () => {
  const service = new EnrichmentService({});

  describe('enrichCompany', () => {
    it('returns error when no domain or companyName provided', async () => {
      const result = await service.enrichCompany({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Either domain or companyName is required');
    });

    it('returns mock data for domain lookup', async () => {
      const result = await service.enrichCompany({ domain: 'stripe.com' });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.company).toBeDefined();
      expect(result.company!.domain).toBe('stripe.com');
    });

    it('returns mock data for companyName lookup', async () => {
      const result = await service.enrichCompany({ companyName: 'Stripe' });
      expect(result.success).toBe(true);
      expect(result.company!.name).toBe('Stripe');
    });
  });

  describe('enrichContact', () => {
    it('returns error when no email or linkedinUrl provided', async () => {
      const result = await service.enrichContact({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Either email or linkedinUrl is required');
    });

    it('returns mock data for email lookup', async () => {
      const result = await service.enrichContact({ email: 'jane@stripe.com' });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.contact).toBeDefined();
      expect(result.contact!.email).toBe('jane@stripe.com');
    });
  });

  describe('verifyEmail', () => {
    it('returns error when no email provided', async () => {
      const result = await service.verifyEmail({ email: '' });
      expect(result.success).toBe(false);
    });

    it('verifies valid email in mock mode', async () => {
      const result = await service.verifyEmail({ email: 'test@example.com' });
      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.score).toBe(95);
    });

    it('detects invalid email in mock mode', async () => {
      const result = await service.verifyEmail({ email: 'invalid@invalid.com' });
      expect(result.success).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.score).toBe(10);
    });

    it('detects disposable email providers', async () => {
      const result = await service.verifyEmail({ email: 'user@tempmail.com' });
      expect(result.disposable).toBe(true);
    });

    it('detects free email providers', async () => {
      const result = await service.verifyEmail({ email: 'user@gmail.com' });
      expect(result.freeProvider).toBe(true);
    });

    it('detects role-based emails', async () => {
      const result = await service.verifyEmail({ email: 'info@example.com' });
      expect(result.role).toBe(true);
    });
  });

  describe('verifyPhone', () => {
    it('returns error when no phone provided', async () => {
      const result = await service.verifyPhone({ phone: '' });
      expect(result.success).toBe(false);
    });

    it('verifies phone in mock mode', async () => {
      const result = await service.verifyPhone({ phone: '+44 7700 900000' });
      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.type).toBe('mobile');
    });
  });

  describe('findEmail', () => {
    it('returns error when required fields missing', async () => {
      const result = await service.findEmail({
        firstName: '',
        lastName: 'Doe',
        domain: 'example.com',
      });
      expect(result.success).toBe(false);
    });

    it('finds email in mock mode', async () => {
      const result = await service.findEmail({
        firstName: 'Jane',
        lastName: 'Smith',
        domain: 'stripe.com',
      });
      expect(result.success).toBe(true);
      expect(result.email).toBe('jane.smith@stripe.com');
      expect(result.score).toBe(85);
      expect(result.provider).toBe('mock');
    });
  });

  describe('getStatus', () => {
    it('reports all providers as unconfigured in mock mode', () => {
      const status = service.getStatus();
      expect(status.clearbit).toBe(false);
      expect(status.hunter).toBe(false);
      expect(status.apollo).toBe(false);
      expect(status.twilio).toBe(false);
      expect(status.usingMocks).toBe(true);
    });

    it('reports providers as configured when keys are set', () => {
      const configured = new EnrichmentService({
        clearbitApiKey: 'sk-test',
        hunterApiKey: 'hunter-test',
        apolloApiKey: 'apollo-test',
        twilioAccountSid: 'AC123',
        twilioAuthToken: 'token123',
      });
      const status = configured.getStatus();
      expect(status.clearbit).toBe(true);
      expect(status.hunter).toBe(true);
      expect(status.apollo).toBe(true);
      expect(status.twilio).toBe(true);
      expect(status.usingMocks).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('clears the cache without error', async () => {
      await expect(service.clearCache()).resolves.toBeUndefined();
    });
  });
});
