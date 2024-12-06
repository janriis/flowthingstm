import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { FlowRun } from '../../types';
import FlowRunForm from './FlowRunForm';
import FlowRunItem from './FlowRunItem';
import FlowRunFilters from './FlowRunFilters';
import { databaseService } from '../../services/databaseService';
import { errorService } from '../../services/errorService';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '../ErrorBoundary';

export default function FlowRunsList() {
  const [flowRuns, setFlowRuns] = useState<FlowRun[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: { start: '', end: '' },
    assignedTo: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const runs = await databaseService.getFlowRuns();
      setFlowRuns(runs || []);
    } catch (error) {
      const message = 'Failed to load flow runs';
      console.error(message, error);
      await errorService.logError(error as Error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlowRun = async (title: string, description: string, labels: string[]) => {
    try {
      await databaseService.createFlowRun({
        title,
        description,
        status: 'draft',
        startDate: null,
        endDate: null,
        labels,
      });
      await loadData();
      setShowForm(false);
      toast.success('Flow run created successfully');
    } catch (error) {
      const message = 'Failed to create flow run';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (id: string, status: FlowRun['status']) => {
    try {
      await databaseService.updateFlowRun(id, { status });
      await loadData();
      toast.success('Status updated successfully');
    } catch (error) {
      const message = 'Failed to update status';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleDeleteFlowRun = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flow run?')) {
      return;
    }

    try {
      await databaseService.deleteFlowRun(id);
      await loadData();
      toast.success('Flow run deleted successfully');
    } catch (error) {
      const message = 'Failed to delete flow run';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const getFilteredFlowRuns = () => {
    return flowRuns.filter(run => {
      if (!run) return false;

      const matchesSearch = !searchQuery || 
        run.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || run.status === filters.status;
      
      const matchesDate = !filters.dateRange.start || !filters.dateRange.end ||
        (run.startDate && new Date(run.startDate) >= new Date(filters.dateRange.start) &&
         new Date(run.startDate) <= new Date(filters.dateRange.end));

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredFlowRuns = getFilteredFlowRuns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FlowRuns</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Execute and track your test runs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New FlowRun
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search flow runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <FlowRunFilters
          status={filters.status}
          dateRange={filters.dateRange}
          assignedTo={filters.assignedTo}
          onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
        />

        {filteredFlowRuns.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filters.status || filters.dateRange.start || filters.assignedTo
                ? 'No flow runs match your filters'
                : 'No flow runs yet. Click "New FlowRun" to create one.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlowRuns.map((run) => (
              <ErrorBoundary key={run.id}>
                <FlowRunItem
                  flowRun={run}
                  onEdit={() => {/* TODO: Implement edit */}}
                  onDelete={() => handleDeleteFlowRun(run.id)}
                  onUpdateStatus={(status) => handleUpdateStatus(run.id, status)}
                />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <FlowRunForm
          onSubmit={handleCreateFlowRun}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}