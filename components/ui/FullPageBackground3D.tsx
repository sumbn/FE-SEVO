'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Float } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as random from 'maath/random'
import * as THREE from 'three'

// Floating particles for subtle effect
function ParticleField() {
  const ref = useRef<any>(null)
  const [sphere] = useState(() => {
    const data = new Float32Array(1000 * 3)
    random.inSphere(data, { radius: 2.5 })
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i])) data[i] = 0
    }
    return data
  })

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30
      ref.current.rotation.y -= delta / 35
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#60a5fa"
          size={0.008}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  )
}

// Large, visible 3D Education Icons with solid colors
function EducationIcon({ position, icon, scale = 1 }: { position: [number, number, number], icon: string, scale?: number }) {
  const mesh = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.4
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15
    }
  })

  const renderIcon = () => {
    switch (icon) {
      case 'robot':
        // Robot head - solid, bright, with glowing eyes
        return (
          <group>
            {/* Head */}
            <mesh>
              <boxGeometry args={[0.5, 0.45, 0.4]} />
              <meshStandardMaterial color="#4f46e5" metalness={0.3} roughness={0.4} />
            </mesh>
            {/* Face plate */}
            <mesh position={[0, 0, 0.21]}>
              <boxGeometry args={[0.4, 0.35, 0.02]} />
              <meshStandardMaterial color="#818cf8" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Left Eye */}
            <mesh position={[-0.12, 0.05, 0.23]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
            </mesh>
            {/* Right Eye */}
            <mesh position={[0.12, 0.05, 0.23]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.1, 0.22]}>
              <boxGeometry args={[0.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} />
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.2]} />
              <meshStandardMaterial color="#4f46e5" metalness={0.5} />
            </mesh>
            {/* Antenna tip */}
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={2} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.15]} />
              <meshStandardMaterial color="#6366f1" metalness={0.4} />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.15]} />
              <meshStandardMaterial color="#6366f1" metalness={0.4} />
            </mesh>
          </group>
        )

      case 'book':
        // Open book - colorful with pages
        return (
          <group rotation={[0.1, 0, 0.1]}>
            {/* Spine */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.4, 0.3]} />
              <meshStandardMaterial color="#dc2626" metalness={0.2} />
            </mesh>
            {/* Left cover */}
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0.25, 0]}>
              <boxGeometry args={[0.25, 0.4, 0.03]} />
              <meshStandardMaterial color="#ef4444" metalness={0.2} />
            </mesh>
            {/* Right cover */}
            <mesh position={[0.15, 0, 0]} rotation={[0, -0.25, 0]}>
              <boxGeometry args={[0.25, 0.4, 0.03]} />
              <meshStandardMaterial color="#ef4444" metalness={0.2} />
            </mesh>
            {/* Pages left */}
            <mesh position={[-0.12, 0, 0.01]} rotation={[0, 0.2, 0]}>
              <boxGeometry args={[0.2, 0.35, 0.04]} />
              <meshStandardMaterial color="#fef3c7" />
            </mesh>
            {/* Pages right */}
            <mesh position={[0.12, 0, 0.01]} rotation={[0, -0.2, 0]}>
              <boxGeometry args={[0.2, 0.35, 0.04]} />
              <meshStandardMaterial color="#fef3c7" />
            </mesh>
          </group>
        )

      case 'graduation':
        // Graduation cap - bright colors
        return (
          <group>
            {/* Board */}
            <mesh rotation={[0, 0.4, 0]}>
              <boxGeometry args={[0.6, 0.04, 0.6]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.3} />
            </mesh>
            {/* Cap dome */}
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 0.15, 8]} />
              <meshStandardMaterial color="#1e40af" metalness={0.3} />
            </mesh>
            {/* Button on top */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.03]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
            {/* Tassel string */}
            <mesh position={[0.25, -0.05, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.015, 0.015, 0.3]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
            {/* Tassel end */}
            <mesh position={[0.35, -0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.02, 0.15]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          </group>
        )

      case 'gear':
        // Gear - industrial look with teeth
        return (
          <group>
            {/* Main ring */}
            <mesh>
              <torusGeometry args={[0.22, 0.06, 16, 24]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Center hub */}
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <mesh key={i} position={[Math.cos(angle * Math.PI / 180) * 0.28, 0, Math.sin(angle * Math.PI / 180) * 0.28]} rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}>
                <boxGeometry args={[0.08, 0.1, 0.08]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.6} />
              </mesh>
            ))}
          </group>
        )

      case 'lightbulb':
        // Bright glowing lightbulb
        return (
          <group>
            {/* Glass bulb */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.5} transparent opacity={0.9} />
            </mesh>
            {/* Filament glow */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
            {/* Base */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.12, 16]} />
              <meshStandardMaterial color="#a3a3a3" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Screw threads */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
              <meshStandardMaterial color="#737373" metalness={0.7} />
            </mesh>
          </group>
        )

      case 'atom':
        // Colorful atom with orbiting electrons
        return (
          <group>
            {/* Nucleus */}
            <mesh>
              <sphereGeometry args={[0.1, 24, 24]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
            </mesh>
            {/* Orbit 1 */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.3, 0.015, 8, 48]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
            {/* Orbit 2 */}
            <mesh rotation={[Math.PI / 2.5, 0, Math.PI / 4]}>
              <torusGeometry args={[0.3, 0.015, 8, 48]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
            </mesh>
            {/* Orbit 3 */}
            <mesh rotation={[-Math.PI / 2.5, 0, -Math.PI / 4]}>
              <torusGeometry args={[0.3, 0.015, 8, 48]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
            </mesh>
            {/* Electrons */}
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-0.15, 0.26, 0]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.15, -0.26, 0]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2} />
            </mesh>
          </group>
        )

      case 'pencil':
        // Pencil for creativity/learning
        return (
          <group rotation={[0, 0, Math.PI / 6]}>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
            {/* Tip */}
            <mesh position={[0, -0.3, 0]}>
              <coneGeometry args={[0.04, 0.1, 6]} />
              <meshStandardMaterial color="#fef3c7" />
            </mesh>
            {/* Lead */}
            <mesh position={[0, -0.37, 0]}>
              <coneGeometry args={[0.015, 0.05, 6]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Eraser */}
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
              <meshStandardMaterial color="#f472b6" />
            </mesh>
            {/* Metal band */}
            <mesh position={[0, 0.23, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.04, 16]} />
              <meshStandardMaterial color="#a3a3a3" metalness={0.8} />
            </mesh>
          </group>
        )

      default:
        return (
          <mesh>
            <icosahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color="#60a5fa" metalness={0.5} />
          </mesh>
        )
    }
  }

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={1.2}>
      <group ref={mesh} position={position} scale={scale}>
        {renderIcon()}
      </group>
    </Float>
  )
}

export default function FullPageBackground3D() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-b from-[#0a1628] via-[#0c1929] to-[#0f172a]">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        {/* Better lighting for solid objects */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#60a5fa" />
        <pointLight position={[0, 0, 3]} intensity={0.8} color="#ffffff" />

        {/* Subtle star field */}
        <Stars radius={60} depth={50} count={1500} factor={4} saturation={0} fade speed={0.2} />

        {/* Floating particles */}
        <ParticleField />

        {/* Education & Technology 3D Icons - Larger and better positioned */}
        <EducationIcon position={[-2.2, 1, -1]} icon="robot" scale={1.4} />
        <EducationIcon position={[2.3, 0.8, -1.5]} icon="book" scale={1.3} />
        <EducationIcon position={[-2, -0.8, -0.5]} icon="graduation" scale={1.2} />
        <EducationIcon position={[2, -0.9, -1]} icon="gear" scale={1.1} />
        <EducationIcon position={[0, 1.5, -1.2]} icon="lightbulb" scale={1.3} />
        <EducationIcon position={[-0.8, -1.3, -0.8]} icon="atom" scale={1.2} />
        <EducationIcon position={[1, -1.4, -0.6]} icon="pencil" scale={1.1} />
      </Canvas>
    </div>
  )
}
