import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import {
  loadCartFromStorage,
  saveCartToStorage,
  CART_STORAGE_KEY,
  type CartItem,
} from '../cartStorage';

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();
const originalWindow = globalThis.window;

// Setup mock window & localStorage for Node test runner
Object.defineProperty(globalThis, 'window', {
  value: { localStorage: mockStorage },
  writable: true,
  configurable: true,
});

describe('cartStorage', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  const mockItem: CartItem = {
    id: 'prod-1',
    name: 'Test Bracelet',
    price_inr: 499,
    image_url: 'https://example.com/test.jpg',
    quantity: 2,
  };

  it('loads empty array when storage is empty', () => {
    expect(loadCartFromStorage()).toEqual([]);
  });

  it('saves and loads valid cart items correctly', () => {
    saveCartToStorage([mockItem]);
    const loaded = loadCartFromStorage();
    expect(loaded).toEqual([mockItem]);
  });

  it('handles corrupted JSON in localStorage gracefully without throwing', () => {
    mockStorage.setItem(CART_STORAGE_KEY, '{invalid-json');
    expect(loadCartFromStorage()).toEqual([]);
  });

  it('filters out invalid or malformed items from localStorage', () => {
    mockStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        mockItem,
        { id: 123 },
        { id: '2', name: 'No price', quantity: 1 },
      ])
    );
    const loaded = loadCartFromStorage();
    expect(loaded).toEqual([mockItem]);
  });

  it('does not throw when localStorage getItem throws an error (e.g. security restricted)', () => {
    vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access is denied');
    });
    expect(() => loadCartFromStorage()).not.toThrow();
    expect(loadCartFromStorage()).toEqual([]);
  });

  it('does not throw when localStorage setItem throws an error (e.g. quota exceeded)', () => {
    vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveCartToStorage([mockItem])).not.toThrow();
  });
});
