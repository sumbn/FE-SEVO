'use client'

import { useEffect } from "react"

export function DebugClientLogs() {
  useEffect(() => {
    console.log("📸 [useEffect] Mounted - Hàm này chỉ nên chạy 1 lần (hoặc 2 lần ở Dev mode)")
    if (typeof window !== 'undefined') {
      console.log("🌐 [Client] Current URL:", window.location.href)
    }
    return () => console.log("🧹 [useEffect] Unmounted - Component bị hủy")
  }, [])
  return null
}
