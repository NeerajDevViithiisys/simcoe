'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { quoteAPI } from '../services/api';
import { useParams } from 'react-router-dom';
import { DownloadCloud } from 'lucide-react';
import { formatServiceType } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

interface Quote {
  id: string;
  createdAt: string;
  services: {
    serviceType: string;
    units: number;
    id: string;
    total: number;
  }[];
  clientInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    email: string;
    notes: string;
    city: string;
    province: string;
    postalCode: string;
    otherPhone: string;
    units: string;
  };
  user: {
    name: string;
    id: string;
    phoneNumber: string;
    email: string;
  };
  units: number;
  taxValue: number;
  setupMinutes: number;
  perUnitMinutes: number;
  total: number;
  subtotal: number;
  discount: {
    flat: number;
    percentage: number;
  };
  numberOfPersons: number;
  invoice: string;
}

export const QuotesView = () => {
  const { id } = useParams<{ id: string }>();
  const [invoiceData, setInvoiceData] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null); // Add this line
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) throw new Error('Quote ID is required');

        const data = await quoteAPI.getQuote(id);
        if (mounted) {
          if (data.data.length === 0) {
            const localData = localStorage.getItem('selectedQuote');
            setInvoiceData(localData ? JSON.parse(localData) : null);
          } else {
            setInvoiceData(data.data);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quote');
          console.error('Error fetching quote:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-500">{error || 'Invoice not found'}</div>
      </div>
    );
  }

  const createdDate = new Date(invoiceData?.createdAt);
  const timeAgo = createdDate ? formatDistance(createdDate, new Date(), { addSuffix: true }) : '';

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      setIsPdfGenerating(true);
      // Show loading state
      const button = document.querySelector('.download-button');
      if (button) {
        button.textContent = 'Generating PDF...';
        button.setAttribute('disabled', 'true');
      }

      setIsPdfMode(true); // Set PDF mode before generating

      // Wait for re-render with hidden elements
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: content.offsetWidth,
        height: content.offsetHeight,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // If content is taller than A4, split into multiple pages
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      while (heightLeft > 0) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        if (heightLeft > 0) {
          pdf.addPage();
          position -= pageHeight;
          page++;
        }
      }

      const firstName = invoiceData.clientInfo?.firstName || '';
      const lastName = invoiceData.clientInfo?.lastName || '';

      // Generate filename with quote ID and date
      const fileName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}${
        lastName ? ' ' + (lastName.charAt(0).toUpperCase() + lastName.slice(1)) : ''
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsPdfGenerating(false);
      setIsPdfMode(false); // Reset PDF mode after generating
      // Reset button state
      const button = document.querySelector('.download-button');
      if (button) {
        button.textContent = 'Download PDF';
        button.removeAttribute('disabled');
      }
    }
  };

  return (
    <div className="min-h-screen md:py-6 px-2 sm:md:px-6 px-2 lg:px-8" ref={contentRef}>
      <div className="max-w-3xl mx-auto bg-white rounded border overflow-hidden">
        {/* Invoice Header */}
        <div className="md:px-6 px-4 py-4 bg-[#C49C3C]">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Quote</h1>
            {!isPdfMode && ( // Hide in PDF mode
              <span
                className={`px-4 cursor-pointer py-1 bg-white text-[#C49C3C] text-sm rounded-full flex items-center ${
                  isPdfGenerating ? 'opacity-50' : ''
                }`}
                onClick={handleDownloadPDF}
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                {isPdfGenerating ? 'Generating PDF...' : 'Download PDF'}
              </span>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="md:px-6 px-4 py-4 border-b">
          <div className="flex justify-between flex-wrap">
            <div className="mb-4">
              <h2 className="text-sm text-gray-500">Quote ID</h2>
              <p className="text-sm font-medium text-gray-700">{invoiceData?.invoice}</p>
            </div>
            <div className="mb-4 text-right">
              <h2 className="text-sm text-gray-500">Date Issued</h2>
              <p className="text-sm font-medium text-gray-700">
                {createdDate.toLocaleDateString()}
                <br />
                {!isPdfMode && ( // Hide in PDF mode
                  <span className="text-gray-400 text-xs ml-2">({timeAgo})</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Business Info */}
        <div className="md:px-6 px-4 py-4 border-b grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xs font-medium text-gray-500 mb-2">Bill To:</h2>
            <p className="text-sm font-medium text-gray-800">
              {invoiceData.clientInfo?.firstName?.charAt(0).toUpperCase() +
                invoiceData.clientInfo?.firstName?.slice(1)}{' '}
              {invoiceData.clientInfo?.lastName}
            </p>
            <p className="text-sm pt-2">
              <span className="text-sm text-gray-500">Phone</span>:{' '}
              {invoiceData.clientInfo.phoneNumber},{invoiceData.clientInfo.otherPhone}
            </p>
            {invoiceData.clientInfo?.email && (
              <p className="text-sm pt-2">
                <span className="text-sm text-gray-500">Email:</span>{' '}
                {invoiceData.clientInfo?.email}
              </p>
            )}
            <p className="text-sm pt-2">
              <span className="text-sm text-gray-500">Address:</span>{' '}
              {invoiceData.clientInfo?.units} {invoiceData.clientInfo.address},{' '}
              {invoiceData.clientInfo.city},{invoiceData.clientInfo.postalCode}
            </p>
            {invoiceData.clientInfo?.notes && (
              <p className="text-sm pt-2">
                <span className="text-sm text-gray-500">Notes:</span>{' '}
                {invoiceData.clientInfo?.notes}
              </p>
            )}
          </div>
          <div className="md:text-right">
            <h2 className="text-xs font-medium  text-gray-500 mb-2">From:</h2>
            <p className="text-sm font-medium text-gray-800">{invoiceData.user?.name}</p>
            <p className="text-sm pt-2">
              <span className="text-sm text-gray-500">Phone</span> : {invoiceData.user.phoneNumber}
            </p>
            <p className="text-sm pt-2">
              <span className="text-sm text-gray-500">Email</span> : {invoiceData.user.email}{' '}
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="md:px-6 px-4 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                    Service Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                    QTY
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500  tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.services.map((service) => {
                  return (
                    <tr key={service.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatServiceType(service.serviceType)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.units}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${(service?.total || 0).toFixed(2)}{' '}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Summary */}
        <div className="md:px-6 px-4 py-4 bg-gray-50">
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm text-gray-900 font-medium">
                  ${(invoiceData?.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Discount</span>
                <span className="text-sm text-green-900 font-medium">
                  -${(invoiceData?.discount?.flat || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Tax</span>
                <span className="text-sm text-gray-900 font-medium">
                  ${invoiceData.taxValue.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">
                  ${(invoiceData?.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
