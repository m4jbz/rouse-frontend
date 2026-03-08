import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Truck, Store, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import {
  type PaymentMethod,
  type OrderCreate,
  createOrder,
  cartItemsToOrderDetails,
  getWhatsAppUrl,
  type OrderPublic,
} from '@/services/orders';

type DeliveryType = 'pickup' | 'delivery';

/**
 * Strip PhoneNumber formatting to plain 10 digits:
 * "tel:+52-733-136-1624" → "7331361624"
 */
function cleanPhone(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, '');
  // Strip Mexico country code (52) if present
  if (digits.startsWith('52') && digits.length === 12) {
    return digits.slice(2);
  }
  return digits;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [clientName, setClientName] = useState(isAuthenticated && user ? user.name : '');
  const [phone, setPhone] = useState(isAuthenticated && user?.phone ? cleanPhone(user.phone) : '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If cart is empty, redirect
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <main className="flex-1 bg-[#F5EDE0] py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2
              className="text-2xl text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Tu carrito esta vacio
            </h2>
            <p className="text-[#6B4422] mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
              Agrega productos antes de proceder al pago.
            </p>
            <Link
              to="/#top"
              className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md rounded-md font-medium"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Ver productos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const details = cartItemsToOrderDetails(items);

      const orderData: OrderCreate = {
        client_id: isAuthenticated && user ? user.id : null,
        client_name: clientName.trim(),
        phone: phone.trim(),
        delivery_address: deliveryType === 'delivery' ? address.trim() : null,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        details,
      };

      const order = await createOrder(orderData);

      // Clear cart after successful order
      clearCart();

      // Navigate to confirmation with order data
      navigate('/order-confirmation', { state: { order } });
    } catch (err: any) {
      setError(err?.detail || 'Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 bg-[#F5EDE0] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
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
              Finalizar pedido
            </h2>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* Contact info */}
              <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6">
                <h3
                  className="text-lg text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Datos de contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-[#3E2412] mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-[#D4B888] rounded-lg bg-white text-[#3E2412] focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-transparent"
                      style={{ fontFamily: 'var(--font-sans)' }}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[#3E2412] mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-[#D4B888] rounded-lg bg-white text-[#3E2412] focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-transparent"
                      style={{ fontFamily: 'var(--font-sans)' }}
                      placeholder="Tu numero de telefono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery type */}
              <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6">
                <h3
                  className="text-lg text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Tipo de entrega
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-[#C8923A] bg-[#C8923A]/10'
                        : 'border-[#D4B888] bg-white hover:border-[#C8923A]/50'
                    }`}
                  >
                    <Store className={`w-6 h-6 ${deliveryType === 'pickup' ? 'text-[#C8923A]' : 'text-[#6B4422]'}`} />
                    <span
                      className={`text-sm font-medium ${deliveryType === 'pickup' ? 'text-[#C8923A]' : 'text-[#3E2412]'}`}
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Recoger en tienda
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-[#C8923A] bg-[#C8923A]/10'
                        : 'border-[#D4B888] bg-white hover:border-[#C8923A]/50'
                    }`}
                  >
                    <Truck className={`w-6 h-6 ${deliveryType === 'delivery' ? 'text-[#C8923A]' : 'text-[#6B4422]'}`} />
                    <span
                      className={`text-sm font-medium ${deliveryType === 'delivery' ? 'text-[#C8923A]' : 'text-[#3E2412]'}`}
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Entrega a domicilio
                    </span>
                  </button>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="mt-4">
                    <label
                      className="block text-sm font-medium text-[#3E2412] mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Direccion de entrega *
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={2}
                      className="w-full px-4 py-2.5 border border-[#D4B888] rounded-lg bg-white text-[#3E2412] focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-transparent resize-none"
                      style={{ fontFamily: 'var(--font-sans)' }}
                      placeholder="Calle, numero, colonia, ciudad..."
                    />
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6">
                <h3
                  className="text-lg text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Metodo de pago
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: Banknote },
                    { value: 'tarjeta' as PaymentMethod, label: 'Tarjeta', icon: CreditCard },
                    { value: 'transferencia' as PaymentMethod, label: 'Transferencia', icon: ArrowRightLeft },
                  ]).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === value
                          ? 'border-[#C8923A] bg-[#C8923A]/10'
                          : 'border-[#D4B888] bg-white hover:border-[#C8923A]/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${paymentMethod === value ? 'text-[#C8923A]' : 'text-[#6B4422]'}`} />
                      <span
                        className={`text-sm font-medium ${paymentMethod === value ? 'text-[#C8923A]' : 'text-[#3E2412]'}`}
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6">
                <h3
                  className="text-lg text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Notas adicionales
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#D4B888] rounded-lg bg-white text-[#3E2412] focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-transparent resize-none"
                  style={{ fontFamily: 'var(--font-sans)' }}
                  placeholder="Instrucciones especiales, dedicatorias, alergias..."
                />
              </div>

              {/* Submit (mobile) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {loading ? 'Procesando...' : 'Confirmar pedido'}
                </button>
              </div>
            </form>

            {/* Order summary (sidebar) */}
            <div className="lg:col-span-1">
              <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6 sticky top-28">
                <h3
                  className="text-xl text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Resumen
                </h3>

                <div className="space-y-3 mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm text-[#3E2412]">
                      <span className="truncate mr-2">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="flex-shrink-0">
                        ${(item.product.price * item.quantity).toLocaleString('es-MX')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#D4B888] my-3"></div>

                <div
                  className="flex justify-between text-[#3E2412] font-bold text-lg mb-6"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span>Total</span>
                  <span className="text-[#C8923A]">
                    ${totalPrice.toLocaleString('es-MX')} MXN
                  </span>
                </div>

                {/* Submit (desktop) */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="hidden lg:block w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {loading ? 'Procesando...' : 'Confirmar pedido'}
                </button>

                <Link
                  to="/cart"
                  className="block text-center mt-4 text-sm text-[#C8923A] hover:text-[#A67A28] transition-colors"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
