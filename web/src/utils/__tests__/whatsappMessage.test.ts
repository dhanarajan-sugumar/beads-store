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

  it('includes Made to Order label and note when cart contains made_to_order items', () => {
    const itemsWithMto: CartItem[] = [
      {
        id: '1',
        name: 'Custom Garnet Choker',
        price_inr: 1599,
        image_url: null,
        sku: 'NL-205',
        stock_status: 'made_to_order',
        quantity: 1,
      },
    ];
    const message = buildWhatsAppOrderMessage('Madhis Handcrafts', itemsWithMto, 1599);
    expect(message).toContain('1. *[NL-205] Custom Garnet Choker (Made to Order)*');
    expect(message).toContain('Includes Made-to-Order handcrafted piece(s)');
  });

  it('includes Customer Details section when customerDetails is provided', () => {
    const message = buildWhatsAppOrderMessage(
      'Madhis Handcrafts',
      mockItems,
      2297,
      'MH-482190',
      {
        name: 'Priya Sharma',
        phone: '9876543210',
        address: '12B, Palm Grove Apts, Indiranagar, Bengaluru - 560038',
      }
    );
    expect(message).toContain('*Customer Details:*');
    expect(message).toContain('• Name: Priya Sharma');
    expect(message).toContain('• Phone: 9876543210');
    expect(message).toContain('• Delivery Address: 12B, Palm Grove Apts, Indiranagar, Bengaluru - 560038');
    expect(message).toContain('*Order Ref:* MH-482190');
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
