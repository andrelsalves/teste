import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '../types/types';

export const reportService = {
  async generateAppointmentPDF(app: Appointment) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Cabeçalho Estilizado
    doc.setFillColor(15, 23, 42); // Azul escuro do seu tema
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VISITA TÉCNICA', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID do Registro: #${app.id.substring(0, 8).toUpperCase()}`, 15, 33);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 33, { align: 'right' });

    // 2. Informações do Cliente e Visita
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text('Dados do Atendimento', 15, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Campo', 'Informação']],
      body: [
        ['Empresa Cliente', app.companyName],
        ['CNPJ', app.companyCnpj || 'Não Informado'],
        ['Data/Hora da Visita', `${app.date} às ${app.time}`],
        ['Motivo da Solicitação', app.reason],
        ['Técnico Responsável', app.technicianName || 'Não Identificado'],
      ],
      theme: 'striped',
      headStyles: { fillStyle: 'transparent', textColor: [100, 100, 100], fontSize: 8 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // 3. Descrição Técnica (O que foi feito)
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(14);
    doc.text('Parecer Técnico / Descrição dos Serviços', 15, finalY + 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitReport = doc.splitTextToSize(app.description || 'Nenhuma descrição detalhada fornecida.', pageWidth - 30);
    doc.text(splitReport, 15, finalY + 25);

    // 4. Evidência Fotográfica
    if (app.photo_url) {
      try {
        const imgY = finalY + 50;
        doc.setFontSize(14);
        doc.text('Evidência Fotográfica', 15, imgY);
        
        // Adiciona a imagem (convertendo URL para Base64 internamente pelo jsPDF)
        // Nota: A imagem precisa permitir CORS para funcionar via URL direta
        doc.addImage(app.photo_url, 'JPEG', 15, imgY + 10, 100, 75);
      } catch (e) {
        console.error("Erro ao carregar imagem no PDF", e);
      }
    }

    // 5. Rodapé / Assinatura
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, pageWidth - 15, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Este documento é um registro digital gerado pelo sistema SST PRO.', pageWidth / 2, footerY + 10, { align: 'center' });
    doc.text('A veracidade das informações é de responsabilidade do técnico executor.', pageWidth / 2, footerY + 15, { align: 'center' });

    // Salvar o arquivo
    doc.save(`Relatorio_${app.companyName.replace(/\s/g, '_')}_${app.date}.pdf`);
  }
};
