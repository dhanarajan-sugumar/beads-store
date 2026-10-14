import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, ImageOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory } from '@/types/database';
import { compressImageToWebP } from '@/utils/imageCompressor';

interface ProductFormModalProps {
  product: Product | null; // null for add mode, Product for edit mode
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const getCategoryPrefix = (cat: ProductCategory): string => {
  switch (cat) {
    case 'necklace':
      return 'NL';
    case 'bracelet':
      return 'BR';
    case 'other':
    default:
      return 'OT';
  }
};

const generateRandomSku = (cat: ProductCategory): string => {
  const prefix = getCategoryPrefix(cat);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomNum}`;
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEdit = Boolean(product);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceInr, setPriceInr] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>('necklace');
  const [sku, setSku] = useState('');
  const [active, setActive] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPriceInr(product.price_inr);
      setSortOrder(product.sort_order);
      setCategory(product.category || 'other');
      setSku(product.sku || '');
      setActive(product.active);
      setImageUrl(product.image_url || '');
    } else {
      setName('');
      setDescription('');
      setPriceInr('');
      setSortOrder(0);
      setCategory('necklace');
      setSku(generateRandomSku('necklace'));
      setActive(true);
      setImageUrl('');
    }
    setErrorMessage(null);
    setUploadProgress(null);
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    // If SKU is empty or begins with a known prefix, auto-update with new category prefix
    if (!sku || sku.startsWith('NL-') || sku.startsWith('BR-') || sku.startsWith('OT-')) {
      setSku(generateRandomSku(newCat));
    }
  };

  const handleRegenerateSku = () => {
    setSku(generateRandomSku(category));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      setErrorMessage('Supabase client is not available. Check configuration.');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage(null);
      setUploadProgress('Compressing image to WebP (max 1200px, <= 200KB)...');

      const compressedBlob = await compressImageToWebP(file, {
        maxDimension: 1200,
        initialQuality: 0.85,
        maxSizeBytes: 200 * 1024,
      });

      const sizeKB = Math.round(compressedBlob.size / 1024);
      setUploadProgress(`Uploading compressed image (${sizeKB} KB)...`);

      const fileExt = 'webp';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      setUploadProgress(`Image uploaded successfully (${sizeKB} KB WebP)!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to compress and upload image.';
      setErrorMessage(`Upload error: ${msg}`);
      setUploadProgress(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMessage('Supabase client not initialized.');
      return;
    }

    const price = Number(priceInr);
    if (isNaN(price) || price < 0) {
      setErrorMessage('Price must be a valid positive number in INR.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      const productPayload = {
        name: name.trim(),
        description: description.trim() || null,
        price_inr: Math.round(price),
        sort_order: Number(sortOrder) || 0,
        category,
        sku: sku.trim() || null,
        active,
        image_url: imageUrl.trim() || null,
      };

      if (isEdit && product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', product.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert(productPayload);

        if (insertError) throw new Error(insertError.message);
      }

      await onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <h2 id="product-form-title" className="text-xl font-sans font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3.5 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category & SKU Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 bg-white focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              >
                <option value="necklace">Necklaces</option>
                <option value="bracelet">Bracelets</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="product-sku" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SKU / Item ID *
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateSku}
                  className="text-xs text-primary-700 hover:text-primary-800 flex items-center gap-1 font-medium focus:outline-none"
                  title="Generate new random SKU"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-generate
                </button>
              </div>
              <input
                id="product-sku"
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. NL-101"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm font-mono uppercase outline-none transition-colors"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              ref={nameInputRef}
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Traditional Red Agate Necklace"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about craftsmanship, materials, bead types, length..."
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
            />
          </div>

          {/* Price & Sort Order Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Price in INR (₹) *
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                required
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 1299"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="product-sort" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Sort Order
              </label>
              <input
                id="product-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm font-medium text-gray-900">
                Active in catalogue (publicly visible)
              </span>
            </label>
          </div>

          {/* Image Upload & Preview */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Product Image
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Thumbnail - object-contain so complete piece is previewed */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-50 border border-gray-200 shrink-0 flex items-center justify-center p-1">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageOff className="w-8 h-8 text-gray-400" aria-hidden="true" />
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="image-upload-input"
                />

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingImage ? 'Compressing & Uploading...' : 'Upload Image (WebP ~200KB)'}</span>
                </button>

                {uploadProgress && (
                  <p className="text-xs text-primary-700 font-medium">
                    {uploadProgress}
                  </p>
                )}
              </div>
            </div>

            {/* Direct Image URL input as fallback */}
            <div>
              <label htmlFor="product-image-url" className="block text-xs text-gray-500 mb-1">
                Or enter image URL directly:
              </label>
              <input
                id="product-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
