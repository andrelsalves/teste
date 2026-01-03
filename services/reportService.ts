import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const reportService = {
  // Função auxiliar para converter URL/File em Base64
  async getBase64FromUrl(url: string): Promise<string> {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
    });
  },

  async generateAppointmentPDF(app: any, photoDataUrl?: string | null) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // --- 1. LOGO NO CABEÇALHO ---
    // Se você tiver a logo em /public/logo.png:
    try {
        const logoBase64 = await this.getBase64FromUrl('/logo-minimal.png'); 
        doc.addImage(logoBase64, 'PNG', 15, 5, 25, 15); // x, y, largura, altura
    } catch (e) {
        // Fallback caso a imagem não carregue
        doc.setTextColor(255, 255, 255);
        doc.text('SST PRO', 15, 15);
    }

    / --- 2. CABEÇALHO (PAPEL TIMBRADO) ---
    // Faixa Superior
    doc.setFillColor(15, 23, 42); // Azul Marinho Profissional
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Título à Direita
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RELATÓRIO DE VISITA TÉCNICA', pageWidth - 15, 15, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`ID: #${app.id?.substring(0, 8).toUpperCase()}`, pageWidth - 15, 22, { align: 'right' });
    doc.text(`EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 27, { align: 'right' });

    // --- 3. CONTEÚDO ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. DADOS DO ATENDIMENTO', 15, 50);

    autoTable(doc, {
      startY: 55,
      head: [['ESPECIFICAÇÃO', 'DETALHAMENTO']],
      body: [
        ['CLIENTE', companyName.toUpperCase()],
        ['DOCUMENTO (CNPJ)', app.companyCnpj || 'N/A'],
        ['DATA E HORÁRIO', `${app.date} às ${app.time}`],
        ['MOTIVO DA VISITA', app.reason || 'Vistoria Técnica'],
        ['EXECUTOR', app.technicianName || 'Técnico Responsável'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 4, fontSize: 9 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', fillColor: [245, 245, 245] } }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- 2. INSERINDO A FOTO DO SERVIÇO ---
    if (photoDataUrl) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('3. EVIDÊNCIA FOTOGRÁFICA', 15, finalY + 30);
      
      // Ajusta a imagem para caber no PDF (proporção 4:3)
      doc.addImage(photoDataUrl, 'JPEG', 15, finalY + 35, 80, 60);
    }

    // --- 3. INSERINDO A ASSINATURA ---
    // Se o sigCanvas.current.toDataURL() for passado:
    // doc.addImage(signatureDataUrl, 'PNG', pageWidth - 80, footerY - 20, 60, 20);

    doc.save(`Relatorio_${app.company_name}.pdf`);

    
    // Faixa Final
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(100, 100, 100);
    doc.text('SST PRO - Gestão Ocupacional Inteligente | Gerado via Plataforma Digital', pageWidth / 2, pageHeight - 7, { align: 'center' });

    doc.save(`Relatorio_SST_${companyName.replace(/\s/g, '_')}.pdf`);
  }
  }
};

