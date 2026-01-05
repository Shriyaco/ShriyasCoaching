import React, { useRef, Suspense, useState, useEffect } from 'react';
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
        group.current.rotation.y = t * 0.1;
    }
  });
  return (
    <group ref={group} position={[0, 0, -2]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Torus args={[3, 0.02, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
        </Torus>
        <Sphere args={[0.5, 64, 64]}>
          <MeshDistortMaterial color="#ffffff" emissive="#444444" emissiveIntensity={0.5} distort={0.3} speed={2} roughness={0.1} metalness={1} />
        </Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -4, 0]} opacity={0.2} scale={20} blur={3} far={5} />
    </group>
  );
};

const Vision: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebglSupported(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const missionPillars = [
    { title: "Empowering Minds", text: "Ensuring deep conceptual understanding across all boards.", icon: BookOpen, color: "text-blue-400" },
    { title: "Holistic Growth", text: "Focusing on 360-degree intellectual and ethical development.", icon: Heart, color: "text-rose-400" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        {/* Background 3D Layer with subtle overlay */}
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas onError={() => setWebglSupported(false)}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00E5FF" />
                <VisionScene />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-black to-black" />
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/5 border border-white/10 mb-8 md:mb-12 backdrop-blur-xl shadow-2xl">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-white/60 text-[9px] font-black tracking-[0.5em] uppercase">The Visionary Core</span>
                </div>
                
                <h1 className="text-5xl md:text-[9rem] font-light serif-font uppercase mb-8 md:mb-12 leading-[1.1] tracking-tight luxury-text-gradient drop-shadow-2xl">
                  Enlighten <br /> Future.
                </h1>
                
                <div className="relative max-w-2xl mx-auto px-4">
                    <Quote size={40} className="absolute -top-6 -left-4 text-white/5 md:size-[60px] md:-top-10 md:-left-12" />
                    <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-light italic serif-font">
                      "To be the learning center that bridges ancient wisdom with global excellence."
                    </p>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-32 md:py-48 relative px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {missionPillars.map((pillar, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }} 
                    className="flex flex-col md:flex-row gap-8 p-10 md:p-12 bg-white/[0.02] border border-white/5 rounded-[40px] md:rounded-[50px] transition-all group shadow-sm"
                  >
                      <div className={`shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[28px] md:rounded-[32px] flex items-center justify-center ${pillar.color} shadow-inner`}>
                        <pillar.icon size={40} md:size={48} strokeWidth={1} />
                      </div>
                      <div>
                        <h4 className="text-2xl md:text-3xl font-light serif-font uppercase mb-4 tracking-wider">{pillar.title}</h4>
                        <p className="text-xs md:text-sm text-white/40 uppercase tracking-[0.2em] font-bold leading-relaxed">{pillar.text}</p>
                      </div>
                  </motion.div>
              ))}
          </div>
      </section>

      {/* Values Section */}
      <section className="py-32 md:py-48 bg-white text-premium-black rounded-[60px] md:rounded-[100px] mx-4 md:mx-10 overflow-hidden mb-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-6xl md:text-[9rem] font-black leading-none tracking-tighter mb-20 opacity-5 select-none">VALUES</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10 -mt-24 md:-mt-32">
                   {[ { name: "Excellence", icon: Target }, { name: "Integrity", icon: Shield }, { name: "Curiosity", icon: Target }, { name: "Compassion", icon: Heart } ].map((v, i) => (
                       <div key={i} className="flex flex-col items-center group">
                           <div className="w-16 h-16 md:w-20 md:h-20 bg-premium-black text-white rounded-full flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-2xl">
                             <v.icon size={28} md:size={32} />
                           </div>
                           <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">{v.name}</p>
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