import { describe, it, expect } from 'vitest';
import { formatInrPrice } from '../formatters';

describe('formatInrPrice', () => {
  it('formats standard integer price correctly in INR format', () => {
    // Note: Intl format in node/browser may use non-breaking space or standard symbol
    const formatted = formatInrPrice(1299);
    expect(formatted).toContain('1,299');
    expect(formatted).toContain('₹');
  });

  it('formats zero correctly', () => {
    const formatted = formatInrPrice(0);
    expect(formatted).toContain('0');
    expect(formatted).toContain('₹');
  });

  it('formats large numbers with Indian numbering grouping (lakhs)', () => {
    const formatted = formatInrPrice(100000);
    expect(formatted).toContain('1,00,000');
  });

  it('handles negative or invalid prices gracefully by returning ₹0', () => {
    expect(formatInrPrice(-50)).toContain('0');
    expect(formatInrPrice(NaN)).toContain('0');
  });
});
