import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { TestCase } from '../types';
import LabelBadge from './labels/LabelBadge';

interface TestCaseSelectorProps {
  availableTestCases: TestCase[];
  onSelectTestCase: (testCaseId: string) => Promise<void>;
  onClose: () => void;
}

export default function TestCaseSelector({
  availableTestCases,
  onSelectTestCase,
  onClose,
}: TestCaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const filteredTestCases = useMemo(() => {
    if (!Array.isArray(availableTestCases)) return [];
    
    return availableTestCases.filter(testCase => {
      if (!testCase) return false;
      
      return (
        searchQuery === '' ||
        testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [availableTestCases, searchQuery]);

  const handleSelectTestCase = async (testCaseId: string) => {
    try {
      setLoading(prev => ({ ...prev, [testCaseId]: true }));
      await onSelectTestCase(testCaseId);
    } catch (error) {
      console.error('Error selecting test case:', error);
    } finally {
      setLoading(prev => ({ ...prev, [testCaseId]: false }));
    }
  };

  if (!Array.isArray(availableTestCases)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Test Cases</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="overflow-y-auto max-h-[60vh] border border-gray-200 dark:border-gray-700 rounded-md">
            {filteredTestCases.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No matching test cases found' : 'No test cases available'}
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTestCases.map((testCase) => {
                  if (!testCase) return null;
                  const isLoading = loading[testCase.id];
                  
                  return (
                    <li
                      key={testCase.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {testCase.displayId}
                            </span>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {testCase.title}
                            </h4>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {testCase.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {testCase.labels?.map(label => (
                              <LabelBadge key={label} label={label} />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectTestCase(testCase.id)}
                          disabled={isLoading}
                          className={`ml-4 inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md ${
                            isLoading
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-wait'
                              : 'text-white dark:text-gray-200 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 border-transparent'
                          }`}
                        >
                          {isLoading ? (
                            <span className="inline-flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}