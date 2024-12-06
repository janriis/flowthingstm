import React from 'react';
import { Filter } from 'lucide-react';

interface FlowRunFiltersProps {
  status: string;
  dateRange: { start: string; end: string };
  assignedTo: string;
  onFilterChange: (filters: {
    status?: string;
    dateRange?: { start: string; end: string };
    assignedTo?: string;
  }) => void;
}

export default function FlowRunFilters({
  status,
  dateRange,
  assignedTo,
  onFilterChange,
}: FlowRunFiltersProps) {
  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-dark-lighter p-4 rounded-lg border border-gray-200 dark:border-dark-border">
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <Filter className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <select
        value={status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
        className="rounded-md border-gray-300 dark:border-dark-border bg-white dark:bg-dark text-gray-900 dark:text-white text-sm focus:ring-teal-500 focus:border-teal-500"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>

      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onFilterChange({ 
            dateRange: { ...dateRange, start: e.target.value }
          })}
          className="rounded-md border-gray-300 dark:border-dark-border bg-white dark:bg-dark text-gray-900 dark:text-white text-sm focus:ring-teal-500 focus:border-teal-500"
        />
        <span className="text-gray-500 dark:text-gray-400">to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onFilterChange({ 
            dateRange: { ...dateRange, end: e.target.value }
          })}
          className="rounded-md border-gray-300 dark:border-dark-border bg-white dark:bg-dark text-gray-900 dark:text-white text-sm focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <select
        value={assignedTo}
        onChange={(e) => onFilterChange({ assignedTo: e.target.value })}
        className="rounded-md border-gray-300 dark:border-dark-border bg-white dark:bg-dark text-gray-900 dark:text-white text-sm focus:ring-teal-500 focus:border-teal-500"
      >
        <option value="">All Testers</option>
        <option value="current">Assigned to Me</option>
        <option value="unassigned">Unassigned</option>
      </select>
    </div>
  );
}