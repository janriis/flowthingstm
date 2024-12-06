import React, { useState, useEffect } from 'react';
import { PlusCircle, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TestCase, TestSuite, TestStep } from '../types';
import TestSuiteComponent from './TestSuite';
import TestForm from './TestForm';
import NewSuiteForm from './NewSuiteForm';
import { databaseService } from '../services/databaseService';
import { errorService } from '../services/errorService';
import { labelService } from '../services/labelService';
import { ErrorBoundary } from './ErrorBoundary';

export default function TestSuites() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showSuiteForm, setShowSuiteForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [suitesData, casesData] = await Promise.all([
        databaseService.getTestSuites(),
        databaseService.getTestCases()
      ]);

      setSuites(suitesData);
      setTestCases(casesData);
    } catch (error) {
      const message = 'Failed to load test suites data';
      console.error(message, error);
      await errorService.logError(error as Error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    steps: Array<{ description: string; expectedResult: string }>,
    labels: string[],
    suiteId?: string
  ) => {
    try {
      if (editingTestCase) {
        await databaseService.updateTestCase(editingTestCase.id, {
          title,
          description,
          priority,
          labels,
        });

        toast.success('Test case updated successfully');
      } else {
        const newCase = await databaseService.createTestCase({
          title,
          description,
          priority,
          labels
        });

        if (newCase && suiteId) {
          await databaseService.addTestCaseToSuite(suiteId, newCase.id);
        }

        toast.success('Test case created successfully');
      }

      await loadData();
      setShowTestForm(false);
      setEditingTestCase(undefined);
    } catch (error) {
      const message = 'Failed to save test case';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleAddSuite = async (name: string, labels: string[]) => {
    try {
      await databaseService.createTestSuite(name, labels);
      toast.success('Test suite created successfully');
      await loadData();
      setShowSuiteForm(false);
    } catch (error) {
      const message = 'Failed to create test suite';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleDeleteSuite = async (suiteId: string) => {
    if (!window.confirm('Are you sure you want to delete this test suite?')) {
      return;
    }

    try {
      await databaseService.deleteTestSuite(suiteId);
      toast.success('Test suite deleted successfully');
      await loadData();
    } catch (error) {
      const message = 'Failed to delete test suite';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }

    try {
      await databaseService.deleteTestCase(testCaseId);
      toast.success('Test case deleted successfully');
      await loadData();
    } catch (error) {
      const message = 'Failed to delete test case';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const handleAddTestCaseToSuite = async (suiteId: string, testCaseId: string) => {
    try {
      await databaseService.addTestCaseToSuite(suiteId, testCaseId);
      await loadData();
    } catch (error) {
      const message = 'Failed to add test case to suite';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
      throw error;
    }
  };

  const handleRemoveTestCaseFromSuite = async (suiteId: string, testCaseId: string) => {
    try {
      await databaseService.removeTestCaseFromSuite(suiteId, testCaseId);
      toast.success('Test case removed from suite');
      await loadData();
    } catch (error) {
      const message = 'Failed to remove test case from suite';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const updateTestStepStatus = async (
    testId: string,
    stepId: string,
    status: TestStep['status']
  ) => {
    try {
      await databaseService.updateTestStep(testId, stepId, { status });
      await loadData();
    } catch (error) {
      const message = 'Failed to update step status';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const updateTestStepActualResult = async (
    testId: string,
    stepId: string,
    actualResult: string
  ) => {
    try {
      await databaseService.updateTestStep(testId, stepId, { actualResult });
      await loadData();
    } catch (error) {
      const message = 'Failed to update step result';
      console.error(message, error);
      await errorService.logError(error as Error);
      toast.error(message);
    }
  };

  const toggleSuite = (suiteId: string) => {
    setSuites(
      suites.map(suite =>
        suite.id === suiteId ? { ...suite, isExpanded: !suite.isExpanded } : suite
      )
    );
  };

  const availableLabels = labelService.getUniqueLabels([...suites, ...testCases]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Suites</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize and track your test cases</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSuiteForm(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <FolderPlus className="h-5 w-5 mr-2" />
            New Suite
          </button>
          <button
            onClick={() => {
              setEditingTestCase(undefined);
              setShowTestForm(true);
            }}
            disabled={suites.length === 0}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Test Case
          </button>
        </div>
      </div>

      {showTestForm && (
        <TestForm
          onSubmit={handleAddTestCase}
          onClose={() => {
            setShowTestForm(false);
            setEditingTestCase(undefined);
          }}
          editingTestCase={editingTestCase}
          availableLabels={availableLabels}
          availableSuites={suites}
        />
      )}

      {showSuiteForm && (
        <NewSuiteForm
          onSubmit={handleAddSuite}
          onClose={() => setShowSuiteForm(false)}
          availableLabels={availableLabels}
        />
      )}

      <div className="space-y-4">
        {suites.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FolderPlus className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Test Suites Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create a test suite to start organizing your test cases.</p>
          </div>
        ) : (
          suites.map(suite => (
            <ErrorBoundary key={suite.id}>
              <TestSuiteComponent
                suite={suite}
                testCases={testCases.filter(tc => suite.testCases?.includes(tc.id))}
                availableTestCases={testCases.filter(tc => !suite.testCases?.includes(tc.id))}
                isExpanded={suite.isExpanded}
                onToggle={toggleSuite}
                onUpdateStepStatus={updateTestStepStatus}
                onUpdateStepActualResult={updateTestStepActualResult}
                onEditTestCase={setEditingTestCase}
                onDeleteTestCase={handleDeleteTestCase}
                onDeleteSuite={() => handleDeleteSuite(suite.id)}
                onAddTestCase={(testCaseId) => handleAddTestCaseToSuite(suite.id, testCaseId)}
                onRemoveTestCase={(testCaseId) => handleRemoveTestCaseFromSuite(suite.id, testCaseId)}
              />
            </ErrorBoundary>
          ))
        )}
      </div>
    </div>
  );
}