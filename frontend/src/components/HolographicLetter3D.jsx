import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function HolographicDocument({ isGenerating = false }) {
  const meshRef = useRef();
  const quillRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.2;
      meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
    }
    if (quillRef.current) {
      // Writing stylus motion
      quillRef.current.position.x = Math.sin(t * (isGenerating ? 4 : 1.5)) * 0.8;
      quillRef.current.position.y = Math.cos(t * (isGenerating ? 4 : 1.5)) * 0.6;
    }
  });

  return (
    <group ref={meshRef}>
      {/* 3D Letter Manuscript */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 2.8, 0.04]} />
        <meshStandardMaterial
          color="#090d16"
          metalness={0.7}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Holographic Glowing Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.02, 2.82, 0.05)]} />
        <lineBasicMaterial color={isGenerating ? "#c084fc" : "#38bdf8"} linewidth={2} />
      </lineSegments>

      {/* Simulated Paragraph Ribbons */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.03]}>
          <planeGeometry args={[1.5, 0.07]} />
          <meshBasicMaterial color={isGenerating ? "#818cf8" : "#334155"} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* 3D AI Synthesis Stylus Beam */}
      <group ref={quillRef} position={[0, 0, 0.1]}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={isGenerating ? "#00f5a0" : "#38bdf8"} />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.015, 0.005, 0.15]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function FloatingInkNodes({ count = 25 }) {
  const pointsRef = useRef();

  const particlePos = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
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
        color="#c084fc"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export default function HolographicLetter3D({ isGenerating = false, className = "h-44 w-full" }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass-panel border border-purple-500/20 ${className}`}>
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 dark:border-purple-500/30 text-[11px] shadow-sm">
        <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-purple-500 animate-ping' : 'bg-cyan-500'}`} />
        <span className="font-mono text-gray-800 dark:text-purple-300 font-medium">
          {isGenerating ? 'Drafting Tailored Letter...' : 'Document Synthesis Engine'}
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} color="#c084fc" intensity={1.5} />
        <pointLight position={[-3, -3, -3]} color="#38bdf8" intensity={1.2} />

        <Float speed={2} rotationIntensity={0.25} floatIntensity={0.4}>
          <HolographicDocument isGenerating={isGenerating} />
        </Float>

        <FloatingInkNodes count={25} />
      </Canvas>
    </div>
  );
}
