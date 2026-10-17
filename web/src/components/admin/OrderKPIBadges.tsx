import React from 'react';
import { ShoppingBag, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import type { OrderWithItems } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';

interface OrderKPIBadgesProps {
  orders: OrderWithItems[];
}

export const OrderKPIBadges: React.FC<OrderKPIBadgesProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const fulfilledOrders = orders.filter((o) => o.status === 'shipped').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Orders */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Total Orders</p>
          <ShoppingBag className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-xl sm:text-2xl font-sans font-bold text-gray-900 tabular-nums">
          {totalOrders}
        </p>
      </div>

      {/* New / Action Needed */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
        <div className="flex items-center justify-between text-amber-800 mb-1">
          <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <span>New (Pending)</span>
            {newOrders > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </p>
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <p className="text-xl sm:text-2xl font-sans font-bold text-amber-800 tabular-nums">
          {newOrders}
        </p>
      </div>

      {/* Shipped / Completed */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Shipped</p>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-xl sm:text-2xl font-sans font-bold text-gray-900 tabular-nums">
          {fulfilledOrders}
        </p>
      </div>

      {/* Total Revenue */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider">Gross Orders</p>
          <TrendingUp className="w-4 h-4 text-primary-600" />
        </div>
        <p className="text-xl sm:text-2xl font-sans font-bold text-gray-900 tabular-nums">
          {formatInrPrice(totalRevenue)}
        </p>
      </div>
    </div>
  );
};
