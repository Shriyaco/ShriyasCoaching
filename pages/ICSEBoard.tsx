import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import { Book, PenTool, Globe2, Languages, Microscope, FileCheck, Star, Quote, Zap, GraduationCap } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';

const ICSEScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = t * 0.15;
        group.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });
  return (
    <group ref={group}>
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <TorusKnot args={[1.5, 0.4, 128, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.1} emissive="#4f46e5" emissiveIntensity={0.5} wireframe />
        </TorusKnot>
        <Sphere args={[0.4, 32, 32]} position={[2.5, 1.5, -1]}><MeshDistortMaterial color="#00E5FF" speed={4} distort={0.3} /></Sphere>
        <Sphere args={[0.3, 32, 32]} position={[-2.5, -1.2, 1]}><MeshDistortMaterial color="#ec4899" speed={2} distort={0.6} /></Sphere>
      </Float>
      <Environment preset="night" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={3} far={5} />
    </group>
  );
};

const ICSEBoard: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebglSupported(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const testimonials = [
    { name: "Sanya Malhotra", grade: "Grade 8", text: "ICSE's focus on English Literature is amazing. Shriya's teachers helped me master Shakespearean English and creative writing early on.", avatar: "S" },
    { name: "Vihaan Gupta", grade: "Grade 6", text: "The jump to separate Physics and Biology was scary, but the project-based learning here made it very practical and fun.", avatar: "V" },
    { name: "Riya Deshmukh", grade: "Grade 7", text: "The internal assessment focus at Shriya's helped me build a consistent study habit instead of just cramming for finals.", avatar: "R" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white transition-colors duration-300 overflow-x-hidden">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas onError={() => setWebglSupported(false)}>
              <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                  <ambientLight intensity={0.8} />
                  <pointLight position={[10, 10, 10]} intensity={2} />
                  <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#8b5cf6" />
                  <ICSEScene />
                  <Stars radius={150} depth={60} count={6000} factor={5} saturation={0} fade speed={1.5} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-black" />
          )}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-2xl">
                    <GraduationCap size={16} className="text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 text-xs font-black tracking-widest uppercase">Global Academic Standards</span>
                </div>
                <h1 className="text-5xl md:text-[8rem] font-light serif-font uppercase mb-8 leading-[0.9] tracking-tighter luxury-text-gradient">ICSE <br />Curriculum</h1>
                <p className="text-xl text-white/50 max-w-3xl mx-auto leading-relaxed font-light uppercase tracking-widest text-sm">
                   Comprehensive learning emphasizing English proficiency and subject depth.
                </p>
            </motion.div>
        </div>
      </section>

      <section className="py-32 relative">
        <ThreeOrb className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10 translate-x-1/4 translate-y-1/4" color="#8b5cf6" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2 className="text-4xl md:text-6xl font-light serif-font uppercase mb-8 leading-tight">Our <span className="text-premium-accent">Approach</span></h2>
                    <p className="text-lg text-white/40 mb-10 font-light leading-loose">
                        We don't believe in surface-level teaching. ICSE requires deep analytical involvement, and our pedagogy is designed to meet those rigorous standards while keeping students engaged.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: Languages, title: "English Mastery", desc: "Heavy emphasis on creative writing & fluency." },
                            { icon: Microscope, title: "Specialized Science", desc: "Physics, Chemistry, Bio from early years." },
                            { icon: Globe2, title: "Global Context", desc: "Geography & History with extensive maps." },
                            { icon: FileCheck, title: "Assessment Focus", desc: "Internal projects & continuous evaluation." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shrink-0"><item.icon size={20}/></div>
                                <div><h4 className="font-bold text-sm mb-1">{item.title}</h4><p className="text-xs text-white/30">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 gap-8">
                <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400"><PenTool size={28}/></div>
                        <div><h3 className="text-2xl font-light serif-font uppercase">Primary Wing</h3><p className="text-premium-accent text-[10px] font-black uppercase tracking-widest">Grade 1st – 5th</p></div>
                    </div>
                    <p className="text-white/40 mb-6 text-sm font-bold uppercase tracking-widest leading-relaxed">A balanced focus on Confidence of Speech through creative composition modules.</p>
                </div>
                <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400"><Book size={28}/></div>
                        <div><h3 className="text-2xl font-light serif-font uppercase">Middle School</h3><p className="text-premium-accent text-[10px] font-black uppercase tracking-widest">Grade 6th – 8th</p></div>
                    </div>
                    <p className="text-white/40 mb-6 text-sm font-bold uppercase tracking-widest leading-relaxed">Transition to separate scientific disciplines with a focus on subject expertise.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h3 className="text-4xl md:text-5xl font-light serif-font uppercase mb-4">Student <span className="text-premium-accent">Perspectives</span></h3>
                  <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Hearing from our high-achieving ICSE batch.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {testimonials.map((t, i) => (
                      <motion.div key={i} whileHover={{ y: -12 }} className="p-10 bg-white/5 rounded-[48px] border border-white/5 relative overflow-hidden group">
                          <Quote className="absolute top-6 right-8 text-white/5" size={40} />
                          <div className="flex items-center gap-4 mb-8">
                              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white font-black shadow-lg">{t.avatar}</div>
                              <div>
                                  <h4 className="font-bold">{t.name}</h4>
                                  <p className="text-[10px] font-black uppercase text-premium-accent">{t.grade}</p>
                              </div>
                          </div>
                          <p className="text-white/40 text-sm leading-relaxed font-bold uppercase tracking-widest italic">"{t.text}"</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default ICSEBoard;