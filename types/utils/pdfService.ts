import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Appointment } from '../types/types';

export const pdfService = {
  generateVisitReport: async (appointment: Appointment) => {
    const doc = new jsPDF();
    const greenColor = [16, 185, 129]; // O verde do SST PRO

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text('SST PRO - RELATÓRIO DE VISITA', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Emitido em: ${new Date().toLocaleString()}`, 14, 30);

    // Tabela de Dados Principais
    (doc as any).autoTable({
      startY: 40,
      head: [['Campo', 'Informação']],
      body: [
        ['Cliente', appointment.companyName],
        ['CNPJ', appointment.companyCnpj || 'Não informado'],
        ['Técnico', appointment.technicianName],
        ['Data/Hora', `${appointment.date} às ${appointment.time}`],
        ['Motivo', appointment.reason],
      ],
      headStyles: { fillColor: greenColor },
    });

    // Relatório Técnico
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Relatório Técnico:', 14, finalY);
    doc.setFontSize(10);
    doc.text(appointment.description || 'Nenhuma nota informada.', 14, finalY + 7, { maxWidth: 180 });

    // Inserir Foto da Visita (se houver)
    if (appointment.photo_url) {
      const imgY = finalY + 30;
      doc.text('Evidência Fotográfica:', 14, imgY - 5);
      // Nota: Para fotos externas, o ideal é converter para base64 antes
      doc.addImage(appointment.photo_url, 'JPEG', 14, imgY, 60, 45);
    }

    // Assinatura do Cliente
    if (appointment.signature_image) {
      const sigY = 240;
      doc.line(14, sigY, 80, sigY); // Linha da assinatura
      doc.addImage(appointment.signature_image, 'PNG', 14, sigY - 25, 50, 20);
      doc.text('Assinatura do Cliente', 14, sigY + 5);
    }

    doc.save(`Relatorio_${appointment.companyName}_${appointment.date}.pdf`);
  }
};