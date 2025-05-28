import React, { useEffect, useState } from 'react';
import { QuoteStatus, ServiceType, UserData } from '../types';
import { quoteAPI, userAPI } from '../services/api';
import { Eye, Trash2, User, MapPin, Download, Phone, Calendar } from 'lucide-react';
import { params } from '../types';
import { toast } from 'react-toastify';
import { formatDateData } from '../utils/string';

interface Quote {
  id: string;
  services: {
    serviceType: ServiceType;
    units: number;
  }[];
  clientInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
  };
  user: {
    name: string;
  };
  units: number;
  taxValue: number;
  setupMinutes: number;
  perUnitMinutes: number;
  total: number;
  subtotal: number;
  discount: number;
  numberOfPersons: number;
  status?: QuoteStatus;
  createdAt: Date;
}

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
  // const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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

  // Initial load
  // useEffect(() => {
  //   getQuotes(page, ITEMS_PER_PAGE);
  // }, []);

  // Load more function
  const loadMore = () => {
    if (!isLoading && hasMore) {
      getQuotes(page + 1, ITEMS_PER_PAGE);
    }
  };

  // const handleDelete = (id: string) => {
  //   setQuotes(quotes.filter((quote) => quote.id !== id));
  // };

  // Pagination state
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 6;

  // Calculate pagination
  // const totalPages = Math.ceil(quotes.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentQuotes = quotes.slice(startIndex, endIndex);
  // console.log('Current Quotes:', currentQuotes);
  // Handle page change
  // const goToPage = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const goToPrevious = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  // const goToNext = () => {
  //   if (currentPage < totalPages) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // Handle view quote
  const handleViewQuote = (quote: Quote) => {
    console.log('Viewing quote:', quote);
    localStorage.setItem('selectedQuote', JSON.stringify(quote));
    // In a real app, you would use React Router
    // console.log(`Navigating to /quotes-view/${id}`);
    window.location.href = `/quotes-view/${quote.id}`;
    // alert(`Would navigate to /quotes-view/${id}`);
  };

  // Handle delete quote
  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      console.log(`Deleting quote with ID: ${id}`);
      // Add your delete logic here
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Add debounced search function
  // const debouncedSearch = useCallback(
  //   debounce((searchTerm: string) => {
  //     setPage(1); // Reset to first page when searching
  //     getQuotes(1, ITEMS_PER_PAGE, searchTerm, selectedUser);
  //   }, 500),
  //   [selectedUser]
  // );

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
                       focus:ring-purple-500 focus:border-purple-500 sm:w-64 w-full"
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
                     focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
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
                        <span className="text-xs text-gray-400">User Info</span>
                        <h6 className="text-md pt-2">{quote.user?.name}</h6>
                      </div>
                      {/* Status dropdown */}
                      <div>
                        <select
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
                    <p className="text-xs text-gray-400 py-3">Client Info</p>
                    {/* User Avatar */}
                    <div className="flex items-center mb-5">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-blue-600" />
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
                    <div className="mb-6">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-800 leading-relaxed pt-1">
                          {quote.clientInfo?.address}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleViewQuote(quote)}
                        className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors duration-200"
                      >
                        <Download className="w-4 h-4" />
                      </button>
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
                  className="animate-spin h-5 w-5 text-purple-600"
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
                className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
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
      </div>
    </div>
  );
}
