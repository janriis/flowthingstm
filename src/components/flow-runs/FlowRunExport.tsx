import React from 'react';
import { Download } from 'lucide-react';
import { FlowRun } from '../../types';

interface FlowRunExportProps {
  flowRun: FlowRun;
}

export default function FlowRunExport({ flowRun }: FlowRunExportProps) {
  const exportToCSV = () => {
    const headers = [
      'Test Case ID',
      'Title',
      'Status',
      'Start Time',
      'End Time',
      'Executed By',
      'Notes'
    ];

    const rows = flowRun.testCases?.map(tc => [
      tc.displayId,
      tc.title,
      tc.status,
      tc.startTime || '',
      tc.endTime || '',
      tc.executedBy || '',
      tc.notes || ''
    ]) || [];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowrun-${flowRun.id}-export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToCSV}
      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-dark-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Results
    </button>
  );
}