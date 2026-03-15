import type {
  EnrichmentConfig,
  EnrichmentStatus,
  CacheProvider,
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
import { InMemoryCacheProvider } from './cache.js';
import { clearbitEnrichCompany, clearbitEnrichPerson } from './providers/clearbit.js';
import { hunterVerifyEmail, hunterFindEmail } from './providers/hunter.js';
import { twilioVerifyPhone } from './providers/twilio.js';
import {
  mockCompanyEnrichment,
  mockContactEnrichment,
  mockEmailVerification,
  mockPhoneVerification,
  mockEmailFinder,
} from './providers/mock.js';

export class EnrichmentService {
  private config: EnrichmentConfig;
  private cache: CacheProvider;
  private useMocks: boolean;

  constructor(config: EnrichmentConfig) {
    this.config = config;
    this.cache = config.cache ?? new InMemoryCacheProvider(config.cacheTtl ?? 86400);
    this.useMocks =
      !config.clearbitApiKey && !config.hunterApiKey && !config.twilioAccountSid;
  }

  async enrichCompany(input: CompanyEnrichmentInput): Promise<CompanyEnrichmentResult> {
    if (!input.domain && !input.companyName) {
      return {
        success: false,
        error: 'Either domain or companyName is required',
        provider: 'mock',
        cached: false,
        timestamp: new Date(),
      };
    }

    if (this.useMocks || !this.config.clearbitApiKey) {
      return mockCompanyEnrichment(input);
    }

    const cacheKey = `clearbit:company:${input.domain || input.companyName}`;
    const cached = await this.cache.get<CompanyEnrichmentResult>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await clearbitEnrichCompany(input, this.config.clearbitApiKey);
    if (result.success) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }

  async enrichContact(input: ContactEnrichmentInput): Promise<ContactEnrichmentResult> {
    if (!input.email && !input.linkedinUrl) {
      return {
        success: false,
        error: 'Either email or linkedinUrl is required',
        provider: 'mock',
        cached: false,
        timestamp: new Date(),
      };
    }

    if (this.useMocks || !this.config.clearbitApiKey) {
      return mockContactEnrichment(input);
    }

    const cacheKey = `clearbit:person:${input.email || input.linkedinUrl}`;
    const cached = await this.cache.get<ContactEnrichmentResult>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await clearbitEnrichPerson(input, this.config.clearbitApiKey);
    if (result.success) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }

  async verifyEmail(input: EmailVerificationInput): Promise<EmailVerificationResult> {
    if (!input.email) {
      return {
        success: false,
        email: '',
        valid: false,
        error: 'Email is required',
        provider: 'mock',
        cached: false,
        timestamp: new Date(),
      };
    }

    if (this.useMocks || !this.config.hunterApiKey) {
      return mockEmailVerification(input.email);
    }

    const cacheKey = `hunter:verify:${input.email}`;
    const cached = await this.cache.get<EmailVerificationResult>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await hunterVerifyEmail(input.email, this.config.hunterApiKey);
    if (result.success) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }

  async verifyPhone(input: PhoneVerificationInput): Promise<PhoneVerificationResult> {
    if (!input.phone) {
      return {
        success: false,
        phone: '',
        valid: false,
        error: 'Phone number is required',
        provider: 'mock',
        cached: false,
        timestamp: new Date(),
      };
    }

    if (this.config.twilioAccountSid && this.config.twilioAuthToken) {
      const cacheKey = `twilio:phone:${input.phone}`;
      const cached = await this.cache.get<PhoneVerificationResult>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }

      const result = await twilioVerifyPhone(
        input.phone,
        this.config.twilioAccountSid,
        this.config.twilioAuthToken,
        input.countryCode
      );
      if (result.success) {
        await this.cache.set(cacheKey, result);
      }
      return result;
    }

    return mockPhoneVerification(input.phone);
  }

  async findEmail(input: EmailFinderInput): Promise<EmailFinderResult> {
    if (!input.firstName || !input.lastName || !input.domain) {
      return {
        success: false,
        error: 'firstName, lastName, and domain are required',
        provider: 'mock',
        cached: false,
        timestamp: new Date(),
      };
    }

    if (this.useMocks || !this.config.hunterApiKey) {
      return mockEmailFinder(input);
    }

    const cacheKey = `hunter:find:${input.firstName}:${input.lastName}:${input.domain}`;
    const cached = await this.cache.get<EmailFinderResult>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await hunterFindEmail(input, this.config.hunterApiKey);
    if (result.success) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }

  getStatus(): EnrichmentStatus {
    return {
      clearbit: !!this.config.clearbitApiKey,
      hunter: !!this.config.hunterApiKey,
      apollo: !!this.config.apolloApiKey,
      twilio: !!(this.config.twilioAccountSid && this.config.twilioAuthToken),
      usingMocks: this.useMocks,
    };
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}
