import type { ToolDefinition } from '@intelagent/mcp-shared';
import type { EnrichmentService } from './enrichment-service.js';

export function enrichmentTools(service: EnrichmentService): ToolDefinition[] {
  return [
    {
      name: 'enrich_company',
      description:
        'Enrich company data from a domain name or company name. Returns industry, employee count, funding, tech stack, social profiles, and more. Uses Clearbit API (falls back to mock data if no API key configured).',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'Company website domain (e.g. "stripe.com")',
          },
          companyName: {
            type: 'string',
            description: 'Company name (used if domain not provided)',
          },
        },
        anyOf: [{ required: ['domain'] }, { required: ['companyName'] }],
      },
      handler: async (args) => {
        return service.enrichCompany({
          domain: args.domain as string | undefined,
          companyName: args.companyName as string | undefined,
        });
      },
    },
    {
      name: 'enrich_contact',
      description:
        'Enrich contact/person data from an email address or LinkedIn URL. Returns name, title, seniority, department, social profiles, and company info. Uses Clearbit API.',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email address of the person to look up',
          },
          linkedinUrl: {
            type: 'string',
            description: 'LinkedIn profile URL (used if email not provided)',
          },
          firstName: { type: 'string', description: 'First name (optional hint)' },
          lastName: { type: 'string', description: 'Last name (optional hint)' },
          company: { type: 'string', description: 'Company name (optional hint)' },
          domain: { type: 'string', description: 'Company domain (optional hint)' },
        },
        anyOf: [{ required: ['email'] }, { required: ['linkedinUrl'] }],
      },
      handler: async (args) => {
        return service.enrichContact({
          email: args.email as string | undefined,
          linkedinUrl: args.linkedinUrl as string | undefined,
          firstName: args.firstName as string | undefined,
          lastName: args.lastName as string | undefined,
          company: args.company as string | undefined,
          domain: args.domain as string | undefined,
        });
      },
    },
    {
      name: 'verify_email',
      description:
        'Verify an email address for deliverability. Returns validity, deliverability score, disposable/free provider detection, role-based detection, MX records check, and SMTP validation. Uses Hunter.io API.',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email address to verify',
          },
        },
        required: ['email'],
      },
      handler: async (args) => {
        return service.verifyEmail({ email: args.email as string });
      },
    },
    {
      name: 'verify_phone',
      description:
        'Validate and look up a phone number. Returns validity, formatted number, line type (mobile/landline/voip), carrier info, and location. Uses Twilio Lookup API.',
      inputSchema: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Phone number to verify (any format, E.164 preferred)',
          },
          countryCode: {
            type: 'string',
            description: 'Country dialing code without + (e.g. "1" for US, "44" for UK). Defaults to "44".',
          },
        },
        required: ['phone'],
      },
      handler: async (args) => {
        return service.verifyPhone({
          phone: args.phone as string,
          countryCode: args.countryCode as string | undefined,
        });
      },
    },
    {
      name: 'find_email',
      description:
        'Find the email address for a specific person at a company. Provide their first name, last name, and the company domain. Returns the most likely email and a confidence score. Uses Hunter.io API.',
      inputSchema: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            description: "Person's first name",
          },
          lastName: {
            type: 'string',
            description: "Person's last name",
          },
          domain: {
            type: 'string',
            description: 'Company domain (e.g. "stripe.com")',
          },
        },
        required: ['firstName', 'lastName', 'domain'],
      },
      handler: async (args) => {
        return service.findEmail({
          firstName: args.firstName as string,
          lastName: args.lastName as string,
          domain: args.domain as string,
        });
      },
    },
  ];
}
