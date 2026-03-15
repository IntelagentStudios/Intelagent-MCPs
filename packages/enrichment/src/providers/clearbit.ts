import type {
  CompanyEnrichmentInput,
  CompanyEnrichmentResult,
  ContactEnrichmentInput,
  ContactEnrichmentResult,
} from '../types.js';

export async function clearbitEnrichCompany(
  input: CompanyEnrichmentInput,
  apiKey: string
): Promise<CompanyEnrichmentResult> {
  try {
    const url = input.domain
      ? `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(input.domain)}`
      : `https://company.clearbit.com/v2/companies/find?name=${encodeURIComponent(input.companyName!)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Company not found',
          provider: 'clearbit',
          cached: false,
          timestamp: new Date(),
        };
      }
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    return {
      success: true,
      company: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        industry: data.category?.industry,
        sector: data.category?.sector,
        employees: data.metrics?.employees,
        employeesRange: data.metrics?.employeesRange,
        founded: data.foundedYear,
        location: {
          city: data.geo?.city,
          state: data.geo?.state,
          country: data.geo?.country,
          streetAddress: data.geo?.streetAddress,
          postalCode: data.geo?.postalCode,
        },
        socialProfiles: {
          linkedin: data.linkedin?.handle
            ? `https://linkedin.com/company/${data.linkedin.handle}`
            : undefined,
          twitter: data.twitter?.handle
            ? `https://twitter.com/${data.twitter.handle}`
            : undefined,
          facebook: data.facebook?.handle
            ? `https://facebook.com/${data.facebook.handle}`
            : undefined,
          crunchbase: data.crunchbase?.handle
            ? `https://crunchbase.com/organization/${data.crunchbase.handle}`
            : undefined,
        },
        techStack: data.tech || [],
        funding: data.metrics?.raised
          ? {
              total: data.metrics.raised,
              lastRound: data.metrics.fundingRaised?.data?.[0]?.type,
              lastRoundDate: data.metrics.fundingRaised?.data?.[0]?.date,
            }
          : undefined,
        logo: data.logo,
        type: data.type,
        ticker: data.ticker,
        revenue: data.metrics?.estimatedAnnualRevenue,
        revenueRange: data.metrics?.annualRevenue,
      },
      provider: 'clearbit',
      cached: false,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Clearbit enrichment failed',
      provider: 'clearbit',
      cached: false,
      timestamp: new Date(),
    };
  }
}

export async function clearbitEnrichPerson(
  input: ContactEnrichmentInput,
  apiKey: string
): Promise<ContactEnrichmentResult> {
  try {
    if (!input.email) {
      return {
        success: false,
        error: 'Email is required for Clearbit person enrichment',
        provider: 'clearbit',
        cached: false,
        timestamp: new Date(),
      };
    }

    const url = `https://person.clearbit.com/v2/people/find?email=${encodeURIComponent(input.email)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Person not found',
          provider: 'clearbit',
          cached: false,
          timestamp: new Date(),
        };
      }
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    return {
      success: true,
      contact: {
        email: data.email,
        emailVerified: true,
        firstName: data.name?.givenName,
        lastName: data.name?.familyName,
        fullName: data.name?.fullName,
        title: data.employment?.title,
        seniority: data.employment?.seniority,
        department: data.employment?.role,
        location: {
          city: data.geo?.city,
          state: data.geo?.state,
          country: data.geo?.country,
        },
        socialProfiles: {
          linkedin: data.linkedin?.handle
            ? `https://linkedin.com/in/${data.linkedin.handle}`
            : undefined,
          twitter: data.twitter?.handle
            ? `https://twitter.com/${data.twitter.handle}`
            : undefined,
        },
        company: {
          name: data.employment?.name,
          domain: data.employment?.domain,
        },
        avatar: data.avatar,
      },
      provider: 'clearbit',
      cached: false,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Clearbit person enrichment failed',
      provider: 'clearbit',
      cached: false,
      timestamp: new Date(),
    };
  }
}
