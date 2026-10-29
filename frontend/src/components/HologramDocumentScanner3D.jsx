import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Animated Document Mesh with Laser Scanning Plane
function DocumentModel({ isScanning = false, hasDocument = false }) {
  const laserRef = useRef();
  const docRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (docRef.current) {
      docRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      docRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
    }

    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(t * (isScanning ? 3.5 : 1.5)) * 1.5;
    }
  });

  return (
    <group ref={docRef} position={[0, 0, 0]}>
      {/* 3D Master Document Page */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.1, 3.0, 0.05]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Glowing Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.12, 3.02, 0.06)]} />
        <lineBasicMaterial
          color={isScanning ? "#00f5a0" : hasDocument ? "#22c55e" : "#38bdf8"}
          linewidth={2}
        />
      </lineSegments>

      {/* Document Text Line Simulation Meshes */}
      {[-0.9, -0.5, -0.1, 0.3, 0.7, 1.1].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.035]}>
          <planeGeometry args={[1.5, 0.08]} />
          <meshBasicMaterial color={hasDocument ? "#1e293b" : "#334155"} />
        </mesh>
      ))}

      {/* Holographic Laser Scanner Beam */}
      <group ref={laserRef} position={[0, 0, 0.06]}>
        <mesh>
          <planeGeometry args={[2.4, 0.04]} />
          <meshBasicMaterial
            color={isScanning ? "#00f5a0" : "#38bdf8"}
            transparent
            opacity={isScanning ? 1.0 : 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, -0.12, 0]}>
          <planeGeometry args={[2.3, 0.25]} />
          <meshBasicMaterial
            color={isScanning ? "#00f5a0" : "#38bdf8"}
            transparent
            opacity={isScanning ? 0.35 : 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

function FloatingParticles({ count = 30 }) {
  const points = useRef();

  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#38bdf8"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export default function HologramDocumentScanner3D({
  isScanning = false,
  hasDocument = false,
  className = "h-48 md:h-56 w-full"
}) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 ${className}`}>
      {/* Visual Overlay Badge */}
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 dark:border-cyan-500/30 text-[11px] shadow-sm">
        <span
          className={`w-2 h-2 rounded-full ${
            isScanning ? 'bg-emerald-500 animate-ping' : hasDocument ? 'bg-emerald-500' : 'bg-cyan-500'
          }`}
        />
        <span className="font-mono text-gray-800 dark:text-cyan-300 font-medium">
          {isScanning
            ? 'Scanning Document: Extracting Text (PDFBox/POI)...'
            : hasDocument
            ? 'Document: Verified & Extracted'
            : 'Document Ready for Analysis'}
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} color="#00f5a0" intensity={0.8} />

        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <DocumentModel isScanning={isScanning} hasDocument={hasDocument} />
        </Float>

        <FloatingParticles count={30} />
      </Canvas>
    </div>
  );
}
