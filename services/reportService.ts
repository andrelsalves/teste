import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const reportService = {
  // 1. Função auxiliar para converter URL/File em Base64
  async getBase64FromUrl(url: string): Promise<string> {
    try {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      });
    } catch (e) {
      console.error("Erro ao carregar imagem para Base64", e);
      return "";
    }
  },

  // 2. Função para abrir o WhatsApp
  openWhatsApp(app: any) {
    if (!app) return;
    const phoneNumber = "55" + (app.clientPhone || "").replace(/\D/g, ''); 
    const message = `Olá! Segue o Relatório de Visita Técnica da empresa *${app.company_name}* referente ao atendimento de *${app.reason}*. %0A%0A_Enviado via SST PRO_`;
    
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  },

  // 3. Função para gerar o PDF
  async generateAppointmentPDF(app: any, photoDataUrl?: string | null, signatureDataUrl?: string | null) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const companyName = app.company_name || app.companyName || 'Cliente';

    // --- LOGO NO CABEÇALHO ---
    try {
      const logoBase64 = await this.getBase64FromUrl('/logo-minimal.png'); 
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 8, 20, 15);
      }
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.text('SST PRO', 15, 18);
    }

    // --- FAIXA DO CABEÇALHO ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VISITA TÉCNICA', pageWidth - 15, 15, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: #${(app.id || "").substring(0, 8).toUpperCase()}`, pageWidth - 15, 22, { align: 'right' });
    doc.text(`EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 27, { align: 'right' });

    // --- TABELA DE DADOS ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DO ATENDIMENTO', 15, 50);

    autoTable(doc, {
      startY: 55,
      head: [['ESPECIFICAÇÃO', 'DETALHAMENTO']],
      body: [
        ['CLIENTE', companyName.toUpperCase()],
        ['DOCUMENTO', app.companyCnpj || 'N/A'],
        ['DATA/HORA', `${app.date || ''} ${app.time || ''}`],
        ['MOTIVO', app.reason || 'Vistoria Técnica'],
        ['TÉCNICO', app.technicianName || 'Técnico Responsável'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', fillColor: [245, 245, 245] } }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- PARECER TÉCNICO ---
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PARECER TÉCNICO', 15, currentY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const description = app.description || 'Nenhuma observação adicional.';
    const splitText = doc.splitTextToSize(description, pageWidth - 30);
    doc.text(splitText, 15, currentY + 8);
    
    currentY += (splitText.length * 5) + 20;

    // --- FOTO ---
    if (photoDataUrl) {
      if (currentY + 50 > pageHeight - 40) doc.addPage(); 
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. EVIDÊNCIA FOTOGRÁFICA', 15, currentY);
      doc.addImage(photoDataUrl, 'JPEG', 15, currentY + 5, 60, 45);
      currentY += 60;
    }

    // --- ASSINATURAS ---
    const footerY = pageHeight - 40;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, 80, footerY);
    doc.text('Assinatura do Técnico', 50, footerY + 5, { align: 'center' });
    
    doc.line(pageWidth - 80, footerY, pageWidth - 20, footerY);
    if (signatureDataUrl) {
        doc.addImage(signatureDataUrl, 'PNG', pageWidth - 75, footerY - 15, 50, 12);
    }
    doc.text('Assinatura do Cliente', pageWidth - 50, footerY + 5, { align: 'center' });

    // --- RODAPÉ ---
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text('SST PRO - Gestão Ocupacional Inteligente | Gerado via Plataforma Digital', pageWidth / 2, pageHeight - 7, { align: 'center' });

    doc.save(`Relatorio_SST_${companyName.replace(/\s/g, '_')}.pdf`);
  }
};
