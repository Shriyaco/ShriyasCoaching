
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Target, Shield, Heart, Sparkles, BookOpen, Quote, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { db } from '../services/db';
import SEO from '../components/SEO';

const VisionScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = t * 0.1;
    }
  });
  return (
    // @ts-ignore
    <group ref={group} position={[0, 0, -2]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Torus args={[3, 0.02, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          {/* @ts-ignore */}
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
        </Torus>
        <Sphere args={[0.5, 64, 64]}>
          {/* @ts-ignore */}
          <MeshDistortMaterial color="#ffffff" emissive="#444444" emissiveIntensity={0.5} distort={0.3} speed={2} roughness={0.1} metalness={1} />
        </Sphere>
      </Float>
      <Environment preset="city" />
      {/* @ts-ignore */}
      <ContactShadows position={[0, -4, 0]} opacity={0.2} scale={20} blur={3} far={5} />
    </group>
  );
};

const Vision: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [content, setContent] = useState<any>({
      heroTitle: 'Enlighten Future.',
      quoteText: "To be the learning center that bridges ancient wisdom with global excellence.",
      seoTitle: 'Our Vision',
      seoDesc: 'Empowering minds and fostering holistic growth.',
      seoKeywords: 'vision, mission, holistic growth, empowerment'
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebglSupported(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      setWebglSupported(false);
    }

    const loadContent = async () => {
        const data = await db.getPageContent('vision');
        if (data) setContent((prev:any) => ({ ...prev, ...data }));
    };
    loadContent();
  }, []);

  const missionPillars = [
    { title: "Empowering Minds", text: "Ensuring deep conceptual understanding across all boards.", icon: BookOpen, color: "text-blue-400" },
    { title: "Holistic Growth", text: "Focusing on 360-degree intellectual and ethical development.", icon: Heart, color: "text-rose-400" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white overflow-x-hidden">
      <SEO title={content.seoTitle} description={content.seoDesc} keywords={content.seoKeywords} />
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas onError={() => setWebglSupported(false)}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                {/* @ts-ignore */}
                <ambientLight intensity={0.5} />
                {/* @ts-ignore */}
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

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/5 border border-white/10 mb-8 md:mb-12 backdrop-blur-xl">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-white/60 text-[9px] font-black tracking-[0.5em] uppercase">The Visionary Core</span>
                </div>
                
                <h1 className="text-5xl md:text-[9rem] font-light serif-font uppercase mb-8 md:mb-12 leading-[1.1] tracking-tight luxury-text-gradient whitespace-pre-line">
                  {content.heroTitle}
                </h1>
                
                <div className="relative max-w-2xl mx-auto px-4">
                    <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-light italic serif-font">
                      "{content.quoteText}"
                    </p>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Pillars Section - Tightened */}
      <section className="py-24 md:py-32 relative px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {missionPillars.map((pillar, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }} 
                    className="flex flex-col md:flex-row gap-6 p-8 md:p-10 bg-white/[0.03] border border-white/5 rounded-[32px] md:rounded-[40px] transition-all group shadow-sm"
                  >
                      <div className={`shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center ${pillar.color}`}>
                        <pillar.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold serif-font uppercase mb-2 tracking-wider">{pillar.title}</h4>
                        <p className="text-xs md:text-sm text-white/40 uppercase tracking-[0.1em] font-bold leading-relaxed">{pillar.text}</p>
                      </div>
                  </motion.div>
              ))}
          </div>
      </section>

      {/* Redesigned Values Container - Exact match to user screenshot layout */}
      <section className="py-20 md:py-32 px-4 md:px-10 mb-20">
          <div className="max-w-4xl mx-auto bg-white text-premium-black rounded-[60px] md:rounded-[100px] overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.4)] py-20 md:py-32">
              
              {/* Background watermark text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <h2 className="text-[12rem] md:text-[22rem] font-black tracking-tighter opacity-[0.03] transform scale-125 md:scale-110">VALUES</h2>
              </div>

              <div className="grid grid-cols-2 gap-y-16 md:gap-y-24 relative z-10">
                   {[ 
                      { name: "Excellence", icon: Target }, 
                      { name: "Integrity", icon: Shield }, 
                      { name: "Curiosity", icon: HelpCircle }, 
                      { name: "Compassion", icon: Heart } 
                   ].map((v, i) => (
                       <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                           <div className="w-24 h-24 md:w-32 md:h-32 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500">
                             <v.icon className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1.5} />
                           </div>
                           <h4 className="text-sm md:text-lg font-black uppercase tracking-[0.3em] font-sans">{v.name}</h4>
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
