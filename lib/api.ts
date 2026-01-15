import { LoggingService } from './logging';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  requiresAuth?: boolean; // New option: whether to send credentials
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * API fetch wrapper with automatic token refresh
 * Uses httpOnly cookies for refresh token
 * Access token is stored in memory (not localStorage)
 * 
 * Features:
 * - Automatic correlation ID propagation
 * - Error logging via LoggingService
 */
let accessToken: string | null = null;

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { requiresAuth = false, ...fetchOptions } = options;
  
  // Add language header
  let locale = 'vi';
  if (typeof window === 'undefined') {
    // Server side: Read from the header set by middleware
    try {
      const { headers: nextHeaders } = await import('next/headers');
      const headerList = await nextHeaders();
      locale = headerList.get('x-locale') || 'vi';
    } catch (e) {
      // In case we are not in a request context (e.g. background task)
      locale = 'vi';
    }
  } else {
    // Client side: Read from the module variable
    locale = currentLocale;
  }

  const headers: Record<string, string> = {
    ...options.headers,
    'Accept-Language': locale,
    // Add correlation ID for end-to-end tracing
    'X-Correlation-ID': LoggingService.getCorrelationId(),
  };

  // Only set application/json if not FormData and not explicitly overridden
  if (!(options.body instanceof FormData) && options.headers?.['Content-Type'] !== 'undefined') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Remove the marker if present
  if (headers['Content-Type'] === 'undefined') {
    delete headers['Content-Type'];
  }

  // Add access token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Send cookies only for authenticated requests (or explicitly enabled)
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: requiresAuth ? 'include' : 'omit', // Only send cookies when needed
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, finalOptions);

    // Capture correlation ID from response if present
    const responseCorrelationId = response.headers.get('X-Correlation-ID');
    if (responseCorrelationId) {
      LoggingService.setCorrelationId(responseCorrelationId);
    }

    // Handle 401 - Token expired, try to refresh
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      // Check if we're already refreshing
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Try to refresh token
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Send refresh token cookie
            headers: {
              'X-Correlation-ID': LoggingService.getCorrelationId(),
            },
          });

          if (refreshResponse.ok) {
            const result = await refreshResponse.json();
            accessToken = result.data.accessToken;

            // Process queued requests
            processQueue(null, accessToken);
            isRefreshing = false;

            // Retry original request with new token
            headers['Authorization'] = `Bearer ${accessToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              ...finalOptions,
              headers,
            });

            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({}));
              throw new Error(error.message || 'API Request Failed');
            }

            const retryResult = await retryResponse.json();
            return retryResult.data;
          } else {
            // Refresh failed - logout
            LoggingService.warn('Session refresh failed', { endpoint });
            processQueue(new Error('Session expired'), null);
            isRefreshing = false;
            accessToken = null;
            if (requiresAuth && typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Session expired');
          }
        } catch (error) {
          processQueue(error as Error, null);
          isRefreshing = false;
          accessToken = null;
          if (requiresAuth && typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw error;
        }
      } else {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry with new token
          headers['Authorization'] = `Bearer ${accessToken}`;
          return fetch(`${API_URL}${endpoint}`, { ...finalOptions, headers })
            .then((res) => res.json())
            .then((res) => res.data);
        });
      }
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(result?.message || 'API Request Failed');
      error.errorCode = result?.errorCode;
      error.statusCode = response.status;
      
      // Log API errors
      LoggingService.error('API request failed', error as Error, {
        endpoint,
        status: response.status,
        errorCode: result?.errorCode,
      });
      
      throw error;
    }

    return result?.data ?? null;
  } catch (error) {
    // Log network/fetch errors
    if (error instanceof TypeError) {
      LoggingService.error('Network error', error as Error, { endpoint });
    }
    throw error;
  }
}

/**
 * Set access token (called after login)
 */
export function setAccessToken(token: string) {
  accessToken = token;
  LoggingService.info('Access token set');
}

/**
 * Clear access token (called after logout)
 */
export function clearAccessToken() {
  accessToken = null;
  LoggingService.info('Access token cleared');
  // Reset correlation ID for new session
  LoggingService.resetCorrelationId();
}

/**
 * Get current access token
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Handle locale for client-side requests
 */
let currentLocale = 'vi';

export function setLocale(locale: string) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}
