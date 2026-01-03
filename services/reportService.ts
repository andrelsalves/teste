import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '../types/types';

export const reportService = {
  async generateAppointmentPDF(app: Appointment) {
    if (!app) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const companyName = app.companyName || 'Empresa não informada';

    // --- 1. PAPEL TIMBRADO (MARCA D'ÁGUA) ---
    // Apenas o texto limpo, sem círculos, no fundo
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
    doc.setFontSize(60);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('SST PRO', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();

    // --- 2. CABEÇALHO ---
    // Faixa Superior Minimalista
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Logo em Texto (Substituindo o círculo verde)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SST', 15, 16);
    doc.setTextColor(34, 197, 94); // Verde Esmeralda apenas no PRO
    doc.text('PRO', 28, 16);

    // Título à Direita
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('RELATÓRIO TÉCNICO DE VISITA', pageWidth - 15, 12, { align: 'right' });
    doc.text(`ID: #${app.id?.substring(0, 8).toUpperCase()}`, pageWidth - 15, 18, { align: 'right' });

    // --- 3. TABELA DE DADOS ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('1. INFORMAÇÕES GERAIS', 15, 40);

    autoTable(doc, {
      startY: 45,
      head: [['CAMPO', 'INFORMAÇÃO']],
      body: [
        ['CLIENTE', companyName.toUpperCase()],
        ['CNPJ', app.companyCnpj || 'N/A'],
        ['DATA', app.date],
        ['MOTIVO', app.reason || 'Vistoria'],
        ['TÉCNICO', app.technicianName || 'Responsável'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- 4. PARECER TÉCNICO ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PARECER TÉCNICO', 15, finalY + 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const description = app.description || 'Nenhuma observação registrada.';
    const splitText = doc.splitTextToSize(description, pageWidth - 30);
    doc.text(splitText, 15, finalY + 22);

    // --- 5. ASSINATURAS (ESTILO PROFISSIONAL) ---
    const footerY = pageHeight - 40;
    
    // Linha do Cliente (onde vai a imagem da assinatura se existir)
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 85, footerY, pageWidth - 15, footerY);
    doc.text('Assinatura do Cliente', pageWidth - 50, footerY + 5, { align: 'center' });

    // Linha do Técnico
    doc.line(15, footerY, 85, footerY);
    doc.text('Assinatura do Técnico', 50, footerY + 5, { align: 'center' });

    doc.save(`Relatorio_${companyName.replace(/\s/g, '_')}.pdf`);
  }
};
