import React from 'react';

interface LoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  itemsCount: number;
}

const LoadMore: React.FC<LoadMoreProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  itemsCount,
}) => {
  return (
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
          onClick={onLoadMore}
          className="px-6 py-2 bg-[#C49C3C] text-white text-sm font-medium rounded-md transition-colors duration-200"
        >
          Load More
        </button>
      ) : itemsCount > 0 ? (
        <p className="text-sm text-gray-600">No more quotes to load</p>
      ) : (
        <p className="text-sm text-gray-600">No quotes found</p>
      )}
    </div>
  );
};

export default LoadMore; 