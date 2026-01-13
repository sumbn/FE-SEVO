'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/auth'
import { apiFetch, setAccessToken, clearAccessToken } from '@/lib/api'

interface AuthContextType {
  user: any | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const initAuth = useCallback(async () => {
    try {
      // Use silent refresh to get initial access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        const { accessToken, user } = result.data
        setAccessToken(accessToken)
        setUser(user)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: true, // Send credentials to set cookie
    })

    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await auth.logout()
    } finally {
      clearAccessToken()
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
