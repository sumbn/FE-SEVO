'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Stars, Float } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as random from 'maath/random'
import * as THREE from 'three'

// Floating particles with neon glow
function ParticleField() {
  const ref = useRef<any>(null)
  const [sphere] = useState(() => {
    const data = new Float32Array(1500 * 3) // Increased count
    random.inSphere(data, { radius: 3.5 }) // Increased spread
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i])) data[i] = 0
    }
    return data
  })

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 50
      ref.current.rotation.y -= delta / 60
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#39ff14" // Neon Green
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
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

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const renderIcon = () => {
    const glassMaterial = <meshPhysicalMaterial
      color="#ffffff"
      transmission={0.6}
      roughness={0.2}
      metalness={0.1}
      thickness={0.5}
      clearcoat={1}
    />

    // Helper materials for neon look
    const neonBlue = <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2} toneMapped={false} />
    const neonPurple = <meshStandardMaterial color="#bc13fe" emissive="#bc13fe" emissiveIntensity={2} toneMapped={false} />
    const neonPink = <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
    const neonGreen = <meshStandardMaterial color="#39ff14" emissive="#39ff14" emissiveIntensity={2} toneMapped={false} />
    const darkMetal = <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />

    /* eslint-enable @typescript-eslint/no-unused-vars */

    switch (icon) {
      case 'robot':
        // Robot head - Cyberpunk style
        return (
          <group>
            {/* Head */}
            <mesh>
              <boxGeometry args={[0.5, 0.45, 0.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Face plate - Glass */}
            <mesh position={[0, 0, 0.21]}>
              <boxGeometry args={[0.4, 0.35, 0.02]} />
              {glassMaterial}
            </mesh>
            {/* Left Eye */}
            <mesh position={[-0.12, 0.05, 0.22]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              {neonBlue}
            </mesh>
            {/* Right Eye */}
            <mesh position={[0.12, 0.05, 0.22]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              {neonBlue}
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.1, 0.22]}>
              <boxGeometry args={[0.2, 0.03, 0.02]} />
              {neonPurple}
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.2]} />
              {darkMetal}
            </mesh>
            {/* Antenna tip */}
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              {neonPink}
            </mesh>
            {/* Ears */}
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.15]} />
              {darkMetal}
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.15]} />
              {darkMetal}
            </mesh>
          </group>
        )

      case 'book':
        // Holographic Data Tablet / Book
        return (
          <group rotation={[0.1, 0, 0.1]}>
            {/* Spine */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.4, 0.3]} />
              {neonBlue}
            </mesh>
            {/* Left cover */}
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0.25, 0]}>
              <boxGeometry args={[0.25, 0.4, 0.03]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Right cover */}
            <mesh position={[0.15, 0, 0]} rotation={[0, -0.25, 0]}>
              <boxGeometry args={[0.25, 0.4, 0.03]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Pages - Glowing Hologram */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.45, 0.35, 0.02]} />
              <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.5} transparent opacity={0.4} />
            </mesh>
          </group>
        )

      case 'graduation':
        // High-tech Graduation Cap
        return (
          <group>
            {/* Board */}
            <mesh rotation={[0, 0.4, 0]}>
              <boxGeometry args={[0.6, 0.04, 0.6]} />
              <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Edge Glow */}
            <mesh rotation={[0, 0.4, 0]}>
              <boxGeometry args={[0.62, 0.02, 0.62]} />
              {neonPurple}
            </mesh>
            {/* Cap dome */}
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 0.15, 8]} />
              <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Tassel */}
            <mesh position={[0.35, -0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.02, 0.15]} />
              {neonGreen}
            </mesh>
          </group>
        )

      case 'gear':
        // Neon Gear
        return (
          <group>
            {/* Main ring */}
            <mesh>
              <torusGeometry args={[0.22, 0.06, 16, 24]} />
              {darkMetal}
            </mesh>
            {/* Inner Glow Ring */}
            <mesh>
              <torusGeometry args={[0.15, 0.02, 16, 24]} />
              {neonGreen}
            </mesh>
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <mesh key={i} position={[Math.cos(angle * Math.PI / 180) * 0.28, 0, Math.sin(angle * Math.PI / 180) * 0.28]} rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}>
                <boxGeometry args={[0.08, 0.1, 0.08]} />
                {darkMetal}
              </mesh>
            ))}
          </group>
        )

      case 'lightbulb':
        // Neon Idea Bulb
        return (
          <group>
            {/* Glass bulb */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.9}
                roughness={0}
                thickness={0.1}
              />
            </mesh>
            {/* Filament glow - Brain shape? Or just complex filament */}
            <mesh position={[0, 0.1, 0]}>
              <torusKnotGeometry args={[0.06, 0.02, 64, 8]} />
              <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} toneMapped={false} />
            </mesh>
            {/* Base */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.12, 16]} />
              {darkMetal}
            </mesh>
          </group>
        )

      case 'atom':
        // Quantum Atom
        return (
          <group>
            {/* Nucleus */}
            <mesh>
              <sphereGeometry args={[0.08, 24, 24]} />
              {neonBlue}
            </mesh>
            {/* Orbit 1 */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.3, 0.01, 8, 48]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            {/* Orbit 2 */}
            <mesh rotation={[Math.PI / 2.5, 0, Math.PI / 4]}>
              <torusGeometry args={[0.3, 0.01, 8, 48]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            {/* Electrons */}
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              {neonPurple}
            </mesh>
            <mesh position={[-0.15, 0.26, 0]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              {neonPink}
            </mesh>
          </group>
        )

      case 'pencil':
        // Digital Stylus
        return (
          <group rotation={[0, 0, Math.PI / 6]}>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glow Strip */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.4, 32]} />
              <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={1} wireframe />
            </mesh>
            {/* Tip */}
            <mesh position={[0, -0.3, 0]}>
              <coneGeometry args={[0.04, 0.1, 32]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
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

// Main component with Dark & Deep Background
export default function FullPageBackground3D() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#050b14]">
      {/* Rich Graduate Background: Darker at bottom, lighter at top (Hero) for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111827] via-[#050b14] to-[#020617] opacity-100" />
      {/* Radial accent for central focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(56,189,248,0.08),_transparent_70%)]" />
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
