
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { db } from '../services/db';
import SEO from '../components/SEO';

const ContactUs: React.FC = () => {
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

  const [content, setContent] = useState<any>({
      heroTitle: 'Connect.',
      heroSubtitle: 'Building foundations for future excellence through personal mentorship.',
      email: 'info@shriyasgurukul.in',
      phone: '+91 97241 11369',
      address: 'Bungalow no 19, Abhishek Bungalows, Hathijan Circle, Ahmedabad - 382445',
      seoTitle: 'Contact Us',
      seoDesc: 'Get in touch for admissions and enquiries.',
      seoKeywords: 'contact, address, phone, email, admission'
  });

  useEffect(() => {
    const loadContent = async () => {
        const data = await db.getPageContent('contact');
        if (data) setContent((prev:any) => ({ ...prev, ...data }));
    };
    loadContent();
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

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent selection:text-black overflow-x-hidden pt-32 transition-colors duration-300">
      <SEO title={content.seoTitle} description={content.seoDesc} keywords={content.seoKeywords} />
      <ThreeOrb className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 -translate-y-1/4" color="#C5A059" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-5xl md:text-8xl font-light serif-font uppercase mb-6 luxury-text-gradient whitespace-pre-line"
            >
                {content.heroTitle}
            </motion.h1>
            <p className="text-sm md:text-lg text-white/40 max-w-2xl mx-auto uppercase tracking-[0.3em] font-bold">
                {content.heroSubtitle}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">
            <div className="space-y-12">
                <div className="grid gap-8">
                    <div className="flex gap-6 items-start group">
                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-premium-accent group-hover:text-black transition-all">
                            <Mail size={24}/>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Email</p>
                            <a href={`mailto:${content.email}`} className="text-xl font-light serif-font hover:text-premium-accent transition-colors">{content.email}</a>
                        </div>
                    </div>
                    <div className="flex gap-6 items-start group">
                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-premium-accent group-hover:text-black transition-all">
                            <Phone size={24}/>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Call</p>
                            <a href={`tel:${content.phone.replace(/\s+/g, '')}`} className="text-xl font-light serif-font hover:text-premium-accent transition-colors">{content.phone}</a>
                        </div>
                    </div>
                    <div className="flex gap-6 items-start">
                        <div className="p-4 bg-white/5 rounded-2xl text-premium-accent">
                            <MapPin size={24}/>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Visit</p>
                            <p className="text-sm text-white/50 uppercase tracking-[0.2em] font-bold leading-loose">
                                {content.address}
                            </p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEnquiryModalOpen(true)} 
                    className="w-full py-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.5em] hover:bg-premium-accent transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98]"
                >
                    Enroll Now <ArrowRight size={18}/>
                </button>
            </div>
            
            <div className="h-[500px] bg-white/5 rounded-[50px] border border-white/5 overflow-hidden relative grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                <iframe 
                    src="https://maps.google.com/maps?q=Abhishek%20Bungalows%2C%20Hathijan%20Circle%2C%20Ahmedabad&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                ></iframe>
            </div>
        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9 }} 
                    className="bg-[#0A0A0A] border border-white/10 rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-2xl"
                >
                    <button onClick={closeEnquiryModal} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-20 p-2"><X size={28}/></button>
                    
                    <div className="p-10 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {enquirySubmitted ? (
                            <div className="text-center py-20 animate-fade-in">
                                <CheckCircle2 className="mx-auto text-premium-accent mb-4" size={48} />
                                <h3 className="text-4xl serif-font uppercase mb-4 luxury-text-gradient">Success.</h3>
                                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">We will connect with you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-8 text-left">
                                <h3 className="text-3xl md:text-4xl serif-font uppercase mb-8 luxury-text-gradient">Enquiry Form</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Student Name</label>
                                        <input required placeholder="Student's Full Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Parent Name</label>
                                        <input required placeholder="Parent's Full Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
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
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Grade</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white appearance-none" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})}>
                                            <option value="" className="bg-black">Select Grade</option>
                                            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(g => (
                                              <option key={g} value={g} className="bg-black">{g} Grade</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-1">Current School Name</label>
                                    <input required placeholder="Current School" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} />
                                </div>

                                <div className="space-y-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Attending any other coaching?</label>
                                    <div className="flex gap-6 px-1 mt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching_contact" checked={enquiryForm.hasCoaching === true} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: true})} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${enquiryForm.hasCoaching === true ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === true && <div className="w-2 h-2 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="coaching_contact" checked={enquiryForm.hasCoaching === false} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: false})} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${enquiryForm.hasCoaching === false ? 'border-premium-accent bg-premium-accent' : 'border-white/20'}`}>
                                                {enquiryForm.hasCoaching === false && <div className="w-2 h-2 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white">No</span>
                                        </label>
                                    </div>

                                    <AnimatePresence mode="wait">
                                      {enquiryForm.hasCoaching === true ? (
                                        <motion.div key="yes" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 overflow-hidden space-y-4">
                                           <div>
                                             <label className="text-[9px] font-black uppercase text-white/20 ml-1 mb-2 block">Current Coaching Center Name</label>
                                             <input required placeholder="Enter coaching name" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.coachingName} onChange={e => setEnquiryForm({...enquiryForm, coachingName: e.target.value})} />
                                           </div>
                                           <div>
                                             <label className="text-[9px] font-black uppercase text-white/20 ml-1 mb-2 block">Reason for shifting current classes</label>
                                             <input required placeholder="Tell us why..." className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.shiftingReason} onChange={e => setEnquiryForm({...enquiryForm, shiftingReason: e.target.value})} />
                                           </div>
                                        </motion.div>
                                      ) : enquiryForm.hasCoaching === false ? (
                                        <motion.div key="no" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 overflow-hidden">
                                           <label className="text-[9px] font-black uppercase text-white/20 ml-1 mb-2 block">Expectations from us</label>
                                           <textarea required placeholder="Your expectations..." className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 outline-none focus:border-premium-accent text-sm text-white h-24 resize-none" value={enquiryForm.expectations} onChange={e => setEnquiryForm({...enquiryForm, expectations: e.target.value})} />
                                        </motion.div>
                                      ) : null}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Mobile Number</label>
                                        <input required type="tel" placeholder="10-digit number" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-1">Preferred Connect Time</label>
                                        <select required className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-premium-accent text-sm text-white appearance-none" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})}>
                                            <option value="" className="bg-black">Select Time</option>
                                            <option value="Morning" className="bg-black">Morning</option>
                                            <option value="Afternoon" className="bg-black">Afternoon</option>
                                            <option value="Evening" className="bg-black">Evening</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-premium-accent transition-all text-xs shadow-xl active:scale-[0.98]">Submit Form</button>
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

export default ContactUs;
