import React from 'react';
import { Edit2, Trash2, Eye, EyeOff, ImageOff } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatInrPrice } from '@/utils/formatters';

interface ProductListTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => Promise<void>;
  togglingId?: string | null;
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleActive,
  togglingId,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-500">
        No products found matching criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
      {/* Desktop Table View (hidden on small mobile screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3.5">Item</th>
              <th scope="col" className="px-4 py-3.5">Category</th>
              <th scope="col" className="px-4 py-3.5">Price</th>
              <th scope="col" className="px-4 py-3.5">Sort</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const isToggling = togglingId === product.id;
              return (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Item info with thumbnail & SKU */}
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-stone-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center p-0.5">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {product.sku && (
                          <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                            {product.sku}
                          </span>
                        )}
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-xs font-medium text-gray-600 capitalize whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {product.category || 'other'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-serif font-semibold text-gray-900 whitespace-nowrap">
                    {formatInrPrice(product.price_inr)}
                  </td>

                  {/* Sort order */}
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {product.sort_order}
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => onToggleActive(product)}
                      title={`Click to ${product.active ? 'hide' : 'show'} product`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold min-h-[36px] transition-colors ${
                        product.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {product.active ? (
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{product.active ? 'Active' : 'Hidden'}</span>
                    </button>
                  </td>

                  {/* Edit and Delete Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-primary-700 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown below md breakpoint) */}
      <div className="md:hidden divide-y divide-gray-100">
        {products.map((product) => {
          const isToggling = togglingId === product.id;
          return (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-stone-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center p-0.5">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <ImageOff className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {product.sku && (
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary-50 text-primary-700">
                        {product.sku}
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 capitalize">
                      {product.category || 'other'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                  <p className="font-serif font-bold text-gray-900 text-sm mt-1">
                    {formatInrPrice(product.price_inr)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => onToggleActive(product)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold min-h-[44px] ${
                    product.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {product.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{product.active ? 'Active' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
