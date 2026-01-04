
import React, { useRef } from 'react';
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
        {/* Abstract "Pillar of Knowledge" */}
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
        
        {/* Core Jewel */}
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
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  const pillars = [
    {
      id: "01",
      title: "Gurukul Heritage",
      desc: "Small batch sizes (10-12 students) ensure a mentor-shishya relationship where character and values are taught alongside subjects.",
      icon: Heart,
      color: "rose"
    },
    {
      id: "02",
      title: "Conceptual Mastery",
      desc: "We prioritize 'Learning for Life' over memorization. Our 'Why' and 'How' approach fosters analytical thinking early on.",
      icon: Brain,
      color: "indigo"
    },
    {
      id: "03",
      title: "Board-Specific Tailoring",
      desc: "Whether it's ICSE Literature depth or State Board scholarship prep, we provide custom-tailored notes for every curriculum.",
      icon: GraduationCap,
      color: "cyan"
    },
    {
      id: "04",
      title: "Holistic 1st–8th Focus",
      desc: "These are the brain's most critical years. We integrate coding, communication, and time management into the academic flow.",
      icon: Zap,
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
            <WisdomScene />
            {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-xl">
                    <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest uppercase">The Shriya's Difference</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black font-[Poppins] mb-8 leading-[0.95] tracking-tight">
                    Beyond <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 drop-shadow-2xl">Education.</span>
                </h1>
                <p className="text-lg md:text-2xl text-slate-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                   Combining the <b>ancient wisdom</b> of the Gurukul tradition with the requirements of the <b>modern</b> global curriculum.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 relative bg-white dark:bg-[#0B1120] transition-colors">
        <ThreeOrb className="absolute top-1/2 left-0 w-96 h-96 opacity-10 -translate-x-1/2" color="#6366f1" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-8 leading-tight">
                        A Modern Twist on <br />
                        <span className="text-indigo-600">Gurukul Heritage</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-gray-400 mb-8 leading-loose">
                        Unlike conventional tuition centers, we follow a philosophy where the teacher is a <b>mentor</b>, not just an instructor. We build character, discipline, and humility alongside academic excellence.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                            <div className="w-12 h-12 bg-white dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0"><Users size={24}/></div>
                            <div><h4 className="font-bold text-lg mb-1">Small Batch Sizes</h4><p className="text-sm text-gray-500">Every child receives the 1-on-1 guidance they deserve during their foundational years.</p></div>
                        </div>
                        <div className="flex gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                            <div className="w-12 h-12 bg-white dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0"><Heart size={24}/></div>
                            <div><h4 className="font-bold text-lg mb-1">Human Values</h4><p className="text-sm text-gray-500">Instilling respect and discipline, ensuring students grow into well-rounded individuals.</p></div>
                        </div>
                    </div>
                </motion.div>
                
                <div className="relative">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: 5 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        className="bg-indigo-600 rounded-[60px] p-12 text-white shadow-2xl relative z-10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <Quote size={80} className="text-white/20 mb-8" />
                        <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-10 italic">
                            "To transform each student by providing a culture of academic excellence and human values, preparing them for a life of purpose."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                            <div><p className="font-black">The Core Promise</p><p className="text-xs text-indigo-200 uppercase tracking-widest">Shriyas Gurukul</p></div>
                        </div>
                    </motion.div>
                    <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-indigo-600/30 rounded-[60px] -z-10"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="py-32 bg-slate-50 dark:bg-[#020617] relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.3em] mb-4">Our Methodology</h3>
                  <h2 className="text-4xl md:text-7xl font-black font-[Poppins] dark:text-white">Built on Four <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Pillars</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pillars.map((pillar, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-10 bg-white dark:bg-[#0B1120] rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                      >
                          <div className={`absolute top-0 right-0 text-9xl font-black text-slate-50 dark:text-white/5 -translate-y-1/4 translate-x-1/4 group-hover:translate-x-0 transition-transform`}>{pillar.id}</div>
                          <div className={`w-16 h-16 bg-${pillar.color}-100 dark:bg-${pillar.color}-900/20 text-${pillar.color}-600 rounded-3xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform`}>
                              <pillar.icon size={32} />
                          </div>
                          <h3 className="text-2xl font-black mb-4 relative z-10">{pillar.title}</h3>
                          <p className="text-slate-500 dark:text-gray-400 leading-relaxed relative z-10">{pillar.desc}</p>
                          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 relative z-10">
                              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Discover More <ArrowRight size={14}/></button>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-24 bg-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 h-full">
                  {Array.from({ length: 144 }).map((_, i) => <div key={i} className="border border-white h-24"></div>)}
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                  <div className="md:w-1/2">
                      <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-8 leading-tight">Experiential <br/><span className="text-cyan-300">Learning</span></h2>
                      <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
                          We use hands-on activities and real-world examples to make complex concepts in Science and Mathematics easy to grasp for young minds in classes 1st–8th.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                               <ShieldCheck className="text-cyan-300" size={20}/>
                               <span className="font-bold text-sm">Bridge Courses</span>
                           </div>
                           <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                               <TrendingUp className="text-cyan-300" size={20}/>
                               <span className="font-bold text-sm">Progress Tracking</span>
                           </div>
                      </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                       <motion.div 
                         initial={{ rotate: -5 }}
                         whileInView={{ rotate: 0 }}
                         className="grid grid-cols-2 gap-4"
                       >
                           <div className="space-y-4">
                               <div className="h-40 w-40 bg-white/10 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center border border-white/20">
                                   <BookOpen className="text-cyan-300 mb-2" size={32}/>
                                   <span className="text-[10px] font-black uppercase">Tailored Notes</span>
                               </div>
                               <div className="h-40 w-40 bg-white rounded-3xl flex flex-col items-center justify-center text-slate-900 shadow-2xl">
                                   <Clock className="text-indigo-600 mb-2" size={32}/>
                                   <span className="text-[10px] font-black uppercase">Time Mastery</span>
                               </div>
                           </div>
                           <div className="space-y-4 pt-12">
                               <div className="h-40 w-40 bg-cyan-400 rounded-3xl flex flex-col items-center justify-center text-slate-900">
                                   <Brain className="mb-2" size={32}/>
                                   <span className="text-[10px] font-black uppercase">Critical Mind</span>
                               </div>
                               <div className="h-40 w-40 bg-white/10 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center border border-white/20">
                                   <Sparkles className="text-cyan-300 mb-2" size={32}/>
                                   <span className="text-[10px] font-black uppercase">Creative Arts</span>
                               </div>
                           </div>
                       </motion.div>
                  </div>
              </div>
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyUs;
