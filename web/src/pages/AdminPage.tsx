import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Plus,
  LogOut,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/lib/supabase';
import { env } from '@/config/env';
import type { Product, OrderWithItems, OrderStatus } from '@/types/database';
import { ProductListTable } from '@/components/admin/ProductListTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { OrderListTable } from '@/components/admin/OrderListTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { OrderKPIBadges } from '@/components/admin/OrderKPIBadges';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, authError, signIn, signOut } = useAdminAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Products state for admin
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Orders state for admin
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<OrderWithItems | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch all products (including inactive) for admin
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);

      if (!supabase) throw new Error('Supabase client is not available.');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      setProducts(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch products.';
      setProductsError(msg);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch all orders with itemized records
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);

      if (!supabase) throw new Error('Supabase client is not available.');

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      setOrders((data as unknown as OrderWithItems[]) || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders.';
      setOrdersError(msg);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllProducts();
      fetchAllOrders();
    }
  }, [isAdmin, fetchAllProducts, fetchAllOrders]);

  // Update order status handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!supabase) return;
    try {
      setUpdatingOrderId(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw new Error(error.message);

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setViewingOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      alert(msg);
      await fetchAllOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    await signIn(email, password);
    setLoggingIn(false);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || !supabase) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw new Error(error.message);

      await fetchAllProducts();
      setDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    if (!supabase) return;

    try {
      setTogglingId(product.id);
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', product.id);

      if (error) throw new Error(error.message);

      // Optimistic local state update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle status');
      await fetchAllProducts();
    } finally {
      setTogglingId(null);
    }
  };

  // Filter products by search query across name, description, SKU, and category
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const activeCount = products.filter((p) => p.active).length;
  const hiddenCount = products.length - activeCount;

  // Filter orders by status and search query across ref, customer, phone, address
  const filteredOrders = orders.filter((order) => {
    if (selectedOrderStatusFilter !== 'all' && order.status !== selectedOrderStatusFilter) {
      return false;
    }
    if (!ordersSearchQuery.trim()) return true;
    const q = ordersSearchQuery.toLowerCase();
    return (
      order.order_ref.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q) ||
      order.customer_address.toLowerCase().includes(q)
    );
  });

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-gray-500 text-sm">Verifying administrator authorization...</p>
      </div>
    );
  }

  // 2. Not Logged In / Not Admin -> Show Login Form
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="font-sans font-bold text-2xl text-gray-900">
              Admin Login
            </h1>
            <p className="text-xs text-gray-500">
              {env.shopName} Management Portal
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Access Denied</p>
                <p className="text-xs text-red-700 mt-1">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loggingIn ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store Catalogue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status filter tabs definition
  const statusTabs: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Orders' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'paid', label: 'Paid' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // 3. Authenticated Admin Dashboard
  return (
    <div className="space-y-6">
      {/* Admin Top Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary-100 text-primary-800">
              Admin Portal
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 mt-1">
            {activeTab === 'products' ? 'Catalogue Management' : 'Orders Management'}
          </h1>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <Link
            to="/"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Catalogue vs Orders */}
      <div className="bg-white rounded-xl border border-gray-200 px-3 py-1.5 shadow-2xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-ink text-paper shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}
          >
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-ink text-paper shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders</span>
          {newOrdersCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
              {newOrdersCount} new
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Products Catalogue Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Summary KPI Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-xs uppercase font-semibold text-gray-500">Total Products</p>
              <p className="text-2xl font-sans font-bold text-gray-900 mt-1 tabular-nums">{products.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-xs uppercase font-semibold text-green-700">Active (Visible)</p>
              <p className="text-2xl font-sans font-bold text-green-700 mt-1 tabular-nums">{activeCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-xs uppercase font-semibold text-amber-700">Hidden (Draft/Inactive)</p>
              <p className="text-2xl font-sans font-bold text-amber-700 mt-1 tabular-nums">{hiddenCount}</p>
            </div>
          </div>

          {/* Controls: Search, Add Product, Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU (e.g. NL-101), or category..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAllProducts}
                disabled={loadingProducts}
                aria-label="Refresh product list"
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingProducts ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Error Message if any */}
          {productsError && (
            <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm">
              {productsError}
            </div>
          )}

          {/* Product List Table */}
          {loadingProducts && products.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : (
            <ProductListTable
              products={filteredProducts}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleActive={handleToggleActive}
              togglingId={togglingId}
            />
          )}
        </div>
      )}

      {/* TAB 2: Orders Maintenance Management */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Metrics Badges */}
          <OrderKPIBadges orders={orders} />

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statusTabs.map((tab) => {
              const isSelected = selectedOrderStatusFilter === tab.value;
              const count =
                tab.value === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedOrderStatusFilter(tab.value)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-ink text-paper border-ink shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls: Search & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ordersSearchQuery}
                onChange={(e) => setOrdersSearchQuery(e.target.value)}
                placeholder="Search by Order Ref (e.g. MH-123456), Customer Name, or Phone..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAllOrders}
                disabled={loadingOrders}
                aria-label="Refresh orders list"
                className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {/* Orders Error Message */}
          {ordersError && (
            <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm">
              {ordersError}
            </div>
          )}

          {/* Orders List Table */}
          {loadingOrders && orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : (
            <OrderListTable
              orders={filteredOrders}
              onViewDetails={(order) => setViewingOrder(order)}
              onStatusChange={handleUpdateOrderStatus}
              updatingOrderId={updatingOrderId}
            />
          )}

          {/* Order Detail Modal */}
          <OrderDetailModal
            isOpen={viewingOrder !== null}
            order={viewingOrder}
            onClose={() => setViewingOrder(null)}
            onStatusChange={handleUpdateOrderStatus}
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <ProductFormModal
        isOpen={formModalOpen}
        product={editingProduct}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchAllProducts}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        product={deletingProduct}
        loading={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
