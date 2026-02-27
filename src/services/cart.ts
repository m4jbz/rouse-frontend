// ============================================================
// Cart Service — Sincronización del carrito con el backend
// ============================================================

import { apiFetchAuth } from './auth';
import type { CartItem } from '@/context/CartContext';

// ----- Tipos del servidor -----

interface ServerCartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_badge: string | null;
  quantity: number;
}

interface ServerCartResponse {
  items: ServerCartItem[];
}

// ----- Conversiones -----

function toCartItems(serverItems: ServerCartItem[]): CartItem[] {
  return serverItems.map((s) => ({
    product: {
      id: s.product_id,
      name: s.product_name,
      price: s.product_price,
      image: s.product_image,
      badge: s.product_badge ?? undefined,
    },
    quantity: s.quantity,
  }));
}

function toServerItems(items: CartItem[]): ServerCartItem[] {
  return items.map((i) => ({
    product_id: i.product.id,
    product_name: i.product.name,
    product_price: i.product.price,
    product_image: i.product.image,
    product_badge: i.product.badge ?? null,
    quantity: i.quantity,
  }));
}

// ----- API -----

/**
 * Fetch the authenticated client's cart from the server.
 */
export async function fetchServerCart(): Promise<CartItem[]> {
  const res = await apiFetchAuth<ServerCartResponse>('/clients/cart');
  return toCartItems(res.items);
}

/**
 * Replace the server cart with the given items.
 */
export async function syncCartToServer(items: CartItem[]): Promise<void> {
  await apiFetchAuth('/clients/cart', {
    method: 'PUT',
    body: JSON.stringify({ items: toServerItems(items) }),
  });
}

/**
 * Clear the server cart.
 */
export async function clearServerCart(): Promise<void> {
  await apiFetchAuth('/clients/cart', {
    method: 'DELETE',
  });
}

// ----- Merge -----

/**
 * Merge local and server cart items.
 * Union of both; for duplicates, keep the higher quantity.
 */
export function mergeCartItems(
  local: CartItem[],
  server: CartItem[]
): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of server) {
    merged.set(item.product.id, item);
  }

  for (const item of local) {
    const existing = merged.get(item.product.id);
    if (existing) {
      merged.set(item.product.id, {
        ...item,
        quantity: Math.max(item.quantity, existing.quantity),
      });
    } else {
      merged.set(item.product.id, item);
    }
  }

  return Array.from(merged.values());
}
