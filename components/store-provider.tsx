"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { productId, productStock, type Product } from "@/lib/types";

export interface CartItem { product: Product; quantity: number }
interface StoreValue {
  items: CartItem[];
  count: number;
  add: (product: Product, quantity?: number) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("littlejoy-cart");
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch (error) {
      console.error("Unable to restore saved cart", error);
    } finally { setReady(true); }
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("littlejoy-cart", JSON.stringify(items));
  }, [items, ready]);
  const value = useMemo<StoreValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    add(product, quantity = 1) {
      setItems(current => {
        const id = productId(product);
        const found = current.find(item => productId(item.product) === id);
        return found
          ? current.map(item => productId(item.product) === id
          ? { ...item, quantity: Math.min(item.quantity + quantity, productStock(product)) } : item)
          : [...current, { product, quantity: Math.min(quantity, productStock(product)) }];
      });
    },
    update(id, quantity) {
      setItems(current => current.map(item => productId(item.product) === id
        ? { ...item, quantity: Math.max(1, Math.min(quantity, productStock(item.product))) } : item));
    },
    remove(id) { setItems(current => current.filter(item => productId(item.product) !== id)); },
    clear() { setItems([]); }
  }), [items]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
