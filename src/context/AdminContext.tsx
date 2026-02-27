import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type AdminUser,
  type AdminLoginCredentials,
  type AdminAuthResponse,
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
  getAdminCurrentUser,
  getAdminAccessToken,
} from '@/services/admin';

interface AdminContextValue {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: AdminLoginCredentials) => Promise<AdminAuthResponse>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe usarse dentro de un <AdminProvider>');
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getAdminCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials: AdminLoginCredentials) => {
    const response = await apiAdminLogin(credentials);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    apiAdminLogout();
    setUser(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
