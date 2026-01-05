
import React, { useRef, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import { Book, PenTool, FlaskConical, Globe2, Languages, Microscope, FileCheck, Star, ArrowRight, Quote, Zap, GraduationCap } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { useTheme } from '../App';

// --- 3D Scene Component for ICSE ---
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
          <meshStandardMaterial 
            color="#8b5cf6" 
            metalness={0.9} 
            roughness={0.1} 
            emissive="#4f46e5" 
            emissiveIntensity={0.5} 
            wireframe
          />
        </TorusKnot>
        <Sphere args={[0.4, 32, 32]} position={[2.5, 1.5, -1]}>
           <MeshDistortMaterial color="#00E5FF" speed={4} distort={0.3} />
        </Sphere>
        <Sphere args={[0.3, 32, 32]} position={[-2.5, -1.2, 1]}>
           <MeshDistortMaterial color="#ec4899" speed={2} distort={0.6} />
        </Sphere>
      </Float>
      <Environment preset="night" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={3} far={5} />
    </group>
  );
};

const ICSEBoard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scrollYProgress } = useScroll();
  
  const testimonials = [
    { name: "Sanya Malhotra", grade: "Grade 8", text: "ICSE's focus on English Literature is amazing. Shriya's teachers helped me master Shakespearean English and creative writing early on.", avatar: "S" },
    { name: "Vihaan Gupta", grade: "Grade 6", text: "The jump to separate Physics and Biology was scary, but the project-based learning here made it very practical and fun.", avatar: "V" },
    { name: "Riya Deshmukh", grade: "Grade 7", text: "The internal assessment focus at Shriya's helped me build a consistent study habit instead of just cramming for finals.", avatar: "R" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#8b5cf6" />
                <ICSEScene />
                {isDark && <Stars radius={150} depth={60} count={6000} factor={5} saturation={0} fade speed={1.5} />}
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-2xl">
                    <GraduationCap size={16} className="text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 text-xs font-black tracking-widest uppercase">Global Academic Standards</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black font-[Poppins] mb-8 leading-[0.9] tracking-tighter">
                    ICSE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 drop-shadow-[0_10px_10px_rgba(139,92,246,0.3)]">Curriculum</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                   Comprehensive and detailed learning experiences that go beyond textbooks, emphasizing <b>English proficiency</b> and specialized subject depth.
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
                    <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-8 leading-tight">
                        Our <span className="text-purple-600">Approach</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-gray-400 mb-10 leading-loose">
                        We don't believe in surface-level teaching. ICSE requires deep analytical involvement, and our pedagogy is designed to meet those rigorous standards while keeping students engaged through project-based learning.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: Languages, title: "English Mastery", desc: "Heavy emphasis on creative writing & fluency." },
                            { icon: Microscope, title: "Specialized Science", desc: "Physics, Chemistry, Bio from early years." },
                            { icon: Globe2, title: "Global Context", desc: "Geography & History with extensive maps." },
                            { icon: FileCheck, title: "Assessment Focus", desc: "Internal projects & continuous evaluation." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-white/5 shadow-sm">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl shrink-0"><item.icon size={20}/></div>
                                <div><h4 className="font-bold text-sm mb-1">{item.title}</h4><p className="text-xs text-gray-500">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 gap-8">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-10 bg-white dark:bg-[#0B1120] rounded-[40px] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600"><PenTool size={28}/></div>
                        <div><h3 className="text-2xl font-black font-[Poppins]">Primary Wing</h3><p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Grade 1st – 5th</p></div>
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                        A balanced focus on Language, Mathematics, and Science. We build the "Confidence of Speech" through dedicated public speaking and creative composition modules.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Creative Writing', 'Logical Math', 'Nature Study', 'Phonics Mastery'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-black/20 rounded-full text-[10px] font-black uppercase text-indigo-500 border border-indigo-100/50">{tag}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-10 bg-slate-900 rounded-[40px] border border-white/5 shadow-2xl text-white group"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400"><Book size={28}/></div>
                        <div><h3 className="text-2xl font-black font-[Poppins]">Middle School</h3><p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Grade 6th – 8th</p></div>
                    </div>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        Transition to separate scientific disciplines. We provide extensive support for Literature, History & Civics, and Geography with a focus on specialized subject knowledge.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-200"><Zap size={14} className="text-amber-400"/> Specialized Science</div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-200"><Zap size={14} className="text-amber-400"/> History & Civics</div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-200"><Zap size={14} className="text-amber-400"/> English Literature</div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-purple-200"><Zap size={14} className="text-amber-400"/> Regional Language</div>
                    </div>
                </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 h-full">
                  {Array.from({ length: 144 }).map((_, i) => <div key={i} className="border border-white h-24"></div>)}
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                  <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-6">Internal <br/><span className="text-purple-400">Assessments</span></h2>
                  <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                      The hallmark of ICSE is its emphasis on application. Our regular project-based evaluations ensure that students understand the 'Why' and 'How' of every concept before they sit for exams.
                  </p>
                  <ul className="space-y-4">
                      {['Project Workshops', 'Lab Simulations', 'Speaking Assessments', 'Mock Board Preps'].map(l => (
                          <li key={l} className="flex items-center gap-3 font-bold text-sm text-purple-300">
                              <CheckCircle2 size={18} className="text-emerald-400" /> {l}
                          </li>
                      ))}
                  </ul>
              </div>
              <div className="md:w-1/2">
                  <div className="relative">
                      <div className="absolute -inset-4 bg-purple-500/20 blur-2xl rounded-full"></div>
                      <motion.div 
                        initial={{ rotate: -5 }}
                        whileInView={{ rotate: 0 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[60px] relative z-10 shadow-2xl"
                      >
                          <Microscope size={80} className="text-purple-400 mb-8" />
                          <h4 className="text-2xl font-bold mb-4">Practical Application</h4>
                          <p className="text-sm text-indigo-100 leading-loose opacity-70">
                              We map curriculum outcomes to real-world scenarios. Students don't just read about plant cells; they see them. They don't just read about democracy; they debate it.
                          </p>
                      </motion.div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-32 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h3 className="text-4xl md:text-5xl font-black font-[Poppins] mb-4">Student <span className="text-purple-600">Perspectives</span></h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-xl mx-auto italic">Hearing from our high-achieving ICSE batch.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {testimonials.map((t, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -12 }}
                        className="p-10 bg-slate-50 dark:bg-[#0B1120] rounded-[48px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group"
                      >
                          <Quote className="absolute top-6 right-8 text-purple-200 dark:text-purple-900/40 group-hover:scale-125 transition-transform" size={40} />
                          <div className="flex items-center gap-4 mb-8">
                              <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">{t.avatar}</div>
                              <div>
                                  <h4 className="font-black dark:text-white">{t.name}</h4>
                                  <p className="text-[10px] font-black uppercase text-purple-500">{t.grade}</p>
                              </div>
                          </div>
                          <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                              "{t.text}"
                          </p>
                          <div className="mt-8 flex gap-1">
                              {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-current" />)}
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>
      <Footer />
    </div>
  );
};

// Helper for UI consistency
const CheckCircle2 = ({ className, size }: { className?: string, size?: number }) => (
    <div className={`rounded-full flex items-center justify-center ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
);

export default ICSEBoard;
