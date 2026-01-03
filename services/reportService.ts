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
    // Substituindo o texto SST PRO por uma imagem real
    // Se você tiver a logo em /public/logo.png:
    try {
        const logoBase64 = await this.getBase64FromUrl('/logo-minimal.png'); 
        doc.addImage(logoBase64, 'PNG', 15, 5, 25, 15); // x, y, largura, altura
    } catch (e) {
        // Fallback caso a imagem não carregue
        doc.setTextColor(255, 255, 255);
        doc.text('SST PRO', 15, 15);
    }

    // ... (restante do código de cabeçalho e tabela)

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
  }
};
