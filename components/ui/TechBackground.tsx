'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, Stars } from '@react-three/drei'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useRef } from 'react'
import * as random from 'maath/random'

function ParticleField(props: any) {
  const ref = useRef<any>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sphere] = useState(() => {
    // Allocate buffer for 5000 points * 3 coordinates (x, y, z)
    const data = new Float32Array(5000 * 3)
    random.inSphere(data, { radius: 1.5 })

    // Validate for NaN just in case
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i])) data[i] = 0
    }

    return data
  })

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#0066ff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function FloatingShape() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} position={[1, 0, -2]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3b82f6" wireframe opacity={0.3} transparent />
      </mesh>
      <mesh position={[-1, -1, -1]}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#60a5fa" wireframe opacity={0.3} transparent />
      </mesh>
    </Float>
  )
}

export default function TechBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
        <FloatingShape />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
    </div>
  )
}
