import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  Loader2,
  Check,
} from 'lucide-react';
import type { OrderWithItems, OrderStatus } from '@/types/database';
import {
  getOrderStatusLabel,
  getOrderStatusBadgeClass,
  buildCustomerWhatsAppUrl,
  formatOrderDate,
} from '@/utils/orderUtils';
import { formatInrPrice } from '@/utils/formatters';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: OrderWithItems | null;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const ALL_STATUSES: OrderStatus[] = ['new', 'contacted', 'paid', 'shipped', 'cancelled'];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  onClose,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setStatusUpdatedSuccess(false);
    }
  }, [order]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleApplyStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status || isUpdatingStatus) return;
    try {
      setIsUpdatingStatus(true);
      setStatusUpdatedSuccess(false);
      await onStatusChange(order.id, newStatus);
      setSelectedStatus(newStatus);
      setStatusUpdatedSuccess(true);
      setTimeout(() => setStatusUpdatedSuccess(false), 2500);
    } catch {
      // Revert if error
      setSelectedStatus(order.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const whatsAppUrl = buildCustomerWhatsAppUrl(
    order.customer_phone,
    order.order_ref,
    order.customer_name
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base sm:text-lg font-bold text-ink">
              {order.order_ref}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getOrderStatusBadgeClass(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-ink hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Maintenance Toolbar */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                Update Order Status
              </span>
              {statusUpdatedSuccess && (
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Status Updated
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleApplyStatusChange(status)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-ink text-paper border-ink shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                    } disabled:opacity-50`}
                  >
                    {isUpdatingStatus && isActive && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    <span>{getOrderStatusLabel(status)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </div>
              <p className="font-sans font-semibold text-ink text-base">
                {order.customer_name}
              </p>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>+91 {order.customer_phone}</span>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="pt-2">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Delivery Address & Placed Time */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {order.customer_address}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="w-3 h-3" />
                <span>Placed on {formatOrderDate(order.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Itemized Order List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-600 font-semibold text-xs uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              <span>Order Items ({order.order_items?.length || 0})</span>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-[11px] uppercase font-semibold text-stone-500 border-b border-stone-200">
                  <tr>
                    <th scope="col" className="px-4 py-3">Item</th>
                    <th scope="col" className="px-4 py-3 text-right">Unit Price</th>
                    <th scope="col" className="px-4 py-3 text-center">Qty</th>
                    <th scope="col" className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{item.product_title}</p>
                          {item.product_sku && (
                            <span className="font-mono text-[11px] text-stone-500">
                              SKU: {item.product_sku}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-stone-600">
                          {formatInrPrice(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink">
                          {formatInrPrice(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-stone-400">
                        No item records attached to this order.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-stone-50/80 border-t border-stone-200 font-semibold text-ink">
                  <tr>
                    <td colSpan={3} className="px-4 py-3.5 text-right font-sans">
                      Grand Total
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans text-base text-ink tabular-nums">
                      {formatInrPrice(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
