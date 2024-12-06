import { ref, set, get, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { TestStep } from '../types';

export const testStepService = {
  async updateTestStep(
    testCaseId: string,
    stepId: string,
    updates: Partial<TestStep>
  ): Promise<void> {
    try {
      const stepRef = ref(db, `testCases/${testCaseId}/steps/${stepId}`);
      await update(stepRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating test step:', error);
      throw error;
    }
  },

  async getTestSteps(testCaseId: string): Promise<TestStep[]> {
    try {
      const snapshot = await get(ref(db, `testCases/${testCaseId}/steps`));
      if (!snapshot.exists()) return [];
      
      const steps: TestStep[] = [];
      snapshot.forEach((child) => {
        const step = child.val();
        if (step) {
          steps.push({
            ...step,
            comments: step.comments || '',
            attachments: step.attachments || []
          });
        }
      });
      return steps;
    } catch (error) {
      console.error('Error getting test steps:', error);
      throw error;
    }
  }
};