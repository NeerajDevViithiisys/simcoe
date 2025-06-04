import React, { useEffect, useState } from 'react';
import { quoteAPI } from '../services/api';
import { Eye, Calendar, Pencil, X, Plus } from 'lucide-react';
import { params, ServiceType } from '../types';
import { formatDateData } from '../utils/string';
// import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

interface Quote {
  id: string;
  serviceType: string;
  hourlyCrewCharge: number;
  perUnitMinutes: number;
  setupMinutes: number;
  areaMinutes: number | null;
  postsMinutes: number | null;
  railingMinutes: number | null;
  spindlesMinutes: number | null;
  stairsMinutes: number | null;
  createdAt?: Date | string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
}

interface ViewDialogProps {
  quote: Quote | null;
  onClose: () => void;
}

// Add this interface
interface QuoteSettingsFormData {
  serviceType: string;
  setupMinutes?: number;
  perUnitMinutes?: number;
  hourlyCrewCharge?: number;
  areaMinutes?: number;
  stairsMinutes?: number;
  postsMinutes?: number;
  railingMinutes?: number;
  spindlesMinutes?: number;
}

// Add the QuoteSettingsDialog component
const QuoteSettingsDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  quote?: Quote;
  onSubmit: (data: QuoteSettingsFormData) => Promise<void>;
}> = ({ isOpen, onClose, quote, onSubmit }) => {
  const [formData, setFormData] = useState<QuoteSettingsFormData>({
    serviceType: quote?.serviceType || 'EXTERIOR_WINDOW_CLEANING',
    setupMinutes: quote?.setupMinutes || 90,
    perUnitMinutes: quote?.perUnitMinutes || 3,
    hourlyCrewCharge: quote?.hourlyCrewCharge || 70,
    areaMinutes: quote?.areaMinutes || 0,
    stairsMinutes: quote?.stairsMinutes || 0,
    postsMinutes: quote?.postsMinutes || 0,
    railingMinutes: quote?.railingMinutes || 0,
    spindlesMinutes: quote?.spindlesMinutes || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create payload based on service type
      const payload = {
        serviceType: formData.serviceType,
        ...(formData.serviceType === 'WOOD_POWERWASHING'
          ? {
              areaMinutes: formData.areaMinutes || 0,
              stairsMinutes: formData.stairsMinutes || 0,
              postsMinutes: formData.postsMinutes || 0,
              railingMinutes: formData.railingMinutes || 0,
              spindlesMinutes: formData.spindlesMinutes || 0,
            }
          : {
              setupMinutes: formData.setupMinutes || 0,
              perUnitMinutes: formData.perUnitMinutes || 0,
              hourlyCrewCharge: formData.hourlyCrewCharge || 0,
            }),
      };
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Failed to save quote settings:', error);
      toast.error('Failed to save quote settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {quote ? 'Edit Quote Settings' : 'Create Quote Settings'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Type</label>
            <div className="relative mt-1">
              <div className="relative cursor-pointer" onClick={toggleDropdown}>
                <div className="block w-full rounded border border-gray-300 px-3 py-3 text-sm flex items-center justify-between">
                  <span>
                    {formData.serviceType
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                  <svg
                    className="h-5 w-5 text-[#C49C3C]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded border border-gray-200 py-1 overflow-auto max-h-56">
                    {Object.values(ServiceType).map((type) => (
                      <div
                        key={type}
                        className={`px-4 py-2 cursor-pointer hover:bg-[#C49C3C] hover:text-white transition-colors ${
                          formData.serviceType === type
                            ? 'bg-[#C49C3C] text-white font-medium'
                            : ''
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, serviceType: type });
                          setIsDropdownOpen(false);
                        }}
                      >
                        {type
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.serviceType === 'WOOD_POWERWASHING' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area Minutes</label>
                <input
                  type="number"
                  value={formData.areaMinutes}
                  onChange={(e) => setFormData({ ...formData, areaMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stairs Minutes</label>
                <input
                  type="number"
                  value={formData.stairsMinutes}
                  onChange={(e) => setFormData({ ...formData, stairsMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Posts Minutes</label>
                <input
                  type="number"
                  value={formData.postsMinutes}
                  onChange={(e) => setFormData({ ...formData, postsMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Railing Minutes</label>
                <input
                  type="number"
                  value={formData.railingMinutes}
                  onChange={(e) => setFormData({ ...formData, railingMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spindles Minutes</label>
                <input
                  type="number"
                  value={formData.spindlesMinutes}
                  onChange={(e) => setFormData({ ...formData, spindlesMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Setup Minutes</label>
                <input
                  type="number"
                  value={formData.setupMinutes}
                  onChange={(e) => setFormData({ ...formData, setupMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Per Unit Minutes</label>
                <input
                  type="number"
                  value={formData.perUnitMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, perUnitMinutes: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Crew Charge</label>
                <input
                  type="number"
                  value={formData.hourlyCrewCharge}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyCrewCharge: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full p-3 rounded border border-gray-300 focus:border-[#C49C3C] focus:ring-0 sm:text-sm"
                  required
                  min="0"
                />
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C49C3C] rounded hover:bg-[#B38C2C] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : quote ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewDialog: React.FC<ViewDialogProps> = ({ quote, onClose }) => {
  if (!quote) return null;

  const formatServiceType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

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
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuotesSettings = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  // const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 4;
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();

  // Helper to format service type
  const formatServiceType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleCreateQuote = async (data: QuoteSettingsFormData) => {
    try {
      await quoteAPI.createQuoteSettings(data);
      toast.success('Quote settings created successfully');
      getQuotes(1, ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to create quote settings:', error);
      throw error;
    }
  };

  const handleUpdateQuote = async (data: QuoteSettingsFormData) => {
    if (!editingQuote) return;
    try {
      await quoteAPI.updateQuoteSettings(editingQuote.id, data);
      toast.success('Quote settings updated successfully');
      getQuotes(1, ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to update quote settings:', error);
      throw error;
    }
  };

  const handleDialogClose = () => {
    setIsSettingsDialogOpen(false);
    setEditingQuote(undefined);
  };

  const handleEditClick = (quote: Quote) => {
    setEditingQuote(quote);
    setIsSettingsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingQuote(undefined);
    setIsSettingsDialogOpen(true);
  };

  const getQuotes = async (pageNum: number, limit: number) => {
    const params: params = { page: pageNum, limit };
    // if (searchTerm) params.search = searchTerm;

    try {
      setIsLoading(true);
      const response = await quoteAPI.getQuotesSettings(params);
      const newQuotes = response.data;

      setQuotes((prev) =>
        pageNum === 1
          ? newQuotes
          : [...prev, ...newQuotes.filter((q: Quote) => !prev.find((p) => p.id === q.id))]
      );

      setHasMore(newQuotes.length === limit);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) getQuotes(page + 1, ITEMS_PER_PAGE);
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
  };

  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // setSearchTerm(e.target.value);
  //   setPage(1);
  // };

  useEffect(() => {
    getQuotes(1, ITEMS_PER_PAGE);
  }, []);

  return (
    <div className="px-2">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-6 pb-6 w-full flex flex-row gap-4 items-start justify-between border-b">
          <div>
            <h1 className="md:text-3xl text-lg font-bold text-gray-900 md:mb-2">Quotes Settings</h1>
            <p className="text-gray-600 md:text-lg text-sm">Manage your quotes values</p>
          </div>
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCreateClick}
                className="flex items-center px-4 py-2 bg-[#C49C3C] text-white rounded-md"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search quotes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-purple-500 sm:w-64"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div> */}
          </div>
        </div>

        {/* Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-gray-400">Quote</span>
                  <h6 className="text-xs flex items-center gap-1 text-right">
                    <Calendar className="w-3 h-3 text-gray-400 mt-1" />
                    <span className="pt-1">{formatDateData(quote.createdAt ?? '')}</span>
                  </h6>
                </div>

                <div className="mb-6 min-h-[50px] mt-4">
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                    {formatServiceType(quote.serviceType)}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewQuote(quote)}
                      className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleEditClick(quote)}
                        className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center py-6">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-[#C49C3C]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : hasMore ? (
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-[#C49C3C] text-white text-sm font-medium rounded-md"
            >
              Load More
            </button>
          ) : quotes.length > 0 ? (
            <p className="text-sm text-gray-600">No more quotes to load</p>
          ) : (
            <p className="text-sm text-gray-600">No quotes found</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedQuote && <ViewDialog quote={selectedQuote} onClose={() => setSelectedQuote(null)} />}
      
      <QuoteSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={handleDialogClose}
        quote={editingQuote}
        onSubmit={editingQuote ? handleUpdateQuote : handleCreateQuote}
      />
    </div>
  );
};
