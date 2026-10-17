import React from 'react';
import {
  Eye,
  MessageCircle,
  Clock,
  User,
  Package,
  Loader2,
} from 'lucide-react';
import type { OrderWithItems, OrderStatus } from '@/types/database';
import {
  getOrderStatusLabel,
  getOrderStatusBadgeClass,
  buildCustomerWhatsAppUrl,
  formatOrderDate,
} from '@/utils/orderUtils';
import { formatInrPrice } from '@/utils/formatters';

interface OrderListTableProps {
  orders: OrderWithItems[];
  onViewDetails: (order: OrderWithItems) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updatingOrderId?: string | null;
}

const ALL_STATUSES: OrderStatus[] = ['new', 'contacted', 'paid', 'shipped', 'cancelled'];

export const OrderListTable: React.FC<OrderListTableProps> = ({
  orders,
  onViewDetails,
  onStatusChange,
  updatingOrderId,
}) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-stone-200 text-center text-stone-500">
        <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="font-semibold text-stone-700">No orders found</p>
        <p className="text-xs text-stone-500 mt-1">
          No orders match the current search or status criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-[11px] uppercase font-semibold text-stone-500 border-b border-stone-200">
            <tr>
              <th scope="col" className="px-4 py-3.5">Order Ref</th>
              <th scope="col" className="px-4 py-3.5">Customer & Contact</th>
              <th scope="col" className="px-4 py-3.5">Items</th>
              <th scope="col" className="px-4 py-3.5">Total</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => {
              const isUpdating = updatingOrderId === order.id;
              const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              const itemsSummary = order.order_items?.map((i) => `${i.product_title} (x${i.quantity})`).join(', ') || 'No items';
              const whatsAppUrl = buildCustomerWhatsAppUrl(
                order.customer_phone,
                order.order_ref,
                order.customer_name
              );

              return (
                <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Order Ref & Date */}
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(order)}
                      className="font-mono text-xs font-bold text-ink hover:text-primary-700 transition-colors text-left"
                    >
                      {order.order_ref}
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatOrderDate(order.created_at)}</span>
                    </div>
                  </td>

                  {/* Customer & Contact */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 font-sans font-semibold text-ink text-sm">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500 font-mono">
                        +91 {order.customer_phone}
                      </span>
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </td>

                  {/* Items summary */}
                  <td className="px-4 py-3.5 max-w-xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <p className="text-[11px] text-stone-500 truncate mt-1" title={itemsSummary}>
                      {itemsSummary}
                    </p>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3.5 font-sans font-semibold text-base text-ink tabular-nums whitespace-nowrap">
                    {formatInrPrice(order.total_amount)}
                  </td>

                  {/* Inline Status Dropdown */}
                  <td className="px-4 py-3.5">
                    <div className="relative inline-flex items-center gap-1.5">
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />}
                      <select
                        aria-label={`Status for ${order.order_ref}`}
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none transition-colors ${getOrderStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-stone-800">
                            {getOrderStatusLabel(st)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails(order)}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (screens < lg) */}
      <div className="lg:hidden divide-y divide-stone-100">
        {orders.map((order) => {
          const isUpdating = updatingOrderId === order.id;
          const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const whatsAppUrl = buildCustomerWhatsAppUrl(
            order.customer_phone,
            order.order_ref,
            order.customer_name
          );

          return (
            <div key={order.id} className="p-4 space-y-3">
              {/* Top row: Ref + Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-ink">
                  {order.order_ref}
                </span>

                <div className="flex items-center gap-1.5">
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />}
                  <select
                    aria-label={`Status for ${order.order_ref}`}
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer outline-none ${getOrderStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-white text-stone-800">
                        {getOrderStatusLabel(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="font-sans font-semibold text-ink text-sm">
                  {order.customer_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-stone-500 font-mono">
                    +91 {order.customer_phone}
                  </span>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium"
                  >
                    <MessageCircle className="w-2.5 h-2.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Date & Total */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <div className="text-stone-400">
                  <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                  <span className="mx-1">•</span>
                  <span>{formatOrderDate(order.created_at)}</span>
                </div>
                <span className="font-sans font-bold text-ink text-sm tabular-nums">
                  {formatInrPrice(order.total_amount)}
                </span>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onViewDetails(order)}
                className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                <span>View Full Order Details</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
