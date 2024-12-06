import { ref, set, get, update, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { TestCase } from '../types';
import { v4 as uuid } from 'uuid';

export const testCaseService = {
  async createTestCase(data: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    labels: string[];
    steps: Array<{ description: string; expectedResult: string }>;
  }): Promise<TestCase> {
    try {
      const id = uuid();
      const now = new Date().toISOString();
      
      const testCase: TestCase = {
        id,
        displayId: `TC-${id.slice(0, 8)}`,
        title: data.title,
        description: data.description,
        status: 'no_run',
        priority: data.priority,
        labels: data.labels,
        steps: data.steps.map((step, index) => ({
          id: `${id}-step-${index}`,
          description: step.description,
          expectedResult: step.expectedResult,
          actualResult: '',
          status: 'pending'
        })),
        createdAt: now,
        updatedAt: now
      };

      await set(ref(db, `testCases/${id}`), testCase);
      return testCase;
    } catch (error) {
      console.error('Error creating test case:', error);
      throw error;
    }
  },

  async getTestCases(): Promise<TestCase[]> {
    try {
      const snapshot = await get(ref(db, 'testCases'));
      if (!snapshot.exists()) return [];
      
      const cases: TestCase[] = [];
      snapshot.forEach((child) => {
        const testCase = child.val();
        if (testCase) {
          cases.push({
            ...testCase,
            labels: testCase.labels || [],
            steps: testCase.steps || []
          });
        }
      });
      return cases;
    } catch (error) {
      console.error('Error getting test cases:', error);
      throw error;
    }
  },

  async updateTestCase(id: string, updates: Partial<TestCase>): Promise<void> {
    try {
      const updates_with_timestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await update(ref(db, `testCases/${id}`), updates_with_timestamp);
    } catch (error) {
      console.error('Error updating test case:', error);
      throw error;
    }
  },

  async deleteTestCase(id: string): Promise<void> {
    try {
      await remove(ref(db, `testCases/${id}`));
    } catch (error) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  }
};