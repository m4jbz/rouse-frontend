import { apiFetchAuth, getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export type CustomCakeRequestStatus =
  | 'pendiente'
  | 'cotizado'
  | 'aceptado'
  | 'en_proceso'
  | 'completado'
  | 'cancelado';

export interface CustomCakeRequestCreate {
  client_name: string;
  client_email: string;
  client_phone: string;
  cake_size: string;
  cake_layers: number;
  cake_flavor: string;
  filling?: string;
  topping?: string;
  custom_text?: string;
  reference_images?: string[];
  delivery_date: string;
  delivery_time?: string;
  additional_notes?: string;
}

export interface CustomCakeRequestPublic {
  id: number;
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  cake_size: string;
  cake_layers: number;
  cake_flavor: string;
  filling: string | null;
  topping: string | null;
  custom_text: string | null;
  reference_images: string[] | null;
  delivery_date: string;
  delivery_time: string | null;
  additional_notes: string | null;
  status: CustomCakeRequestStatus;
  quoted_price: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a custom cake request.
 * If the client is logged in, we attach the Authorization header so the backend
 * can associate `client_id` automatically.
 */
export async function createCustomCakeRequest(
  data: CustomCakeRequestCreate,
): Promise<CustomCakeRequestPublic> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/custom-cake-requests/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Error al enviar la solicitud.' }));
    if (Array.isArray(errorData.detail)) {
      errorData.detail = errorData.detail
        .map((e: { msg?: string }) => e.msg || 'Error de validación')
        .join('. ');
    }
    throw errorData;
  }

  return res.json();
}

/** Get custom cake requests for the authenticated client. */
export async function fetchMyCustomCakeRequests(): Promise<CustomCakeRequestPublic[]> {
  return apiFetchAuth<CustomCakeRequestPublic[]>('/custom-cake-requests/my-requests');
}
