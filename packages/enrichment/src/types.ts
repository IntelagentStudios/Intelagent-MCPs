export interface CompanyEnrichmentInput {
  domain?: string;
  companyName?: string;
}

export interface CompanyEnrichmentResult {
  success: boolean;
  company?: {
    name: string;
    domain: string;
    description?: string;
    industry?: string;
    sector?: string;
    employees?: number;
    employeesRange?: string;
    founded?: number;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      streetAddress?: string;
      postalCode?: string;
    };
    socialProfiles?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      crunchbase?: string;
    };
    techStack?: string[];
    funding?: {
      total?: number;
      lastRound?: string;
      lastRoundDate?: string;
    };
    logo?: string;
    type?: string;
    ticker?: string;
    revenue?: number;
    revenueRange?: string;
  };
  provider: 'clearbit' | 'apollo' | 'mock';
  cached: boolean;
  error?: string;
  timestamp: Date;
}

export interface ContactEnrichmentInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  domain?: string;
  linkedinUrl?: string;
}

export interface ContactEnrichmentResult {
  success: boolean;
  contact?: {
    email?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    title?: string;
    seniority?: string;
    department?: string;
    phone?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    socialProfiles?: {
      linkedin?: string;
      twitter?: string;
    };
    company?: {
      name?: string;
      domain?: string;
    };
    avatar?: string;
  };
  provider: 'clearbit' | 'hunter' | 'apollo' | 'mock';
  cached: boolean;
  error?: string;
  timestamp: Date;
}

export interface EmailVerificationInput {
  email: string;
}

export interface EmailVerificationResult {
  success: boolean;
  email: string;
  valid: boolean;
  deliverable?: boolean;
  disposable?: boolean;
  freeProvider?: boolean;
  role?: boolean;
  catchAll?: boolean;
  mxRecords?: boolean;
  smtpValid?: boolean;
  score?: number;
  provider: 'hunter' | 'clearbit' | 'mock';
  cached: boolean;
  error?: string;
  timestamp: Date;
}

export interface PhoneVerificationInput {
  phone: string;
  countryCode?: string;
}

export interface PhoneVerificationResult {
  success: boolean;
  phone: string;
  valid: boolean;
  formatted?: string;
  nationalFormat?: string;
  internationalFormat?: string;
  type?: 'mobile' | 'landline' | 'voip' | 'unknown';
  carrier?: string;
  location?: {
    country?: string;
    region?: string;
  };
  provider: 'twilio' | 'numverify' | 'mock';
  cached: boolean;
  error?: string;
  timestamp: Date;
}

export interface EmailFinderInput {
  firstName: string;
  lastName: string;
  domain: string;
}

export interface EmailFinderResult {
  success: boolean;
  email?: string;
  score?: number;
  sources?: string[];
  provider: 'hunter' | 'apollo' | 'mock';
  cached: boolean;
  error?: string;
  timestamp: Date;
}

export interface EnrichmentConfig {
  clearbitApiKey?: string;
  hunterApiKey?: string;
  apolloApiKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  cacheTtl?: number;
  cache?: CacheProvider;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface EnrichmentStatus {
  clearbit: boolean;
  hunter: boolean;
  apollo: boolean;
  twilio: boolean;
  usingMocks: boolean;
}
