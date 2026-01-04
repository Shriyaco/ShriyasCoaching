import React, { useEffect, useState } from 'react';
import ThreeHero from '../components/ThreeHero';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight, Shield, Users, Trophy, ChevronRight, CheckCircle2, TrendingUp, Zap, Brain, Microscope, Calculator, BookOpen, Star, Plus, Minus, MessageCircle, Phone, Mail, MapPin, Globe, Palette, X, Send } from 'lucide-react';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';

const PublicHome: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const { scrollYProgress } = useScroll();
  
  // 3D Parallax & Scroll Effects
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // UI State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  
  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
      studentName: '',
      parentName: '',
      relation: '',
      grade: '',
      schoolName: '',
      hasCoaching: null as boolean | null,
      reason: '',
      mobile: '',
      connectTime: ''
  });

  useEffect(() => {
    // Get all important notices for the ticker
    const load = async () => {
        const all = await db.getNotices();
        setNotices(all.filter(n => n.important));
    }
    load();
  }, []);

  const marqueeNotices = [...notices, ...notices, ...notices, ...notices];

  const fadeInUp: Variants = {
      hidden: { opacity: 0, y: 60, rotateX: -15 },
      visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: "easeOut", type: "spring" } }
  };

  const staggerContainer: Variants = {
      hidden: { opacity: 0 },
      visible: {
          opacity: 1,
          transition: {
              staggerChildren: 0.15
          }
      }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (enquiryForm.hasCoaching === null) {
          alert("Please select if your child is already getting coaching.");
          return;
      }
      try {
          await db.addEnquiry({
              ...enquiryForm,
              hasCoaching: enquiryForm.hasCoaching as boolean
          });
          setEnquirySubmitted(true);
      } catch (error) {
          console.error(error);
          alert("Something went wrong. Please try again.");
      }
  };

  const closeEnquiryModal = () => {
      setIsEnquiryModalOpen(false);
      setEnquirySubmitted(false);
      setEnquiryForm({
          studentName: '',
          parentName: '',
          relation: '',
          grade: '',
          schoolName: '',
          hasCoaching: null,
          reason: '',
          mobile: '',
          connectTime: ''
      });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#00E5FF] selection:text-[#020617] overflow-x-hidden perspective-1000">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">
        <ThreeHero />
        
        {/* Gradient Ticker */}
        <div className="relative z-20 w-full bg-gradient-to-r from-[#020617] via-[#00E5FF]/10 to-[#020617] backdrop-blur-md border-y border-[#00E5FF]/20 overflow-hidden py-3 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
             <div className="flex animate-marquee whitespace-nowrap hover:pause">
                {marqueeNotices.length > 0 ? marqueeNotices.map((notice, idx) => (
                    <div key={`${notice.id}-${idx}`} className="flex items-center mx-8">
                         <Zap size={14} className="text-[#00E5FF] mr-2 fill-current animate-pulse" />
                         <span className="text-gray-300 font-medium text-sm tracking-wide">
                             <span className="text-[#00E5FF] font-bold mr-2 uppercase text-xs border border-[#00E5FF]/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_#00E5FF]">New</span>
                             <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-bold">{notice.content}</span>
                         </span>
                    </div>
                )) : (
                    <div className="flex items-center mx-8 text-gray-400 text-sm">Welcome to Shriya's Coaching - The Foundation Experts</div>
                )}
             </div>
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6 py-12 relative z-10 pointer-events-none">
             <div className="w-full md:w-3/5 pointer-events-auto text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotateY: 10 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-transparent border border-white/10 backdrop-blur-xl mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:border-[#00E5FF]/50 transition-colors">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
                          </span>
                          <span className="text-[#00E5FF] text-xs font-bold tracking-[0.2em] uppercase">Grade 1st to 8th Specialists</span>
                      </div>

                      <h1 className="text-5xl md:text-8xl font-[Poppins] font-black text-white mb-6 leading-[0.95] tracking-tight drop-shadow-2xl">
                          Strong <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-purple-400 to-pink-400 drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                            Foundations.
                          </span>
                      </h1>

                      <p className="text-lg md:text-xl text-gray-300/90 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed font-light border-l-4 border-l-[#00E5FF] pl-6 bg-gradient-to-r from-[#00E5FF]/5 to-transparent py-2 rounded-r-2xl">
                        Building confident learners for tomorrow. We specialize in Primary and Middle School education, ensuring concept clarity from Day 1.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                          <button onClick={() => setIsEnquiryModalOpen(true)} className="group relative px-8 py-4 bg-gradient-to-r from-[#00E5FF] to-cyan-600 text-[#020617] rounded-full font-bold text-lg shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:shadow-[0_0_60px_rgba(0,229,255,0.5)] transition-all overflow-hidden hover:-translate-y-1">
                             <span className="relative z-10 flex items-center gap-2">Enroll Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
                             <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                          </button>
                          <a href="/login" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-[#00E5FF]/30 backdrop-blur-md transition-all flex items-center gap-2 group">
                             Access Portal <ChevronRight size={18} className="text-[#00E5FF] group-hover:translate-x-1 transition-transform" />
                          </a>
                      </div>
                  </motion.div>
                  
                  {/* Floating Glass Stats with 3D Rotation */}
                  <motion.div 
                     style={{ rotateX, scale, opacity }}
                     className="mt-16 inline-block relative group"
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-purple-500 to-pink-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-3xl" />
                      <div className="relative flex items-center gap-8 px-10 py-6 bg-[#0B1120]/60 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-[#00E5FF]/30 transition-colors shadow-2xl">
                          <div>
                              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-[Poppins]">1st-8th</div>
                              <div className="text-[10px] text-[#00E5FF] uppercase tracking-wider font-bold">Grade Focus</div>
                          </div>
                          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                          <div>
                              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-[Poppins]">100%</div>
                              <div className="text-[10px] text-[#00E5FF] uppercase tracking-wider font-bold">Attention</div>
                          </div>
                      </div>
                  </motion.div>
             </div>
        </div>
      </section>

      {/* --- FEATURES GRID (Gradient & Glass with 3D Reveal) --- */}
      <section id="about" className="py-24 relative overflow-hidden bg-[#020617]">
          {/* Vibrant Aurora Backgrounds */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#020617] to-[#020617] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-24"
              >
                  <h2 className="text-[#00E5FF] font-bold tracking-widest uppercase text-sm mb-4 flex items-center justify-center gap-3">
                    <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00E5FF]"></span> Early Years Excellence <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#00E5FF]"></span>
                  </h2>
                  <h3 className="text-4xl md:text-7xl font-[Poppins] font-black text-white">
                    Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-purple-400 to-pink-400">Shriya's?</span>
                  </h3>
              </motion.div>
              
              <motion.div 
                 variants={staggerContainer}
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, amount: 0.1 }}
                 className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                  {[
                      { icon: Users, title: "Personalized Care", desc: "Small batch sizes for Grade 1-8 to ensure individual attention.", color: "from-blue-500 to-cyan-500" },
                      { icon: Shield, title: "Smart Tracking", desc: "Weekly progress reports sent to parents via our app.", color: "from-purple-500 to-pink-500" },
                      { icon: Trophy, title: "Concept Mastery", desc: "Focus on Olympiads and Scholarship exams, not just rote learning.", color: "from-amber-400 to-orange-500" }
                  ].map((feature, idx) => (
                      <motion.div key={idx} variants={fadeInUp} className="group relative p-[1px] rounded-[32px] bg-gradient-to-b from-white/10 to-transparent hover:from-[#00E5FF] hover:to-purple-600 transition-all duration-500">
                          <div className="absolute inset-0 bg-[#00E5FF] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-[32px]" />
                          <div className="relative h-full bg-[#0B1120] rounded-[31px] p-8 overflow-hidden group-hover:bg-[#0B1120]/90 transition-colors">
                              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                  <feature.icon size={32} strokeWidth={1.5} />
                              </div>
                              <h3 className="text-2xl font-bold font-[Poppins] mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">{feature.title}</h3>
                              <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">{feature.desc}</p>
                              
                              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-[#00E5FF]/20 transition-colors" />
                          </div>
                      </motion.div>
                  ))}
              </motion.div>
          </div>
      </section>

      {/* --- METHODOLOGY SECTION --- */}
      <section className="py-24 bg-[#0B1120] relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-16 text-center">
                  <h3 className="text-3xl md:text-5xl font-[Poppins] font-bold text-white mb-4">Our Teaching <span className="text-[#00E5FF]">Methodology</span></h3>
                  <p className="text-gray-400 max-w-2xl mx-auto">A systematic approach designed for young minds to grasp complex concepts easily.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-[#00E5FF] to-gray-800 opacity-30 z-0"></div>

                  {[
                      { step: "01", title: "Assess", desc: "Understanding current student level", icon: Microscope },
                      { step: "02", title: "Learn", desc: "Interactive visualization & theory", icon: Brain },
                      { step: "03", title: "Practice", desc: "Daily worksheets & problem solving", icon: Calculator },
                      { step: "04", title: "Master", desc: "Weekly tests & feedback loop", icon: Trophy },
                  ].map((m, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 bg-[#020617] border border-white/10 p-6 rounded-2xl text-center hover:border-[#00E5FF]/50 transition-colors group"
                      >
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-900 to-slate-900 rounded-full flex items-center justify-center text-[#00E5FF] mb-6 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                              <m.icon size={28} />
                          </div>
                          <div className="text-5xl font-[Poppins] font-black text-white/5 absolute top-2 right-4 pointer-events-none">{m.step}</div>
                          <h4 className="text-xl font-bold text-white mb-2">{m.title}</h4>
                          <p className="text-sm text-gray-400">{m.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>
      
      {/* --- FOOTER --- */}
      <footer className="bg-[#020617] text-gray-400 py-16 border-t border-white/5 relative overflow-hidden">
        {/* Top Glowing Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_#00E5FF]" />
        
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.2)] border border-white/10">
                    <img src="https://advedasolutions.in/sc.png" alt="Shriya's Coaching" className="h-14 w-auto object-contain" />
                </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-sm text-gray-500">
              The premier destination for primary and middle school education (Grade 1-8). We build the leaders of tomorrow with a strong academic foundation.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest text-[#00E5FF]">Quick Links</h4>
            <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Home</a></li>
                <li><a href="#about" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> About Us</a></li>
                <li><a href="#results" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Results</a></li>
                <li><a href="/login" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Portal Login</a></li>
            </ul>
          </div>
          <div id="contact">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest text-[#00E5FF]">Contact</h4>
            <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 group">
                    <div className="mt-1 text-gray-500 group-hover:text-[#00E5FF] transition-colors"><MapPin size={16}/></div>
                    <span>Bungalow no 19, Abhishek Bungalows,<br/>Behind Aman Indian Colony,<br/>Hathijan Circle, Ahmedabad - 382445</span>
                </li>
                 <li className="flex items-center gap-3 group">
                    <div className="text-gray-500 group-hover:text-[#00E5FF] transition-colors"><Phone size={16}/></div>
                    <span className="cursor-pointer hover:text-[#00E5FF] transition-colors">+91 97241 11369</span>
                </li>
                <li className="flex items-center gap-3 group">
                    <div className="text-gray-500 group-hover:text-[#00E5FF] transition-colors"><Mail size={16}/></div>
                    <span className="cursor-pointer hover:text-[#00E5FF] transition-colors">info@shriyasgurukul.in</span>
                </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-center text-gray-600">&copy; 2023 Shriya's Coaching. All rights reserved.</p>
            
            <a 
                href="https://www.advedasolutions.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-all cursor-pointer group bg-gradient-to-r from-white/5 to-white/10 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#00E5FF]/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-0.5"
            >
                 <span className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white font-semibold transition-colors">Powered by</span>
                 <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-6 w-auto grayscale group-hover:grayscale-0 transition-all" />
            </a>
        </div>
      </footer>

      {/* --- ENQUIRY MODAL --- */}
      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }} 
                    className="bg-[#0B1120] rounded-3xl border border-[#00E5FF]/20 shadow-[0_0_50px_rgba(0,229,255,0.1)] w-full max-w-2xl overflow-hidden relative"
                >
                    <button onClick={closeEnquiryModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"><X size={24} /></button>
                    
                    {enquirySubmitted ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-[#00E5FF]/10 rounded-full flex items-center justify-center text-[#00E5FF] mb-6">
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <h3 className="text-3xl font-bold text-white mb-4 font-[Poppins]">Thank You!</h3>
                            <p className="text-gray-400 max-w-md">Your enquiry has been received. Our team will connect with you at your preferred time.</p>
                            <button onClick={closeEnquiryModal} className="mt-8 px-8 py-3 bg-[#00E5FF] text-[#020617] font-bold rounded-xl hover:bg-cyan-400 transition-colors">Close</button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <div className="p-6 md:p-8 bg-[#020617] border-b border-white/5">
                                <h3 className="text-2xl font-bold text-white font-[Poppins] flex items-center gap-3">
                                    <MessageCircle className="text-[#00E5FF]" /> Admission Enquiry
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">Fill in the details below to start your journey with us.</p>
                            </div>
                            
                            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                                <form id="enquiryForm" onSubmit={handleEnquirySubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Student Name</label>
                                            <input required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" placeholder="Child's Name" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Your Name</label>
                                            <input required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" placeholder="Parent/Guardian Name" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Relation with Student</label>
                                            <select required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" value={enquiryForm.relation} onChange={e => setEnquiryForm({...enquiryForm, relation: e.target.value})}>
                                                <option value="" disabled>Select Relation</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Guardian">Guardian</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Grade Applying For</label>
                                            <select required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})}>
                                                <option value="" disabled>Select Grade</option>
                                                {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Current School Name</label>
                                        <input required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" placeholder="School Name" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} />
                                    </div>

                                    <div className="bg-[#020617] p-5 rounded-xl border border-white/10 space-y-4">
                                        <label className="block text-sm font-bold text-gray-300">Is your child already getting coaching somewhere?</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enquiryForm.hasCoaching === true ? 'border-[#00E5FF]' : 'border-gray-500 group-hover:border-gray-300'}`}>
                                                    {enquiryForm.hasCoaching === true && <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />}
                                                </div>
                                                <input type="radio" name="coaching" className="hidden" checked={enquiryForm.hasCoaching === true} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: true, reason: ''})} />
                                                <span className="text-gray-300 group-hover:text-white">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enquiryForm.hasCoaching === false ? 'border-[#00E5FF]' : 'border-gray-500 group-hover:border-gray-300'}`}>
                                                    {enquiryForm.hasCoaching === false && <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />}
                                                </div>
                                                <input type="radio" name="coaching" className="hidden" checked={enquiryForm.hasCoaching === false} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: false, reason: ''})} />
                                                <span className="text-gray-300 group-hover:text-white">No</span>
                                            </label>
                                        </div>
                                        
                                        {enquiryForm.hasCoaching !== null && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                                <label className="text-xs font-bold text-[#00E5FF] uppercase block mb-1">
                                                    {enquiryForm.hasCoaching ? "Reason for Shifting" : "Reason for Tuition from us"}
                                                </label>
                                                <input required className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] outline-none" placeholder={enquiryForm.hasCoaching ? "Why do you want to change?" : "Why are you looking for tuition?"} value={enquiryForm.reason} onChange={e => setEnquiryForm({...enquiryForm, reason: e.target.value})} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                                            <input required type="tel" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" placeholder="10-digit Mobile" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Right Time to Connect</label>
                                            <input required type="text" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-colors" placeholder="e.g. After 6 PM" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-white/5 bg-[#020617]/50 flex justify-end">
                                <button type="submit" form="enquiryForm" className="bg-gradient-to-r from-[#00E5FF] to-cyan-600 text-[#020617] px-8 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2">
                                    Submit Enquiry <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHome;