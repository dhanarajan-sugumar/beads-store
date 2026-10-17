import { describe, it, expect } from 'vitest';
import { generateOrderRef, sanitizeIndianPhone, isValidIndianPhone } from '../orderUtils';

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
});
