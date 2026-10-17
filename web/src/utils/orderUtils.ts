import type { OrderStatus } from '@/types/database';

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

/**
 * Returns human-readable label for OrderStatus.
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'contacted':
      return 'Contacted';
    case 'paid':
      return 'Paid';
    case 'shipped':
      return 'Shipped';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Returns tailwind CSS classes for styling status badges.
 */
export function getOrderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'new':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'contacted':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'paid':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'shipped':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'cancelled':
      return 'bg-stone-100 text-stone-600 border-stone-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
}

/**
 * Builds a direct WhatsApp chat URL to reach out to the customer regarding their order.
 */
export function buildCustomerWhatsAppUrl(phone: string, orderRef: string, customerName?: string): string {
  const cleaned = sanitizeIndianPhone(phone);
  const nameGreeting = customerName?.trim() ? `Hello ${customerName.trim()}` : 'Hello';
  const message = `${nameGreeting}, thank you for ordering from Madhis Handcrafts! Regarding your order ${orderRef}: `;
  return `https://wa.me/91${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats ISO timestamp to a readable date string (e.g., '17 Oct 2026, 08:02 PM').
 */
export function formatOrderDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}
