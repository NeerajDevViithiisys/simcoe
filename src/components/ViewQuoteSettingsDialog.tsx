import { X } from 'lucide-react';
import { formatServiceType, ViewDialogProps } from '../types';

export const ViewDialog: React.FC<ViewDialogProps> = ({ quote, onClose }) => {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quote Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm font-medium text-gray-500">Service Type</p>
            <p className="mt-1 text-base text-gray-900">{formatServiceType(quote.serviceType)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Setup Time</p>
              <p className="mt-1 text-base text-gray-900">{quote.setupMinutes ?? 0} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time Per Unit</p>
              <p className="mt-1 text-base text-gray-900">{quote.perUnitMinutes ?? 0} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hourly Crew Charge</p>
              <p className="mt-1 text-base text-gray-900">${quote.hourlyCrewCharge ?? 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Crew Size</p>
              <p className="mt-1 text-base text-gray-900">{quote.crewSize ?? 0}</p>
            </div>
          </div>
          <div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1 text-base text-gray-900">{quote.description ?? '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
