'use client'

import { logToSheet } from '@/lib/logger'
import { useState } from 'react'

export default function TestLoggingPage() {
  const [status, setStatus] = useState('Idle')

  const handleInfo = () => {
    logToSheet('info', 'Test INFO log from button', { source: 'manual_test' })
    setStatus('Logged INFO')
  }

  const handleWarn = () => {
    logToSheet('warn', 'Test WARN log from button', { source: 'manual_test' })
    setStatus('Logged WARN')
  }

  const handleError = () => {
    try {
      throw new Error('Test ERROR object')
    } catch (err: any) {
      logToSheet('error', 'Test ERROR log from button', { error: err, source: 'manual_test' })
      setStatus('Logged ERROR')
    }
  }

  const handleBatch = () => {
    // Trigger 25 logs to force flush (buffer size is 20)
    for (let i = 0; i < 25; i++) {
      logToSheet('info', `Batch log test ${i + 1}/25`, { batch_id: 'batch_test' })
    }
    setStatus('Triggered 25 batch logs')
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Logging Test Page</h1>
      <div className="p-4 border rounded bg-gray-50 text-black">
        Status: <span className="font-mono font-bold">{status}</span>
      </div>
      <div className="flex gap-4">
        <button onClick={handleInfo} className="px-4 py-2 bg-blue-500 text-white rounded items-center justify-center">Log INFO</button>
        <button onClick={handleWarn} className="px-4 py-2 bg-yellow-500 text-white rounded items-center justify-center">Log WARN</button>
        <button onClick={handleError} className="px-4 py-2 bg-red-500 text-white rounded items-center justify-center">Log ERROR</button>
        <button onClick={handleBatch} className="px-4 py-2 bg-purple-500 text-white rounded items-center justify-center">Trigger Batch (25)</button>
      </div>
    </div>
  )
}
