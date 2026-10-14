import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, ImageOff, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';
import { compressImageToWebP } from '@/utils/imageCompressor';

interface ProductFormModalProps {
  product: Product | null; // null for add mode, Product for edit mode
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

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
      setActive(product.active);
      setImageUrl(product.image_url || '');
    } else {
      setName('');
      setDescription('');
      setPriceInr('');
      setSortOrder(0);
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMessage(null);
      setUploadProgress('Compressing image to WebP...');

      // 1. Compress in browser to WebP (< 200KB, max 1200px)
      const compressedFile = await compressImageToWebP(file, {
        maxDimension: 1200,
        maxSizeBytes: 200 * 1024,
      });

      setUploadProgress('Uploading image to Supabase Storage...');

      if (!supabase) {
        throw new Error('Supabase client is not available.');
      }

      // 2. Upload to storage bucket product-images
      const fileExt = 'webp';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage upload error: ${uploadError.message}`);
      }

      // 3. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      setUploadProgress('Image uploaded successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to compress or upload image.';
      setErrorMessage(msg);
      console.error('[Upload Error]', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }

    const price = Number(priceInr);
    if (isNaN(price) || price < 0) {
      setErrorMessage('Price must be a valid non-negative number.');
      return;
    }

    try {
      setSaving(true);
      if (!supabase) throw new Error('Supabase client is not available.');

      const productPayload = {
        name: name.trim(),
        description: description.trim() || null,
        price_inr: Math.round(price),
        sort_order: Number(sortOrder) || 0,
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
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 id="product-form-title" className="font-serif font-bold text-xl sm:text-2xl text-gray-900">
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
          <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
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
              {/* Preview Thumbnail */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product preview" className="w-full h-full object-cover" />
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
                placeholder="https://images.unsplash.com/..."
                className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-xs outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[44px] px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
