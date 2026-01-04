
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { BookOpen, CheckCircle2, Star, Calculator, Microscope, Globe, Palette, Brain, ArrowRight, Zap, Award } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import { useTheme } from '../App';

// --- 3D Scene Component for CBSE ---
const CBSEScene = () => {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.rotation.y = Math.sin(t * 0.2) * 0.1;
        group.current.position.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Central NCERT Block */}
        <Box args={[2, 2.5, 0.4]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.2} emissive="#00E5FF" emissiveIntensity={0.2} />
        </Box>
        {/* Floating Concept Spheres */}
        <Sphere args={[0.3, 32, 32]} position={[1.8, 1.2, 0.5]}>
           <MeshDistortMaterial color="#f472b6" speed={3} distort={0.4} />
        </Sphere>
        <Sphere args={[0.2, 32, 32]} position={[-1.5, -1, 1]}>
           <MeshDistortMaterial color="#8b5cf6" speed={2} distort={0.5} />
        </Sphere>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </group>
  );
};

const CBSEBoard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scrollYProgress } = useScroll();
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scaleEffect = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  const testimonials = [
    { name: "Aarav Sharma", grade: "Grade 7", text: "The transition from 5th to 6th grade CBSE science was tough, but Shriya's coaching made Physics and Chemistry concepts feel like a story.", avatar: "A" },
    { name: "Ishita Patel", grade: "Grade 5", text: "I love the interactive math sessions. Solving NCERT problems is no longer a headache for me!", avatar: "I" },
    { name: "Rahul Kulkarni", grade: "Grade 8", text: "Focusing on analytical thinking helped me score a distinction in my regional Mathematics Olympiad.", avatar: "R" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <CBSEScene />
            {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-xl">
                    <Zap size={14} className="text-[#00E5FF] fill-current" />
                    <span className="text-[#0066cc] dark:text-[#00E5FF] text-xs font-bold tracking-widest uppercase">National Standards Excellence</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black font-[Poppins] mb-6 leading-tight">
                    CBSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Board</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                   We align our coaching with the NCERT curriculum, building a strong foundation for future competitive success.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-24 relative">
        <ThreeOrb className="absolute top-1/2 left-0 w-96 h-96 opacity-10 -translate-x-1/2" color="#00E5FF" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Primary Wing */}
            <motion.div 
               style={{ scale: scaleEffect }}
               className="bg-white dark:bg-[#0B1120] p-8 md:p-12 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-xl group hover:border-blue-400 dark:hover:border-[#00E5FF]/30 transition-all"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-[#00E5FF] mb-8 group-hover:scale-110 transition-transform">
                <Palette size={32} />
              </div>
              <h3 className="text-3xl font-black font-[Poppins] mb-4">Primary Wing</h3>
              <p className="text-blue-600 dark:text-[#00E5FF] font-bold mb-6 uppercase tracking-widest text-xs">Classes 1st – 5th</p>
              <p className="text-slate-600 dark:text-gray-400 mb-8 leading-relaxed">
                Focus on foundational literacy and numeracy. We use interactive methods for core subjects to ignite curiosity.
              </p>
              <ul className="space-y-4">
                {['Interactive English & Hindi', 'Foundational Mathematics', 'Environmental Science (EVS)', 'Activity-Based Learning'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Middle School */}
            <motion.div 
               style={{ scale: scaleEffect }}
               className="bg-slate-900 p-8 md:p-12 rounded-[40px] border border-white/5 shadow-2xl text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-8 group-hover:scale-110 transition-transform relative z-10">
                <Microscope size={32} />
              </div>
              <h3 className="text-3xl font-black font-[Poppins] mb-4 relative z-10">Middle School</h3>
              <p className="text-purple-400 font-bold mb-6 uppercase tracking-widest text-xs relative z-10">Classes 6th – 8th</p>
              <p className="text-gray-400 mb-8 leading-relaxed relative z-10">
                A seamless transition to conceptual depth. We prepare students for complex problem solving and critical thinking.
              </p>
              <ul className="space-y-4 relative z-10">
                {['Advanced Mathematics', 'Physics, Chemistry & Biology', 'Social Science Depth', 'Third Language Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 size={18} className="text-purple-400" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Key Features / Analytical Thinking */}
      <section className="py-20 bg-blue-600 dark:bg-indigo-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="grid grid-cols-10 h-full w-full">
                  {Array.from({ length: 50 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-white h-20"></div>
                  ))}
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="md:w-1/2">
                  <h2 className="text-4xl md:text-6xl font-black font-[Poppins] mb-6">Analytical Thinking <span className="text-cyan-300">Emphasis</span></h2>
                  <p className="text-blue-100 text-lg mb-8">
                      We don't just teach the syllabus; we teach students how to think. Regular assessments and Olympiad-style questions ensure a 360-degree clarity.
                  </p>
                  <div className="flex gap-4">
                      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                          <Award className="text-cyan-300" />
                          <span className="font-bold">Weekly Tests</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                          <Brain className="text-cyan-300" />
                          <span className="font-bold">Concept Maps</span>
                      </div>
                  </div>
              </div>
              <div className="md:w-1/2 relative">
                  <motion.div 
                    initial={{ rotate: 12, scale: 0.8 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl text-slate-900"
                  >
                      <h4 className="font-bold text-xl mb-4 flex items-center gap-2"><Star className="text-amber-500 fill-current" /> NCERT Edge</h4>
                      <p className="text-slate-500 text-sm leading-loose">
                          Our curriculum mapping ensures that every single line of the NCERT textbook is understood and applied through practical scenarios.
                      </p>
                      <button className="mt-6 flex items-center gap-2 text-blue-600 font-bold">Learn more <ArrowRight size={16}/></button>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h3 className="text-4xl font-black font-[Poppins] mb-4">Voice of our <span className="text-blue-600">Students</span></h3>
                  <p className="text-slate-500 dark:text-gray-400">Honest feedback from the future leaders of our community.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((t, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-8 bg-slate-50 dark:bg-[#0B1120] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all"
                      >
                          <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                              <div>
                                  <h4 className="font-bold dark:text-white">{t.name}</h4>
                                  <p className="text-[10px] font-black uppercase text-blue-500">{t.grade}</p>
                              </div>
                              <div className="ml-auto flex gap-1">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-amber-400 fill-current" />)}
                              </div>
                          </div>
                          <p className="text-slate-600 dark:text-gray-400 text-sm italic leading-relaxed">
                              "{t.text}"
                          </p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

    </div>
  );
};

export default CBSEBoard;
