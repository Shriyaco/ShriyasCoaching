import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, Stars, Sparkles, MeshDistortMaterial, Torus, Tetrahedron, Box, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const EducationalScene = () => {
  const { viewport, mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  
  // Independent rotation refs
  const globeRef = useRef<THREE.Mesh>(null!);
  const atomRingRef = useRef<THREE.Mesh>(null!);
  const mathShapesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scrollY = window.scrollY;
    
    if (groupRef.current) {
        // Scroll interaction: Rotate the entire system based on scroll
        const scrollRotation = scrollY * 0.002;

        // Gentle floating rotation + scroll influence
        groupRef.current.rotation.y = (t * 0.1) + scrollRotation;
        
        // Mouse Parallax
        const x = (mouse.x * viewport.width) / 100;
        const y = (mouse.y * viewport.height) / 100;
        
        // Smooth responsive positioning
        const targetX = (viewport.width > 7 ? viewport.width / 3.5 : 0) + x * 0.5;
        const targetY = y * 0.5;
        
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    }

    // Animate Globe (The Nucleus of Knowledge)
    if (globeRef.current) {
        globeRef.current.rotation.y -= 0.005;
        globeRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }

    // Animate Atom Ring
    if (atomRingRef.current) {
        atomRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.5;
        atomRingRef.current.rotation.y = t * 0.4;
    }
    
    // Animate Math Shapes Container
    if (mathShapesRef.current) {
        mathShapesRef.current.rotation.z = -t * 0.15;
        mathShapesRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
  });

  const isDesktop = viewport.width > 7;
  // Scale adjustment for mobile/desktop
  const scale = isDesktop ? 2.4 : 1.7;
  const initialPos: [number, number, number] = isDesktop ? [viewport.width / 3.5, 0, 0] : [0, 0, 0];

  return (
    <group ref={groupRef} position={initialPos} scale={scale}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            
            {/* CENTRAL KNOWLEDGE CORE */}
            <group>
                {/* Wireframe Globe representing Global Knowledge */}
                <Sphere ref={globeRef} args={[1, 24, 24]}>
                    <meshStandardMaterial 
                        color="#00E5FF" 
                        wireframe 
                        transparent 
                        opacity={0.2} 
                        side={THREE.DoubleSide}
                    />
                </Sphere>
                {/* Inner Energy Source */}
                <Sphere args={[0.8, 32, 32]}>
                     <MeshDistortMaterial 
                        color="#020617" 
                        emissive="#0044ff"
                        emissiveIntensity={1.2}
                        distort={0.3}
                        speed={2}
                        roughness={0.2}
                     />
                </Sphere>
            </group>

            {/* SCIENCE: Atom-like Orbital Rings */}
            <Torus ref={atomRingRef} args={[1.7, 0.02, 32, 100]} rotation={[1.5, 0, 0]}>
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} toneMapped={false} />
            </Torus>
             <Torus args={[2.1, 0.02, 32, 100]} rotation={[0, 1.5, 0.5]}>
                <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} toneMapped={false} />
            </Torus>

            {/* MATH: Orbiting Platonic Solids */}
            <group ref={mathShapesRef}>
                {/* Tetrahedron (Geometry/Trigonometry) */}
                <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                    <Tetrahedron args={[0.25]} position={[2, 1, 0]}>
                         <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} roughness={0.1} />
                    </Tetrahedron>
                </Float>
                
                {/* Cube (Algebra/Volume) */}
                <Float speed={4} rotationIntensity={3} floatIntensity={1}>
                    <Box args={[0.35, 0.35, 0.35]} position={[-1.5, -1.2, 0.8]}>
                        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} roughness={0.1} />
                    </Box>
                </Float>

                {/* Octahedron (Advanced Math) */}
                <Float speed={6} rotationIntensity={1} floatIntensity={2}>
                    <Octahedron args={[0.25]} position={[0, 2.2, -0.5]}>
                        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} roughness={0.1} />
                    </Octahedron>
                </Float>

                 {/* Icosahedron (Complexity) */}
                 <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                    <Icosahedron args={[0.2]} position={[-1.8, 1.5, -1]}>
                        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} roughness={0.1} />
                    </Icosahedron>
                </Float>
            </group>

            {/* Knowledge Particles */}
            <Sparkles count={100} scale={5} size={3} speed={0.4} opacity={0.5} color="#00E5FF" />
        </Float>
    </group>
  );
};

const ThreeHero: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020617]">
        {/* Complex Gradient Background Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#00E5FF]/20 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#6366f1]/20 via-transparent to-transparent pointer-events-none" />
        
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        {/* @ts-ignore */}
        <fog attach="fog" args={['#020617', 5, 25]} />
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
        {/* @ts-ignore */}
        <pointLight position={[-10, -10, -10]} intensity={1} color="#c084fc" />
        
        <EducationalScene />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default ThreeHero;