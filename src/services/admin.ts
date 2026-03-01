// ============================================================
// Admin Service — Auth + CRUD API calls for admin panel
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ----- Types -----

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
}

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AdminUser;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Variant {
  id: number;
  name: string;
  price: number;
  image_path: string | null;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  variants: Variant[];
}

// ----- Token management -----

const ADMIN_ACCESS_KEY = 'rouse_admin_token';
const ADMIN_REFRESH_KEY = 'rouse_admin_refresh';

export function getAdminAccessToken(): string | null {
  return localStorage.getItem(ADMIN_ACCESS_KEY);
}

export function getAdminRefreshToken(): string | null {
  return localStorage.getItem(ADMIN_REFRESH_KEY);
}

export function saveAdminTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ADMIN_ACCESS_KEY, accessToken);
  localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
}

export function clearAdminTokens(): void {
  localStorage.removeItem(ADMIN_ACCESS_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
}

// ----- Fetch helpers -----

async function adminApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers, ...rest } = options;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Error de conexión con el servidor.' }));
    throw errorData;
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

async function adminApiFetchAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminAccessToken();
  if (!token) {
    throw { detail: 'No hay sesión de administrador activa.' };
  }

  return adminApiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ----- Auth functions -----

export async function adminLogin(credentials: AdminLoginCredentials): Promise<AdminAuthResponse> {
  const response = await adminApiFetch<AdminAuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  saveAdminTokens(response.access_token, response.refresh_token);
  return response;
}

export function adminLogout(): void {
  clearAdminTokens();
}

export async function getAdminCurrentUser(): Promise<AdminUser | null> {
  const token = getAdminAccessToken();
  if (!token) return null;

  try {
    return await adminApiFetchAuth<AdminUser>('/users/me');
  } catch {
    const refreshed = await tryAdminRefreshToken();
    if (refreshed) {
      try {
        return await adminApiFetchAuth<AdminUser>('/users/me');
      } catch {
        clearAdminTokens();
        return null;
      }
    }
    clearAdminTokens();
    return null;
  }
}

export async function tryAdminRefreshToken(): Promise<boolean> {
  const refreshToken = getAdminRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await adminApiFetch<{ access_token: string }>('/users/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    localStorage.setItem(ADMIN_ACCESS_KEY, response.access_token);
    return true;
  } catch {
    clearAdminTokens();
    return false;
  }
}

// ----- Category CRUD -----

export async function listCategories(): Promise<Category[]> {
  return adminApiFetch<Category[]>('/categories/');
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  return adminApiFetchAuth<Category>('/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: { name?: string; description?: string }): Promise<Category> {
  return adminApiFetchAuth<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return adminApiFetchAuth<void>(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// ----- Product CRUD -----

export async function listProducts(activeOnly: boolean = false): Promise<Product[]> {
  return adminApiFetch<Product[]>(`/products/?active_only=${activeOnly}`);
}

export async function createProduct(data: {
  category_id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  variants?: { name: string; price: number }[];
}): Promise<Product> {
  return adminApiFetchAuth<Product>('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: {
  category_id?: number;
  name?: string;
  description?: string;
  is_active?: boolean;
}): Promise<Product> {
  return adminApiFetchAuth<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return adminApiFetchAuth<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// ----- Variant CRUD -----

export async function createVariant(productId: number, data: { name: string; price: number, image_path: string }): Promise<Variant> {
  return adminApiFetchAuth<Variant>(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVariant(productId: number, variantId: number, data: { name?: string; price?: number, image_path?: string}): Promise<Variant> {
  return adminApiFetchAuth<Variant>(`/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  return adminApiFetchAuth<void>(`/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
}

// ----- Public product fetching (for storefront pages) -----

export interface DisplayVariant {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: number;
}

export function flattenToVariants(products: Product[]): DisplayVariant[] {
  const result: DisplayVariant[] = [];
  for (const product of products) {
    for (const variant of product.variants) {
      result.push({
        id: `p${product.id}-v${variant.id}`,
        name: variant.name,
        price: Number(variant.price),
        image: variant.image_path ? `${variant.image_path}` : '',
        categoryId: product.category_id,
      });
    }
  }
  return result;
}

export async function fetchActiveProducts(): Promise<Product[]> {
  return adminApiFetch<Product[]>('/products/?active_only=true');
}

export async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  return adminApiFetch<Product[]>(`/products/?category_id=${categoryId}&active_only=true`);
}

export async function fetchProductsByCategories(categoryIds: number[]): Promise<Product[]> {
  const results = await Promise.all(categoryIds.map(id => fetchProductsByCategory(id)));
  return results.flat();
}
