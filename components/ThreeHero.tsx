// @ts-nocheck
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const CinematicHorizon = () => {
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.1;
        coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <Sphere ref={coreRef} args={[3, 128, 128]}>
                <MeshDistortMaterial 
                    color="#C5A059" 
                    emissive="#1a0505"
                    emissiveIntensity={1.2}
                    distort={0.25}
                    speed={2}
                    roughness={0.1}
                    metalness={0.9}
                />
            </Sphere>
        </Float>
        <Sparkles count={80} scale={15} size={2} speed={0.2} opacity={0.4} color="#C5A059" />
    </group>
  );
};

const ThreeHero: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setWebglSupported(!!gl);
      } catch (e) {
        setWebglSupported(false);
      }
    };
    check();
  }, []);

  if (webglSupported === false) {
    return (
      <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a0a0a] via-[#050505] to-[#1a0505] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 bg-premium-black">
      {webglSupported && (
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 45 }} 
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.setClearColor('#050505');
          }}
          onError={() => setWebglSupported(false)}
        >
          <Suspense fallback={null}>
              <fog attach="fog" args={['#050505', 8, 30]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#fff" />
              <spotLight position={[-10, 10, 10]} angle={0.4} penumbra={1} intensity={3} color="#C5A059" />
              <CinematicHorizon />
              <Environment preset="night" />
              <Stars radius={100} depth={50} count={3000} factor={6} saturation={0} fade speed={1} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default ThreeHero;