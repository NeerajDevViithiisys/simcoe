import React from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Quote } from "../types";
import { toast } from "react-toastify";

interface QuotePDFProps {
  quote: Quote;
}

export const generateQuotePDF = async (quote: Quote) => {
  try {
    // Create a temporary container
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.background = "white";
    tempDiv.style.width = "800px"; // Set a fixed width for better scaling
    document.body.appendChild(tempDiv);

    // Add content to the temporary container
    tempDiv.innerHTML = `
      <div class="max-w-3xl mx-auto bg-white">
        <div class="bg-[#C49C3C] p-4 text-white">
          <h1 class="text-xl font-bold">Quote</h1>
        </div>
        
        <div class="border-b p-4">
          <div class="flex justify-between">
            <div>
              <h2 class="text-sm text-gray-500">Quote ID</h2>
              <p class="text-sm font-medium">${quote.invoice}</p>
            </div>
            <div class="text-right">
              <h2 class="text-sm text-gray-500">Date Issued</h2>
              <p class="text-sm font-medium">${new Date(
                quote.createdAt
              ).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="p-4 border-b">
          <div class="grid grid-cols-2">
            <div>
              <h2 class="text-sm text-gray-500 mb-2">Bill To:</h2>
              <p class="text-sm font-medium">
                ${quote.clientInfo.firstName} ${quote.clientInfo.lastName}
              </p>
              <p class="text-sm">Phone: ${quote.clientInfo.phoneNumber}</p>
              <p class="text-sm">Email: ${quote.clientInfo.email || ""}</p>
              <p class="text-sm">Address: ${quote.clientInfo.address}</p>
            </div>
            <div class="text-right">
              <h2 class="text-sm text-gray-500 mb-2">From:</h2>
              <p class="text-sm font-medium">${quote.user.name}</p>
              <p class="text-sm">Phone: ${quote.user.phoneNumber}</p>
              <p class="text-sm">Email: ${quote.user.email}</p>
            </div>
          </div>
        </div>

        <div class="p-4">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left p-2">Service Type</th>
                <th class="text-left p-2">QTY</th>
                <th class="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.services
                .map(
                  (service) => `
                <tr>
                  <td class="p-2">${service.serviceType.replace(
                    /_/g,
                    " "
                  )}</td>
                  <td class="p-2">${service.units}</td>
                  <td class="p-2 text-right">$${service.total.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-gray-50">
          <div class="max-w-xs ml-auto">
            <div class="flex justify-between py-2">
              <span class="text-sm text-gray-500">Subtotal</span>
              <span class="text-sm font-medium">$${quote.subtotal.toFixed(
                2
              )}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-gray-500">Discount</span>
              <span class="text-sm font-medium">-$${quote.discount.flat.toFixed(
                2
              )}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-gray-500">Tax</span>
              <span class="text-sm font-medium">$${quote.taxValue.toFixed(
                2
              )}</span>
            </div>
            <div class="flex justify-between py-2 border-t mt-2">
              <span class="font-medium">Total</span>
              <span class="font-bold">$${quote.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Generate PDF
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: tempDiv.offsetWidth,
      height: tempDiv.offsetHeight,
      windowWidth: tempDiv.scrollWidth,
      windowHeight: tempDiv.scrollHeight,
    });

    // Calculate dimensions to fit A4
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF("p", "mm", "a4");
    
    // If content is taller than A4, split into multiple pages
    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
      
      if (heightLeft > 0) {
        pdf.addPage();
        position -= pageHeight;
      }
    }

    // Cleanup
    document.body.removeChild(tempDiv);

    // Save PDF
    const fileName = `quote-${quote.id}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF");
  }
};

const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  return (
    <button
      onClick={() => generateQuotePDF(quote)}
      className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded transition-colors duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </button>
  );
};

export default QuotePDF; 