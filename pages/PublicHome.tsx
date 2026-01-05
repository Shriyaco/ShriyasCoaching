import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import Footer from '../components/Footer';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const PublicHome: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ 
    studentName: '', 
    parentName: '', 
    relation: '', 
    grade: '', 
    schoolName: '', 
    hasCoaching: null as boolean | null, 
    coachingName: '',
    shiftingReason: '',
    expectations: '',
    mobile: '', 
    connectTime: '' 
  });

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

  const handleEnquirySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (enquiryForm.hasCoaching === null) { alert("Please select coaching status."); return; }
      try { 
        const reasonContent = enquiryForm.hasCoaching 
          ? `Coaching: ${enquiryForm.coachingName}. Reason for shift: ${enquiryForm.shiftingReason}`
          : `Expectations: ${enquiryForm.expectations}`;

        await db.addEnquiry({ 
          ...enquiryForm, 
          hasCoaching: enquiryForm.hasCoaching as boolean,
          reason: reasonContent
        }); 
        setEnquirySubmitted(true); 
      } catch (error) { 
        alert("Error submitting. Try again."); 
      }
  };

  const closeEnquiryModal = () => { setIsEnquiryModalOpen(false); setEnquirySubmitted(false); };
  const marqueeNotices = [...notices, ...notices, ...notices, ...notices];

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent selection:text-black overflow-x-hidden">
      
      {/* --- IMMERSIVE HERO --- */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: opacityHero }} className="absolute inset-0 z-0">
          <ThreeHero />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
        
        <div className="max-w-[1400px] w-full mx-auto relative z-10 text-center">
             <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                className="flex flex-col items-center"
             >
                <h1 className="mt-20 text-5xl md:text-[8rem] font-light leading-[1] tracking-tight serif-font uppercase mb-16 luxury-text-gradient">
                  Your Future <br /> Crafted Here.
                </h1>

                <div className="mb-24">
                  <button 
                    onClick={() => setIsEnquiryModalOpen(true)}
                    className="group text-white text-[11px] font-bold uppercase tracking-[0.5em] flex items-center gap-3 hover:text-premium-accent transition-all"
                  >
                    Enroll Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
             </motion.div>
        </div>

        {/* --- FULL WIDTH TICKER --- */}
        <div className="absolute bottom-0 left-0 w-full border-y border-white/5 bg-black/40 backdrop-blur-md py-3 overflow-hidden z-20">
             <div className="flex animate-marquee whitespace-nowrap">
                {marqueeNotices.length > 0 ? marqueeNotices.map((notice, idx) => (
                    <div key={idx} className="flex items-center mx-12">
                         <span className="text-white/40 text-[8px] font-black tracking-[0.3em] uppercase mr-3">Alert</span>
                         <span className="text-white/80 font-bold text-[10px] tracking-[0.1em] uppercase serif-font">
                             {notice.title}
                         </span>
                    </div>
                )) : (
                    <div className="flex items-center mx-16 text-white/30 text-[9px] uppercase font-bold tracking-[0.6em]">Academic Session 2025-26 • Admissions Open • Excellence Redefined</div>
                )}
             </div>
        </div>
      </section>

      {/* --- ENROLLMENT MODAL --- */}
      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9 }} 
                    className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-xl overflow-hidden relative shadow-2xl"
                >
                    <button onClick={closeEnquiryModal} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20 p-2"><X size={24}/></button>
                    
                    <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {enquirySubmitted ? (
                            <div className="text-center py-10 animate-fade-in">
                                <CheckCircle2 className="mx-auto text-premium-accent mb-4" size={48} />
                                <h3 className="text-3xl serif-font uppercase mb-2 luxury-text-gradient">Thank You.</h3>
                                <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">We will connect with you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-4 text-left">
                                <div className="inline-flex items-center gap-2">
                                  <Sparkles size={12} className="text-premium-accent" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Session 2025-26 Enrollment</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl serif-font uppercase mb-4 luxury-text-gradient">Enquiry Form</h3>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Student Name</label>
                                        <input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Parent Name</label>
                                        <input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Relation</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.relation} onChange={e => setEnquiryForm({...enquiryForm, relation: e.target.value})}>
                                            <option value="" className="bg-black">Select</option>
                                            <option value="Father" className="bg-black">Father</option>
                                            <option value="Mother" className="bg-black">Mother</option>
                                            <option value="Guardian" className="bg-black">Guardian</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Grade / Class</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})}>
                                            <option value="" className="bg-black">Select</option>
                                            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(g => (
                                              <option key={g} value={g} className="bg-black">{g} Grade</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Current School Name</label>
                                    <input required placeholder="Name of institution" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} />
                                </div>

                                {/* Attending any other coaching question */}
                                <div className="space-y-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                                    <label className="text-[9px] font-black uppercase text-white/30 ml-1 tracking-widest">Attending any other coaching?</label>
                                    <div className="flex gap-6 px-1 mt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching_main" checked={enquiryForm.hasCoaching === true} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: true})} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${enquiryForm.hasCoaching === true ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === true && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching_main" checked={enquiryForm.hasCoaching === false} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: false})} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${enquiryForm.hasCoaching === false ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === false && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">No</span>
                                        </label>
                                    </div>
                                    
                                    <AnimatePresence mode="wait">
                                      {enquiryForm.hasCoaching === true ? (
                                        <motion.div key="yes" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2 overflow-hidden space-y-2">
                                           <div>
                                             <label className="text-[8px] font-black uppercase text-white/20 ml-1 mb-1 block">Current Coaching Center Name</label>
                                             <input required placeholder="Enter coaching name" className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.coachingName} onChange={e => setEnquiryForm({...enquiryForm, coachingName: e.target.value})} />
                                           </div>
                                           <div>
                                             <label className="text-[8px] font-black uppercase text-white/20 ml-1 mb-1 block">Reason for shifting current classes</label>
                                             <input required placeholder="Reason for shift..." className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.shiftingReason} onChange={e => setEnquiryForm({...enquiryForm, shiftingReason: e.target.value})} />
                                           </div>
                                        </motion.div>
                                      ) : enquiryForm.hasCoaching === false ? (
                                        <motion.div key="no" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2 overflow-hidden">
                                           <label className="text-[8px] font-black uppercase text-white/20 ml-1 mb-1 block">Expectations from us</label>
                                           <input required placeholder="Your expectations..." className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.expectations} onChange={e => setEnquiryForm({...enquiryForm, expectations: e.target.value})} />
                                        </motion.div>
                                      ) : null}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Mobile Number</label>
                                        <input required type="tel" placeholder="10-digit number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Best Time to Connect</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})}>
                                            <option value="" className="bg-black">Select</option>
                                            <option value="Morning" className="bg-black">Morning (9AM-12PM)</option>
                                            <option value="Afternoon" className="bg-black">Afternoon (12PM-4PM)</option>
                                            <option value="Evening" className="bg-black">Evening (4PM-8PM)</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-premium-accent transition-all text-[10px] shadow-xl active:scale-[0.98]">Submit Application</button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

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

      {/* Board Grid Section */}
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