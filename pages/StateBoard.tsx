
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { Languages, Zap, Award, Palette, Code, Smartphone, Layout, Star, ArrowRight, Quote, GraduationCap, Map } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { db } from '../services/db';
import SEO from '../components/SEO';

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
    // @ts-ignore
    <group ref={group}>
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Icosahedron args={[1.5, 1]} position={[0, 0, 0]}>
          {/* @ts-ignore */}
          <meshStandardMaterial color="#10b981" metalness={0.9} roughness={0.1} emissive="#059669" emissiveIntensity={0.6} wireframe />
        </Icosahedron>
        <Box args={[0.4, 0.4, 0.4]} position={[2, 1, -1]}>
           {/* @ts-ignore */}
           <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.5} />
        </Box>
        <Sphere args={[0.3, 32, 32]} position={[-2, -1, 1]}>
           {/* @ts-ignore */}
           <MeshDistortMaterial color="#3b82f6" speed={3} distort={0.5} />
        </Sphere>
      </Float>
      <Environment preset="forest" />
      {/* @ts-ignore */}
      <ContactShadows position={[0, -3.5, 0]} opacity={0.3} scale={15} blur={3} far={5} />
    </group>
  );
};

const StateBoard: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [content, setContent] = useState<any>({
      heroTitle: 'State Boards',
      heroSubtitle: 'Dedicated coaching for Gujarat and Maharashtra students, aligned with NEP 2020.',
      seoTitle: 'State Board Coaching',
      seoDesc: 'GSEB and MSBSHSE coaching with focus on bridge courses and scholarship exams.',
      seoKeywords: 'gseb, msbshse, state board, gujarat board, maharashtra board'
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebglSupported(!!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      setWebglSupported(false);
    }

    const loadContent = async () => {
        const data = await db.getPageContent('state');
        if (data) setContent((prev:any) => ({ ...prev, ...data }));
    };
    loadContent();
  }, []);

  const testimonials = [
    { name: "Pratik Shah", board: "GSEB (Gujarat)", grade: "Grade 8", text: "The bridge courses at Shriya's helped me understand science in English without losing my Gujarati foundation. I feel ready for national level exams!", avatar: "P" },
    { name: "Ananya Deshpande", board: "MSBSHSE (Maharashtra)", grade: "Grade 6", text: "I love the animated Balbharati lessons. It makes Marathi literature and Geography so much more interesting than just reading the book.", avatar: "A" },
    { name: "Mehul Mehta", board: "GSEB (Gujarat)", grade: "Grade 7", text: "The focus on scholarship exams here is great. I recently cleared the state primary scholarship with an A grade!", avatar: "M" }
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white transition-colors duration-300 overflow-x-hidden">
      <SEO title={content.seoTitle} description={content.seoDesc} keywords={content.seoKeywords} />
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas onError={() => setWebglSupported(false)}>
              <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[0, 0, 9]} />
                  {/* @ts-ignore */}
                  <ambientLight intensity={1} />
                  {/* @ts-ignore */}
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#10b981" />
                  {/* @ts-ignore */}
                  <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#34d399" />
                  <StateBoardScene />
                  <Stars radius={120} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 to-black" />
          )}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-2xl">
                    <Map size={16} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest uppercase">GSEB & MSBSHSE Excellence</span>
                </div>
                <h1 className="text-5xl md:text-[8rem] font-light serif-font uppercase mb-8 leading-[1.1] luxury-text-gradient whitespace-pre-line">{content.heroTitle}</h1>
                <p className="text-xl text-white/50 max-w-4xl mx-auto leading-relaxed font-light uppercase tracking-widest text-sm">
                   {content.heroSubtitle}
                </p>
            </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <ThreeOrb className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 translate-x-1/2 -translate-y-1/4" color="#10b981" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Languages, title: "Regional Mastery", desc: "Specialized support for Gujarati and Marathi proficiency.", color: "emerald" },
              { icon: Zap, title: "NEP 2020 Alignment", desc: "Moving away from rote learning toward critical thinking.", color: "amber" },
              { icon: Layout, title: "Standardized Quality", desc: "NCERT-aligned materials to keep students at par with national levels.", color: "blue" }
            ].map((pillar, i) => (
                <div key={i} className="p-12 bg-white/5 rounded-[40px] border border-white/5 group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-premium-accent mb-8"><pillar.icon size={32} /></div>
                    <h3 className="text-2xl font-light serif-font uppercase mb-4 tracking-wider">{pillar.title}</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">{pillar.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/5 text-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                  <h2 className="text-4xl md:text-7xl font-light serif-font uppercase mb-8 leading-tight">Key Features <br /><span className="text-premium-accent">State Excellence</span></h2>
                  <div className="space-y-8">
                      {[
                          { icon: Award, title: "Exam Readiness", text: "Preparation for state scholarship exams through regular mock drills." },
                          { icon: Palette, title: "Holistic Skills", text: "Integration of creative arts and moral values into daily schedule." },
                          { icon: GraduationCap, title: "Bridge Courses", text: "Smoothing the transition to national academic patterns." }
                      ].map((f, i) => (
                          <div key={i} className="flex gap-6 items-start">
                              <div className="p-3 bg-white/5 rounded-2xl text-premium-accent"><f.icon size={24}/></div>
                              <div>
                                  <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{f.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="md:w-1/2">
                  <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className="bg-white/10 p-12 rounded-[60px] shadow-2xl relative z-10 border border-white/5">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8"><Code size={40} className="text-emerald-400" /></div>
                      <h4 className="text-2xl font-light serif-font uppercase mb-4">Logic & Coding</h4>
                      <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed">
                          We introduced coding for Grade 6-8 state board students to ensure they are at par with private national boards.
                      </p>
                  </motion.div>
              </div>
          </div>
      </section>

      <section className="py-32 bg-premium-black">
          <div className="max-w-7xl mx-auto px-6">
              <h3 className="text-4xl md:text-5xl font-light serif-font uppercase mb-20 text-center">Success <span className="text-premium-accent">Stories</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {testimonials.map((t, i) => (
                      <div key={i} className="p-10 bg-white/5 rounded-[48px] border border-white/5 relative">
                          <Quote className="absolute top-8 right-10 text-white/5" size={56} />
                          <div className="flex items-center gap-4 mb-8">
                              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white font-black">{t.avatar}</div>
                              <div>
                                  <h4 className="font-bold">{t.name}</h4>
                                  <p className="text-[10px] font-black uppercase text-premium-accent">{t.board}</p>
                              </div>
                          </div>
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed italic">"{t.text}"</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default StateBoard;
