
import React, { useRef, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Target, Compass, Lightbulb, Users, Shield, Sparkles, BookOpen, Heart, Rocket, Quote } from 'lucide-react';
import Footer from '../components/Footer';

const VisionScene = () => {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = t * 0.15;
        group.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Float speed={3} rotationIntensity={1} floatIntensity={1.5}>
        <Torus args={[2.5, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={3} toneMapped={false} />
        </Torus>
        <Torus args={[2, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={3} toneMapped={false} />
        </Torus>
        
        <Sphere args={[0.8, 64, 64]}>
          <MeshDistortMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={1.5} 
            distort={0.4} 
            speed={4} 
            roughness={0} 
            metalness={1} 
          />
        </Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={3} far={5} />
    </group>
  );
};

const Vision: React.FC = () => {
  const missionPillars = [
    { title: "Empowering Minds", text: "Moving beyond rote learning to ensure deep conceptual understanding across all boards.", icon: BookOpen, color: "text-blue-400" },
    { title: "Holistic Growth", text: "Focusing on the 360-degree development—intellectual, emotional, and ethical.", icon: Heart, color: "text-rose-400" },
    { title: "Personal Guidance", text: "Micro-ratios allowing educators to polish the unique potential in every single student.", icon: Compass, color: "text-emerald-400" },
    { title: "Tech & Tradition", text: "Utilizing modern SMS tools while staying rooted in Gurukul discipline.", icon: Rocket, color: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
                <VisionScene />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}>
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-12 backdrop-blur-xl">
                    <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 text-xs font-black tracking-[0.5em] uppercase">The Visionary Core</span>
                </div>
                <h1 className="text-7xl md:text-[12rem] font-black mb-12 leading-[0.8] tracking-tighter">
                    ENLIGHTEN <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-purple-500 drop-shadow-[0_0_50px_rgba(0,229,255,0.4)]">FUTURE.</span>
                </h1>
                <div className="relative max-w-3xl mx-auto">
                  <Quote size={80} className="absolute -top-10 -left-12 text-cyan-500/20" />
                  <p className="text-2xl md:text-4xl text-gray-300 leading-relaxed font-light italic">
                    "To be the premier learning center that bridges ancient wisdom with global excellence."
                  </p>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Grid of Values */}
      <section className="py-40 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {missionPillars.map((pillar, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="flex gap-10 p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] hover:bg-white/[0.08] transition-all group"
                      >
                          <div className={`shrink-0 w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center ${pillar.color} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                              <pillar.icon size={48} strokeWidth={1} />
                          </div>
                          <div>
                              <h4 className="text-3xl font-black mb-4">{pillar.title}</h4>
                              <p className="text-gray-400 leading-relaxed text-lg">{pillar.text}</p>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* The Core Values High-Contrast Section */}
      <section className="py-40 bg-white text-[#020617] rounded-[100px] mx-4 md:mx-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-7xl md:text-[10rem] font-black leading-none tracking-tighter mb-20 opacity-10">VALUES</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 -mt-32">
                   {[
                       { name: "Excellence", icon: Target },
                       { name: "Integrity", icon: Shield },
                       { name: "Curiosity", icon: Lightbulb },
                       { name: "Compassion", icon: Heart }
                   ].map((v, i) => (
                       <div key={i} className="flex flex-col items-center group">
                           <div className="w-24 h-24 bg-[#020617] text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all">
                               <v.icon size={40} />
                           </div>
                           <p className="text-2xl font-black uppercase tracking-widest">{v.name}</p>
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
