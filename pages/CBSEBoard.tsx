import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Palette, Microscope, CheckCircle2, Zap } from 'lucide-react';
import Footer from '../components/Footer';

const CBSEScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) { group.current.rotation.y = Math.sin(t * 0.1) * 0.2; }
  });
  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Box args={[2, 2.5, 0.4]} position={[0, 0, 0]}><meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.2} emissive="#00E5FF" emissiveIntensity={0.2} /></Box>
        <Sphere args={[0.3, 32, 32]} position={[1.8, 1.2, 0.5]}><MeshDistortMaterial color="#f472b6" speed={3} distort={0.4} /></Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </group>
  );
};

const CBSEBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0"><Canvas><Suspense fallback={null}><PerspectiveCamera makeDefault position={[0, 0, 8]} /><ambientLight intensity={0.5} /><CBSEScene /><Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /></Suspense></Canvas></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-white/5 mb-8 backdrop-blur-xl"><Zap size={14} className="text-[#00E5FF]" /><span className="text-white/40 text-[9px] font-bold tracking-[0.4em] uppercase">National Excellence</span></div>
                <h1 className="text-6xl md:text-[10rem] font-light serif-font uppercase mb-8 leading-tight luxury-text-gradient">CBSE Board</h1>
                <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto tracking-widest uppercase font-light"> NCERT-aligned coaching for future academic leadership.</p>
            </motion.div>
        </div>
      </section>

      <section className="py-40 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[ { icon: Palette, title: "Primary", age: "1st - 5th", desc: "Interactive literacy and numeracy ignite curiosity." }, { icon: Microscope, title: "Middle", age: "6th - 8th", desc: "Conceptual depth prepares for critical thinking." } ].map((wing, i) => (
                <div key={i} className="p-12 bg-white/5 border border-white/5 rounded-[50px] group transition-all hover:border-premium-accent/40">
                    <wing.icon size={48} className="text-premium-accent mb-10" />
                    <h3 className="text-3xl serif-font uppercase mb-2">{wing.title}</h3>
                    <p className="text-premium-accent text-[10px] font-black uppercase tracking-widest mb-8">{wing.age}</p>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-bold leading-relaxed">{wing.desc}</p>
                </div>
            ))}
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default CBSEBoard;