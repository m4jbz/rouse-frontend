import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { type OrderPublic, type OrderStatus, fetchMyOrders } from '@/services/orders';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: Package },
  en_camino: { label: 'En camino', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMyOrders()
      .then(setOrders)
      .catch((err: any) => setError(err?.detail || 'Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 bg-[#F5EDE0] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Mis pedidos
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

          {loading ? (
            <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-12 text-center">
              <p className="text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                Cargando pedidos...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-12 text-center">
              <Package className="w-20 h-20 text-[#D4B888] mx-auto mb-6" />
              <h3
                className="text-xl text-[#3E2412] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No tienes pedidos
              </h3>
              <p
                className="text-[#6B4422] mb-8"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Cuando hagas tu primer pedido aparecera aqui
              </p>
              <Link
                to="/#top"
                className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md rounded-md font-medium"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm overflow-hidden"
                  >
                    {/* Order header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-[#EAD5B8]/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`w-5 h-5 flex-shrink-0 ${
                          order.status === 'cancelado' ? 'text-red-500' :
                          order.status === 'entregado' ? 'text-green-500' :
                          'text-[#C8923A]'
                        }`} />
                        <div>
                          <p
                            className="font-bold text-[#3E2412]"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {order.ticket_number}
                          </p>
                          <p
                            className="text-sm text-[#6B4422]"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {order.details.length} producto{order.details.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {statusConfig.label}
                        </span>
                        <span
                          className="text-lg font-bold text-[#C8923A]"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          ${Number(order.total).toLocaleString('es-MX')}
                        </span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-[#D4B888] p-4 sm:p-6 space-y-3" style={{ fontFamily: 'var(--font-sans)' }}>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-[#6B4422]">Entrega: </span>
                            <span className="text-[#3E2412] font-medium">
                              {order.delivery_address && order.delivery_address !== 'Recoger en tienda'
                                ? order.delivery_address
                                : 'Recoger en tienda'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6B4422]">Pago: </span>
                            <span className="text-[#3E2412] font-medium">
                              {PAYMENT_LABELS[order.payment_method]} ({order.payment_status === 'pagado' ? 'Pagado' : 'Pendiente'})
                            </span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="text-sm">
                            <span className="text-[#6B4422]">Notas: </span>
                            <span className="text-[#3E2412]">{order.notes}</span>
                          </div>
                        )}

                        <div className="h-px bg-[#D4B888]"></div>

                        {order.details.map((d) => (
                          <div key={d.id} className="flex justify-between text-sm">
                            <span className="text-[#3E2412]">
                              {d.variant_name} x{d.quantity}
                            </span>
                            <span className="text-[#3E2412]">
                              ${Number(d.subtotal).toLocaleString('es-MX')}
                            </span>
                          </div>
                        ))}

                        <div className="h-px bg-[#D4B888]"></div>

                        <div className="flex justify-between font-bold">
                          <span className="text-[#3E2412]">Total</span>
                          <span className="text-[#C8923A]">
                            ${Number(order.total).toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
