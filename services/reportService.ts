import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ================= TYPES ================= */

interface AppointmentPDFData {
  id?: string;
  company_name?: string;
  companyName?: string;
  companyCnpj?: string;
  date?: string;
  time?: string;
  reason?: string;
  description?: string;
  technicianName?: string;
  clientPhone?: string;
}

/* ================= HELPERS ================= */

const isBrowser = typeof window !== 'undefined';

const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Imagem não carregada: ${url}`);
    return null;
  }
};

/* ================= SERVICE ================= */

export const reportService = {
  /* ---------- WhatsApp ---------- */

  openWhatsApp(app: AppointmentPDFData) {
    if (!isBrowser || !app?.clientPhone) return;

    const phone = `55${app.clientPhone.replace(/\D/g, '')}`;
    const message =
      `Olá! Segue o Relatório de Visita Técnica da empresa *${app.company_name || app.companyName}* ` +
      `referente ao atendimento de *${app.reason}*.\n\n_Enviado via SST PRO_`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  },

  /* ---------- PDF ---------- */

  async generateAppointmentPDF(
    app: AppointmentPDFData,
    photoDataUrl?: string | null,
    signatureDataUrl?: string | null
  ) {
    if (!isBrowser) {
      console.warn('PDF ignorado: ambiente não-browser');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const company =
      app.company_name || app.companyName || 'Cliente';

    /* ===== HEADER ===== */

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 35, 'F');

    const logo = await loadImageAsBase64('/logo-minimal.png');
    if (logo) doc.addImage(logo, 'PNG', 15, 8, 20, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VISITA TÉCNICA', pageWidth - 15, 15, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: #${app.id?.slice(0, 8)?.toUpperCase()}`, pageWidth - 15, 22, { align: 'right' });
    doc.text(`EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 27, { align: 'right' });

    /* ===== WATERMARK ===== */

    const watermark = await loadImageAsBase64('/escudo-sst.png');
    if (watermark) {
      doc.saveGraphicsState();
      // @ts-ignore
      doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      doc.addImage(
        watermark,
        'PNG',
        pageWidth / 4,
        pageHeight / 4,
        pageWidth / 2,
        pageWidth / 2
      );
      doc.restoreGraphicsState();
    }

    /* ===== TABLE ===== */

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DO ATENDIMENTO', 15, 50);

    autoTable(doc, {
      startY: 55,
      head: [['ESPECIFICAÇÃO', 'DETALHAMENTO']],
      body: [
        ['CLIENTE', company.toUpperCase()],
        ['DOCUMENTO', app.companyCnpj || 'N/A'],
        ['DATA/HORA', `${app.date || ''} ${app.time || ''}`],
        ['MOTIVO', app.reason || 'Vistoria Técnica'],
        ['TÉCNICO', app.technicianName || 'Técnico Responsável'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', fillColor: [245, 245, 245] },
      },
    });

    let y = (doc as any).lastAutoTable.finalY + 15;

    /* ===== DESCRIPTION ===== */

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PARECER TÉCNICO', 15, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const text = doc.splitTextToSize(
      app.description || 'Nenhuma observação adicional.',
      pageWidth - 30
    );
    doc.text(text, 15, y + 8);
    y += text.length * 5 + 20;

    /* ===== PHOTO ===== */

    if (photoDataUrl) {
      if (y + 60 > pageHeight - 40) doc.addPage();

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. EVIDÊNCIA FOTOGRÁFICA', 15, y);
      doc.addImage(photoDataUrl, 'JPEG', 15, y + 5, 60, 45);
      y += 60;
    }

    /* ===== SIGNATURE ===== */

    const footerY = pageHeight - 40;
    doc.setDrawColor(200);

    doc.line(20, footerY, 80, footerY);
    doc.text('Assinatura do Técnico', 50, footerY + 5, { align: 'center' });

    doc.line(pageWidth - 80, footerY, pageWidth - 20, footerY);
    if (signatureDataUrl) {
      doc.addImage(signatureDataUrl, 'PNG', pageWidth - 75, footerY - 15, 50, 12);
    }
    doc.text('Assinatura do Cliente', pageWidth - 50, footerY + 5, { align: 'center' });

    /* ===== FOOTER ===== */

    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.text(
      'SST PRO - Gestão Ocupacional Inteligente',
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );

    doc.save(`Relatorio_SST_${company.replace(/\s/g, '_')}.pdf`);
  },
};
