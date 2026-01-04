
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { Languages, Zap, Award, Palette, Code, Smartphone, Layout, Star, ArrowRight, Quote, CheckCircle, GraduationCap, Map } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import { useTheme } from '../App';

// --- 3D Scene Component for State Board ---
const StateBoardScene = () => {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = Math.sin(t * 0.1) * 0.2;
        group.current.position.y = Math.cos(t * 0.4) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
        {/* Abstract "Bridge" Structure using Icosahedrons */}
        <Icosahedron args={[1.5, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#10b981" 
            metalness={0.9} 
            roughness={0.1} 
            emissive="#059669" 
            emissiveIntensity={0.6} 
            wireframe
          />
        </Icosahedron>
        
        {/* Regional "Language" Nodes */}
        <Box args={[0.4, 0.4, 0.4]} position={[2, 1, -1]}>
           <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.5} />
        </Box>
        <Sphere args={[0.3, 32, 32]} position={[-2, -1, 1]}>
           <MeshDistortMaterial color="#3b82f6" speed={3} distort={0.5} />
        </Sphere>
      </Float>
      <Environment preset="forest" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.3} scale={15} blur={3} far={5} />
    </group>
  );
};

const StateBoard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scrollYProgress } = useScroll();
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const testimonials = [
    { name: "Pratik Shah", board: "GSEB (Gujarat)", grade: "Grade 8", text: "The bridge courses at Shriya's helped me understand science in English without losing my Gujarati foundation. I feel ready for national level exams!", avatar: "P" },
    { name: "Ananya Deshpande", board: "MSBSHSE (Maharashtra)", grade: "Grade 6", text: "I love the animated Balbharati lessons. It makes Marathi literature and Geography so much more interesting than just reading the book.", avatar: "A" },
    { name: "Mehul Mehta", board: "GSEB (Gujarat)", grade: "Grade 7", text: "The focus on scholarship exams here is great. I recently cleared the state primary scholarship with an A grade!", avatar: "M" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 9]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#10b981" />
            <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#34d399" />
            <StateBoardScene />
            {isDark && <Stars radius={120} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />}
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-2xl">
                    <Map size={16} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest uppercase">GSEB & MSBSHSE Excellence</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black font-[Poppins] mb-8 leading-[1.1]">
                    State <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-500 drop-shadow-[0_10px_10px_rgba(16,185,129,0.2)]">Boards</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
                   Dedicated coaching for <b>Gujarat</b> and <b>Maharashtra</b> students, meticulously aligned with NEP 2020 guidelines for a future-ready academic foundation.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Integrated Approach Section */}
      <section className="py-24 relative overflow-hidden">
        <ThreeOrb className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 translate-x-1/2 -translate-y-1/4" color="#10b981" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black font-[Poppins] mb-6">Our Integrated <span className="text-emerald-600">Approach</span></h2>
              <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">Bridging the gap between textbook learning and conceptual mastery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Languages, 
                title: "Regional Mastery", 
                desc: "Specialized support for Gujarati and Marathi (First Language) along with Hindi and English to ensure linguistic proficiency.",
                color: "emerald"
              },
              { 
                icon: Zap, 
                title: "NEP 2020 Alignment", 
                desc: "Moving away from rote learning toward critical thinking and interactive, activity-based learning sessions.",
                color: "amber"
              },
              { 
                icon: Layout, 
                title: "Standardized Quality", 
                desc: "Using NCERT-aligned materials and Balbharati textbooks to keep students at par with national competitive levels.",
                color: "blue"
              }
            ].map((pillar, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="p-10 bg-white dark:bg-[#0B1120] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group"
                >
                    <div className={`w-16 h-16 rounded-2xl bg-${pillar.color}-100 dark:bg-${pillar.color}-900/20 flex items-center justify-center text-${pillar.color}-600 mb-8 group-hover:scale-110 transition-transform`}>
                        <pillar.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-bold font-[Poppins] mb-4">{pillar.title}</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{pillar.desc}</p>
                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${pillar.color}-500/5 blur-3xl rounded-full`}></div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => <div key={i} className="border border-white/20"></div>)}
              </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-16">
                  <div className="md:w-1/2">
                      <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-8 leading-tight">Key Features for <br /><span className="text-emerald-400">State Students</span></h2>
                      <div className="space-y-8">
                          {[
                              { icon: Award, title: "Exam Readiness", text: "Preparation for state scholarship exams (NMMSS/Primary) through regular mock drills." },
                              { icon: Palette, title: "Holistic Skills", text: "Integration of creative arts, moral values, and coding (from Class 6) into daily schedule." },
                              { icon: Smartphone, title: "Digital Lessons", text: "Chapter-wise animated videos and digital notes to visualize complex state board topics." },
                              { icon: GraduationCap, title: "Bridge Courses", text: "Special sessions to help transition smoothly as state boards update to national patterns." }
                          ].map((f, i) => (
                              <div key={i} className="flex gap-6 items-start group">
                                  <div className="p-3 bg-white/5 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all"><f.icon size={24}/></div>
                                  <div>
                                      <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                                      <p className="text-sm text-slate-400 leading-relaxed">{f.text}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="md:w-1/2">
                      <div className="relative">
                          <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                          <motion.div 
                            initial={{ scale: 0.8, rotate: -3 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[60px] shadow-2xl relative z-10"
                          >
                              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                  <Code size={40} className="text-white" />
                              </div>
                              <h4 className="text-2xl font-black mb-4">21st Century Skills</h4>
                              <p className="text-emerald-50 dark:text-emerald-100 text-sm leading-loose opacity-70">
                                  We introduced coding for Grade 6-8 state board students to ensure they are at par with private national boards. Logic building is our priority.
                              </p>
                              <button className="mt-8 flex items-center gap-2 font-bold text-emerald-400">View Curriculum <ArrowRight size={18}/></button>
                          </motion.div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                  <div className="max-w-2xl">
                      <h3 className="text-4xl md:text-5xl font-black font-[Poppins] mb-4">Success <span className="text-emerald-600">Stories</span></h3>
                      <p className="text-slate-500 dark:text-gray-400">Hear from our students who achieved distinction in State Board exams.</p>
                  </div>
                  <button className="px-8 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-100 dark:border-emerald-500/20">All Results</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {testimonials.map((t, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -12 }}
                        className="p-10 bg-slate-50 dark:bg-[#0B1120] rounded-[48px] border border-slate-100 dark:border-white/5 shadow-lg relative"
                      >
                          <Quote className="absolute top-8 right-10 text-emerald-100 dark:text-emerald-900/20" size={56} />
                          <div className="flex items-center gap-4 mb-8">
                              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black">{t.avatar}</div>
                              <div>
                                  <h4 className="font-black dark:text-white">{t.name}</h4>
                                  <p className="text-[10px] font-black uppercase text-emerald-600">{t.board}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{t.grade}</p>
                              </div>
                          </div>
                          <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed italic relative z-10">
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

    </div>
  );
};

export default StateBoard;
