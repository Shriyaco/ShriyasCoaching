// @ts-nocheck
import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const CinematicHorizon = () => {
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.05;
        coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <Sphere ref={coreRef} args={[3, 128, 128]}>
                <MeshDistortMaterial 
                    color="#080808" 
                    emissive="#1a0505"
                    emissiveIntensity={0.5}
                    distort={0.2}
                    speed={1}
                    roughness={0}
                    metalness={1}
                />
            </Sphere>
        </Float>
        <Sparkles count={50} scale={10} size={1} speed={0.1} opacity={0.2} color="#ffffff" />
    </group>
  );
};

const ThreeHero: React.FC = () => {
  // Synchronous WebGL support check to prevent crashing before first paint
  const [webglSupported] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  });

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-black to-[#0a0a0a] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 bg-premium-black">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }} 
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor('#050505');
        }}
        onError={(e) => {
           console.warn("WebGL initialization failed", e);
        }}
      >
        <Suspense fallback={null}>
            <fog attach="fog" args={['#050505', 8, 30]} />
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#fff" />
            <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} color="#C5A059" />
            <CinematicHorizon />
            <Environment preset="night" />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeHero;