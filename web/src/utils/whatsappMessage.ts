import type { CartItem } from './cartStorage';
import { formatInrPrice } from './formatters';

/**
 * Builds a clean, friendly WhatsApp message text summarizing the order with order reference code and item SKUs.
 */
export function buildWhatsAppOrderMessage(
  shopName: string,
  items: CartItem[],
  grandTotal: number,
  refCode?: string
): string {
  const lines: string[] = [];

  lines.push(`*New Order for ${shopName}*`);
  if (refCode) {
    lines.push(`*Order Ref:* ${refCode}`);
  }
  lines.push(
    `*Date:* ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`
  );
  lines.push('');
  lines.push('*Items Ordered:*');

  items.forEach((item, index) => {
    const itemTotal = item.price_inr * item.quantity;
    const nameWithSku = item.sku ? `[${item.sku}] ${item.name}` : item.name;
    lines.push(
      `${index + 1}. *${nameWithSku}*` +
        `\n   Qty: ${item.quantity} × ${formatInrPrice(item.price_inr)} = ${formatInrPrice(itemTotal)}`
    );
  });

  lines.push('');
  lines.push(`*Grand Total: ${formatInrPrice(grandTotal)}*`);
  lines.push('');
  lines.push('Please confirm availability and payment details!');

  return lines.join('\n');
}

/**
 * Generates the wa.me link for WhatsApp Web/App sharing.
 */
export function getWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encodedText = encodeURIComponent(message);
  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
