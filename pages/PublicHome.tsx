import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import Footer from '../components/Footer';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicHome: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ 
    studentName: '', parentName: '', relation: '', grade: '', schoolName: '', 
    hasCoaching: null as boolean | null, coachingName: '', shiftingReason: '',
    expectations: '', mobile: '', connectTime: '' 
  });

  useEffect(() => {
    const load = async () => {
        try {
            const all = await db.getNotices();
            setNotices(all.filter(n => n.important));
        } catch (e) { console.error(e); }
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
      } catch (error) { alert("Error submitting. Try again."); }
  };

  const closeEnquiryModal = () => { setIsEnquiryModalOpen(false); setEnquirySubmitted(false); };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-premium-accent overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <ThreeHero />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center mb-20">
            {/* White placeholder block removed as per request */}
            
            {/* Styled Enroll Now Button */}
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              onClick={() => setIsEnquiryModalOpen(true)}
              className="group flex flex-col items-center gap-6 text-white hover:text-premium-accent transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-[14px] md:text-[20px] font-black uppercase tracking-[1em] ml-[1em]">ENROLL NOW</span>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" strokeWidth={1.5} />
              </div>
            </motion.button>
        </div>

        {/* Bottom Alert Ticker */}
        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-md border-t border-white/5 py-5 z-20">
            <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">ALERT</span>
                    <p className="text-white/90 text-[11px] md:text-[14px] font-black uppercase tracking-[0.2em]">
                        ADMISSION OPENS FOR 2026-27. LIMITED SEATS AVAILABLE.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- Philosophy Section --- */}
      <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                  <h2 className="text-5xl md:text-7xl font-light serif-font uppercase leading-tight">Precision <br /> Mastery.</h2>
                  <p className="text-lg text-white/40 leading-relaxed font-light">
                      The most sophisticated coaching environment for primary years. Our collective experience and tailored methodology elevate education to a whole new level.
                  </p>
                  <Link to="/why-us" className="inline-block text-premium-accent text-[11px] font-black uppercase tracking-[0.5em] border-b border-premium-accent/20 pb-1 hover:border-premium-accent transition-all">
                    OUR VISION
                  </Link>
              </div>
              <div className="h-[500px] bg-white/5 rounded-[60px] border border-white/5 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000" className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-1000" />
              </div>
          </div>
      </section>

      <Footer />

      {/* Enquiry Modal */}
      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-xl overflow-hidden relative shadow-2xl">
                    <button onClick={closeEnquiryModal} className="absolute top-6 right-6 text-white/40 hover:text-white z-20 p-2"><X size={24}/></button>
                    <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {enquirySubmitted ? (
                            <div className="text-center py-10 animate-fade-in"><CheckCircle2 className="mx-auto text-premium-accent mb-4" size={48} /><h3 className="text-3xl serif-font uppercase mb-2">Thank You.</h3><p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">We will connect with you shortly.</p></div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-4 text-left">
                                <h3 className="text-2xl md:text-3xl serif-font uppercase mb-4 luxury-text-gradient">Enquiry Form</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Student Name</label><input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} /></div>
                                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Parent Name</label><input required placeholder="Enter name" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Relation</label><select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.relation} onChange={e => setEnquiryForm({...enquiryForm, relation: e.target.value})}><option value="" className="bg-black">Select</option><option value="Father" className="bg-black">Father</option><option value="Mother" className="bg-black">Mother</option><option value="Guardian" className="bg-black">Guardian</option></select></div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Grade</label>
                                      <select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})}>
                                        <option value="" className="bg-black">Select Grade</option>
                                        {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(g => (
                                          <option key={g} value={g} className="bg-black">{g} Grade</option>
                                        ))}
                                      </select>
                                    </div>
                                </div>
                                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Current School</label><input required placeholder="Name of school" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} /></div>
                                
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
                                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Mobile Number</label><input required type="tel" placeholder="10-digit number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} /></div>
                                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-white/20 ml-1 tracking-wider">Preferred Connect Time</label><select required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-premium-accent text-xs text-white appearance-none" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})}><option value="" className="bg-black">Select</option><option value="Morning" className="bg-black">Morning</option><option value="Afternoon" className="bg-black">Afternoon</option><option value="Evening" className="bg-black">Evening</option></select></div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-premium-accent transition-all text-[10px] shadow-xl">Submit Application</button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHome;