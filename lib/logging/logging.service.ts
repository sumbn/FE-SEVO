'use client';

import { 
  ILogger, 
  FrontendLogMeta, 
  FrontendLogEntry, 
  BatchLogsPayload 
} from './logger.types';

/**
 * Browser detection helper
 */
function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
}

/**
 * Generate UUID for correlation
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * LoggingService - Frontend Logging Service
 * 
 * ⚠️ MANDATORY: Tất cả logging trong FE PHẢI qua service này.
 * ❌ KHÔNG ĐƯỢC sử dụng console.log trực tiếp trong business logic.
 * 
 * Features:
 * - Batch mechanism (gom logs mỗi 5 giây)
 * - Auto-flush on critical errors
 * - Correlation ID propagation
 * - Browser metadata extraction
 * 
 * @see docs/standards/_INDEX.md#logging-standards
 */
class LoggingServiceClass implements ILogger {
  private logBuffer: FrontendLogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private correlationId: string;
  
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_BUFFER_SIZE = 20;
  private readonly API_ENDPOINT = '/api/internal/logs';
  
  constructor() {
    this.correlationId = generateUUID();
    this.startFlushTimer();
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }
  
  /**
   * Get current correlation ID (for API requests)
   */
  getCorrelationId(): string {
    return this.correlationId;
  }
  
  /**
   * Set correlation ID from server response (if provided)
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }
  
  /**
   * Reset correlation ID (useful for new user sessions)
   */
  resetCorrelationId(): void {
    this.correlationId = generateUUID();
  }
  
  info(message: string, meta?: Partial<FrontendLogMeta>): void {
    this.log('info', message, meta);
  }
  
  warn(message: string, meta?: Partial<FrontendLogMeta>): void {
    this.log('warn', message, meta);
  }
  
  error(message: string, error?: Error, meta?: Partial<FrontendLogMeta>): void {
    const errorMeta: Partial<FrontendLogMeta> = {
      ...meta,
    };
    
    if (error) {
      errorMeta.error_name = error.name;
      errorMeta.error_message = error.message;
      // Only include stack in development
      if (process.env.NODE_ENV === 'development') {
        errorMeta.error_stack = error.stack;
      }
    }
    
    this.log('error', message, errorMeta);
    
    // Flush immediately on errors
    this.flush();
  }
  
  private log(
    level: 'info' | 'warn' | 'error', 
    message: string, 
    meta?: Partial<FrontendLogMeta>
  ): void {
    const entry: FrontendLogEntry = {
      message,
      level,
      timestamp: new Date().toISOString(),
      metadata: {
        correlation_id: this.correlationId,
        browser: detectBrowser(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...meta,
      },
    };
    
    // In Development: Log to console primarily
    // We disable remote flushing by default in verify mode/dev to prevent HMR loops
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGS) {
      this.logToConsole(entry);
      // Do not buffer for remote flush
      return;
    }
    
    this.logBuffer.push(entry);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry);
    }
    
    // Flush if buffer is full
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flush();
    }
  }
  
  private logToConsole(entry: FrontendLogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] [${entry.timestamp}]`;
    
    switch (entry.level) {
      case 'info':
        console.info(prefix, entry.message, entry.metadata);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.metadata);
        break;
      case 'error':
        console.error(prefix, entry.message, entry.metadata);
        break;
    }
  }
  
  private startFlushTimer(): void {
    if (typeof window === 'undefined') return;
    
    // Clear existing timer if any (singleton safety)
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Only start timer if remote logging is potentially enabled
    if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGS) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.FLUSH_INTERVAL);
    }
  }
  
  /**
   * Flush buffered logs to backend
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;
    if (typeof window === 'undefined') return;
    
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      const payload: BatchLogsPayload = { logs: logsToSend };
      
      // Use sendBeacon for reliability during page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { 
          type: 'application/json' 
        });
        navigator.sendBeacon(this.API_ENDPOINT, blob);
      } else {
        // Fallback to fetch
        await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': this.correlationId,
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      // On failure, put logs back in buffer (up to max size)
      this.logBuffer = [...logsToSend.slice(-this.MAX_BUFFER_SIZE), ...this.logBuffer];
      
      // Log to console as fallback
      console.error('[LoggingService] Failed to flush logs:', error);
    }
  }
}

// Singleton instance
export const LoggingService = new LoggingServiceClass();

// Named exports for different use cases
export const logger = LoggingService;
export default LoggingService;
