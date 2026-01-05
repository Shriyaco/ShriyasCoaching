import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import Footer from '../components/Footer';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight, X, Sparkles, User, School, MessageSquare, Clock, Phone } from 'lucide-react';
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
    reason: '', 
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
        await db.addEnquiry({ ...enquiryForm, hasCoaching: enquiryForm.hasCoaching as boolean }); 
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

                <div className="mb-16">
                  <button 
                    onClick={() => setIsEnquiryModalOpen(true)}
                    className="group bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-premium-accent transition-all flex items-center gap-4 shadow-2xl"
                  >
                    Enroll Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>

                {/* Status Ticker */}
                <div className="w-full max-w-4xl mx-auto border-y border-white/5 bg-black/30 backdrop-blur-md py-5 overflow-hidden">
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
                     </div>
                </div>
             </motion.div>
        </div>
      </section>

      {/* --- ENROLLMENT MODAL (Full Yesterday Version) --- */}
      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9 }} 
                    className="bg-[#0A0A0A] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden relative shadow-2xl"
                >
                    <button onClick={closeEnquiryModal} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-20 p-2"><X size={28}/></button>
                    
                    <div className="p-10 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {enquirySubmitted ? (
                            <div className="text-center py-20 animate-fade-in">
                                <CheckCircle2 className="mx-auto text-premium-accent mb-6" size={60} />
                                <h3 className="text-4xl serif-font uppercase mb-4 luxury-text-gradient">Thank You.</h3>
                                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">We will connect with you shortly for the next steps.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-8">
                                <div className="inline-flex items-center gap-2 mb-2">
                                  <Sparkles size={14} className="text-premium-accent" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Session 2025-26 Enrollment</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl serif-font uppercase mb-8 luxury-text-gradient">Enquiry Application</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Student Name</label>
                                        <input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Parent Name</label>
                                        <input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Relation</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white appearance-none" value={enquiryForm.relation} onChange={e => setEnquiryForm({...enquiryForm, relation: e.target.value})}>
                                            <option value="" className="bg-black">Select Relation</option>
                                            <option value="Father" className="bg-black">Father</option>
                                            <option value="Mother" className="bg-black">Mother</option>
                                            <option value="Guardian" className="bg-black">Guardian</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Grade / Class</label>
                                        <input required placeholder="e.g. 7th Grade" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-1">Current School Name</label>
                                    <input required placeholder="Name of institution" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-1">Attending any other coaching?</label>
                                    <div className="flex gap-6 px-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching" checked={enquiryForm.hasCoaching === true} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: true})} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${enquiryForm.hasCoaching === true ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === true && <div className="w-2 h-2 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching" checked={enquiryForm.hasCoaching === false} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: false})} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${enquiryForm.hasCoaching === false ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === false && <div className="w-2 h-2 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white">No</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-1">Why are you looking for coaching?</label>
                                    <textarea required placeholder="Brief reason..." className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white h-24 resize-none" value={enquiryForm.reason} onChange={e => setEnquiryForm({...enquiryForm, reason: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Mobile Number</label>
                                        <input required type="tel" placeholder="10-digit number" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Best Time to Connect</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white appearance-none" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})}>
                                            <option value="" className="bg-black">Select Time</option>
                                            <option value="Morning" className="bg-black">Morning (9AM - 12PM)</option>
                                            <option value="Afternoon" className="bg-black">Afternoon (12PM - 4PM)</option>
                                            <option value="Evening" className="bg-black">Evening (4PM - 8PM)</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-premium-accent transition-all text-xs shadow-xl active:scale-[0.98]">Launch Application</button>
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

const CheckCircle2 = ({ className, size }: { className?: string, size?: number }) => (
    <div className={`rounded-full flex items-center justify-center ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
);

export default PublicHome;