import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import Footer from '../components/Footer';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PublicHome: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const { scrollYProgress } = useScroll();
  
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const load = async () => {
        try {
            const all = await db.getNotices();
            setNotices(all.filter(n => n.important));
        } catch (e) {
            console.error("Failed to load notices", e);
        }
    }
    load();
  }, []);

  const marqueeNotices = [...notices, ...notices, ...notices, ...notices];

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent selection:text-black overflow-x-hidden">
      
      {/* --- IMMERSIVE HERO --- */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: opacityHero }} className="absolute inset-0 z-0">
          <ThreeHero />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <div className="max-w-[1400px] w-full mx-auto relative z-10 text-center">
             <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
             >
                <h1 className="text-5xl md:text-[8rem] font-light leading-[1] tracking-tight serif-font uppercase mb-12 luxury-text-gradient">
                  Your Future <br /> Crafted Here.
                </h1>

                <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed tracking-widest uppercase mb-12">
                  Premium academic coaching for the next generation of global leaders.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 md:gap-12 mb-20">
                  <button className="group text-white text-[11px] font-bold uppercase tracking-[0.5em] flex items-center gap-4 hover:text-premium-accent transition-all">
                    Discover More <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform"/>
                  </button>
                </div>

                {/* Status Ticker - Moved to downside of Discover More */}
                <div className="w-full max-w-4xl mx-auto border-y border-white/5 bg-black/20 backdrop-blur-sm py-5 overflow-hidden">
                     <div className="flex animate-marquee whitespace-nowrap">
                        {marqueeNotices.length > 0 ? marqueeNotices.map((notice, idx) => (
                            <div key={idx} className="flex items-center mx-16">
                                 <span className="text-white/40 text-[9px] font-bold tracking-[0.4em] uppercase mr-4">Update</span>
                                 <span className="text-white/80 font-light text-xs tracking-[0.2em] uppercase italic serif-font">
                                     {notice.content}
                                 </span>
                            </div>
                        )) : (
                            <div className="flex items-center mx-16 text-white/30 text-[9px] uppercase font-bold tracking-[0.6em]">Academic Session 2024-25 • Admissions Open • Excellence Redefined</div>
                        )}
                        {/* Duplicate for seamless loop if content is short */}
                        {!marqueeNotices.length && <div className="flex items-center mx-16 text-white/30 text-[9px] uppercase font-bold tracking-[0.6em]">Academic Session 2024-25 • Admissions Open • Excellence Redefined</div>}
                     </div>
                </div>
             </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 md:py-60 px-6">
          <div className="max-w-[1200px] mx-auto text-center md:text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
                  <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <h2 className="text-4xl md:text-7xl font-light serif-font uppercase tracking-tight leading-tight mb-8">
                        Precision <br /> Mastery.
                      </h2>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                      <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light mb-10">
                        Created by a core team of academic experts, Shriya's Academic Group is the most sophisticated way to excel in your primary years. Our collective experience and tailored methodology elevate coaching to a whole new level.
                      </p>
                      <Link to="/why-us" className="text-premium-accent text-[11px] font-bold uppercase tracking-[0.5em] border-b border-premium-accent/30 pb-1">
                        Our Vision
                      </Link>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* Grid Section */}
      <section className="bg-premium-black">
          <div className="grid grid-cols-1 lg:grid-cols-3">
              {[
                  { title: "CBSE", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000", path: "/cbse" },
                  { title: "ICSE", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000", path: "/icse" },
                  { title: "STATE", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000", path: "/state-board" }
              ].map((vert, i) => (
                  <Link to={vert.path} key={i} className="relative h-[70vh] md:h-[90vh] group overflow-hidden border-r last:border-0 border-white/5">
                      <img src={vert.img} alt={vert.title} className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
                      <div className="absolute bottom-16 left-12">
                          <h3 className="text-5xl md:text-7xl font-light text-white uppercase tracking-tight serif-font mb-4">{vert.title}</h3>
                          <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] group-hover:text-premium-accent transition-colors">
                             Explore Tracks
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicHome;