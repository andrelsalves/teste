import { ensureBrowser } from './pdfGuards';
import { loadImageAsBase64 } from './pdfAssets';
import { drawHeader, drawFooter } from './pdfBuilder';

export type Appointment = {
  id?: string;
  company_name?: string;
  companyCnpj?: string;
  date?: string;
  time?: string;
  reason?: string;
  description?: string;
  technicianName?: string;
  clientPhone?: string;
};

export const reportService = {
  openWhatsApp(app: Appointment) {
    if (typeof window === 'undefined') return;

    const phone = '55' + (app.clientPhone || '').replace(/\D/g, '');
    const msg =
      `Olá! Segue o Relatório de Visita Técnica da empresa *${app.company_name}* ` +
      `referente ao atendimento de *${app.reason}*.\n\n_Enviado via SST PRO_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  },

  async generateAppointmentPDF(
    app: Appointment,
    photo?: string | null,
    signature?: string | null
  ) {
    ensureBrowser();

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Marca d’água
    try {
      const watermark = await loadImageAsBase64('/escudo-sst.png');
      doc.saveGraphicsState();
      // @ts-ignore
      doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
      doc.addImage(
        watermark,
        'PNG',
        pageWidth / 4,
        pageHeight / 4,
        pageWidth / 2,
        pageWidth / 2
      );
      doc.restoreGraphicsState();
    } catch {}

    drawHeader(doc, pageWidth);

    // Logo
    try {
      const logo = await loadImageAsBase64('/logo-minimal.png');
      doc.addImage(logo, 'PNG', 15, 8, 20, 15);
    } catch {}

    // Tabela
    autoTable(doc, {
      startY: 55,
      head: [['ESPECIFICAÇÃO', 'DETALHAMENTO']],
      body: [
        ['CLIENTE', app.company_name || 'N/A'],
        ['DOCUMENTO', app.companyCnpj || 'N/A'],
        ['DATA/HORA', `${app.date || ''} ${app.time || ''}`],
        ['MOTIVO', app.reason || 'Vistoria Técnica'],
        ['TÉCNICO', app.technicianName || '—'],
      ],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    let y = (doc as any).lastAutoTable.finalY + 15;

    // Parecer
    doc.setFont('helvetica', 'bold');
    doc.text('PARECER TÉCNICO', 15, y);
    doc.setFont('helvetica', 'normal');

    const text = doc.splitTextToSize(
      app.description || 'Nenhuma observação.',
      pageWidth - 30
    );
    doc.text(text, 15, y + 8);
    y += text.length * 5 + 20;

    // Foto
    if (photo) {
      if (y + 60 > pageHeight - 40) doc.addPage();
      doc.addImage(photo, 'JPEG', 15, y, 60, 45);
    }

    // Assinatura
    if (signature) {
      doc.addImage(signature, 'PNG', pageWidth - 75, pageHeight - 55, 50, 12);
    }

    drawFooter(doc, pageWidth, pageHeight);

    doc.save(`Relatorio_SST_${(app.company_name || 'cliente').replace(/\s/g, '_')}.pdf`);
  },
};
