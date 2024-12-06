import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { TestCase, TestSuite, FlowRun } from '../../types';
import { databaseService } from '../../services/databaseService';
import { errorService } from '../../services/errorService';
import { toast } from 'react-hot-toast';
import TestCaseSelector from '../TestCaseSelector';
import { ErrorBoundary } from '../ErrorBoundary';

interface FlowRunTestCasesProps {
  flowRun: FlowRun;
  onClose: () => void;
}

export default function FlowRunTestCases({ flowRun, onClose }: FlowRunTestCasesProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [showTestCaseSelector, setShowTestCaseSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [flowRun.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [flowRunTestCases, allTestCases] = await Promise.all([
        databaseService.getFlowRunTestCases(flowRun.id),
        databaseService.getTestCases()
      ]);

      const flowRunTestCaseIds = new Set(flowRunTestCases.map(tc => tc.id));
      
      setTestCases(flowRunTestCases);
      setAvailableTestCases(allTestCases.filter(tc => !flowRunTestCaseIds.has(tc.id)));
    } catch (error) {
      const message = 'Failed to load test cases';
      console.error(message, error);
      await errorService.logError(error as Error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (testCaseId: string) => {
    try {
      await databaseService.addTestCaseToFlowRun(flowRun.id, testCaseId);
      await loadData();
    } catch (error) {
      const message = 'Failed to add test case';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
      throw error;
    }
  };

  const filteredTestCases = testCases.filter(testCase => {
    if (!testCase) return false;
    
    return searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Cases</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {testCases.length} test case{testCases.length !== 1 ? 's' : ''} in this FlowRun
          </p>
        </div>
        <button
          onClick={() => setShowTestCaseSelector(true)}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Test Cases
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredTestCases.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No matching test cases found' : 'No test cases added yet'}
              </p>
            </div>
          ) : (
            filteredTestCases.map((testCase) => (
              <ErrorBoundary key={testCase.id}>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {testCase.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {testCase.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      testCase.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : testCase.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}>
                      {testCase.priority}
                    </span>
                  </div>
                </div>
              </ErrorBoundary>
            ))
          )}
        </div>
      </div>

      {showTestCaseSelector && (
        <TestCaseSelector
          availableTestCases={availableTestCases}
          onSelectTestCase={handleAddTestCase}
          onClose={() => setShowTestCaseSelector(false)}
        />
      )}
    </div>
  );
}