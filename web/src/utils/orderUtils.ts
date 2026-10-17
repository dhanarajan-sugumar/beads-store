/**
 * Utility functions for Order Reference generation and Customer Phone validation.
 */

/**
 * Generates an Order Reference in the format 'MH-XXXXXX' (e.g., 'MH-482190').
 */
export function generateOrderRef(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `MH-${randomNum}`;
}

/**
 * Sanitizes input phone string by removing non-digits and stripping leading +91 or 0 prefix.
 */
export function sanitizeIndianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Validates that the phone number is a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).
 */
export function isValidIndianPhone(rawPhone: string): boolean {
  const cleaned = sanitizeIndianPhone(rawPhone);
  return /^[6-9]\d{9}$/.test(cleaned);
}
