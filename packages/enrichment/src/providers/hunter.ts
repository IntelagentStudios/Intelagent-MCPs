import type {
  EmailVerificationResult,
  EmailFinderInput,
  EmailFinderResult,
} from '../types.js';

export async function hunterVerifyEmail(
  email: string,
  apiKey: string
): Promise<EmailVerificationResult> {
  try {
    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hunter API error: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();
    const data = json.data;

    return {
      success: true,
      email,
      valid: data.result === 'deliverable' || data.result === 'risky',
      deliverable: data.result === 'deliverable',
      disposable: data.disposable,
      freeProvider: data.webmail,
      role: data.role,
      catchAll: data.accept_all,
      mxRecords: data.mx_records,
      smtpValid: data.smtp_server && data.smtp_check,
      score: data.score,
      provider: 'hunter',
      cached: false,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      email,
      valid: false,
      error: error instanceof Error ? error.message : 'Hunter verification failed',
      provider: 'hunter',
      cached: false,
      timestamp: new Date(),
    };
  }
}

export async function hunterFindEmail(
  input: EmailFinderInput,
  apiKey: string
): Promise<EmailFinderResult> {
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(input.domain)}&first_name=${encodeURIComponent(input.firstName)}&last_name=${encodeURIComponent(input.lastName)}&api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hunter API error: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();
    const data = json.data;

    return {
      success: !!data.email,
      email: data.email,
      score: data.score,
      sources: data.sources?.map((s: { uri: string }) => s.uri) || [],
      provider: 'hunter',
      cached: false,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hunter email finder failed',
      provider: 'hunter',
      cached: false,
      timestamp: new Date(),
    };
  }
}
