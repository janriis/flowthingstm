import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  user_id?: string;
  error?: any;
}

export const logService = {
  async log(
    level: LogLevel,
    message: string,
    context: Record<string, any> = {},
    error?: any,
    userId?: string
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        user_id: userId,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        } : undefined
      };

      const { error: dbError } = await supabase
        .from('system_logs')
        .insert(logEntry);

      if (dbError) {
        console.error('Failed to store log entry:', dbError);
      }

      // Always log to console for development
      if (import.meta.env.DEV) {
        const consoleMethod = {
          [LogLevel.DEBUG]: console.debug,
          [LogLevel.INFO]: console.info,
          [LogLevel.WARN]: console.warn,
          [LogLevel.ERROR]: console.error
        }[level];

        consoleMethod(
          `[${level.toUpperCase()}] ${message}`,
          { context, error: logEntry.error }
        );
      }
    } catch (loggingError) {
      console.error('Error in logging service:', loggingError);
    }
  },

  debug(message: string, context?: Record<string, any>, userId?: string) {
    return this.log(LogLevel.DEBUG, message, context, undefined, userId);
  },

  info(message: string, context?: Record<string, any>, userId?: string) {
    return this.log(LogLevel.INFO, message, context, undefined, userId);
  },

  warn(message: string, context?: Record<string, any>, error?: any, userId?: string) {
    return this.log(LogLevel.WARN, message, context, error, userId);
  },

  error(message: string, error: any, context?: Record<string, any>, userId?: string) {
    return this.log(LogLevel.ERROR, message, context, error, userId);
  }
};