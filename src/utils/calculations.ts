import { ServiceCalculation } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generatePDF(calculations: ServiceCalculation[]): void {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('Service Quote', 105, 20, { align: 'center' });

  // Add date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

  let yPos = 40;

  calculations.forEach((calc, index) => {
    // Service details
    doc.setFontSize(14);
    doc.text(calc.serviceType.replace(/_/g, ' '), 20, yPos);

    // Create table data
    const tableData = [
      ['Units', calc.numberOfUnits.toString()],
      ['Total Time', `${calc.totalTimeHours.toFixed(2)} hours`],
      ['Calendar Time', `${calc.calendarSlotHours.toFixed(2)} hours`],
      ['Subtotal', `$${calc.subtotal.toFixed(2)}`],
      ['Discount', `-$${calc.discount.toFixed(2)}`],
      ['Tax (13%)', `$${calc.tax.toFixed(2)}`],
      ['Total Cost', `$${calc.totalCost.toFixed(2)}`],
    ];

    // Add table
    (doc as any).autoTable({
      startY: yPos + 10,
      head: [['Item', 'Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Add page if needed
    if (yPos > 250 && index < calculations.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Add total section
  const totalAmount = calculations.reduce((sum, calc) => sum + calc.totalCost, 0);
  const totalTime = calculations.reduce((sum, calc) => sum + calc.totalTimeHours, 0);

  doc.setFontSize(12);
  doc.text('Summary', 20, yPos);

  const summaryData = [
    ['Total Time', `${totalTime.toFixed(2)} hours`],
    ['Total Amount', `$${totalAmount.toFixed(2)}`],
  ];

  (doc as any).autoTable({
    startY: yPos + 10,
    body: summaryData,
    theme: 'grid',
    styles: { fontStyle: 'bold' },
    margin: { left: 20 },
  });

  // Save the PDF
  doc.save('service-quote.pdf');
}
