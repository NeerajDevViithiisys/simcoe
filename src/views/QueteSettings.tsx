import React, { useEffect, useState } from "react";
import { quoteAPI } from "../services/api";
import { Eye, Calendar, Pencil, Plus } from "lucide-react";
import { formatServiceType, params, Quote, QuoteSettingsFormData } from "../types";
import { formatDateData } from "../utils/string";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import LoadMore from "../components/LoadMore";
import { QuoteSettingsDialog } from "../components/AddQuoteSettingsDialog";
import { ViewDialog } from "../components/ViewQuoteSettingsDialog";


export const QuotesSettings = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();

  const handleCreateQuote = async (data: QuoteSettingsFormData) => {
    try {
      await quoteAPI.createQuoteSettings(data);
      toast.success("Quote settings created successfully");
      await getQuotes(1, ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Failed to create quote settings:", error);
      throw error;
    }
  };

  const handleUpdateQuote = async (data: QuoteSettingsFormData) => {
    if (!editingQuote) return;
    try {
      await quoteAPI.updateQuoteSettings(editingQuote.id, data);
      toast.success("Quote settings updated successfully");
      await getQuotes(1, ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Failed to update quote settings:", error);
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
    if (isLoading) return; // Prevent concurrent calls
    
    const params: params = { page: pageNum, limit };
    try {
      setIsLoading(true);
      const response = await quoteAPI.getQuotesSettings(params);
      const newQuotes = response.data;

      setQuotes((prev) =>
        pageNum === 1
          ? newQuotes
          : [
              ...prev,
              ...newQuotes.filter(
                (q: Quote) => !prev.find((p) => p.id === q.id)
              ),
            ]
      );

      setHasMore(newQuotes.length === limit);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
      toast.error("Failed to fetch quotes");
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

  useEffect(() => {
    let mounted = true;
    
    const fetchInitialData = async () => {
      if (mounted) {
        await getQuotes(1, ITEMS_PER_PAGE);
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-2">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-6 pb-6 w-full flex flex-row gap-4 items-start justify-between border-b">
          <div>
            <h1 className="md:text-3xl text-lg font-bold text-gray-900 md:mb-2">
              Quotes Settings
            </h1>
            <p className="text-gray-600 md:text-lg text-sm">
              Manage your quotes values
            </p>
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
          </div>
        </div>

        {/* Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-gray-400">Quote</span>
                  <h6 className="text-xs flex items-center gap-1 text-right">
                    <Calendar className="w-3 h-3 text-gray-400 mt-1" />
                    <span className="pt-1">
                      {formatDateData(quote.createdAt ?? "")}
                    </span>
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

        {/* Load More Section */}
        <div className="flex justify-center py-6">
          <LoadMore
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            itemsCount={quotes.length}
          />
        </div>
      </div>

      {/* viwe Modals */}
      {selectedQuote && (
        <ViewDialog
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
      {/* add and update modal */}
      <QuoteSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={handleDialogClose}
        quote={editingQuote}
        onSubmit={editingQuote ? handleUpdateQuote : handleCreateQuote}
      />
    </div>
  );
};
