import React from 'react';
import { TestStep } from '../types';

interface TestStepListProps {
  steps: TestStep[];
  readOnly?: boolean;
}

export default function TestStepList({ 
  steps,
  readOnly = false 
}: TestStepListProps) {
  return (
    <div className="divide-y divide-gray-700">
      {steps.map((step, index) => (
        <div key={step.id} className="p-4 text-gray-300">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-400">Step {index + 1}</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm">{step.description}</p>
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Expected:</span> {step.expectedResult}
              </p>
              {!readOnly && (
                <div className="text-sm">
                  <span className="font-medium text-gray-400">Actual:</span>
                  <p className="text-gray-300 mt-1">
                    {step.actualResult || 'No result recorded'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}