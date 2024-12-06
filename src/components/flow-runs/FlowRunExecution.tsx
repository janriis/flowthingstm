import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertTriangle, Paperclip, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { TestCase, TestStep, FlowRun } from '../../types';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

interface FlowRunExecutionProps {
  flowRun: FlowRun;
  testCase: TestCase;
  onUpdateStatus: (status: 'no_run' | 'pending' | 'passed' | 'failed' | 'blocked') => void;
  onClose: () => void;
}

export default function FlowRunExecution({
  flowRun,
  testCase,
  onUpdateStatus,
  onClose,
}: FlowRunExecutionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState<TestStep[]>(testCase?.steps || []);
  const [isRunning, setIsRunning] = useState(false);
  const [stepComments, setStepComments] = useState<Record<string, string>>({});
  const [stepAttachments, setStepAttachments] = useState<Record<string, File[]>>({});

  useEffect(() => {
    loadStepData();
  }, [testCase.id]);

  const loadStepData = async () => {
    try {
      const stepData = await supabaseService.getTestStepDetails(testCase.id);
      setStepComments(stepData.comments);
      // Handle attachments if implemented in backend
    } catch (error) {
      console.error('Error loading step data:', error);
      toast.error('Failed to load step details');
    }
  };

  const handleExit = () => {
    if (isRunning) {
      const confirmExit = window.confirm(
        'Test execution is in progress. Are you sure you want to exit? Progress will be saved.'
      );
      if (!confirmExit) return;
      
      onUpdateStatus('pending');
    }
    onClose();
  };

  const updateStepStatus = async (
    stepId: string, 
    status: TestStep['status'],
    comment?: string
  ) => {
    try {
      await supabaseService.updateTestStep(stepId, { 
        status,
        actualResult: comment || stepComments[stepId] || ''
      });
      
      setSteps(prevSteps => 
        prevSteps.map(step =>
          step.id === stepId ? { ...step, status } : step
        )
      );

      if (status === 'passed' && currentStepIndex !== null && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }

      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      );
      
      const allPassed = updatedSteps.every(step => step.status === 'passed');
      const anyFailed = updatedSteps.some(step => step.status === 'failed');
      const anyBlocked = updatedSteps.some(step => step.status === 'blocked');
      
      let newStatus: 'passed' | 'failed' | 'blocked' | 'pending' = 'pending';
      
      if (allPassed) newStatus = 'passed';
      else if (anyBlocked) newStatus = 'blocked';
      else if (anyFailed) newStatus = 'failed';
      
      if (status === 'failed' || status === 'blocked' || 
          (status === 'passed' && currentStepIndex === steps.length - 1)) {
        onUpdateStatus(newStatus);
        setIsRunning(false);
        setCurrentStepIndex(null);
      }

      toast.success(`Step marked as ${status}`);
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error('Failed to update step status');
    }
  };

  const handleStepComment = async (stepId: string, comment: string) => {
    try {
      await supabaseService.updateStepComment(stepId, comment);
      setStepComments(prev => ({
        ...prev,
        [stepId]: comment
      }));
      toast.success('Comment saved');
    } catch (error) {
      console.error('Error saving comment:', error);
      toast.error('Failed to save comment');
    }
  };

  const handleAttachmentUpload = async (stepId: string, files: FileList) => {
    try {
      const uploadedFiles = Array.from(files);
      await supabaseService.uploadStepAttachments(stepId, uploadedFiles);
      setStepAttachments(prev => ({
        ...prev,
        [stepId]: [...(prev[stepId] || []), ...uploadedFiles]
      }));
      toast.success('Attachments uploaded');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Failed to upload attachments');
    }
  };

  const startExecution = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setIsExpanded(true);
    
    const resetSteps = steps.map(step => ({
      ...step,
      status: 'pending',
      actualResult: ''
    }));
    
    setSteps(resetSteps);
    onUpdateStatus('pending');
    toast.success('Test execution started');
  };

  const pauseExecution = async () => {
    try {
      await supabaseService.updateFlowRunStatus(flowRun.id, 'pending');
      setIsRunning(false);
      toast.success('Test execution paused');
    } catch (error) {
      console.error('Error pausing execution:', error);
      toast.error('Failed to pause execution');
    }
  };

  const resumeExecution = () => {
    const lastIncompleteIndex = steps.findIndex(step => 
      step.status === 'pending' || !step.status
    );
    setCurrentStepIndex(lastIncompleteIndex === -1 ? steps.length - 1 : lastIncompleteIndex);
    setIsRunning(true);
    setIsExpanded(true);
    toast.success('Test execution resumed');
  };

  const getStepStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'blocked': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!testCase || !testCase.steps) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {testCase.displayId}: {testCase.title}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Started: {formatDate(flowRun.startDate || '')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <button
                onClick={startExecution}
                className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
              >
                <PlayCircle className="h-4 w-4 mr-1 inline" />
                Start Test
              </button>
            ) : (
              <button
                onClick={pauseExecution}
                className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Pause
              </button>
            )}
            {!isRunning && steps.some(step => step.status === 'pending') && (
              <button
                onClick={resumeExecution}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Resume
              </button>
            )}
            <button
              onClick={handleExit}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex && isRunning;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border ${
                  isCurrent 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-dark-border'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Step {index + 1}
                      </span>
                      {getStepStatusIcon(step.status)}
                      {isCurrent && (
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Current Step
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {step.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Expected:</span>{' '}
                      {step.expectedResult}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comments
                    </label>
                    <textarea
                      value={stepComments[step.id] || ''}
                      onChange={(e) => handleStepComment(step.id, e.target.value)}
                      disabled={!isRunning || index !== currentStepIndex}
                      className="w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Attachments
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleAttachmentUpload(step.id, e.target.files)}
                        disabled={!isRunning || index !== currentStepIndex}
                        className="hidden"
                        id={`attachment-${step.id}`}
                      />
                      <label
                        htmlFor={`attachment-${step.id}`}
                        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-md text-sm font-medium ${
                          !isRunning || index !== currentStepIndex
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer'
                        }`}
                      >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Add Files
                      </label>
                      {stepAttachments[step.id]?.map((file, fileIndex) => (
                        <span
                          key={fileIndex}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(isRunning && index === currentStepIndex) && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => updateStepStatus(step.id, 'blocked')}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1 inline" />
                        Blocked
                      </button>
                      <button
                        onClick={() => updateStepStatus(step.id, 'failed')}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1 inline" />
                        Failed
                      </button>
                      <button
                        onClick={() => updateStepStatus(step.id, 'passed')}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1 inline" />
                        Passed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark dark:text-white"
              rows={3}
              placeholder="Add any additional notes about this test case execution..."
            />
          </div>
        </div>
      )}
    </div>
  );
}