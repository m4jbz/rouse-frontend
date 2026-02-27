import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type User,
  type LoginCredentials,
  type AuthResponse,
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  getAccessToken,
} from '@/services/auth';

interface AuthContextValue {
  /** The currently authenticated user, or null */
  user: User | null;
  /** Whether auth state is being loaded (initial check) */
  loading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Login and save tokens + set user */
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  /** Logout: clear tokens + reset state */
  logout: () => void;
  /** Manually refresh user data from the server */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if there's a stored token and fetch the user
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await apiLogin(credentials);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await getCurrentUser();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
