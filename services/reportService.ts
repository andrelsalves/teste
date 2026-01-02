import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '../types/types';

export const reportService = {
  async generateAppointmentPDF(app: Appointment) {
    if (!app) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- TRATAMENTO DE DADOS NULOS ---
    // Garante que tenhamos strings válidas para evitar erros de .replace() ou .substring()
    const companyName = app.companyName || 'Empresa_Nao_Informada';
    const reportDate = app.date || new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const appId = app.id ? app.id.substring(0, 8).toUpperCase() : 'S-ID';

    // 1. Cabeçalho Estilizado
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VISITA TÉCNICA', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID do Registro: #${appId}`, 15, 33);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 33, { align: 'right' });

    // 2. Informações do Cliente e Visita
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text('Dados do Atendimento', 15, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Campo', 'Informação']],
      body: [
        ['Empresa Cliente', companyName],
        ['CNPJ', app.companyCnpj || 'Não Informado'],
        ['Data/Hora da Visita', `${app.date || ''} às ${app.time || ''}`],
        ['Motivo da Solicitação', app.reason || 'Não Informado'],
        ['Técnico Responsável', app.technicianName || 'Não Identificado'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // 3. Descrição Técnica
    const finalY = (doc as any).lastAutoTable?.finalY || 60;
    doc.setFontSize(14);
    doc.text('Parecer Técnico / Descrição dos Serviços', 15, finalY + 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const description = app.description || 'Nenhuma descrição detalhada fornecida.';
    const splitReport = doc.splitTextToSize(description, pageWidth - 30);
    doc.text(splitReport, 15, finalY + 25);

    // 4. Evidência Fotográfica (Proteção para CORS)
    if (app.photo_url) {
      try {
        const imgY = finalY + 50;
        doc.setFontSize(14);
        // doc.text('Evidência Fotográfica', 15, imgY);
        // doc.addImage(app.photo_url, 'JPEG', 15, imgY + 10, 100, 75);
      } catch (e) {
        console.error("Erro ao carregar imagem no PDF", e);
      }
    }

    // 5. Rodapé
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, pageWidth - 15, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Este documento é um registro digital gerado pelo sistema SST PRO.', pageWidth / 2, footerY + 10, { align: 'center' });

    // Salvar o arquivo usando as variáveis tratadas
    doc.save(`Relatorio_${companyName.replace(/\s/g, '_')}_${reportDate}.pdf`);
  }
};
