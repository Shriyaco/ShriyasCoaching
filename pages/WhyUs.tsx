
import React, { useRef, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Stars, PerspectiveCamera, MeshWobbleMaterial, TorusKnot, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Heart, Brain, Zap, ShieldCheck, GraduationCap, Users, TrendingUp, Sparkles, ArrowRight, Quote, BookOpen, Clock } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { useTheme } from '../App';

// --- 3D Scene Component for Why Us ---
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
        <Cylinder args={[1.2, 1.5, 4, 32]} position={[0, 0, 0]}>
           <meshStandardMaterial 
              color="#6366f1" 
              metalness={0.9} 
              roughness={0.1} 
              wireframe 
              emissive="#4f46e5" 
              emissiveIntensity={0.5} 
           />
        </Cylinder>
        <TorusKnot args={[0.8, 0.2, 128, 32]} position={[0, 0, 0]}>
           <MeshWobbleMaterial color="#00E5FF" speed={2} factor={0.6} metalness={0.8} />
        </TorusKnot>
      </Float>
      <Environment preset="night" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
    </group>
  );
};

const WhyUs: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const pillars = [
    {
      id: "01",
      title: "Gurukul Heritage",
      desc: "Mentor-shishya relationship where character and values are taught alongside subjects. Max 12 students per batch.",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10"
    },
    {
      id: "02",
      title: "Life-long Learning",
      desc: "We prioritize 'Learning for Life' over memorization. Our 'Why' and 'How' approach fosters analytical thinking.",
      icon: Brain,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      id: "03",
      title: "Customized Notes",
      desc: "Tailored educational material for CBSE, ICSE, and State Boards prepared by our core academic council.",
      icon: GraduationCap,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      id: "04",
      title: "Modern SMS Tech",
      desc: "Live portal for homework, exams, and attendance. Total transparency for parents through technology.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
                <WisdomScene />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-xl">
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    <span className="text-indigo-400 text-[10px] font-black tracking-widest uppercase">The Shriya's Difference</span>
                </div>
                <h1 className="text-7xl md:text-[10rem] font-black mb-8 leading-[0.85] tracking-tighter">
                    DEEP <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 drop-shadow-[0_0_50px_rgba(0,229,255,0.3)]">INTEGRITY.</span>
                </h1>
                <p className="text-xl md:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                   Combining the <b>ancient wisdom</b> of the Gurukul tradition with the <b>cutting-edge</b> tech of tomorrow.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2 className="text-5xl md:text-8xl font-black mb-10 leading-none">
                        OUR <br/><span className="text-indigo-500">ROOTS</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 leading-loose">
                        Unlike conventional tuition centers, we follow a philosophy where the teacher is a <b>mentor</b>, not just an instructor. We build character, discipline, and humility alongside academic excellence.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-6 p-8 rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-[#00E5FF] group-hover:text-[#020617] transition-all duration-500 shrink-0"><Users size={32}/></div>
                            <div><h4 className="font-black text-2xl mb-2">Mentor-Shishya Ratio</h4><p className="text-gray-500 leading-relaxed">Every child receives the 1-on-1 guidance they deserve during their most critical formative years.</p></div>
                        </div>
                        <div className="flex gap-6 p-8 rounded-[40px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-[#020617] transition-all duration-500 shrink-0"><Heart size={32}/></div>
                            <div><h4 className="font-black text-2xl mb-2">Human Values</h4><p className="text-gray-500 leading-relaxed">Instilling respect and discipline, ensuring students grow into well-rounded, ethical global citizens.</p></div>
                        </div>
                    </div>
                </motion.div>
                
                <div className="relative flex justify-center">
                    <motion.div initial={{ scale: 0.8, rotate: 5 }} whileInView={{ scale: 1, rotate: 0 }} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[80px] p-16 text-white shadow-[0_0_80px_rgba(99,102,241,0.3)] relative z-10 overflow-hidden">
                        <Quote size={120} className="text-white/10 absolute -top-4 -left-4" />
                        <p className="text-3xl md:text-5xl font-black leading-tight italic relative z-10">
                            "To transform each student by providing a culture of academic excellence and human values."
                        </p>
                        <p className="mt-12 text-sm font-black uppercase tracking-[0.5em] text-indigo-200">The Shriyas Gurukul Pledge</p>
                    </motion.div>
                    <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-indigo-500/30 rounded-[80px] -z-10 animate-pulse"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="py-40 bg-[#020617] relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-24">
                  <h3 className="text-6xl md:text-[8rem] font-black leading-none opacity-20 absolute top-0 left-0 w-full pointer-events-none">METHODOLOGY</h3>
                  <h2 className="text-4xl md:text-7xl font-black relative z-10">THE FOUR <span className="text-[#00E5FF]">PILLARS</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {pillars.map((pillar, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-12 bg-white/5 rounded-[60px] border border-white/10 hover:border-[#00E5FF]/40 transition-all group relative overflow-hidden"
                      >
                          <div className={`absolute top-0 right-0 text-[12rem] font-black text-white/[0.02] -translate-y-1/4 translate-x-1/4 group-hover:text-[#00E5FF]/[0.05] transition-all duration-700`}>{pillar.id}</div>
                          <div className={`w-20 h-20 ${pillar.bg} ${pillar.color} rounded-3xl flex items-center justify-center mb-10 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500`}>
                              <pillar.icon size={40} />
                          </div>
                          <h3 className="text-4xl font-black mb-6 relative z-10">{pillar.title}</h3>
                          <p className="text-xl text-gray-500 leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors">{pillar.desc}</p>
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
