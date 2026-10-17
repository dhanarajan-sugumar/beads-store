import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import type { CartItem } from '@/utils/cartStorage';
import { formatInrPrice } from '@/utils/formatters';
import { generateOrderRef, sanitizeIndianPhone, isValidIndianPhone } from '@/utils/orderUtils';
import { buildWhatsAppOrderMessage, getWhatsAppShareUrl } from '@/utils/whatsappMessage';
import { supabase } from '@/lib/supabase';
import { env } from '@/config/env';

interface ExpressCheckoutFormProps {
  items: CartItem[];
  grandTotal: number;
  onBack: () => void;
  onOrderSuccess: (orderInfo: {
    orderRef: string;
    customerName: string;
    whatsappUrl: string;
  }) => void;
}

function generateSafeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const ExpressCheckoutForm: React.FC<ExpressCheckoutFormProps> = ({
  items,
  grandTotal,
  onBack,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = customerName.trim();
    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!isValidIndianPhone(customerPhone)) {
      setErrorMessage(
        'Please enter a valid 10-digit Indian WhatsApp mobile number (e.g. 9876543210).'
      );
      return;
    }

    const trimmedAddress = customerAddress.trim();
    if (trimmedAddress.length < 6) {
      setErrorMessage(
        'Please enter your complete delivery address including Area, City and PIN Code.'
      );
      return;
    }

    const cleanPhone = sanitizeIndianPhone(customerPhone);
    const orderRef = generateOrderRef();
    const orderId = generateSafeUUID();

    try {
      setSubmitting(true);

      // 1. Log order to Supabase if client is available
      if (supabase) {
        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          order_ref: orderRef,
          customer_name: trimmedName,
          customer_phone: cleanPhone,
          customer_address: trimmedAddress,
          total_amount: grandTotal,
          status: 'new',
        });

        if (orderError) {
          console.warn('[Checkout] Failed to log order in Supabase:', orderError);
          // Non-blocking: If Supabase fails (e.g. offline/env missing), continue to WhatsApp
        } else {
          // Insert order items
          const orderItemsPayload = items.map((item) => ({
            id: generateSafeUUID(),
            order_id: orderId,
            product_id: item.id,
            product_title: item.name,
            product_sku: item.sku || null,
            unit_price: item.price_inr,
            quantity: item.quantity,
            subtotal: item.price_inr * item.quantity,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsPayload);

          if (itemsError) {
            console.warn('[Checkout] Failed to log order items in Supabase:', itemsError);
          }
        }
      }

      // 2. Generate WhatsApp Order Message
      const message = buildWhatsAppOrderMessage(
        env.shopName || 'Madhis Handcrafts',
        items,
        grandTotal,
        orderRef,
        {
          name: trimmedName,
          phone: cleanPhone,
          address: trimmedAddress,
        }
      );

      const targetPhone = env.whatsappNumber || '+91 99447 17970';
      const whatsappUrl = getWhatsAppShareUrl(message, targetPhone);

      // 3. Open WhatsApp in new tab / app
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // 4. Callback to CartDrawer to clear cart and show success view
      onOrderSuccess({
        orderRef,
        customerName: trimmedName,
        whatsappUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during checkout.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-5">
      <div>
        {/* Navigation & Title */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            aria-label="Back to shopping bag"
            className="p-1 -ml-1 text-muted hover:text-oxblood transition-colors rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
          <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-gold font-medium">
            Express Checkout
          </span>
        </div>

        {/* Order Summary Pill */}
        <div className="p-3 mb-4 rounded-[2px] bg-stone-50 border border-gold/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-wider text-muted">Order Total</p>
            <p className="font-sans font-medium text-base text-oxblood">{formatInrPrice(grandTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-sans uppercase tracking-wider text-muted">Items</p>
            <p className="font-sans text-xs text-ink font-medium">
              {items.reduce((acc, i) => acc + i.quantity, 0)} pieces
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3 mb-4 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Checkout Form */}
        <form id="express-checkout-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="checkout-name"
              className="block text-[11px] font-sans font-semibold tracking-wider uppercase text-gray-700 mb-1"
            >
              Full Name *
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              disabled={submitting}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-[2px] border border-gold/30 bg-white hover:border-gold/60 focus:border-oxblood focus:ring-1 focus:ring-oxblood text-xs font-sans text-ink placeholder:text-muted/60 transition-colors outline-none"
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="checkout-phone"
                className="block text-[11px] font-sans font-semibold tracking-wider uppercase text-gray-700"
              >
                WhatsApp Number *
              </label>
              <span className="text-[10px] font-sans text-muted">10-digit mobile</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-sans text-muted select-none pointer-events-none">
                +91
              </span>
              <input
                id="checkout-phone"
                type="tel"
                required
                disabled={submitting}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full min-h-[44px] pl-11 pr-3.5 py-2 rounded-[2px] border border-gold/30 bg-white hover:border-gold/60 focus:border-oxblood focus:ring-1 focus:ring-oxblood text-xs font-sans text-ink placeholder:text-muted/60 transition-colors outline-none"
              />
            </div>
          </div>

          {/* Delivery Address & Pincode */}
          <div>
            <label
              htmlFor="checkout-address"
              className="block text-[11px] font-sans font-semibold tracking-wider uppercase text-gray-700 mb-1"
            >
              Delivery Address & PIN Code *
            </label>
            <textarea
              id="checkout-address"
              required
              rows={3}
              disabled={submitting}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="House/Flat No, Apartment/Street, City, State - PIN Code"
              className="w-full p-3 rounded-[2px] border border-gold/30 bg-white hover:border-gold/60 focus:border-oxblood focus:ring-1 focus:ring-oxblood text-xs font-sans text-ink placeholder:text-muted/60 transition-colors outline-none leading-relaxed"
            />
          </div>
        </form>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 mt-4 border-t border-gold/25 space-y-2">
        <button
          form="express-checkout-form"
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] py-3 px-4 rounded-[2px] bg-oxblood text-ivory hover:bg-oxblood-hover text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors shadow-xs flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-oxblood disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
              <span>Confirm & Order via WhatsApp</span>
            </>
          )}
        </button>

        <p className="text-[10px] font-sans text-muted text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>Secure checkout • Direct connection with our artisan team</span>
        </p>
      </div>
    </div>
  );
};
