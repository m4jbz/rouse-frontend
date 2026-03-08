import { apiFetchAuth } from './auth';
import type { CartItem } from '@/context/CartContext';

// ----- Tipos del servidor -----

interface ServerCartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
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
    quantity: i.quantity,
  }));
}

// ----- API -----

// Obtener el carrito del servidor para el usuario autenticado. Si no hay carrito, devuelve un array vacío.
export async function fetchServerCart(): Promise<CartItem[]> {
  const res = await apiFetchAuth<ServerCartResponse>('/clients/cart');
  return toCartItems(res.items);
}

// Sincronizar el carrito local con el servidor. Reemplaza completamente el carrito del servidor con el local.
export async function syncCartToServer(items: CartItem[]): Promise<void> {
  await apiFetchAuth('/clients/cart', {
    method: 'PUT',
    body: JSON.stringify({ items: toServerItems(items) }),
  });
}
