// @ts-nocheck
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
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    // Normalized scroll progress (0 to 1)
    const scrollProgress = Math.min(scrollY / (maxScroll || 1), 1);
    
    // Responsive Logic
    const isMobile = viewport.width < 7;

    if (groupRef.current) {
        // --- SCROLL INTERACTION ---
        
        // Base rotation from time
        const baseRotY = t * 0.1;
        
        if (isMobile) {
            // Mobile: Objects tumble forward/down as you scroll
            // Move object down so it stays somewhat visible or exits cleanly
            groupRef.current.position.y = THREE.MathUtils.lerp(0, -2, scrollProgress);
            
            // Rotate on X axis heavily on mobile for a "rolling" effect
            groupRef.current.rotation.x = scrollProgress * Math.PI;
            groupRef.current.rotation.y = baseRotY + scrollProgress * 1;
        } else {
            // Desktop: Parallax + Deep Rotation
            
            // Mouse Parallax (only on desktop)
            const x = (mouse.x * viewport.width) / 100;
            const y = (mouse.y * viewport.height) / 100;
            const targetX = (viewport.width / 3.5) + x * 0.5;
            const targetY = y * 0.5;
            
            // Move group slightly to the left as we scroll down to make room for content
            const scrollOffsetX = scrollProgress * -2; 
            
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX + scrollOffsetX, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
            
            // Rotate based on scroll
            groupRef.current.rotation.y = baseRotY + (scrollProgress * Math.PI * 1.5);
            
            // Slight Zoom out on scroll
            groupRef.current.position.z = THREE.MathUtils.lerp(0, -3, scrollProgress);
        }
    }

    // Animate Globe (The Nucleus of Knowledge)
    if (globeRef.current) {
        globeRef.current.rotation.y -= 0.005;
        // Pulse scale based on scroll
        const scalePulse = 1 + Math.sin(t * 2) * 0.05 + (scrollProgress * 0.5);
        globeRef.current.scale.setScalar(scalePulse);
    }

    // Animate Atom Ring
    if (atomRingRef.current) {
        atomRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.5 + (scrollProgress * 2);
        atomRingRef.current.rotation.y = t * 0.4;
    }
    
    // Animate Math Shapes Container - Expand outward on scroll
    if (mathShapesRef.current) {
        mathShapesRef.current.rotation.z = -t * 0.15 - (scrollProgress * 2);
        mathShapesRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
        
        // Explosion effect on scroll
        const expansion = 1 + scrollProgress * 1.5;
        mathShapesRef.current.scale.setScalar(expansion);
    }
  });

  const isDesktop = viewport.width > 7;
  // Base Scale
  const scale = isDesktop ? 2.4 : 1.5;
  const initialPos: [number, number, number] = isDesktop ? [viewport.width / 3.5, 0, 0] : [0, 0.5, 0];

  return (
    // @ts-ignore
    <group ref={groupRef} position={initialPos} scale={scale}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            
            {/* CENTRAL KNOWLEDGE CORE */}
            {/* @ts-ignore */}
            <group>
                {/* Wireframe Globe */}
                <Sphere ref={globeRef} args={[1, 24, 24]}>
                    {/* @ts-ignore */}
                    <meshStandardMaterial 
                        color="#00E5FF" 
                        wireframe 
                        transparent 
                        opacity={0.15} 
                        side={THREE.DoubleSide}
                    />
                </Sphere>
                {/* Inner Energy Source */}
                <Sphere args={[0.8, 32, 32]}>
                     <MeshDistortMaterial 
                        color="#020617" 
                        emissive="#0044ff"
                        emissiveIntensity={1.5}
                        distort={0.4}
                        speed={3}
                        roughness={0.2}
                        metalness={0.8}
                     />
                </Sphere>
            </group>

            {/* SCIENCE: Atom-like Orbital Rings */}
            <Torus ref={atomRingRef} args={[1.7, 0.02, 64, 100]} rotation={[1.5, 0, 0]}>
                {/* @ts-ignore */}
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} toneMapped={false} />
            </Torus>
             <Torus args={[2.1, 0.02, 64, 100]} rotation={[0, 1.5, 0.5]}>
                {/* @ts-ignore */}
                <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} toneMapped={false} />
            </Torus>

            {/* MATH: Orbiting Platonic Solids */}
            {/* @ts-ignore */}
            <group ref={mathShapesRef}>
                {/* Tetrahedron (Geometry/Trigonometry) */}
                <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                    <Tetrahedron args={[0.25]} position={[2, 1, 0]}>
                         {/* @ts-ignore */}
                         <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Tetrahedron>
                </Float>
                
                {/* Cube (Algebra/Volume) */}
                <Float speed={4} rotationIntensity={3} floatIntensity={1}>
                    <Box args={[0.35, 0.35, 0.35]} position={[-1.5, -1.2, 0.8]}>
                        {/* @ts-ignore */}
                        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Box>
                </Float>

                {/* Octahedron (Advanced Math) */}
                <Float speed={6} rotationIntensity={1} floatIntensity={2}>
                    <Octahedron args={[0.25]} position={[0, 2.2, -0.5]}>
                        {/* @ts-ignore */}
                        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Octahedron>
                </Float>

                 {/* Icosahedron (Complexity) */}
                 <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                    <Icosahedron args={[0.2]} position={[-1.8, 1.5, -1]}>
                        {/* @ts-ignore */}
                        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} roughness={0.1} metalness={0.5} />
                    </Icosahedron>
                </Float>
            </group>

            {/* Knowledge Particles */}
            <Sparkles count={150} scale={6} size={4} speed={0.4} opacity={0.6} color="#00E5FF" />
        </Float>
    </group>
  );
};

const ThreeHero: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020617]">
        {/* Complex Gradient Background Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#00E5FF]/10 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#6366f1]/10 via-transparent to-transparent pointer-events-none" />
        
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        {/* @ts-ignore */}
        <fog attach="fog" args={['#020617', 5, 25]} />
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
        {/* @ts-ignore */}
        <pointLight position={[-10, -10, -10]} intensity={1} color="#c084fc" />
        {/* @ts-ignore */}
        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={1} color="#ffffff" />
        
        <EducationalScene />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default ThreeHero;