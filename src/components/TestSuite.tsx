import React, { useState, useMemo } from 'react';
import { FolderOpen, ChevronDown, ChevronRight, Trash2, Clock, Plus, MinusCircle } from 'lucide-react';
import { TestCase, TestStep, TestSuite } from '../types';
import TestCaseItem from './TestCaseItem';
import LabelBadge from './labels/LabelBadge';
import { formatDate } from '../utils/dateUtils';
import TestCaseSelector from './TestCaseSelector';
import { ErrorBoundary } from './ErrorBoundary';

interface TestSuiteProps {
  suite: TestSuite;
  testCases: TestCase[];
  availableTestCases: TestCase[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onUpdateStepStatus: (testId: string, stepId: string, status: TestStep['status']) => void;
  onUpdateStepActualResult: (testId: string, stepId: string, actualResult: string) => void;
  onEditTestCase: (testCase: TestCase) => void;
  onDeleteTestCase: (testCaseId: string) => void;
  onDeleteSuite: () => void;
  onAddTestCase: (testCaseId: string) => Promise<void>;
  onRemoveTestCase: (testCaseId: string) => void;
}

export default function TestSuiteComponent({
  suite,
  testCases,
  availableTestCases,
  isExpanded,
  onToggle,
  onUpdateStepStatus,
  onUpdateStepActualResult,
  onEditTestCase,
  onDeleteTestCase,
  onDeleteSuite,
  onAddTestCase,
  onRemoveTestCase,
}: TestSuiteProps) {
  const [showSelector, setShowSelector] = useState(false);
  
  const formattedDate = useMemo(() => 
    formatDate(suite?.createdAt), 
    [suite?.createdAt]
  );

  if (!suite) {
    return null;
  }

  const handleAddTestCase = async (testCaseId: string) => {
    try {
      await onAddTestCase(testCaseId);
    } catch (error) {
      console.error('Error adding test case:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => onToggle(suite.id)}
          className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex-grow text-left"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          
          <FolderOpen className="h-5 w-5 text-indigo-500" />
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">{suite.displayId}</span>
              <span className="font-medium text-gray-900 dark:text-white">{suite.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Created: {formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {suite.labels?.map(label => (
              <LabelBadge key={label} label={label} />
            ))}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {testCases.length} test{testCases.length !== 1 ? 's' : ''}
            </span>
          </div>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSelector(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Add test cases"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          <button
            onClick={onDeleteSuite}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Delete suite"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {testCases.map((testCase) => (
            <ErrorBoundary key={testCase.id}>
              <TestCaseItem
                testCase={testCase}
                onEdit={onEditTestCase}
                onRemove={() => onRemoveTestCase(testCase.id)}
                showRemoveButton={true}
                removeIcon={<MinusCircle className="h-5 w-5" />}
                removeButtonTitle="Remove from suite"
                removeButtonClass="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              />
            </ErrorBoundary>
          ))}
          
          {testCases.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No test cases in this suite. Click the + button to add test cases.
            </div>
          )}
        </div>
      )}

      {showSelector && (
        <TestCaseSelector
          availableTestCases={availableTestCases}
          onSelectTestCase={handleAddTestCase}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}