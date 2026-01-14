'use client'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Leads</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Content Keys</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
      </div>
    </div>
  )
}
