import { ref, push } from 'firebase/database';
import { db } from '../lib/firebase';

export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export const errorService = {
  async logError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context
      };

      await push(ref(db, 'errorLogs'), errorLog);
      
      // Also log to console in development
      if (import.meta.env.DEV) {
        console.error('Error:', error.message, { error, context });
      }
    } catch (loggingError) {
      // Fallback to console if database logging fails
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }
};