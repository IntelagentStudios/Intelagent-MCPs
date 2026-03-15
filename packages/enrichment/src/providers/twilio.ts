import type { PhoneVerificationResult } from '../types.js';
import { formatPhoneE164 } from '@intelagent/mcp-shared';

export async function twilioVerifyPhone(
  phone: string,
  accountSid: string,
  authToken: string,
  countryCode?: string
): Promise<PhoneVerificationResult> {
  try {
    const formattedPhone = formatPhoneE164(phone, countryCode);
    const encodedPhone = encodeURIComponent(formattedPhone);
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodedPhone}?Fields=line_type_intelligence,caller_name`;

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          phone,
          valid: false,
          error: 'Phone number not found',
          provider: 'twilio',
          cached: false,
          timestamp: new Date(),
        };
      }
      throw new Error(`Twilio API error: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    const lineTypeMap: Record<string, PhoneVerificationResult['type']> = {
      mobile: 'mobile',
      landline: 'landline',
      voip: 'voip',
      nonFixedVoip: 'voip',
      unknown: 'unknown',
    };

    return {
      success: true,
      phone,
      valid: data.valid !== false,
      formatted: data.phone_number,
      nationalFormat: data.national_format,
      internationalFormat: data.phone_number,
      type: lineTypeMap[data.line_type_intelligence?.type] || 'unknown',
      carrier: data.line_type_intelligence?.carrier_name,
      location: {
        country: data.country_code,
      },
      provider: 'twilio',
      cached: false,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      phone,
      valid: false,
      error: error instanceof Error ? error.message : 'Twilio verification failed',
      provider: 'twilio',
      cached: false,
      timestamp: new Date(),
    };
  }
}
