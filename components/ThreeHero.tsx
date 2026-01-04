// @ts-nocheck
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, Stars, Sparkles, MeshDistortMaterial, Torus, Tetrahedron, Box, Octahedron, Icosahedron } from '@react-three/drei';
// Corrected: import from 'three' instead of 'this'
import * as THREE from 'three';
import { useTheme } from '../App';

const EducationalScene = ({ isDark }) => {
  const { viewport, mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const globeRef = useRef<THREE.Mesh>(null!);
  const atomRingRef = useRef<THREE.Mesh>(null!);
  const mathShapesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / (maxScroll || 1), 1);
    const isMobile = viewport.width < 7;

    if (groupRef.current) {
        const baseRotY = t * 0.1;
        if (isMobile) {
            groupRef.current.position.y = THREE.MathUtils.lerp(0, -2, scrollProgress);
            groupRef.current.rotation.x = scrollProgress * Math.PI;
            groupRef.current.rotation.y = baseRotY + scrollProgress * 1;
        } else {
            const x = (mouse.x * viewport.width) / 100;
            const y = (mouse.y * viewport.height) / 100;
            const targetX = (viewport.width / 3.5) + x * 0.5;
            const targetY = y * 0.5;
            const scrollOffsetX = scrollProgress * -2; 
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX + scrollOffsetX, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
            groupRef.current.rotation.y = baseRotY + (scrollProgress * Math.PI * 1.5);
            groupRef.current.position.z = THREE.MathUtils.lerp(0, -3, scrollProgress);
        }
    }

    if (globeRef.current) {
        globeRef.current.rotation.y -= 0.005;
        const scalePulse = 1 + Math.sin(t * 2) * 0.05 + (scrollProgress * 0.5);
        globeRef.current.scale.setScalar(scalePulse);
    }

    if (atomRingRef.current) {
        atomRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.5 + (scrollProgress * 2);
        atomRingRef.current.rotation.y = t * 0.4;
    }
    
    if (mathShapesRef.current) {
        mathShapesRef.current.rotation.z = -t * 0.15 - (scrollProgress * 2);
        mathShapesRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
        const expansion = 1 + scrollProgress * 1.5;
        mathShapesRef.current.scale.setScalar(expansion);
    }
  });

  const isDesktop = viewport.width > 7;
  const scale = isDesktop ? 2.4 : 1.5;
  const initialPos: [number, number, number] = isDesktop ? [viewport.width / 3.5, 0, 0] : [0, 0.5, 0];

  return (
    <group ref={groupRef} position={initialPos} scale={scale}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group>
                <Sphere ref={globeRef} args={[1, 24, 24]}>
                    <meshStandardMaterial 
                        color={isDark ? "#00E5FF" : "#3b82f6"} 
                        wireframe 
                        transparent 
                        opacity={0.15} 
                        side={THREE.DoubleSide}
                    />
                </Sphere>
                <Sphere args={[0.8, 32, 32]}>
                     <MeshDistortMaterial 
                        color={isDark ? "#020617" : "#ffffff"} 
                        emissive={isDark ? "#0044ff" : "#60a5fa"}
                        emissiveIntensity={1.5}
                        distort={0.4}
                        speed={3}
                        roughness={0.2}
                        metalness={0.8}
                     />
                </Sphere>
            </group>
            <Torus ref={atomRingRef} args={[1.7, 0.02, 64, 100]} rotation={[1.5, 0, 0]}>
                <meshStandardMaterial color={isDark ? "#00E5FF" : "#3b82f6"} emissive={isDark ? "#00E5FF" : "#3b82f6"} emissiveIntensity={2} toneMapped={false} />
            </Torus>
             <Torus args={[2.1, 0.02, 64, 100]} rotation={[0, 1.5, 0.5]}>
                <meshStandardMaterial color={isDark ? "#8b5cf6" : "#a855f7"} emissive={isDark ? "#8b5cf6" : "#a855f7"} emissiveIntensity={2} toneMapped={false} />
            </Torus>
            <group ref={mathShapesRef}>
                <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                    <Tetrahedron args={[0.25]} position={[2, 1, 0]}>
                         <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Tetrahedron>
                </Float>
                <Float speed={4} rotationIntensity={3} floatIntensity={1}>
                    <Box args={[0.35, 0.35, 0.35]} position={[-1.5, -1.2, 0.8]}>
                        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Box>
                </Float>
                <Float speed={6} rotationIntensity={1} floatIntensity={2}>
                    <Octahedron args={[0.25]} position={[0, 2.2, -0.5]}>
                        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Octahedron>
                </Float>
                 <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                    <Icosahedron args={[0.2]} position={[-1.8, 1.5, -1]}>
                        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Icosahedron>
                </Float>
            </group>
            <Sparkles count={150} scale={6} size={4} speed={0.4} opacity={0.6} color={isDark ? "#00E5FF" : "#3b82f6"} />
        </Float>
    </group>
  );
};

const ThreeHero: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
        {isDark ? (
            <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#00E5FF]/10 via-[#020617] to-[#020617] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#6366f1]/10 via-transparent to-transparent pointer-events-none" />
            </>
        ) : (
             <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 pointer-events-none opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent pointer-events-none opacity-50" />
             </>
        )}
        
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
            <fog attach="fog" args={[isDark ? '#020617' : '#f8fafc', 5, 25]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color={isDark ? "#00E5FF" : "#3b82f6"} />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#c084fc" />
            <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={1} color="#ffffff" />
            <EducationalScene isDark={isDark} />
            {isDark && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeHero;