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
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/lib/supabase';
import { env } from '@/config/env';
import type { Product } from '@/types/database';
import { ProductListTable } from '@/components/admin/ProductListTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, authError, signIn, signOut } = useAdminAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Products state for admin
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (isAdmin) {
      fetchAllProducts();
    }
  }, [isAdmin, fetchAllProducts]);

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
      alert(err instanceof Error ? err.message : 'Failed to delete product');
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

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const activeCount = products.filter((p) => p.active).length;
  const hiddenCount = products.length - activeCount;

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
            <h1 className="font-serif font-bold text-2xl text-gray-900">
              Admin Login
            </h1>
            <p className="text-xs text-gray-500">
              {env.shopName} Management Portal
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{authError}</p>
                <p className="mt-1 text-xs text-red-600">
                  Tip: Ensure your Supabase user ID exists in the <code className="font-mono bg-red-100 px-1 py-0.5 rounded">admin_users</code> table.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Admin</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Catalogue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="space-y-6">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800 px-2.5 py-0.5 rounded-full">
              Admin Portal
            </span>
            <span className="text-xs text-gray-500">Logged in as {user.email}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mt-1">
            Product Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="min-h-[44px] px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics & Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs uppercase font-semibold text-gray-500">Total Products</p>
          <p className="text-2xl font-serif font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs uppercase font-semibold text-green-700">Active (Visible)</p>
          <p className="text-2xl font-serif font-bold text-green-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs uppercase font-semibold text-amber-700">Hidden (Draft/Inactive)</p>
          <p className="text-2xl font-serif font-bold text-amber-700 mt-1">{hiddenCount}</p>
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
            placeholder="Search products by title..."
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
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {productsError}
        </div>
      )}

      {/* Product List Table / Cards */}
      {loadingProducts && products.length === 0 ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="text-gray-500 text-sm mt-2">Loading catalogue items...</p>
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

      {/* Modals */}
      <ProductFormModal
        product={editingProduct}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchAllProducts}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
};
