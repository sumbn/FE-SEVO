'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logToSheet } from '@/lib/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional fallback component */
  fallback?: ReactNode
  /** Component name for logging context */
  componentName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - React Error Boundary Component
 * 
 * ⚠️ MANDATORY: Wrap critical pages/components với ErrorBoundary.
 * 
 * Features:
 * - Catch UI crashes
 * - Log error + component stack to LoggingService
 * - Show fallback UI
 * - Allow retry/refresh
 * 
 * @see docs/standards/_INDEX.md#logging-standards
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to LoggingService via logToSheet utility
    logToSheet('error', 'UI Crash detected', {
      error,
      component: this.props.componentName || 'Unknown',
      component_stack: errorInfo.componentStack,
    })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  };

  handleRefresh = (): void => {
    window.location.reload()
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Đã xảy ra lỗi</h2>
            <p>Xin lỗi, đã có lỗi xảy ra khi hiển thị trang này.</p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="error-details">
                {this.state.error.message}
              </pre>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="retry-button"
              >
                Thử lại
              </button>
              <button
                onClick={this.handleRefresh}
                className="refresh-button"
              >
                Tải lại trang
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-boundary-fallback {
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
            }

            .error-boundary-content {
              text-align: center;
              max-width: 400px;
            }

            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            h2 {
              margin: 0 0 0.5rem;
              color: #dc2626;
            }

            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }

            .error-details {
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 1.5rem;
              font-size: 0.875rem;
              color: #991b1b;
              text-align: left;
              overflow-x: auto;
              max-height: 200px;
            }

            .error-actions {
              display: flex;
              gap: 0.75rem;
              justify-content: center;
            }

            .retry-button,
            .refresh-button {
              padding: 0.625rem 1.25rem;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.15s ease;
            }

            .retry-button {
              background: #2563eb;
              color: white;
              border: none;
            }

            .retry-button:hover {
              background: #1d4ed8;
            }

            .refresh-button {
              background: white;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .refresh-button:hover {
              background: #f9fafb;
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
