import { create } from 'zustand';
import { Product } from '@/types';

interface WishlistState {
  items: (Product & { wishlistId?: string })[];
  ids: Set<string>;
  loading: boolean;
  init: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  ids: new Set<string>(),
  loading: false,

  init: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { wishlistApi } = await import('@/lib/api');
      const res = await wishlistApi.list();
      const items: Product[] = res.data.data.map((w: any) => w.product);
      const ids = new Set<string>(items.map((p: Product) => p.id));
      set({ items, ids });
    } catch { /* not logged in or error */ }
  },

  add: async (productId) => {
    const { wishlistApi } = await import('@/lib/api');
    await wishlistApi.add(productId);
    set(s => {
      const newIds = new Set(s.ids);
      newIds.add(productId);
      return { ids: newIds };
    });
  },

  remove: async (productId) => {
    const { wishlistApi } = await import('@/lib/api');
    await wishlistApi.remove(productId);
    set(s => {
      const newIds = new Set(s.ids);
      newIds.delete(productId);
      return {
        ids: newIds,
        items: s.items.filter(p => p.id !== productId),
      };
    });
  },

  isWishlisted: (productId) => get().ids.has(productId),

  toggle: async (productId) => {
    if (get().ids.has(productId)) {
      await get().remove(productId);
    } else {
      await get().add(productId);
    }
  },
}));
