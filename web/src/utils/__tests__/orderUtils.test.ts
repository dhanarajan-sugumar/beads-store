import { describe, it, expect } from 'vitest';
import {
  generateOrderRef,
  sanitizeIndianPhone,
  isValidIndianPhone,
  getOrderStatusLabel,
  getOrderStatusBadgeClass,
  buildCustomerWhatsAppUrl,
  formatOrderDate,
} from '../orderUtils';

describe('orderUtils', () => {
  describe('generateOrderRef', () => {
    it('generates a ref in the format MH-XXXXXX with 6 digits', () => {
      const ref = generateOrderRef();
      expect(ref).toMatch(/^MH-\d{6}$/);
    });

    it('generates distinct references on successive calls', () => {
      const ref1 = generateOrderRef();
      const ref2 = generateOrderRef();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('sanitizeIndianPhone', () => {
    it('strips spaces, dashes, and parentheses', () => {
      expect(sanitizeIndianPhone('98765-43210')).toBe('9876543210');
      expect(sanitizeIndianPhone('(98765) 43210')).toBe('9876543210');
      expect(sanitizeIndianPhone('98765 43210')).toBe('9876543210');
    });

    it('removes +91 or 91 country code prefix if 12 digits', () => {
      expect(sanitizeIndianPhone('+91 98765 43210')).toBe('9876543210');
      expect(sanitizeIndianPhone('919876543210')).toBe('9876543210');
    });

    it('removes leading 0 if 11 digits', () => {
      expect(sanitizeIndianPhone('09876543210')).toBe('9876543210');
    });
  });

  describe('isValidIndianPhone', () => {
    it('accepts valid 10-digit mobile numbers starting with 6, 7, 8, 9', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('8123456789')).toBe(true);
      expect(isValidIndianPhone('7000000000')).toBe(true);
      expect(isValidIndianPhone('6381234567')).toBe(true);
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true);
      expect(isValidIndianPhone('09876543210')).toBe(true);
    });

    it('rejects numbers not starting with 6-9 or invalid lengths', () => {
      expect(isValidIndianPhone('1234567890')).toBe(false);
      expect(isValidIndianPhone('5234567890')).toBe(false);
      expect(isValidIndianPhone('98765')).toBe(false);
      expect(isValidIndianPhone('9876543210123')).toBe(false);
      expect(isValidIndianPhone('abcdefghij')).toBe(false);
      expect(isValidIndianPhone('')).toBe(false);
    });
  });
  describe('getOrderStatusLabel', () => {
    it('returns proper display names for statuses', () => {
      expect(getOrderStatusLabel('new')).toBe('New');
      expect(getOrderStatusLabel('contacted')).toBe('Contacted');
      expect(getOrderStatusLabel('paid')).toBe('Paid');
      expect(getOrderStatusLabel('shipped')).toBe('Shipped');
      expect(getOrderStatusLabel('cancelled')).toBe('Cancelled');
    });
  });

  describe('getOrderStatusBadgeClass', () => {
    it('returns appropriate tailwind classes per status', () => {
      expect(getOrderStatusBadgeClass('new')).toContain('bg-amber-50');
      expect(getOrderStatusBadgeClass('contacted')).toContain('bg-blue-50');
      expect(getOrderStatusBadgeClass('paid')).toContain('bg-emerald-50');
      expect(getOrderStatusBadgeClass('shipped')).toContain('bg-purple-50');
      expect(getOrderStatusBadgeClass('cancelled')).toContain('bg-stone-100');
    });
  });

  describe('buildCustomerWhatsAppUrl', () => {
    it('creates a wa.me URL with sanitized phone and encoded greeting with order ref', () => {
      const url = buildCustomerWhatsAppUrl('+91 98765 43210', 'MH-123456', 'Priya');
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain('Hello%20Priya');
      expect(url).toContain('MH-123456');
    });

    it('falls back to generic greeting if customer name is empty', () => {
      const url = buildCustomerWhatsAppUrl('9876543210', 'MH-654321');
      expect(url).toContain('https://wa.me/919876543210');
      expect(url).toContain('Hello%2C');
      expect(url).toContain('MH-654321');
    });
  });

  describe('formatOrderDate', () => {
    it('formats a valid ISO timestamp', () => {
      const formatted = formatOrderDate('2026-10-17T12:30:00.000Z');
      expect(formatted).toMatch(/17/);
      expect(formatted).toMatch(/Oct/);
      expect(formatted).toMatch(/2026/);
    });

    it('returns raw string for invalid dates', () => {
      expect(formatOrderDate('invalid-date')).toBe('invalid-date');
    });
  });
});
