import type jsPDF from 'jspdf';

export function drawHeader(doc: jsPDF, pageWidth: number) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RELATÓRIO DE VISITA TÉCNICA', pageWidth - 15, 15, { align: 'right' });
}

export function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.text(
    'SST PRO - Gestão Ocupacional Inteligente',
    pageWidth / 2,
    pageHeight - 7,
    { align: 'center' }
  );
}
