import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

interface ServiceToggleProps {
  view: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
}

export default function ServiceToggle({ view, onViewChange }: ServiceToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow p-1">
      <button
        onClick={() => onViewChange('card')}
        className={`flex items-center px-3 py-2 rounded ${
          view === 'card' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <LayoutGrid className="h-5 w-5 mr-2" />
        Card
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center px-3 py-2 rounded ${
          view === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Table className="h-5 w-5 mr-2" />
        Table
      </button>
    </div>
  );
}
