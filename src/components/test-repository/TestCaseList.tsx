import React from 'react';
import { TestCase, TestSuite } from '../../types';
import TestCaseItem from '../TestCaseItem';
import { Trash2 } from 'lucide-react';
import { ErrorBoundary } from '../ErrorBoundary';

interface TestCaseListProps {
  testCases: TestCase[];
  testSuites: TestSuite[];
  selectedTestCases: string[];
  onSelectTestCase: (id: string) => void;
  onEditTestCase: (testCase: TestCase) => void;
  onDeleteTestCase: (id: string) => void;
}

export default function TestCaseList({
  testCases,
  testSuites,
  selectedTestCases,
  onSelectTestCase,
  onEditTestCase,
  onDeleteTestCase,
}: TestCaseListProps) {
  const showBulkActions = selectedTestCases.length > 0;

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">
          {selectedTestCases.length > 0 ? 'No test cases match your selection' : 'No test cases found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showBulkActions && (
        <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
          <span className="text-gray-300">
            {selectedTestCases.length} test case{selectedTestCases.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => selectedTestCases.forEach(id => onDeleteTestCase(id))}
            className="text-red-500 hover:text-red-400 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </button>
        </div>
      )}

      {testCases.map((testCase) => {
        const caseSuites = testSuites?.filter(suite => 
          Array.isArray(suite?.testCases) && suite.testCases.includes(testCase.id)
        ) || [];

        return (
          <ErrorBoundary key={testCase.id}>
            <TestCaseItem
              testCase={testCase}
              suites={caseSuites}
              showCheckbox={true}
              isSelected={selectedTestCases.includes(testCase.id)}
              onSelect={() => onSelectTestCase(testCase.id)}
              onEdit={() => onEditTestCase(testCase)}
              onRemove={() => onDeleteTestCase(testCase.id)}
              showRemoveButton={true}
              removeIcon={<Trash2 className="h-5 w-5" />}
              removeButtonTitle="Delete test case"
              removeButtonClass="text-gray-400 hover:text-red-500"
            />
          </ErrorBoundary>
        );
      })}
    </div>
  );
}