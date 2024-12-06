import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { FlowRun } from '../../types';

interface FlowRunMetricsProps {
  metrics: FlowRun['metrics'];
}

export default function FlowRunMetrics({ metrics }: FlowRunMetricsProps) {
  if (!metrics) return null;

  const getPercentage = (value: number) => {
    return ((value / metrics.total) * 100).toFixed(0);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Passed</span>
          </div>
          <span className="text-lg font-semibold text-green-700 dark:text-green-400">
            {metrics.passed}/{metrics.total}
          </span>
        </div>
        <div className="mt-2 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500"
            style={{ width: `${getPercentage(metrics.passed)}%` }}
          />
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Failed</span>
          </div>
          <span className="text-lg font-semibold text-red-700 dark:text-red-400">
            {metrics.failed}/{metrics.total}
          </span>
        </div>
        <div className="mt-2 h-2 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500"
            style={{ width: `${getPercentage(metrics.failed)}%` }}
          />
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Blocked</span>
          </div>
          <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
            {metrics.blocked}/{metrics.total}
          </span>
        </div>
        <div className="mt-2 h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500"
            style={{ width: `${getPercentage(metrics.blocked)}%` }}
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Pending</span>
          </div>
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {metrics.pending}/{metrics.total}
          </span>
        </div>
        <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500"
            style={{ width: `${getPercentage(metrics.pending)}%` }}
          />
        </div>
      </div>
    </div>
  );
}