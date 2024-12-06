import React from 'react';
import { Search } from 'lucide-react';
import LabelFilter from '../labels/LabelFilter';

interface TestCaseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLabels: string[];
  availableLabels: string[];
  onSelectLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export default function TestCaseFilters({
  searchQuery,
  onSearchChange,
  selectedLabels,
  availableLabels,
  onSelectLabel,
  onRemoveLabel,
}: TestCaseFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search test cases..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <LabelFilter
        availableLabels={availableLabels}
        selectedLabels={selectedLabels}
        onSelectLabel={onSelectLabel}
        onRemoveLabel={onRemoveLabel}
      />
    </div>
  );
}