import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { AdminProvider } from '@/context/AdminContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { PastelesPage } from './pages/PastelesPage';
import { PostresPage } from './pages/PostresPage';
import { CustomCakePage } from './pages/CustomCakePage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { BrandStory } from './components/BrandStory';
import { fetchActiveProducts, toDisplayProducts, type DisplayProduct } from '@/services/admin';

function HomePage() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveProducts()
      .then((data) => {
        // Show products from pasteles and postres sections, limited to first 9
        const filtered = data.filter(p => p.category_id === 1 || p.category_id === 2 || p.category_id === 4 || p.category_id === 7);
        const displayProducts = toDisplayProducts(filtered);
        setProducts(displayProducts.slice(0, 9));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />
      <Hero />

      {/* Featured Products Section */}
      <section className="py-20 bg-[#F5EDE0]" id="productos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4 text-[#3E2412]" style={{ fontFamily: 'var(--font-serif)' }}>
              Productos destacados
            </h2>
            <p className="text-lg text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
              Los favoritos de nuestros clientes
            </p>
          </div>
          {loading ? (
            <p className="text-center text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>No hay productos disponibles por el momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/pasteles" className="inline-block bg-[#C8923A] text-white px-10 py-4 hover:bg-[#A67A28] transition-colors duration-300 shadow-md">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* <BrandStory /> */}
      <Footer />
    </div>
  );
}

function AdminShortcutListener({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        navigate('/admin');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <AdminShortcutListener>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pasteles" element={<PastelesPage />} />
              <Route path="/postres" element={<PostresPage />} />
              <Route path="/pastel-personalizado" element={<CustomCakePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/mis-pedidos" element={<MyOrdersPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Routes>
          </AdminShortcutListener>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
