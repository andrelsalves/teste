import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '../types/types';

export const reportService = {
  async generateAppointmentPDF(app: Appointment) {
    if (!app) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Tratamento de strings para evitar erros
    const companyName = app.companyName || 'Empresa não informada';
    const reportDate = app.date || new Date().toLocaleDateString('pt-BR');

    // --- 1. MARCA D'ÁGUA CENTRALIZADA ---
    // Usamos um tom cinza muito claro (opacidade simulada)
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
    doc.setFontSize(60);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'bold');
    doc.text('SST PRO', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();

    // --- 2. CABEÇALHO (PAPEL TIMBRADO) ---
    // Faixa Superior
    doc.setFillColor(15, 23, 42); // Azul Marinho Profissional
    doc.rect(0, 0, pageWidth, 35, 'F');

    // LOGO SIMULADA (Círculo + Texto)
    doc.setDrawColor(34, 197, 94); // Verde Esmeralda do Sistema
    doc.setLineWidth(1);
    doc.circle(25, 17, 8, 'D'); 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('SST', 38, 18);
    doc.setTextColor(34, 197, 94);
    doc.text('PRO', 52, 18);

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

    // --- 4. PARECER TÉCNICO ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PARECER TÉCNICO', 15, finalY + 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const description = app.description || 'Sem observações adicionais gravadas.';
    const splitText = doc.splitTextToSize(description, pageWidth - 30);
    doc.text(splitText, 15, finalY + 23);

    // --- 5. RODAPÉ COM ASSINATURAS ---
    const footerY = pageHeight - 50;
    
    // Linhas de Assinatura
    doc.setDrawColor(180, 180, 180);
    doc.line(20, footerY, 90, footerY); // Técnico
    doc.line(pageWidth - 90, footerY, pageWidth - 20, footerY); // Cliente

    doc.setFontSize(8);
    doc.text('Assinatura do Técnico', 55, footerY + 5, { align: 'center' });
    doc.text('Assinatura do Cliente', pageWidth - 55, footerY + 5, { align: 'center' });

    // Faixa Final
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(100, 100, 100);
    doc.text('SST PRO - Gestão Ocupacional Inteligente | Gerado via Plataforma Digital', pageWidth / 2, pageHeight - 7, { align: 'center' });

    doc.save(`Relatorio_SST_${companyName.replace(/\s/g, '_')}.pdf`);
  }
};
