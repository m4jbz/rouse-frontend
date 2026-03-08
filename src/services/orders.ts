import { apiFetchAuth } from './auth';
import { adminApiFetchAuth } from './admin';
import type { CartItem } from '@/context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ----- Types -----

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';
export type PaymentStatus = 'pendiente' | 'pagado';

export interface OrderDetailCreate {
  product_id: number;
  variant_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderCreate {
  client_id?: string | null;
  client_name: string;
  phone: string;
  delivery_address?: string | null;
  payment_method: PaymentMethod;
  notes?: string | null;
  details: OrderDetailCreate[];
}

export interface OrderDetailPublic {
  id: number;
  product_id: number;
  variant_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderPublic {
  id: number;
  ticket_number: string;
  client_id: string | null;
  client_name: string;
  phone: string;
  delivery_address: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes: string | null;
  total: number;
  created_at: string;
  details: OrderDetailPublic[];
}

export interface OrderUpdate {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  notes?: string;
}

// ----- Cart → Order detail conversion -----

/**
 * Parse a composite cart ID like "p3-v7" into { productId: 3, variantId: 7 }.
 */
function parseCartId(compositeId: string): { productId: number; variantId: number } | null {
  const match = compositeId.match(/^p(\d+)-v(\d+)$/);
  if (!match) return null;
  return { productId: parseInt(match[1]), variantId: parseInt(match[2]) };
}

/**
 * Convert cart items to order detail create objects.
 * Cart item's product.name is the variant name.
 * Cart item's product.id is a composite "p{productId}-v{variantId}".
 */
export function cartItemsToOrderDetails(items: CartItem[]): OrderDetailCreate[] {
  return items.map((item) => {
    const parsed = parseCartId(item.product.id);
    if (!parsed) {
      throw new Error(`Invalid cart item ID format: ${item.product.id}`);
    }
    return {
      product_id: parsed.productId,
      variant_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
    };
  });
}

// ----- API calls -----

/**
 * Create a new order (public endpoint, no auth required).
 */
export async function createOrder(data: OrderCreate): Promise<OrderPublic> {
  const res = await fetch(`${API_BASE_URL}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Error al crear el pedido.' }));
    if (Array.isArray(errorData.detail)) {
      errorData.detail = errorData.detail
        .map((e: { msg?: string }) => e.msg || 'Error de validación')
        .join('. ');
    }
    throw errorData;
  }

  return res.json();
}

/**
 * Get orders for the authenticated client.
 */
export async function fetchMyOrders(): Promise<OrderPublic[]> {
  return apiFetchAuth<OrderPublic[]>('/orders/my-orders');
}

/**
 * Admin: list all orders with optional filters.
 */
export async function fetchAllOrders(
  status?: OrderStatus,
  paymentStatus?: PaymentStatus,
): Promise<OrderPublic[]> {
  let endpoint = '/orders/';
  const params: string[] = [];
  if (status) params.push(`status=${status}`);
  if (paymentStatus) params.push(`payment_status=${paymentStatus}`);
  if (params.length > 0) endpoint += `?${params.join('&')}`;
  return adminApiFetchAuth<OrderPublic[]>(endpoint);
}

/**
 * Admin: update order status/payment.
 */
export async function updateOrder(orderId: number, data: OrderUpdate): Promise<OrderPublic> {
  return adminApiFetchAuth<OrderPublic>(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: delete an order.
 */
export async function deleteOrder(orderId: number): Promise<void> {
  return adminApiFetchAuth<void>(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// ----- WhatsApp helpers -----

const WHATSAPP_PHONE = '527331361624';

/**
 * Build a WhatsApp message with all order details.
 */
export function buildWhatsAppMessage(order: OrderPublic): string {
  const lines: string[] = [
    `*Nuevo pedido - Pastelería Rouse*`,
    ``,
    `*Ticket:* ${order.ticket_number}`,
    `*Cliente:* ${order.client_name}`,
    `*Teléfono:* ${order.phone}`,
    ``,
    `*Productos:*`,
  ];

  for (const d of order.details) {
    lines.push(`  - ${d.variant_name} x${d.quantity} — $${Number(d.unit_price).toLocaleString('es-MX')} c/u = $${Number(d.subtotal).toLocaleString('es-MX')}`);
  }

  lines.push(``);
  lines.push(`*Total:* $${Number(order.total).toLocaleString('es-MX')} MXN`);
  lines.push(``);

  if (order.delivery_address && order.delivery_address !== 'Recoger en tienda') {
    lines.push(`*Entrega:* Domicilio`);
    lines.push(`*Dirección:* ${order.delivery_address}`);
  } else {
    lines.push(`*Entrega:* Recoger en tienda`);
  }

  const paymentLabels: Record<PaymentMethod, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  };
  lines.push(`*Método de pago:* ${paymentLabels[order.payment_method]}`);

  if (order.notes) {
    lines.push(``);
    lines.push(`*Notas:* ${order.notes}`);
  }

  return lines.join('\n');
}

/**
 * Get the full WhatsApp URL for an order.
 */
export function getWhatsAppUrl(order: OrderPublic): string {
  const message = buildWhatsAppMessage(order);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
