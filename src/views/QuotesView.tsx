'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { quoteAPI } from '../services/api';
import { useParams } from 'react-router-dom';

// interface ServiceType {
//   id: string;
//   serviceType: string;
//   units: number;
// }

interface Quote {
  id: string;
  createdAt: string;
  services: {
    serviceType: string;
    units: number;
    id: string;
  }[];
  clientInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
  };
  user: {
    name: string;
    id: string;
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
}

// Format service names for display
// const formatServiceName = (serviceType: string): string => {
// return serviceType
//   .replace(/_/g, ' ')
//   .toLowerCase()
//   .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// Calculate price per service (hypothetical prices)
const getServicePrice = (serviceType: string): number => {
  const prices: Record<string, number> = {
    EXTERIOR_WINDOW_CLEANING: 35.99,
    EXTERIOR_GUTTER_CLEANING: 45.99,
    // Add more service prices as needed
  };
  return prices[serviceType] || 0;
};

export default function QuotesView() {
  const { id } = useParams<{ id: string }>();
  const [invoiceData, setInvoiceData] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) throw new Error('Quote ID is required');

        // Provide default values for the missing arguments (e.g., limit and offset)
        const data = await quoteAPI.getQuote(id);
        if (data.data.length === 0) {
          console.log('Fetched quote data:', data.data);
          const localData = localStorage.getItem('selectedQuote');
          setInvoiceData(localData ? JSON.parse(localData) : null);
        } else {
          setInvoiceData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote');
        console.error('Error fetching quote:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
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
  const timeAgo = formatDistance(createdDate, new Date(), { addSuffix: true });

  return (
    <div className="min-h-screen md:py-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        {/* Invoice Header */}
        <div className="px-6 py-4 bg-purple-600">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Invoice</h1>
            {/* <span className="px-3 py-1 bg-purple-800 text-white text-sm rounded-full">Paid</span> */}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between flex-wrap">
            <div className="mb-4">
              <h2 className="text-sm text-gray-500">Invoice ID</h2>
              <p className="text-sm font-medium text-gray-700">
                {invoiceData?.id.substring(0, 8)}...
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-sm text-gray-500">Date Issued</h2>
              <p className="text-sm font-medium text-gray-700">
                {createdDate.toLocaleDateString()}
                <span className="text-gray-400 text-xs ml-2">({timeAgo})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Business Info */}
        <div className="px-6 py-4 border-b grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xs font-medium uppercase text-gray-500 mb-2">Business Info</h2>
            <p className="text-sm font-medium text-gray-800">
              {invoiceData.clientInfo?.firstName} {invoiceData.clientInfo?.lastName}
            </p>
            <p className="text-sm text-gray-600">Phone: {invoiceData.clientInfo.phoneNumber}</p>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase text-gray-500 mb-2">ESTIMATOR</h2>
            <p className="text-sm font-medium text-gray-800">{invoiceData.user?.name}</p>
          </div>
        </div>

        {/* Services */}
        <div className="px-6 py-4">
          <h2 className="text-xs font-medium uppercase text-gray-500 mb-4">Services</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.services.map((service) => {
                  const price = getServicePrice(service.serviceType);
                  const total = price * service.units;

                  return (
                    <tr key={service.id}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.serviceType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.units}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm text-gray-700">${invoiceData.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Discount</span>
                <span className="text-sm text-green-600">
                  -${invoiceData.discount.flat.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Tax</span>
                <span className="text-sm text-gray-700">${invoiceData.taxValue.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">
                  ${invoiceData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Download PDF
          </button>
          {/* <button
            type="button"
            className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700"
          >
            Send to Email
          </button> */}
        </div>
      </div>
    </div>
  );
}
