// @ts-nocheck
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Environment, ContactShadows, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Palette, Microscope, Zap, Book, Brain, Target, GraduationCap } from 'lucide-react';
import Footer from '../components/Footer';
import { db } from '../services/db';
import SEO from '../components/SEO';

const CBSEScene = () => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) { group.current.rotation.y = Math.sin(t * 0.1) * 0.2; }
  });
  return (
    // @ts-ignore
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* @ts-ignore */}
        <Box args={[2, 2.5, 0.4]} position={[0, 0, 0]}><meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.2} emissive="#00E5FF" emissiveIntensity={0.2} /></Box>
        <Sphere args={[0.3, 32, 32]} position={[1.8, 1.2, 0.5]}><MeshDistortMaterial color="#f472b6" speed={3} distort={0.4} /></Sphere>
      </Float>
      <Environment preset="city" />
      {/* @ts-ignore */}
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </group>
  );
};

const CBSEBoard: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [content, setContent] = useState<any>({
      heroTitle: 'CBSE Board',
      heroSubtitle: 'NCERT-aligned coaching for future academic leadership.',
      mainDesc: "Our CBSE program is meticulously structured around the NCERT framework, ensuring students don't just memorize but master the core concepts. We provide a bridge between regular schooling and competitive national standards.",
      quoteText: "Excellence is not an act, but a habit of continuous conceptual evolution.",
      seoTitle: 'CBSE Coaching',
      seoDesc: 'Top CBSE Coaching in Ahmedabad for grades 1-8.',
      seoKeywords: 'cbse, coaching, ahmedabad, ncert'
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(!!gl);
    } catch (e) {
      setWebglSupported(false);
    }

    const loadContent = async () => {
        const data = await db.getPageContent('cbse');
        if (data) setContent(prev => ({ ...prev, ...data }));
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent overflow-x-hidden">
      <SEO title={content.seoTitle} description={content.seoDesc} keywords={content.seoKeywords} />
      
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglSupported ? (
            <Canvas onError={() => setWebglSupported(false)}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                {/* @ts-ignore */}
                <ambientLight intensity={0.5} />
                <CBSEScene />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-black" />
          )}
        </div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-white/5 mb-8 backdrop-blur-xl"><Zap size={14} className="text-[#00E5FF]" /><span className="text-white/40 text-[9px] font-bold tracking-[0.4em] uppercase">National Excellence</span></div>
                <h1 className="text-6xl md:text-[10rem] font-light serif-font uppercase mb-8 leading-tight luxury-text-gradient">{content.heroTitle}</h1>
                <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto tracking-widest uppercase font-light">{content.heroSubtitle}</p>
            </motion.div>
        </div>
      </section>

      <section className="py-40 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-6xl font-light serif-font uppercase mb-8 leading-tight">The NCERT <br /><span className="text-premium-accent">Edge.</span></h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                {content.mainDesc}
              </p>
              <div className="space-y-6">
                {[
                  { title: "Conceptual Clarity", icon: Brain, desc: "Moving beyond rote learning to deep understanding." },
                  { title: "Competency Based", icon: Target, desc: "Aligned with new CBSE evaluation patterns." },
                  { title: "Analytical Skills", icon: Microscope, desc: "Fostering scientific temperament from Grade 1." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-premium-accent shrink-0"><item.icon size={20} /></div>
                    <div><h4 className="font-bold text-lg mb-1">{item.title}</h4><p className="text-sm text-white/30">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-premium-accent/20 to-transparent rounded-[100px] border border-white/5 flex items-center justify-center p-20">
                <Book size={180} className="text-premium-accent opacity-20 absolute" />
                <p className="text-2xl md:text-4xl serif-font italic text-center text-white/80 leading-snug">
                  "{content.quoteText}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-40 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[ { icon: Palette, title: "Primary Wing", age: "1st - 5th Grade", desc: "Interactive literacy and numeracy ignite curiosity. Focus on foundational English, Math, and EVS." }, 
               { icon: Microscope, title: "Middle School", age: "6th - 8th Grade", desc: "Conceptual depth prepares for critical thinking. Specialized faculty for Physics, Chemistry, and Biology." } 
            ].map((wing, i) => (
                <div key={i} className="p-12 bg-white/5 border border-white/5 rounded-[50px] group transition-all hover:border-premium-accent/40">
                    <wing.icon size={48} className="text-premium-accent mb-10" />
                    <h3 className="text-3xl serif-font uppercase mb-2">{wing.title}</h3>
                    <p className="text-premium-accent text-[10px] font-black uppercase tracking-widest mb-8">{wing.age}</p>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-bold leading-relaxed">{wing.desc}</p>
                </div>
            ))}
          </div>
      </section>

      <section className="py-40 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <GraduationCap size={64} className="mx-auto text-premium-accent mb-10 opacity-20" />
          <h2 className="text-4xl md:text-6xl serif-font mb-8">Ready for the Board?</h2>
          <p className="text-white/40 text-lg mb-12 uppercase tracking-widest">Small batches. Personal attention. Unmatched results.</p>
          <Link to="/contact" className="inline-block bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-premium-accent transition-all">Enroll Your Child</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CBSEBoard;
