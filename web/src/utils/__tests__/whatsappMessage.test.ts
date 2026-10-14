import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppOrderMessage,
  getWhatsAppShareUrl,
} from '../whatsappMessage';
import type { CartItem } from '../cartStorage';

describe('whatsappMessage', () => {
  const mockItems: CartItem[] = [
    {
      id: '1',
      name: 'Crystal Bracelet',
      price_inr: 499,
      image_url: null,
      quantity: 2,
    },
    {
      id: '2',
      name: 'Glass Necklace',
      price_inr: 1299,
      image_url: null,
      quantity: 1,
    },
  ];

  it('builds a detailed order message with shop name, items, reference code, and grand total', () => {
    const message = buildWhatsAppOrderMessage('Madhis Handcrafts', mockItems, 2297, 'MH-892301');
    expect(message).toContain('*New Order for Madhis Handcrafts*');
    expect(message).toContain('*Order Ref:* MH-892301');
    expect(message).toContain('1. *Crystal Bracelet*');
    expect(message).toContain('Qty: 2 ×');
    expect(message).toContain('2. *Glass Necklace*');
    expect(message).toContain('*Grand Total:');
    expect(message).toContain('2,297');
  });

  it('generates correct wa.me link with encoded text', () => {
    const url = getWhatsAppShareUrl('Hello Madhis Handcrafts');
    expect(url).toBe('https://wa.me/?text=Hello%20Madhis%20Handcrafts');
  });

  it('generates correct wa.me link with phone number when provided', () => {
    const url = getWhatsAppShareUrl('Hello', '+91 98765 43210');
    expect(url).toBe('https://wa.me/919876543210?text=Hello');
  });
});
