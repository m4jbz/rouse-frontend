import { useLocation, Link, Navigate } from 'react-router';
import { CheckCircle, MessageCircle, Download } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { type OrderPublic, getWhatsAppUrl } from '@/services/orders';
import { downloadOrderTicketPDF } from '@/services/tickets';

export function OrderConfirmationPage() {
  const location = useLocation();
  const order = (location.state as { order?: OrderPublic })?.order;

  // If no order data, redirect to home
  if (!order) {
    return <Navigate to="/" replace />;
  }

  const whatsappUrl = getWhatsAppUrl(order);

  const paymentLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 bg-[#F5EDE0] py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success message */}
          <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-8 text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2
              className="text-2xl sm:text-3xl text-[#3E2412] mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pedido confirmado
            </h2>
            <p
              className="text-[#6B4422] mb-1"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Tu numero de ticket es:
            </p>
            <p
              className="text-3xl font-bold text-[#C8923A] mb-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {order.ticket_number}
            </p>

            {/* WhatsApp button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-lg hover:bg-[#1fb855] transition-colors duration-300 shadow-md text-lg font-medium"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <MessageCircle className="w-6 h-6" />
              Enviar pedido por WhatsApp
            </a>

            {/* Ticket PDF */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => downloadOrderTicketPDF(order)}
                className="inline-flex items-center gap-3 bg-white text-[#3E2412] px-8 py-4 rounded-lg hover:bg-[#F5EDE0] transition-colors duration-300 shadow-md text-lg font-medium border border-[#D4B888]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <Download className="w-6 h-6" />
                Descargar ticket (PDF)
              </button>
            </div>
            <p
              className="text-sm text-[#6B4422] mt-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Envia tu pedido por WhatsApp para confirmar con la pasteleria
            </p>
          </div>

          {/* Order details */}
          <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-sm p-6">
            <h3
              className="text-lg text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Detalles del pedido
            </h3>

            <div className="space-y-3" style={{ fontFamily: 'var(--font-sans)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B4422]">Cliente</span>
                <span className="text-[#3E2412] font-medium">{order.client_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B4422]">Telefono</span>
                <span className="text-[#3E2412] font-medium">{order.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B4422]">Entrega</span>
                <span className="text-[#3E2412] font-medium">
                  {order.delivery_address && order.delivery_address !== 'Recoger en tienda'
                    ? `Domicilio: ${order.delivery_address}`
                    : 'Recoger en tienda'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B4422]">Metodo de pago</span>
                <span className="text-[#3E2412] font-medium">{paymentLabels[order.payment_method]}</span>
              </div>
              {order.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B4422]">Notas</span>
                  <span className="text-[#3E2412] font-medium text-right max-w-[60%]">{order.notes}</span>
                </div>
              )}

              <div className="h-px bg-[#D4B888] my-2"></div>

              <h4 className="text-sm font-semibold text-[#3E2412]">Productos</h4>
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

              <div className="h-px bg-[#D4B888] my-2"></div>

              <div className="flex justify-between font-bold text-lg">
                <span className="text-[#3E2412]">Total</span>
                <span className="text-[#C8923A]">
                  ${Number(order.total).toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md rounded-md font-medium"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
