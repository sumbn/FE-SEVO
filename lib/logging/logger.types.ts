/**
 * Frontend Logger Types
 * 
 * Shared types cho Frontend logging - matches Backend ILogger interface.
 * 
 * @see docs/standards/_INDEX.md#logging-standards
 */

/**
 * Frontend-specific log metadata
 */
export interface FrontendLogMeta {
  /** Correlation ID for end-to-end tracing */
  correlation_id?: string;
  
  /** Browser name (extracted from navigator.userAgent) */
  browser?: string;
  
  /** Current page URL */
  url?: string;
  
  /** React component name where error occurred */
  component?: string;
  
  /** User ID if logged in */
  user_id?: string;
  
  /** Additional context data */
  [key: string]: unknown;
}

/**
 * Log entry structure sent to backend
 */
export interface FrontendLogEntry {
  message: string;
  level: 'info' | 'warn' | 'error';
  metadata: FrontendLogMeta;
  timestamp: string;
}

/**
 * ILogger Interface for Frontend
 * 
 * Matches Backend interface for unified logging.
 */
export interface ILogger {
  info(message: string, meta?: Partial<FrontendLogMeta>): void;
  warn(message: string, meta?: Partial<FrontendLogMeta>): void;
  error(message: string, error?: Error, meta?: Partial<FrontendLogMeta>): void;
}

/**
 * Batch logs request payload
 */
export interface BatchLogsPayload {
  logs: FrontendLogEntry[];
}
