import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function OrbitingSphere() {
  const meshRef = useRef();
  const wireframeRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = t * 0.15;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = -t * 0.1;
      wireframeRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      {/* Outer Wireframe Sphere */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color="#00f5a0"
          emissive="#00f5a0"
          emissiveIntensity={0.4}
          roughness={0.3}
          wireframe
        />
      </mesh>
    </group>
  );
}

export default function KeywordParticleCloud3D({ className = "h-48 md:h-60 w-full" }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass-panel border border-emerald-500/20 ${className}`}>
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-500/30 text-xs shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-gray-800 dark:text-emerald-300 uppercase tracking-wider font-medium">
          ATS Skill Match Radar
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 3.8], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} color="#38bdf8" intensity={1.5} />
        <pointLight position={[-4, -4, -4]} color="#00f5a0" intensity={1.2} />
        <OrbitingSphere />
      </Canvas>
    </div>
  );
}
