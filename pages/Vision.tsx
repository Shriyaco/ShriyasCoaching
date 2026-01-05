import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Target, Shield, Heart, Sparkles, BookOpen, Quote } from 'lucide-react';
import Footer from '../components/Footer';

const VisionScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = t * 0.15;
    }
  });
  return (
    <group ref={group}>
      <Float speed={3} rotationIntensity={1} floatIntensity={1.5}>
        <Torus args={[2.5, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={3} toneMapped={false} />
        </Torus>
        <Sphere args={[0.8, 64, 64]}>
          <MeshDistortMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} distort={0.4} speed={4} roughness={0} metalness={1} />
        </Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={3} far={5} />
    </group>
  );
};

const Vision: React.FC = () => {
  const missionPillars = [
    { title: "Empowering Minds", text: "Ensuring deep conceptual understanding across all boards.", icon: BookOpen, color: "text-blue-400" },
    { title: "Holistic Growth", text: "Focusing on 360-degree intellectual and ethical development.", icon: Heart, color: "text-rose-400" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0"><Canvas><Suspense fallback={null}><PerspectiveCamera makeDefault position={[0, 0, 8]} /><ambientLight intensity={0.5} /><pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" /><VisionScene /><Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /></Suspense></Canvas></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}>
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/10 border border-white/5 mb-12 backdrop-blur-xl"><Sparkles size={16} className="text-cyan-400" /><span className="text-white/40 text-[9px] font-bold tracking-[0.5em] uppercase">The Visionary Core</span></div>
                <h1 className="text-7xl md:text-[11rem] font-light serif-font uppercase mb-12 leading-[0.8] tracking-tight luxury-text-gradient">Enlighten <br /> Future.</h1>
                <div className="relative max-w-3xl mx-auto"><Quote size={60} className="absolute -top-10 -left-12 text-white/5" /><p className="text-xl md:text-3xl text-white/50 leading-relaxed font-light italic">"To be the learning center that bridges ancient wisdom with global excellence."</p></div>
            </motion.div>
        </div>
      </section>

      <section className="py-40 relative px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {missionPillars.map((pillar, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }} className="flex gap-10 p-12 bg-white/5 border border-white/5 rounded-[50px] transition-all group">
                      <div className={`shrink-0 w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center ${pillar.color}`}><pillar.icon size={48} strokeWidth={1} /></div>
                      <div><h4 className="text-2xl font-light serif-font uppercase mb-4 tracking-wider">{pillar.title}</h4><p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold leading-relaxed">{pillar.text}</p></div>
                  </motion.div>
              ))}
          </div>
      </section>

      <section className="py-40 bg-white text-premium-black rounded-[100px] mx-4 md:mx-10 overflow-hidden mb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-7xl md:text-[9rem] font-black leading-none tracking-tighter mb-20 opacity-5">VALUES</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10 -mt-32">
                   {[ { name: "Excellence", icon: Target }, { name: "Integrity", icon: Shield }, { name: "Curiosity", icon: Target }, { name: "Compassion", icon: Heart } ].map((v, i) => (
                       <div key={i} className="flex flex-col items-center group">
                           <div className="w-20 h-20 bg-premium-black text-white rounded-full flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-xl"><v.icon size={32} /></div>
                           <p className="text-xs font-black uppercase tracking-widest">{v.name}</p>
                       </div>
                   ))}
              </div>
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default Vision;