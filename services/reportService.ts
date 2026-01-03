import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const reportService = {
  // Função que gera o Blob do PDF (necessário para compartilhar)
  async generateAppointmentBlob(app: any): Promise<Blob> {
    const doc = new jsPDF();
    // ... (Aqui vai todo aquele código de design que criamos antes: cabeçalho, tabela, etc)
    
    // Em vez de doc.save(), retornamos o blob
    return doc.output('blob');
  },

  async shareReport(app: any) {
    try {
      const blob = await this.generateAppointmentBlob(app);
      const file = new File([blob], `Relatorio_${app.company_name}.pdf`, { type: 'application/pdf' });

      // Verifica se o navegador suporta compartilhamento de arquivos (Mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Relatório de Visita Técnica',
          text: `Segue relatório da visita realizada na empresa ${app.company_name}`,
        });
      } else {
        // Fallback para download simples se estiver no Desktop
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_${app.company_name}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }
};
