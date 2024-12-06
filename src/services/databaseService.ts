import { ref, set, get, push, remove, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { TestCase, TestSuite, TestStep, FlowRun } from '../types';
import { v4 as uuid } from 'uuid';

export const databaseService = {
  // Test Cases
  async createTestCase(data: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    labels: string[];
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
        steps: [],
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
  },

  // Test Suites
  async createTestSuite(name: string, labels: string[]): Promise<TestSuite> {
    try {
      const id = uuid();
      const now = new Date().toISOString();
      
      const suite: TestSuite = {
        id,
        displayId: `TS-${id.slice(0, 8)}`,
        name,
        labels,
        isExpanded: true,
        testCases: [],
        createdAt: now,
        updatedAt: now
      };

      await set(ref(db, `testSuites/${id}`), suite);
      return suite;
    } catch (error) {
      console.error('Error creating test suite:', error);
      throw error;
    }
  },

  async getTestSuites(): Promise<TestSuite[]> {
    try {
      const snapshot = await get(ref(db, 'testSuites'));
      if (!snapshot.exists()) return [];
      
      const suites: TestSuite[] = [];
      snapshot.forEach((child) => {
        const suite = child.val();
        if (suite) {
          suites.push({
            ...suite,
            labels: suite.labels || [],
            testCases: suite.testCases || []
          });
        }
      });
      return suites;
    } catch (error) {
      console.error('Error getting test suites:', error);
      throw error;
    }
  },

  async updateTestSuite(id: string, updates: Partial<TestSuite>): Promise<void> {
    try {
      const updates_with_timestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await update(ref(db, `testSuites/${id}`), updates_with_timestamp);
    } catch (error) {
      console.error('Error updating test suite:', error);
      throw error;
    }
  },

  async deleteTestSuite(id: string): Promise<void> {
    try {
      await remove(ref(db, `testSuites/${id}`));
    } catch (error) {
      console.error('Error deleting test suite:', error);
      throw error;
    }
  },

  async addTestCaseToSuite(suiteId: string, testCaseId: string): Promise<void> {
    try {
      const suiteRef = ref(db, `testSuites/${suiteId}`);
      const snapshot = await get(suiteRef);
      if (!snapshot.exists()) {
        throw new Error('Test suite not found');
      }

      const suite = snapshot.val();
      const testCases = suite.testCases || [];
      
      if (!testCases.includes(testCaseId)) {
        testCases.push(testCaseId);
        await update(suiteRef, {
          testCases,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error adding test case to suite:', error);
      throw error;
    }
  },

  async removeTestCaseFromSuite(suiteId: string, testCaseId: string): Promise<void> {
    try {
      const suiteRef = ref(db, `testSuites/${suiteId}`);
      const snapshot = await get(suiteRef);
      if (!snapshot.exists()) {
        throw new Error('Test suite not found');
      }

      const suite = snapshot.val();
      const testCases = (suite.testCases || []).filter((id: string) => id !== testCaseId);
      
      await update(suiteRef, {
        testCases,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing test case from suite:', error);
      throw error;
    }
  },

  // Flow Runs
  async createFlowRun(data: {
    title: string;
    description: string;
    status: FlowRun['status'];
    startDate: string | null;
    endDate: string | null;
    labels: string[];
  }): Promise<FlowRun> {
    try {
      const id = uuid();
      const now = new Date().toISOString();
      
      const flowRun: FlowRun = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now
      };

      await set(ref(db, `flowRuns/${id}`), flowRun);
      return flowRun;
    } catch (error) {
      console.error('Error creating flow run:', error);
      throw error;
    }
  },

  async getFlowRuns(): Promise<FlowRun[]> {
    try {
      const snapshot = await get(ref(db, 'flowRuns'));
      if (!snapshot.exists()) return [];
      
      const runs: FlowRun[] = [];
      snapshot.forEach((child) => {
        const run = child.val();
        if (run) {
          runs.push({
            ...run,
            labels: run.labels || []
          });
        }
      });
      return runs;
    } catch (error) {
      console.error('Error getting flow runs:', error);
      throw error;
    }
  },

  async updateFlowRun(id: string, updates: Partial<FlowRun>): Promise<void> {
    try {
      const updates_with_timestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await update(ref(db, `flowRuns/${id}`), updates_with_timestamp);
    } catch (error) {
      console.error('Error updating flow run:', error);
      throw error;
    }
  },

  async deleteFlowRun(id: string): Promise<void> {
    try {
      await remove(ref(db, `flowRuns/${id}`));
      await remove(ref(db, `flowRunTestCases/${id}`));
    } catch (error) {
      console.error('Error deleting flow run:', error);
      throw error;
    }
  },

  async getFlowRunTestCases(flowRunId: string): Promise<TestCase[]> {
    try {
      const snapshot = await get(ref(db, `flowRunTestCases/${flowRunId}`));
      if (!snapshot.exists()) return [];
      
      const testCases: TestCase[] = [];
      snapshot.forEach((child) => {
        const testCase = child.val();
        if (testCase) {
          testCases.push({
            ...testCase,
            labels: testCase.labels || [],
            steps: testCase.steps || []
          });
        }
      });
      return testCases;
    } catch (error) {
      console.error('Error getting flow run test cases:', error);
      throw error;
    }
  },

  async addTestCaseToFlowRun(flowRunId: string, testCaseId: string): Promise<void> {
    try {
      const testCaseSnapshot = await get(ref(db, `testCases/${testCaseId}`));
      if (!testCaseSnapshot.exists()) {
        throw new Error('Test case not found');
      }

      const testCase = testCaseSnapshot.val();
      const flowRunTestCasesRef = ref(db, `flowRunTestCases/${flowRunId}/${testCaseId}`);
      
      await set(flowRunTestCasesRef, {
        ...testCase,
        status: 'no_run',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding test case to flow run:', error);
      throw error;
    }
  },

  async removeTestCaseFromFlowRun(flowRunId: string, testCaseId: string): Promise<void> {
    try {
      await remove(ref(db, `flowRunTestCases/${flowRunId}/${testCaseId}`));
    } catch (error) {
      console.error('Error removing test case from flow run:', error);
      throw error;
    }
  }
};