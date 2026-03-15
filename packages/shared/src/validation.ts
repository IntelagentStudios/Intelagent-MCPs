/**
 * Input validation utilities for MCP servers
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const E164_REGEX = /^\+?[1-9]\d{1,14}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return E164_REGEX.test(cleaned);
}

export function formatPhoneE164(phone: string, defaultCountryCode?: string): string {
  let cleaned = phone.replace(/[\s()-]/g, '');
  if (!cleaned.startsWith('+')) {
    const prefix = defaultCountryCode || '44';
    cleaned = cleaned.startsWith('0')
      ? `+${prefix}${cleaned.substring(1)}`
      : `+${prefix}${cleaned}`;
  }
  return cleaned;
}
