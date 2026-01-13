'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const isLoginPage = pathname === '/login'

  // Protected route logic
  if (!isLoading && !user && !isLoginPage) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  const navItems = [
    { label: 'Nội dung trang', href: '/admin/content', icon: '📝' },
    { label: 'Khóa học', href: '/admin/courses', icon: '🎓' },
    { label: 'Khách hàng', href: '/admin/leads', icon: '👥' },
  ]

  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-900">Đang chuẩn bị trang quản trị...</div>

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <main className="min-h-screen bg-gray-50">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-blue-600">SEVO Admin</h2>
          <p className="mt-1 text-xs text-gray-400 uppercase tracking-widest font-bold">Hệ thống quản trị</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-all ${pathname.startsWith(item.href)
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-10 w-52">
          <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase">Tài khoản</div>
            <div className="mt-1 truncate text-sm font-black text-gray-900">{user?.name || 'Admin'}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            退出 🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
