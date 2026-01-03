import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const Orb = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        // Subtle rotation
        meshRef.current.rotation.x = t * 0.1;
        meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>
    </Float>
  );
};

interface ThreeOrbProps {
    className?: string;
    color?: string;
}

const ThreeOrb: React.FC<ThreeOrbProps> = ({ className = "absolute top-0 right-0 w-64 h-64 opacity-50 pointer-events-none", color = "#818cf8" }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 3] }} gl={{ alpha: true }}>
        {/* @ts-ignore */}
        <ambientLight intensity={0.8} />
        {/* @ts-ignore */}
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Orb color={color} />
      </Canvas>
    </div>
  );
};

export default ThreeOrb;