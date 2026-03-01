// ============================================================
// Auth Service — Integración real con backend
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ----- Tipos -----

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  client_id: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuthError {
  detail: string;
}

// ----- Token management -----

const ACCESS_TOKEN_KEY = 'rouse_access_token';
const REFRESH_TOKEN_KEY = 'rouse_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ----- Helper: fetch with error handling -----

async function apiFetch<T>(
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

    // FastAPI 422 returns detail as an array of objects — normalize to string
    if (Array.isArray(errorData.detail)) {
      errorData.detail = errorData.detail
        .map((e: { msg?: string }) => e.msg || 'Error de validación')
        .join('. ');
    }

    if (errorData.detail === 'value is not a valid phone number') {
      errorData.detail = 'El número de teléfono no es válido.';
    }

    if (errorData.detail === 'Email already registered') {
      errorData.detail = 'El correo electrónico ya está registrado.';
    }

    throw errorData;
  }

  return res.json();
}

export async function apiFetchAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw { detail: 'No hay sesión activa.' };
  }

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ----- Auth functions -----

/**
 * Register a new client. Returns a success message (client must verify email).
 */
export async function register(data: RegisterData): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/clients/register', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
    }),
  });
}

/**
 * Login with email and password. Returns tokens and user data.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/clients/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  saveTokens(response.access_token, response.refresh_token);
  return response;
}

/**
 * Logout: clear local tokens.
 */
export function logout(): void {
  clearTokens();
}

/**
 * Get the current user's profile using the stored access token.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return await apiFetchAuth<User>('/clients/me');
  } catch {
    // Token expired or invalid — try refreshing
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      try {
        return await apiFetchAuth<User>('/clients/me');
      } catch {
        clearTokens();
        return null;
      }
    }
    clearTokens();
    return null;
  }
}

/**
 * Try to refresh the access token using the stored refresh token.
 */
export async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await apiFetch<{ access_token: string }>('/clients/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Verify email using the token from the URL.
 */
export async function verifyEmail(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/clients/verify-email?token=${encodeURIComponent(token)}`);
}

/**
 * Request a password reset email.
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/clients/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset the password using the token from the email.
 */
export async function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/clients/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

/**
 * Resend the verification email.
 */
export async function resendVerification(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/clients/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
