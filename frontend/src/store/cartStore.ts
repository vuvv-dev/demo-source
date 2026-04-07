import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  setItems: (items: CartItem[]) => void;
  setLoading: (v: boolean) => void;
  getTotal: () => number;
  itemCount: () => number;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  loading: false,

  setItems: (items) => {
    const total = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);
    set({ items, total });
  },

  setLoading: (loading) => set({ loading }),

  getTotal: () => get().items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0),

  itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

  // Optimistic remove from local state
  removeItem: (itemId) => {
    const items = get().items.filter(i => i.id !== itemId);
    const total = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);
    set({ items, total });
  },

  // Optimistic update quantity
  updateItem: (itemId, quantity) => {
    const items = get().items.map(i => i.id === itemId ? { ...i, quantity } : i);
    const total = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);
    set({ items, total });
  },
}));