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
      sku: 'BR-101',
      quantity: 2,
    },
    {
      id: '2',
      name: 'Glass Necklace',
      price_inr: 1299,
      image_url: null,
      sku: 'NL-102',
      quantity: 1,
    },
  ];

  it('builds a detailed order message with shop name, items, reference code, SKUs, and grand total', () => {
    const message = buildWhatsAppOrderMessage('Madhis Handcrafts', mockItems, 2297, 'MH-892301');
    expect(message).toContain('*New Order for Madhis Handcrafts*');
    expect(message).toContain('*Order Ref:* MH-892301');
    expect(message).toContain('1. *[BR-101] Crystal Bracelet*');
    expect(message).toContain('Qty: 2 ×');
    expect(message).toContain('2. *[NL-102] Glass Necklace*');
    expect(message).toContain('*Grand Total:');
    expect(message).toContain('2,297');
  });

  it('builds order message cleanly when item has no SKU', () => {
    const itemsWithoutSku: CartItem[] = [
      {
        id: '1',
        name: 'Simple Anklet',
        price_inr: 349,
        image_url: null,
        quantity: 1,
      },
    ];
    const message = buildWhatsAppOrderMessage('Madhis Handcrafts', itemsWithoutSku, 349);
    expect(message).toContain('1. *Simple Anklet*');
    expect(message).not.toContain('[');
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
