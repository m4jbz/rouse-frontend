import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrderPublic } from './orders';

// ----- Types -----

export interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidOrders: number;
  unpaidOrders: number;
}

// ----- Date helpers -----

/** Start of current week (Monday) at 00:00 local */
export function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Start of current month at 00:00 local */
export function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Today as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ----- Calculation -----

/**
 * Filter orders by date range (inclusive) using created_at.
 */
export function filterOrdersByDate(
  orders: OrderPublic[],
  from: string,
  to: string,
): OrderPublic[] {
  const fromTs = new Date(from + 'T00:00:00').getTime();
  const toTs = new Date(to + 'T23:59:59').getTime();
  return orders.filter((o) => {
    const ts = new Date(o.created_at).getTime();
    return ts >= fromTs && ts <= toTs;
  });
}

export function computeSummary(orders: OrderPublic[]): ReportSummary {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'pagado')
    .reduce((sum, o) => sum + Number(o.total), 0);
  const nonCancelled = orders.filter((o) => o.status !== 'cancelado');
  const averageTicket = nonCancelled.length > 0
    ? nonCancelled.reduce((sum, o) => sum + Number(o.total), 0) / nonCancelled.length
    : 0;
  const deliveredOrders = orders.filter((o) => o.status === 'entregado').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelado').length;
  const pendingOrders = orders.filter((o) =>
    ['pendiente', 'confirmado', 'preparando', 'en_camino'].includes(o.status),
  ).length;
  const paidOrders = orders.filter((o) => o.payment_status === 'pagado').length;
  const unpaidOrders = orders.filter((o) => o.payment_status === 'pendiente').length;

  return {
    totalOrders,
    totalRevenue,
    averageTicket,
    deliveredOrders,
    cancelledOrders,
    pendingOrders,
    paidOrders,
    unpaidOrders,
  };
}

// ----- PDF Generation -----

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const PAYMENT_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
};

const METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Generate and download a PDF report.
 */
export function generateReportPDF(
  orders: OrderPublic[],
  summary: ReportSummary,
  dateFrom: string,
  dateTo: string,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(62, 36, 18); // #3E2412
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pasteleria Rouse', 14, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Ingresos', 14, 20);

  doc.setFontSize(10);
  doc.text(`Periodo: ${fmtDate(dateFrom)} - ${fmtDate(dateTo)}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Generado: ${fmtDate(today())}`, pageWidth - 14, 20, { align: 'right' });

  // ── Summary cards ──
  let y = 36;
  doc.setTextColor(62, 36, 18);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', 14, y);
  y += 6;

  // Draw summary boxes
  const boxW = 62;
  const boxH = 22;
  const gap = 6;
  const boxes = [
    { label: 'Ingresos Totales', value: fmtMoney(summary.totalRevenue), color: [22, 163, 106] },
    { label: 'Total Pedidos', value: String(summary.totalOrders), color: [59, 130, 246] },
    { label: 'Ticket Promedio', value: fmtMoney(summary.averageTicket), color: [168, 85, 247] },
    { label: 'Entregados / Cancelados', value: `${summary.deliveredOrders} / ${summary.cancelledOrders}`, color: [234, 179, 8] },
  ];

  boxes.forEach((box, i) => {
    const x = 14 + i * (boxW + gap);
    // Background
    doc.setFillColor(box.color[0], box.color[1], box.color[2]);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F');

    // Label
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, x + boxW / 2, y + 8, { align: 'center' });

    // Value
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, x + boxW / 2, y + 18, { align: 'center' });
  });

  y += boxH + 10;

  // ── Extra stats line ──
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Pagados: ${summary.paidOrders}  |  Pago pendiente: ${summary.unpaidOrders}  |  En proceso: ${summary.pendingOrders}`,
    14,
    y,
  );
  y += 8;

  // ── Orders table ──
  doc.setTextColor(62, 36, 18);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Pedidos', 14, y);
  y += 4;

  const tableData = orders.map((o) => [
    o.ticket_number,
    o.client_name,
    o.phone,
    STATUS_LABELS[o.status] || o.status,
    METHOD_LABELS[o.payment_method] || o.payment_method,
    PAYMENT_LABELS[o.payment_status] || o.payment_status,
    fmtMoney(Number(o.total)),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Ticket', 'Cliente', 'Telefono', 'Estado', 'Metodo Pago', 'Pago', 'Total']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [55, 65, 81],
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [62, 36, 18],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      2: { cellWidth: 28 },
      6: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Pasteleria Rouse - Reporte generado el ${fmtDate(today())}`,
        14,
        pageH - 8,
      );
      doc.text(
        `Pagina ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth - 14,
        pageH - 8,
        { align: 'right' },
      );
    },
  });

  // ── Download ──
  const fileName = `reporte_rouse_${dateFrom}_a_${dateTo}.pdf`;
  doc.save(fileName);
}
