import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '@/context/CartContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#D4B888]">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl sm:text-3xl text-[#C8923A] mb-0" style={{ fontFamily: 'var(--font-serif)' }}>
                Pastelería Rouse
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium">
              Inicio
            </a>
            <a href="#pasteles" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium">
              Pasteles
            </a>
            <a href="#panaderia" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium">
              Panadería
            </a>
            <a href="#nosotros" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium">
              Sobre Nosotros
            </a>
            <a href="#contacto" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium">
              Contacto
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#3E2412] hover:text-[#C8923A] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/login" className="p-2 text-[#3E2412] hover:text-[#C8923A] transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={openCart}
              className="p-2 text-[#3E2412] hover:text-[#C8923A] transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8923A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            <button 
              className="lg:hidden p-2 text-[#3E2412] hover:text-[#C8923A] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-[#D4B888]">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Inicio
              </a>
              <a href="#pasteles" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Pasteles
              </a>
              <a href="#panaderia" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Panadería
              </a>
              <a href="#postres" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Postres
              </a>
              <a href="#regalos" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Regalos
              </a>
              <a href="#nosotros" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Sobre Nosotros
              </a>
              <a href="#contacto" className="text-[#3E2412] hover:text-[#C8923A] transition-colors font-medium py-2">
                Contacto
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
