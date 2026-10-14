/**
 * Formats a numeric price into INR currency display (e.g. ₹1,299).
 */
export function formatInrPrice(priceInr: number): string {
  if (isNaN(priceInr) || priceInr < 0) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(priceInr);
}
