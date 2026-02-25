import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';

export function CartPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeItem, deleteItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 bg-[#F5EDE0] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titulo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-[#3E2412] hover:text-[#C8923A] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2
                className="text-2xl sm:text-3xl text-[#3E2412]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tu carrito ({totalItems})
              </h2>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-[#6B4422] hover:text-[#A63C2E] transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Vaciar carrito
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* Carrito vacio */
            <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-12 text-center">
              <ShoppingBag className="w-20 h-20 text-[#D4B888] mx-auto mb-6" />
              <h3
                className="text-xl text-[#3E2412] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tu carrito esta vacio
              </h3>
              <p
                className="text-[#6B4422] mb-8"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Explora nuestro catalogo y encuentra algo delicioso
              </p>
              <Link
                to="/"
                className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md rounded-md font-medium"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-4 sm:p-6 flex gap-4 sm:gap-6"
                  >
                    {/* Imagen */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[#EAD5B8]/30">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3
                          className="text-lg text-[#3E2412] font-semibold"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {item.product.name}
                        </h3>
                        <p
                          className="text-[#C8923A] font-medium mt-1"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          ${item.product.price.toLocaleString('es-MX')} MXN
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="w-8 h-8 flex items-center justify-center rounded border border-[#D4B888] text-[#3E2412] hover:bg-[#EAD5B8] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            className="w-10 text-center text-[#3E2412] font-medium"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded border border-[#D4B888] text-[#3E2412] hover:bg-[#EAD5B8] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal + eliminar */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-lg font-bold text-[#3E2412]"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            ${(item.product.price * item.quantity).toLocaleString('es-MX')}
                          </span>
                          <button
                            onClick={() => deleteItem(item.product.id)}
                            className="p-2 text-[#6B4422] hover:text-[#A63C2E] transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de orden */}
              <div className="lg:col-span-1">
                <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6 sticky top-28">
                  <h3
                    className="text-xl text-[#3E2412] mb-6"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Resumen del pedido
                  </h3>

                  <div className="space-y-3 mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                    <div className="flex justify-between text-[#3E2412]">
                      <span>Subtotal ({totalItems} productos)</span>
                      <span>${totalPrice.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between text-[#6B4422]">
                      <span>Envio</span>
                      <span className="text-[#C8923A]">Por calcular</span>
                    </div>
                    <div className="h-px bg-[#D4B888] my-2"></div>
                    <div className="flex justify-between text-[#3E2412] font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#C8923A]">${totalPrice.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Proceder al pago
                  </button>

                  <Link
                    to="/"
                    className="block text-center mt-4 text-sm text-[#C8923A] hover:text-[#A67A28] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
