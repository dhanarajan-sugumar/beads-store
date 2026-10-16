import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, ImageOff, RefreshCw, Trash2, Star, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory } from '@/types/database';
import { compressImageToWebP } from '@/utils/imageCompressor';
import { setCoverImage, moveImage } from '@/utils/productImages';

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
  const [images, setImages] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');

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
      const initialImages = (product.images && product.images.length > 0)
        ? product.images
        : (product.image_url ? [product.image_url] : []);
      setImages(initialImages);
    } else {
      setName('');
      setDescription('');
      setPriceInr('');
      setSortOrder(0);
      setCategory('necklace');
      setSku(generateRandomSku('necklace'));
      setActive(true);
      setImages([]);
    }
    setNewUrlInput('');
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!supabase) {
      setErrorMessage('Supabase client is not available. Check configuration.');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage(null);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Compressing image ${i + 1} of ${files.length} (${file.name})...`);

        const compressedBlob = await compressImageToWebP(file, {
          maxDimension: 1200,
          initialQuality: 0.85,
          maxSizeBytes: 200 * 1024,
        });

        const sizeKB = Math.round(compressedBlob.size / 1024);
        setUploadProgress(`Uploading image ${i + 1} of ${files.length} (${sizeKB} KB WebP)...`);

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

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setUploadProgress(`Successfully uploaded ${files.length} image(s)!`);
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

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (indexToCover: number) => {
    setImages((prev) => setCoverImage(prev, indexToCover));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImages((prev) => moveImage(prev, index, direction));
  };

  const handleAddUrl = () => {
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setNewUrlInput('');
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

      const primaryImageUrl = images.length > 0 ? images[0] : null;

      const productPayload = {
        name: name.trim(),
        description: description.trim() || null,
        price_inr: Math.round(price),
        sort_order: Number(sortOrder) || 0,
        category,
        sku: sku.trim() || null,
        active,
        image_url: primaryImageUrl,
        images,
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

          {/* Multiple Images Upload & Gallery */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product Images ({images.length})
                </span>
                <p className="text-[11px] text-gray-500">
                  The first photo is the <strong>Cover</strong> shown on the catalogue card. Reorder or click "Make Cover" to change.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                id="image-upload-input"
              />

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                ) : (
                  <Upload className="w-4 h-4 text-primary-700" />
                )}
                <span>{uploadingImage ? 'Uploading...' : '+ Upload Photos'}</span>
              </button>
            </div>

            {uploadProgress && (
              <p className="text-xs text-primary-700 font-medium bg-primary-50 px-3 py-1.5 rounded-md border border-primary-100">
                {uploadProgress}
              </p>
            )}

            {/* Images Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {images.map((imgUrl, idx) => {
                  const isCover = idx === 0;
                  return (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className={`relative group rounded-lg overflow-hidden border bg-stone-50 flex flex-col ${
                        isCover ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[4/5] w-full bg-stone-100 overflow-hidden relative">
                        <img
                          src={imgUrl}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                        />

                        {/* Cover Badge */}
                        {isCover && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-sm bg-primary-700 text-white text-[10px] font-sans font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            Cover
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label={`Remove photo ${idx + 1}`}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 shadow-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Controls Toolbar */}
                      <div className="p-1.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, 'left')}
                            aria-label="Move photo left"
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => handleMoveImage(idx, 'right')}
                            aria-label="Move photo right"
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Set Cover Action */}
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="text-[11px] font-medium text-primary-700 hover:text-primary-900 transition-colors"
                          >
                            Make Cover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-gray-500">
                  <ImageOff className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">No photos added yet</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Click to browse and upload multiple photos (auto-compressed to ~150KB WebP)
                  </p>
                </div>
              </div>
            )}

            {/* Direct Image URL input as fallback */}
            <div className="pt-2">
              <label htmlFor="product-image-url" className="block text-xs text-gray-500 mb-1">
                Or add photo via direct URL:
              </label>
              <div className="flex gap-2">
                <input
                  id="product-image-url"
                  type="url"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="https://..."
                  className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-xs outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!newUrlInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
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
