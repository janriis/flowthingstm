import React, { useState, useMemo } from 'react';
import { Clock, ChevronDown, ChevronRight, Edit2, ListChecks } from 'lucide-react';
import { TestCase, TestSuite } from '../types';
import TestStepList from './TestStepList';
import LabelBadge from './labels/LabelBadge';
import { formatDate } from '../utils/dateUtils';

interface TestCaseItemProps {
  testCase: TestCase;
  suites?: TestSuite[];
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: (testCase: TestCase) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  removeIcon?: React.ReactNode;
  removeButtonTitle?: string;
  removeButtonClass?: string;
}

export default function TestCaseItem({
  testCase,
  suites = [],
  showCheckbox = false,
  isSelected = false,
  onSelect,
  onEdit,
  onRemove,
  showRemoveButton = false,
  removeIcon,
  removeButtonTitle = "Remove",
  removeButtonClass = "text-gray-400 hover:text-red-500"
}: TestCaseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formattedDate = useMemo(() => 
    formatDate(testCase?.createdAt), 
    [testCase?.createdAt]
  );

  if (!testCase) {
    return null;
  }

  const stepCount = testCase.steps?.length || 0;

  return (
    <div className="relative border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50">
      <div className="flex items-start p-4">
        {showCheckbox && (
          <div className="flex-shrink-0 mr-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-600 rounded cursor-pointer"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <span className="text-gray-400">{testCase.displayId}</span>
                <h3 className="font-medium text-white">{testCase.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  testCase.priority === 'high' ? 'bg-red-900/50 text-red-300' :
                  testCase.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-blue-900/50 text-blue-300'
                }`}>
                  {testCase.priority}
                </span>
                {!isExpanded && stepCount > 0 && (
                  <span className="flex items-center text-sm text-gray-400">
                    <ListChecks className="h-4 w-4 mr-1" />
                    {stepCount} step{stepCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{testCase.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formattedDate}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {testCase.labels?.map(label => (
                  <LabelBadge key={label} label={label} />
                ))}
                {suites.length > 0 && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm text-gray-400">Suites:</span>
                    {suites.map(suite => (
                      <span key={suite.id} className="px-2 py-0.5 text-xs font-medium bg-indigo-900/50 text-indigo-300 rounded-full">
                        {suite.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(testCase)}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                title="Edit test case"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              {showRemoveButton && onRemove && (
                <button
                  onClick={onRemove}
                  className={`p-2 rounded-full hover:bg-gray-700 ${removeButtonClass}`}
                  title={removeButtonTitle}
                >
                  {removeIcon}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && stepCount > 0 && (
        <div className="border-t border-gray-700 bg-gray-800/50 p-4">
          <TestStepList
            steps={testCase.steps}
            readOnly={true}
          />
        </div>
      )}
    </div>
  );
}