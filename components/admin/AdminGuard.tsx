'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/auth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Allow access to login page without token
    if (pathname === '/admin/login') {
      setAuthorized(true)
      return
    }

    if (!auth.isAuthenticated()) {
      setAuthorized(false)
      router.push('/admin/login')
    } else {
      setAuthorized(true)
    }
  }, [mounted, pathname, router])

  // Prevent hydration mismatch by rendering nothing on server
  if (!mounted) {
    return null
  }

  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">checking access...</div>
      </div>
    )
  }

  return <>{children}</>
}
