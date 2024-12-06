export interface TestStep {
  id: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: 'pending' | 'passed' | 'failed' | 'blocked';
  comments?: string;
  attachments?: string[];
  executedAt?: string | null;
}

export interface TestCase {
  id: string;
  displayId: string;
  title: string;
  description: string;
  status: 'no_run' | 'pending' | 'passed' | 'failed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  steps: TestStep[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestSuite {
  id: string;
  displayId: string;
  name: string;
  isExpanded: boolean;
  labels: string[];
  testCases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowRun {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  startDate: string | null;
  endDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  metrics?: {
    passed: number;
    failed: number;
    blocked: number;
    pending: number;
    total: number;
  };
}

export interface FlowRunTestCase {
  id: string;
  flowRunId: string;
  testCaseId: string;
  status: 'no_run' | 'pending' | 'passed' | 'failed' | 'blocked';
  notes: string;
  startTime?: string;
  endTime?: string;
  executedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestStepDetails {
  comments: Record<string, string>;
  attachments: Record<string, string[]>;
}