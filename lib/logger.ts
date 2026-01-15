import { LoggingService } from './logging';
import { FrontendLogMeta } from './logging/logger.types';

type LogLevel = 'info' | 'warn' | 'error';

/**
 * Sends a log entry to the backend logging service (Google Sheets).
 * Uses fire-and-forget mechanism via LoggingService batching.
 * 
 * @param level - The severity level of the log ('info' | 'warn' | 'error')
 * @param message - The main log message
 * @param metadata - Additional context. For 'error' level, pass the Error object in metadata.error
 */
export function logToSheet(
  level: LogLevel, 
  message: string, 
  metadata?: Partial<FrontendLogMeta> & { error?: Error }
): void {
  // Extract error object if present to pass it as a separate argument to LoggingService.error
  const { error, ...meta } = metadata || {};

  switch (level) {
    case 'info':
      LoggingService.info(message, meta);
      break;
    case 'warn':
      LoggingService.warn(message, meta);
      break;
    case 'error':
      LoggingService.error(message, error, meta);
      break;
  }
}
