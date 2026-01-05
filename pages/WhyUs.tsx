import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, MeshWobbleMaterial, TorusKnot, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Heart, Brain, Zap, GraduationCap, Users, Sparkles, Quote } from 'lucide-react';
import Footer from '../components/Footer';

const WisdomScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = t * 0.1;
        group.current.position.y = Math.sin(t * 0.5) * 0.2;
    }
  });
  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
        <Cylinder args={[1.2, 1.5, 4, 16]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#6366f1" metalness={0.9} roughness={0.1} wireframe emissive="#4f46e5" emissiveIntensity={0.5} />
        </Cylinder>
        <TorusKnot args={[0.8, 0.2, 64, 16]} position={[0, 0, 0]}>
           <MeshWobbleMaterial color="#00E5FF" speed={2} factor={0.6} metalness={0.8} />
        </TorusKnot>
      </Float>
      <Environment preset="night" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
    </group>
  );
};

const WhyUs: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl', { powerPreference: 'high-performance' }) || 
                 canvas.getContext('experimental-webgl', { powerPreference: 'high-performance' });
      setWebglSupported(!!gl);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const pillars = [
    { id: "01", title: "Gurukul Heritage", desc: "Mentor-shishya relationship where character and values are taught alongside subjects. Max 12 students per batch.", icon: Heart, color: "text-rose-400" },
    { id: "02", title: "Life-long Learning", desc: "We prioritize 'Learning for Life' over memorization. Our 'Why' and 'How' approach fosters analytical thinking.", icon: Brain, color: "text-indigo-400" },
    { id: "03", title: "Customized Notes", desc: "Tailored educational material for CBSE, ICSE, and State Boards prepared by our core academic council.", icon: GraduationCap, color: "text-cyan-400" },
    { id: "04", title: "Modern SMS Tech", desc: "Live portal for homework, exams, and attendance. Total transparency for parents through technology.", icon: Zap, color: "text-amber-400" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent selection:text-black overflow-x-hidden">
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas 
               gl={{ antialias: false, powerPreference: 'high-performance' }}
               onError={() => setWebglSupported(false)}
            >
              <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
                  <WisdomScene />
                  <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-indigo-950/30 to-black">
                <div className="pseudo-3d-orb opacity-30 blur-[4px] scale-[3]" style={{ background: 'radial-gradient(circle at 30% 30%, #6366f1, #4f46e5 20%, #1a1a2e 50%, #000 100%)' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-white/10 mb-8 backdrop-blur-xl">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-white/40 text-[9px] font-black tracking-[0.4em] uppercase">The Difference</span>
                </div>
                <h1 className="text-6xl md:text-[9rem] font-light serif-font uppercase mb-8 leading-[0.85] tracking-tight luxury-text-gradient">
                    Deep <br /> Integrity.
                </h1>
                <p className="text-sm md:text-lg text-white/50 max-w-3xl mx-auto leading-relaxed tracking-[0.2em] uppercase font-bold">
                   Combining ancient wisdom with the tech of tomorrow.
                </p>
            </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 relative px-6">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2 className="text-4xl md:text-7xl font-light serif-font uppercase tracking-tight mb-8 leading-none">
                        Our <br/><span className="text-premium-accent">Roots</span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/40 mb-10 font-light leading-loose max-w-lg">
                        Building character and discipline alongside academic excellence. Every child receives 1-on-1 guidance during critical years.
                    </p>
                    <div className="flex gap-6 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-premium-accent/20 transition-all max-w-md">
                        <div className="w-14 h-14 bg-premium-accent/10 rounded-2xl flex items-center justify-center text-premium-accent shrink-0"><Users size={28}/></div>
                        <div><h4 className="font-bold text-lg mb-1 serif-font uppercase tracking-wider">Shishya Ratio</h4><p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Max 12 students per batch.</p></div>
                    </div>
                </motion.div>
                <div className="relative">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-indigo-950/20 to-black rounded-[60px] p-12 md:p-16 text-white border border-white/5 shadow-2xl relative z-10 overflow-hidden">
                        <Quote size={80} className="text-white/5 absolute -top-4 -left-4" />
                        <p className="text-2xl md:text-4xl font-light serif-font leading-tight italic relative z-10 text-white/80">
                            "To transform each student by providing a culture of excellence and human values."
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-premium-black relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {pillars.map((pillar, i) => (
                      <motion.div key={i} whileHover={{ y: -5 }} className="p-10 bg-white/[0.02] rounded-[40px] border border-white/5 hover:border-premium-accent/20 transition-all group relative overflow-hidden">
                          <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 ${pillar.color}`}><pillar.icon size={32} /></div>
                          <h3 className="text-2xl font-bold serif-font uppercase mb-4 tracking-tight">{pillar.title}</h3>
                          <p className="text-xs text-white/40 uppercase tracking-[0.1em] font-bold leading-relaxed">{pillar.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default WhyUs;