import jsPDF from 'jspdf';
import type { OrderPublic, PaymentMethod } from './orders';

function fmtMoney(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

function maybeMxPhone10(phone: string): string {
  // Accept either 10 digits or +52 + 10 digits and display as 10 digits.
  const digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
  return digits;
}

function methodLabel(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    efectivo: 'EFECTIVO',
    transferencia: 'TRANSFERENCIA',
  };
  return map[method] || String(method).toUpperCase();
}

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Download a serious, receipt-style ticket PDF for a single order.
 * Monochrome, narrow page similar to real receipts.
 */
export function downloadOrderTicketPDF(order: OrderPublic): void {
  // 80mm paper width (common). Height is generous; jsPDF doesn't auto-resize.
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 260] });
  doc.setTextColor(0, 0, 0);
  doc.setFont('courier', 'normal');

  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 6;
  const maxW = pageW - marginX * 2;

  let y = 8;

  // Header
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text('PASTELERIA ROUSE', pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text('TICKET DE COMPRA', pageW / 2, y, { align: 'center' });
  y += 5;

  doc.text('-'.repeat(42), marginX, y);
  y += 4;

  // Order info
  doc.setFontSize(8.5);
  y = wrap(doc, `Ticket: ${order.ticket_number}`, marginX, y, maxW, 4);
  y = wrap(doc, `Fecha: ${fmtDateTime(order.created_at)}`, marginX, y, maxW, 4);
  y = wrap(doc, `Cliente: ${order.client_name}`, marginX, y, maxW, 4);
  y = wrap(doc, `Telefono: ${maybeMxPhone10(order.phone)}`, marginX, y, maxW, 4);

  const deliveryLine = order.delivery_address && order.delivery_address !== 'Recoger en tienda'
    ? `Entrega: DOMICILIO`
    : `Entrega: RECOGER EN TIENDA`;
  y = wrap(doc, deliveryLine, marginX, y, maxW, 4);
  if (order.delivery_address && order.delivery_address !== 'Recoger en tienda') {
    y = wrap(doc, `Direccion: ${order.delivery_address}`, marginX, y, maxW, 4);
  }
  y = wrap(doc, `Pago: ${methodLabel(order.payment_method)}`, marginX, y, maxW, 4);

  if (order.notes) {
    y += 1;
    y = wrap(doc, `Notas: ${order.notes}`, marginX, y, maxW, 4);
  }

  y += 1;
  doc.text('-'.repeat(42), marginX, y);
  y += 4;

  // Items header
  doc.setFont('courier', 'bold');
  doc.text('PRODUCTOS', marginX, y);
  y += 4;
  doc.setFont('courier', 'normal');

  for (const d of order.details) {
    // First line: qty x name
    y = wrap(doc, `${d.quantity} x ${d.variant_name}`, marginX, y, maxW, 4);
    // Second line: unit and subtotal
    const unit = fmtMoney(Number(d.unit_price));
    const subtotal = fmtMoney(Number(d.subtotal));
    const line = `  $${unit}  ->  $${subtotal}`;
    y = wrap(doc, line, marginX, y, maxW, 4);

    // Add a new page if needed
    if (y > 245) {
      doc.addPage();
      y = 8;
    }
  }

  y += 1;
  doc.text('-'.repeat(42), marginX, y);
  y += 5;

  // Total
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL: $${fmtMoney(Number(order.total))} MXN`, marginX, y);
  y += 8;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('Gracias por su compra.', pageW / 2, y, { align: 'center' });
  y += 4;
  doc.text('Conserve este ticket.', pageW / 2, y, { align: 'center' });

  doc.save(`ticket_${order.ticket_number}.pdf`);
}
