import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TestCase } from '../types';
import TestForm from './TestForm';
import { testCaseService } from '../services/testCaseService';
import { testStepService } from '../services/testStepService';
import { labelService } from '../services/labelService';
import { toast } from 'react-hot-toast';
import TestCaseList from './test-repository/TestCaseList';
import TestCaseFilters from './test-repository/TestCaseFilters';

export default function TestCaseRepository() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const casesData = await testCaseService.getTestCases();
      setTestCases(casesData);
    } catch (error) {
      console.error('Error loading test cases:', error);
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    steps: Array<{ description: string; expectedResult: string }>,
    labels: string[]
  ) => {
    try {
      if (editingTestCase) {
        await testCaseService.updateTestCase(editingTestCase.id, {
          title,
          description,
          priority,
          labels,
        });

        // Update steps
        for (const [index, step] of editingTestCase.steps.entries()) {
          if (steps[index]) {
            await testStepService.updateTestStep(editingTestCase.id, step.id, {
              description: steps[index].description,
              expectedResult: steps[index].expectedResult,
            });
          }
        }

        toast.success('Test case updated successfully');
      } else {
        await testCaseService.createTestCase({
          title,
          description,
          priority,
          labels,
          steps
        });

        toast.success('Test case created successfully');
      }

      await loadData();
      setShowTestForm(false);
      setEditingTestCase(undefined);
    } catch (error) {
      console.error('Error saving test case:', error);
      toast.error('Failed to save test case');
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }

    try {
      await testCaseService.deleteTestCase(testCaseId);
      toast.success('Test case deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting test case:', error);
      toast.error('Failed to delete test case');
    }
  };

  const handleSelectTestCase = (testCaseId: string) => {
    setSelectedTestCases(prev => {
      if (prev.includes(testCaseId)) {
        return prev.filter(id => id !== testCaseId);
      }
      return [...prev, testCaseId];
    });
  };

  const availableLabels = labelService.getUniqueLabels(testCases);

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLabels = selectedLabels.length === 0 ||
      selectedLabels.some(label => testCase.labels.includes(label));
    
    return matchesSearch && matchesLabels;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Test Repository</h2>
          <p className="text-sm text-gray-400">Manage your test cases</p>
        </div>
        <button
          onClick={() => {
            setEditingTestCase(undefined);
            setShowTestForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Test Case
        </button>
      </div>

      <TestCaseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLabels={selectedLabels}
        availableLabels={availableLabels}
        onSelectLabel={(label) => setSelectedLabels([...selectedLabels, label])}
        onRemoveLabel={(label) => setSelectedLabels(selectedLabels.filter(l => l !== label))}
      />

      <TestCaseList
        testCases={filteredTestCases}
        testSuites={[]}
        selectedTestCases={selectedTestCases}
        onSelectTestCase={handleSelectTestCase}
        onEditTestCase={setEditingTestCase}
        onDeleteTestCase={handleDeleteTestCase}
      />

      {showTestForm && (
        <TestForm
          onSubmit={handleAddTestCase}
          onClose={() => {
            setShowTestForm(false);
            setEditingTestCase(undefined);
          }}
          editingTestCase={editingTestCase}
          availableLabels={availableLabels}
        />
      )}
    </div>
  );
}