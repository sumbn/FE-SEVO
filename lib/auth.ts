'use client';

/**
 * Auth utilities for frontend
 * Now uses httpOnly cookies instead of localStorage
 */

/**
 * Check if user is authenticated by verifying cookie exists
 * Note: We can't read httpOnly cookies from JavaScript, 
 * so we rely on API calls to verify auth status
 */
export const auth = {
  /**
   * Check authentication status by making an API call
   * The refresh token cookie will be sent automatically
   */
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send cookies
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Logout - Call backend logout endpoint to clear cookie
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  /**
   * Simple client-side auth check
   * Returns true if we assume user is logged in (can't verify cookie from JS)
   * For real verification, use checkAuth()
   */
  isAuthenticated(): boolean {
    // We can't read httpOnly cookies, so we'll rely on API interceptor
    // This is just a placeholder for client-side guards
    return true; // Assume authenticated, let API verify
  },
};
