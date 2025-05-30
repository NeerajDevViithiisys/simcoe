import React, { useEffect, useState } from 'react';
import { QuoteStatus, ServiceType, UserData } from '../types';
import { quoteAPI, userAPI } from '../services/api';
import { Eye, Trash2, User, MapPin, Download, Phone, Calendar, Pencil } from 'lucide-react';
import { params } from '../types';
import { toast } from 'react-toastify';
import { formatDateData } from '../utils/string';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useAuthStore from '../store/authStore';

interface Quote {
  id: string;
  invoice: string;
  services: {
    serviceType: ServiceType;
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
  };
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  units: number;
  taxValue: number;
  setupMinutes: number;
  perUnitMinutes: number;
  total: number;
  subtotal: number;
  discount: {
    flat: number;
  };
  numberOfPersons: number;
  status?: QuoteStatus;
  createdAt: Date;
}

export const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  // Add state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; quoteId: string | null }>({
    isOpen: false,
    quoteId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Add function to fetch users
  const fetchUsers = async () => {
    try {
      // setIsLoadingUsers(true);
      const response = await userAPI.list({ page: 1, limit: 100 }); // Fetch up to 100 users
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      // setIsLoadingUsers(false);
    }
  };

  // Add status update function
  const handleStatusUpdate = async (quoteId: string, status: QuoteStatus) => {
    try {
      await quoteAPI.createStatus({
        quoteId: quoteId,
        status: status,
      });

      // Update local state to reflect the change
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) => (quote.id === quoteId ? { ...quote, status } : quote))
      );

      toast.success(`Quote ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update quote status:', error);
      toast.error('Failed to update quote status');
    }
  };

  const getQuotes = async (pageNum: number, limit: number) => {
    console.log('Fetching quotes...', pageNum, limit);
    const params: params = {
      page: pageNum,
      limit: limit,
    };

    if (selectedUser) {
      params.userId = selectedUser;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }
    try {
      setIsLoading(true);
      const response = await quoteAPI.getQuotes(params);
      // Append new quotes to existing ones
      const newQuotes = response.data;
      if (pageNum === 1) {
        // For first page, replace existing quotes
        setQuotes(newQuotes);
      } else {
        // For subsequent pages, append non-duplicate quotes
        setQuotes((prevQuotes) => {
          const existingIds = new Set(prevQuotes.map((quote) => quote.id));
          const uniqueNewQuotes: Quote[] = newQuotes.filter(
            (quote: Quote) => !existingIds.has(quote.id)
          );
          return [...prevQuotes, ...uniqueNewQuotes];
        });
      }
      setHasMore(newQuotes.length === limit);
      setPage(pageNum);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to fetch quotes:', error);
      // Optionally show error to user
    }
  };

  // Load more function
  const loadMore = () => {
    if (!isLoading && hasMore) {
      getQuotes(page + 1, ITEMS_PER_PAGE);
    }
  };
  // Handle view quote
  const handleViewQuote = (quote: Quote) => {
    console.log('Viewing quote:', quote);
    localStorage.setItem('selectedQuote', JSON.stringify(quote));
    navigate(`/quotes-view/${quote.id}`);
  };

  const handleEdituote = (quote: Quote) => {
    console.log('Viewing quote:', quote);
    localStorage.setItem('selectedQuote', JSON.stringify(quote));
    navigate('/', {
      state: {
        id: quote.id,
      },
    });
  };

  // Handle delete dialog open
  const handleDeleteDialog = (quoteId: string) => {
    setDeleteDialog({ isOpen: true, quoteId });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.quoteId) return;

    try {
      setIsDeleting(true);
      await quoteAPI.deleteQuote(deleteDialog.quoteId);

      // Update local state
      setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== deleteDialog.quoteId));

      toast.success('Quote deleted successfully');
    } catch (error) {
      console.error('Failed to delete quote:', error);
      toast.error('Failed to delete quote');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, quoteId: null });
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    // getQuotes(1, ITEMS_PER_PAGE, searchTerm);
    // debouncedSearch(value);
  };
  // Handle user filter change
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUser(value);
    setPage(1);
    console.log('Selected user:', value);
    // getQuotes(page, ITEMS_PER_PAGE);
  };

  useEffect(() => {
    getQuotes(page, ITEMS_PER_PAGE);
  }, [searchTerm, selectedUser]);

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.background = 'white';
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
                <p class="text-sm font-medium">${new Date(quote.createdAt).toLocaleDateString()}</p>
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
                <p class="text-sm">Email: ${quote.clientInfo.email || ''}</p>
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
                    <td class="p-2">${service.serviceType.replace(/_/g, ' ')}</td>
                    <td class="p-2">${service.units}</td>
                    <td class="p-2 text-right">$${service.total.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
  
          <div class="p-4 bg-gray-50">
            <div class="max-w-xs ml-auto">
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-500">Subtotal</span>
                <span class="text-sm font-medium">$${quote.subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-500">Discount</span>
                <span class="text-sm font-medium">-$${quote.discount.flat.toFixed(2)}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-500">Tax</span>
                <span class="text-sm font-medium">$${quote.taxValue.toFixed(2)}</span>
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
        backgroundColor: '#ffffff',
      });

      const imgWidth = 208; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      // Cleanup
      document.body.removeChild(tempDiv);

      // Save PDF
      const fileName = `quote-${quote.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="px-2">
      <div className="">
        <div className="max-w-7xl mx-auto">
          {/* Header */}

          {/* Search and Filter Section */}
          <div className="mb-6 pb-6 flex flex-col md:flex-row gap-4 items-start justify-between border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotes</h1>
              <p className="text-gray-600">Manage your client quotes</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:w-auto md:mx-0 mx-auto w-full">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search quotes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        focus:border-purple-500 sm:w-64 w-full"
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
                </div>
              </div>
              {/* User Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={selectedUser}
                  onChange={handleUserChange}
                  className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-md
                       cursor-pointer"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 justify-between gap-4 mb-4">
            {quotes &&
              quotes.length > 0 &&
              quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-white rounded duration-200 border border-gray-200"
                >
                  <div className="p-6">
                    <div className="w-full border-b pb-3 flex items-start justify-between">
                      <div>
                        <span className="text-xs text-gray-400">User</span>
                        <h6 className="text-md pt-2">{quote.user?.name}</h6>
                      </div>
                      {/* Status dropdown */}
                      <div>
                        <select
                          disabled={!isAdmin}
                          value={quote.status || 'PENDING'}
                          onChange={(e) =>
                            handleStatusUpdate(quote.id, e.target.value as QuoteStatus)
                          }
                          className={`text-sm rounded px-2 py-1 border cursor-pointer ${
                            quote.status === 'ACCEPTED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : quote.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACCEPTED">Accept</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                        <h6 className="text-xs text-right pt-2 flex gap-1 items-center">
                          <Calendar className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="pt-1"> {formatDateData(quote.createdAt)}</span>
                        </h6>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 py-3">Customer Details</p>
                    {/* User Avatar */}
                    <div className="flex items-center mb-5">
                      <div className="w-12 h-12 bg-[#C49C3C] rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-md font-semibold text-gray-900 mb-1">
                          {quote.clientInfo?.firstName?.charAt(0).toUpperCase() +
                            quote.clientInfo?.firstName?.slice(1)}{' '}
                          {quote.clientInfo?.lastName}
                        </h3>
                        <span className="text-sm text-gray-500 flex gap-1 items-center">
                          <Phone className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="pt-1"> {quote.clientInfo?.phoneNumber}</span>
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-6 min-h-[50px]">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-800 leading-relaxed pt-1 line-clamp-2">
                          {quote.clientInfo?.address}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded  transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdituote(quote)}
                              className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded  transition-colors duration-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(quote)}
                              className="flex items-center px-3 py-1 bg-[#C49C3C] text-white text-sm font-medium rounded transition-colors duration-200"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDialog(quote.id)}
                          className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Load More Section */}
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
                  ></path>
                </svg>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : hasMore ? (
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-[#C49C3C] text-white text-sm font-medium rounded-md  transition-colors duration-200"
              >
                Load More
              </button>
            ) : quotes.length > 0 ? (
              <p className="text-sm text-gray-600">No more quotes to load</p>
            ) : (
              <p className="text-sm text-gray-600">No quotes found</p>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteDialog.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Quote</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete this quote? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteDialog({ isOpen: false, quoteId: null })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          ></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
