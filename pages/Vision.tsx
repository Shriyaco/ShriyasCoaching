
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Target, Compass, Lightbulb, Users, Shield, Sparkles, BookOpen, Heart, Rocket, ArrowRight, Quote } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { useTheme } from '../App';

// --- 3D Scene Component for Vision ---
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
        {/* The "Eye" of Vision */}
        <Torus args={[2, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
        </Torus>
        <Torus args={[1.5, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
        </Torus>
        
        {/* Central Core of Enlightenment */}
        <Sphere args={[0.6, 64, 64]}>
          <MeshDistortMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={1} 
            distort={0.3} 
            speed={4} 
            roughness={0} 
            metalness={1} 
          />
        </Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={3} far={5} />
    </group>
  );
};

const Vision: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scrollYProgress } = useScroll();
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const coreValues = [
    { name: "Excellence", desc: "We strive for the highest standards in academic results and teaching quality.", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Integrity", desc: "We instill a strong sense of ethics and honesty in our students from a young age.", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Curiosity", desc: "We encourage students to ask 'Why?' and 'How?', fostering a lifelong love for learning.", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Personalization", desc: "We believe every child learns differently and deserves a tailored approach.", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  const missionPillars = [
    { title: "Empowering Through Knowledge", text: "Moving beyond rote learning to ensure deep conceptual understanding across CBSE, ICSE, and State Boards.", icon: BookOpen },
    { title: "Nurturing Holistic Growth", text: "Focusing on the 360-degree development of the child—intellectual, emotional, and ethical.", icon: Heart },
    { title: "Mentor-Driven Guidance", text: "Small ratios allowing educators to identify and polish the unique potential in every student.", icon: Compass },
    { title: "Integrating Tech & Tradition", text: "Utilizing modern digital tools while staying rooted in Gurukul discipline and values.", icon: Rocket }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
            <VisionScene />
            {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 backdrop-blur-xl">
                    <Sparkles size={14} className="text-cyan-500 animate-pulse" />
                    <span className="text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest uppercase">The Path of Enlightenment</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black font-[Poppins] mb-8 leading-tight">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-2xl">Vision</span>
                </h1>
                <div className="relative">
                  <Quote size={48} className="absolute -top-6 -left-8 text-cyan-500/20" />
                  <p className="text-xl md:text-3xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light italic">
                    "To be a premier learning center that bridges traditional wisdom with modern excellence, transforming students into enlightened global citizens."
                  </p>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Vision Statement Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-white dark:bg-[#0B1120] rounded-[60px] p-12 md:p-20 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black font-[Poppins] mb-6">Future-Ready <br/><span className="text-cyan-500">Minds</span></h2>
                <p className="text-lg text-slate-500 dark:text-gray-400 leading-relaxed mb-8">
                  We envision a future where every child from Classes 1st to 8th possesses not only the knowledge to succeed in competitive exams but also the character to lead a life of purpose and integrity.
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Established 2023</span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-slate-50 dark:bg-black/20 rounded-[40px] flex items-center justify-center p-8 border border-slate-100 dark:border-white/5">
                   <Target size={120} className="text-cyan-500/20 animate-spin-slow" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)]">
                         <Compass size={64} className="text-white" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-slate-900 text-white relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                  <h3 className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4">Our Mission</h3>
                  <h2 className="text-4xl md:text-6xl font-black font-[Poppins]">The Gurukul <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pledge</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {missionPillars.map((pillar, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 10 }}
                        className="flex gap-8 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] hover:bg-white/10 transition-all group"
                      >
                          <div className="shrink-0 w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                              <pillar.icon size={32} />
                          </div>
                          <div>
                              <h4 className="text-2xl font-bold mb-3">{pillar.title}</h4>
                              <p className="text-slate-400 leading-relaxed text-sm">{pillar.text}</p>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-black font-[Poppins] mb-4">Core <span className="text-blue-600">Values</span></h2>
                  <p className="text-slate-500 dark:text-gray-400">The fundamental beliefs that drive Shriyas Gurukul.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {coreValues.map((value, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-8 bg-slate-50 dark:bg-[#0B1120] rounded-[32px] border border-slate-100 dark:border-white/5 text-center group"
                      >
                          <div className={`w-16 h-16 ${value.bg} ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform`}>
                              <value.icon size={32} />
                          </div>
                          <h4 className="text-xl font-bold mb-4 dark:text-white">{value.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{value.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* The Promise Section */}
      <section className="py-24 relative overflow-hidden">
        <ThreeOrb className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10 translate-x-1/4 translate-y-1/4" color="#00E5FF" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[50px] p-12 md:p-16 text-white text-center shadow-2xl"
          >
             <h3 className="text-3xl font-black mb-6">The Shriyas Gurukul Promise</h3>
             <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-10">
                "We promise to walk alongside your child during their most formative years, ensuring that they are not just 'schooled' but truly 'educated'."
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(n => <div key={n} className="w-12 h-12 rounded-full border-4 border-blue-600 bg-white/20"></div>)}
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Confidently Educated</p>
                  <p className="text-sm text-blue-200">Our goal for every student.</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vision;
