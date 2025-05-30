import React from 'react';
import { ServiceCalculation, STATUS } from '../types';
import { Download, Check, X } from 'lucide-react';

interface ServiceCardProps {
  calculation: ServiceCalculation;
  status: STATUS;
  onStatusChange: (status: STATUS) => void;
  onDownload: () => void;
}

export default function ServiceCard({
  calculation,
  status,
  onStatusChange,
  onDownload,
}: ServiceCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">Service Quote</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onStatusChange(STATUS.ACCEPTED)}
            className={`p-2 rounded-lg transition-colors ${
              status === STATUS.ACCEPTED
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title="Accept Quote"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => onStatusChange(STATUS.REJECTED)}
            className={`p-2 rounded-lg transition-colors ${
              status === STATUS.REJECTED
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title="Reject Quote"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {calculation.serviceType.replace(/_/g, ' ')}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Units</p>
            <p className="text-lg font-semibold">{calculation.numberOfUnits}</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Total Time</p>
            <p className="text-lg font-semibold">{calculation.totalTimeHours.toFixed(2)} hours</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Calendar Time</p>
            <p className="text-lg font-semibold">
              {calculation.calendarSlotHours.toFixed(2)} hours
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-lg font-semibold">${calculation.subtotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Discount</p>
            <p className="text-lg font-semibold text-red-600">
              -${calculation.discount.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-500">Tax (13%)</p>
            <p className="text-lg font-semibold">${calculation.tax.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-[#C49C3C]">
                ${calculation.totalCost.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onDownload}
              className="hidden sm:flex items-center px-4 py-2 rounded-lg text-white bg-[#C49C3C]  transition-colors"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Quote
            </button>
            <button
              onClick={onDownload}
              className="sm:hidden p-2 rounded-lg text-white bg-[#C49C3C]  transition-colors"
              title="Download Quote"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
