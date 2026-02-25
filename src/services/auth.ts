// ============================================================
// Auth Service — Stub para futura integración con backend
// ============================================================
// Todas las funciones retornan Promises para que la migración
// a llamadas HTTP reales (fetch / axios) sea directa.
// Reemplaza el cuerpo de cada función con la llamada al endpoint
// correspondiente cuando el backend esté listo.
// ============================================================

// ----- Tipos -----

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
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
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

// ----- Configuración -----

// TODO: Reemplazar con la URL real del backend
const API_BASE_URL = '/api/auth';

// ----- Funciones -----

/**
 * Iniciar sesión con email y contraseña.
 *
 * Cuando el backend esté listo, reemplazar con:
 * ```ts
 * const res = await fetch(`${API_BASE_URL}/login`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(credentials),
 * });
 * if (!res.ok) throw await res.json();
 * return res.json();
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Stub: simula un delay de red
  await delay(800);

  console.log('[auth stub] login called with:', credentials.email);

  // Simula una respuesta exitosa
  return {
    user: {
      id: 'stub-user-1',
      name: 'Usuario Demo',
      email: credentials.email,
      createdAt: new Date().toISOString(),
    },
    token: 'stub-jwt-token',
  };
}

/**
 * Registrar un nuevo usuario.
 *
 * Cuando el backend esté listo, reemplazar con:
 * ```ts
 * const res = await fetch(`${API_BASE_URL}/register`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data),
 * });
 * if (!res.ok) throw await res.json();
 * return res.json();
 * ```
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  await delay(800);

  console.log('[auth stub] register called with:', data.email);

  return {
    user: {
      id: 'stub-user-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    },
    token: 'stub-jwt-token',
  };
}

/**
 * Cerrar sesión.
 */
export async function logout(): Promise<void> {
  await delay(300);
  console.log('[auth stub] logout called');
  // TODO: Llamar al endpoint de logout y limpiar tokens
}

/**
 * Obtener el usuario actual a partir del token guardado.
 */
export async function getCurrentUser(): Promise<User | null> {
  await delay(300);
  console.log('[auth stub] getCurrentUser called');
  // TODO: Verificar token y obtener datos del usuario
  return null;
}

// ----- Helpers -----

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
