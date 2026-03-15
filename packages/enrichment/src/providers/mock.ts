import type {
  CompanyEnrichmentInput,
  CompanyEnrichmentResult,
  ContactEnrichmentInput,
  ContactEnrichmentResult,
  EmailFinderInput,
  EmailFinderResult,
  EmailVerificationResult,
  PhoneVerificationResult,
} from '../types.js';

export function mockCompanyEnrichment(input: CompanyEnrichmentInput): CompanyEnrichmentResult {
  return {
    success: true,
    company: {
      name: input.companyName || `Company for ${input.domain}`,
      domain: input.domain || 'example.com',
      description: 'A leading technology company specializing in innovative solutions.',
      industry: 'Technology',
      sector: 'Software',
      employees: 150,
      employeesRange: '101-250',
      founded: 2015,
      location: {
        city: 'London',
        state: 'England',
        country: 'United Kingdom',
        streetAddress: '123 Tech Street',
        postalCode: 'EC1A 1BB',
      },
      socialProfiles: {
        linkedin: 'https://linkedin.com/company/example',
        twitter: 'https://twitter.com/example',
      },
      techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      logo: 'https://logo.clearbit.com/example.com',
      type: 'private',
    },
    provider: 'mock',
    cached: false,
    timestamp: new Date(),
  };
}

export function mockContactEnrichment(input: ContactEnrichmentInput): ContactEnrichmentResult {
  return {
    success: true,
    contact: {
      email:
        input.email ||
        `${input.firstName?.toLowerCase()}.${input.lastName?.toLowerCase()}@example.com`,
      emailVerified: true,
      firstName: input.firstName || 'John',
      lastName: input.lastName || 'Doe',
      fullName: `${input.firstName || 'John'} ${input.lastName || 'Doe'}`,
      title: 'Senior Software Engineer',
      seniority: 'manager',
      department: 'Engineering',
      location: {
        city: 'London',
        country: 'United Kingdom',
      },
      socialProfiles: {
        linkedin: 'https://linkedin.com/in/johndoe',
      },
      company: {
        name: input.company || 'Example Corp',
        domain: input.domain || 'example.com',
      },
    },
    provider: 'mock',
    cached: false,
    timestamp: new Date(),
  };
}

export function mockEmailVerification(email: string): EmailVerificationResult {
  const isValid = email.includes('@') && !email.includes('invalid');
  return {
    success: true,
    email,
    valid: isValid,
    deliverable: isValid,
    disposable: email.includes('tempmail') || email.includes('guerrilla'),
    freeProvider: email.includes('gmail') || email.includes('yahoo') || email.includes('hotmail'),
    role: email.startsWith('info@') || email.startsWith('support@') || email.startsWith('sales@'),
    catchAll: false,
    mxRecords: true,
    smtpValid: isValid,
    score: isValid ? 95 : 10,
    provider: 'mock',
    cached: false,
    timestamp: new Date(),
  };
}

export function mockPhoneVerification(phone: string): PhoneVerificationResult {
  const cleanPhone = phone.replace(/\D/g, '');
  return {
    success: true,
    phone,
    valid: cleanPhone.length >= 10,
    formatted: phone,
    nationalFormat: cleanPhone,
    internationalFormat: `+${cleanPhone}`,
    type: 'mobile',
    carrier: 'Mock Carrier',
    location: {
      country: 'United Kingdom',
    },
    provider: 'mock',
    cached: false,
    timestamp: new Date(),
  };
}

export function mockEmailFinder(input: EmailFinderInput): EmailFinderResult {
  const email = `${input.firstName.toLowerCase()}.${input.lastName.toLowerCase()}@${input.domain}`;
  return {
    success: true,
    email,
    score: 85,
    sources: ['LinkedIn', 'Company Website'],
    provider: 'mock',
    cached: false,
    timestamp: new Date(),
  };
}
