import React, { useState, useMemo } from 'react';
import { PlayCircle, Archive, Clock, CheckCircle, XCircle, Edit2, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { FlowRun } from '../../types';
import LabelBadge from '../labels/LabelBadge';
import FlowRunTestCases from './FlowRunTestCases';
import { formatDate } from '../../utils/dateUtils';

interface FlowRunItemProps {
  flowRun: FlowRun;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: FlowRun['status']) => void;
}

export default function FlowRunItem({
  flowRun,
  onEdit,
  onDelete,
  onUpdateStatus,
}: FlowRunItemProps) {
  const [showTestCases, setShowTestCases] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = useMemo(() => 
    formatDate(flowRun?.createdAt),
    [flowRun?.createdAt]
  );

  if (!flowRun) {
    return null;
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };

  const StatusIcon = {
    draft: Clock,
    in_progress: PlayCircle,
    completed: CheckCircle,
    archived: Archive,
  }[flowRun.status];

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex-grow text-left"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {flowRun.title}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[flowRun.status]}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {flowRun.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {flowRun.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {flowRun.labels?.map(label => (
                  <LabelBadge key={label} label={label} />
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {formattedDate}
                </span>
              </div>
            </div>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTestCases(true)}
              className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              title="Manage test cases"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              title="Edit FlowRun"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500"
              title="Delete FlowRun"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            {flowRun.status === 'draft' && (
              <button
                onClick={() => onUpdateStatus('in_progress')}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Start FlowRun"
              >
                <PlayCircle className="h-5 w-5" />
              </button>
            )}
            {flowRun.status === 'in_progress' && (
              <button
                onClick={() => onUpdateStatus('completed')}
                className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                title="Complete FlowRun"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            )}
            {(flowRun.status === 'completed' || flowRun.status === 'in_progress') && (
              <button
                onClick={() => onUpdateStatus('archived')}
                className="p-2 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                title="Archive FlowRun"
              >
                <Archive className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {(isExpanded || showTestCases) && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <FlowRunTestCases
            flowRun={flowRun}
            onClose={() => {
              setShowTestCases(false);
              setIsExpanded(false);
            }}
          />
        </div>
      )}
    </div>
  );
}