import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Kinetic Ring for S-T-A-R
function KineticRing({ radius, speed, color, tilt, isSpinning = false }) {
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      const currentSpeed = isSpinning ? speed * 3.5 : speed;
      ringRef.current.rotation.x = tilt + Math.sin(t * currentSpeed) * 0.2;
      ringRef.current.rotation.y += currentSpeed * 0.02;
    }
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSpinning ? 1.2 : 0.4}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

// 3D Hexagonal Core representing Quantifiable Impact
function ImpactCore({ isSpinning = false }) {
  const coreRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * (isSpinning ? 2.5 : 0.6);
      coreRef.current.rotation.z = t * (isSpinning ? 1.8 : 0.4);
      const scale = isSpinning ? 1 + Math.sin(t * 8) * 0.15 : 1 + Math.sin(t * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={coreRef}>
      <octahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial
        color={isSpinning ? "#00f5a0" : "#38bdf8"}
        emissive={isSpinning ? "#00f5a0" : "#0284c7"}
        emissiveIntensity={isSpinning ? 1.5 : 0.6}
        roughness={0.1}
        wireframe
      />
    </mesh>
  );
}

// Floating STAR Spark Particles
function StarParticles({ count = 30 }) {
  const pointsRef = useRef();

  const particlePos = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlePos.length / 3}
          array={particlePos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f5a0"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export default function StarReactor3D({ isRewriting = false, className = "h-40 w-full" }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 ${className}`}>
      {/* Real-time Status Badge */}
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 dark:border-cyan-500/30 text-[11px] shadow-sm">
        <span className={`w-2 h-2 rounded-full ${isRewriting ? 'bg-emerald-500 animate-ping' : 'bg-cyan-500'}`} />
        <span className="font-mono text-gray-800 dark:text-cyan-300 font-medium">
          {isRewriting ? 'Synthesizing Impact Metrics...' : 'STAR Impact Framework Active'}
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 3.6], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} color="#38bdf8" intensity={1.5} />
        <pointLight position={[-3, -3, -3]} color="#00f5a0" intensity={1.5} />

        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          {/* Concentric rings for Situation, Task, Action, Result */}
          <KineticRing radius={1.4} speed={0.8} color="#38bdf8" tilt={0.3} isSpinning={isRewriting} />
          <KineticRing radius={1.15} speed={-1.2} color="#00f5a0" tilt={-0.4} isSpinning={isRewriting} />
          <KineticRing radius={0.9} speed={1.5} color="#c084fc" tilt={0.6} isSpinning={isRewriting} />

          <ImpactCore isSpinning={isRewriting} />
        </Float>

        <StarParticles count={25} />
      </Canvas>
    </div>
  );
}
