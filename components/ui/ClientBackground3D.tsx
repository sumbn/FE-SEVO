'use client'

import dynamic from 'next/dynamic'

// Load 3D background only on client side
const FullPageBackground3D = dynamic(() => import('./FullPageBackground3D'), { ssr: false })

export function ClientBackground3D() {
  return <FullPageBackground3D />
}
