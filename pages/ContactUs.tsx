import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, X, MessageCircle, ArrowRight } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { db } from '../services/db';

const ContactUs: React.FC = () => {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ studentName: '', parentName: '', relation: '', grade: '', schoolName: '', hasCoaching: null as boolean | null, reason: '', mobile: '', connectTime: '' });

  const handleEnquirySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (enquiryForm.hasCoaching === null) { alert("Please select coaching status."); return; }
      try { await db.addEnquiry({ ...enquiryForm, hasCoaching: enquiryForm.hasCoaching as boolean }); setEnquirySubmitted(true); } catch (error) { alert("Error submitting. Try again."); }
  };

  const closeEnquiryModal = () => { setIsEnquiryModalOpen(false); setEnquirySubmitted(false); };

  return (
    <div className="min-h-screen bg-premium-black text-white selection:bg-premium-accent selection:text-black overflow-x-hidden pt-32 transition-colors duration-300">
      <ThreeOrb className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 -translate-y-1/4" color="#00E5FF" />
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-light serif-font uppercase mb-6 luxury-text-gradient">Connect.</motion.h1>
            <p className="text-sm md:text-lg text-white/40 max-w-2xl mx-auto uppercase tracking-[0.3em] font-bold">Building foundations for future excellence.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div className="space-y-12">
                <div className="grid gap-8">
                    {[ { icon: Mail, label: "Email", value: "info@shriyasgurukul.in", href: "mailto:info@shriyasgurukul.in" }, { icon: Phone, label: "Call", value: "+91 97241 11369", href: "tel:+919724111369" } ].map((item, i) => (
                        <div key={i} className="flex gap-6 items-start group">
                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-premium-accent group-hover:text-black transition-all"><item.icon size={24}/></div>
                            <div><p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">{item.label}</p><a href={item.href} className="text-xl font-light serif-font hover:text-premium-accent transition-colors">{item.value}</a></div>
                        </div>
                    ))}
                    <div className="flex gap-6 items-start">
                        <div className="p-4 bg-white/5 rounded-2xl text-premium-accent"><MapPin size={24}/></div>
                        <div><p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Visit</p><p className="text-sm text-white/50 uppercase tracking-[0.2em] font-bold leading-loose">Bungalow no 19, Abhishek Bungalows,<br/>Hathijan Circle, Ahmedabad - 382445</p></div>
                    </div>
                </div>
                <button onClick={() => setIsEnquiryModalOpen(true)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.5em] hover:bg-premium-accent transition-all flex items-center justify-center gap-4">Enroll Now <ArrowRight size={18}/></button>
            </div>
            <div className="h-[500px] bg-white/5 rounded-[50px] border border-white/5 overflow-hidden relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                <iframe src="https://maps.google.com/maps?q=Abhishek%20Bungalows%2C%20Hathijan%20Circle%2C%20Ahmedabad&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
            </div>
        </div>
      </div>
      <Footer />
      <AnimatePresence>
        {isEnquiryModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-premium-black border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden relative">
                    <button onClick={closeEnquiryModal} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-20"><X size={24}/></button>
                    <div className="p-12">
                        {enquirySubmitted ? (
                            <div className="text-center py-20"><h3 className="text-4xl serif-font uppercase mb-4 luxury-text-gradient">Thank You.</h3><p className="text-white/40 uppercase tracking-widest text-xs font-bold">We will connect with you shortly.</p></div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-6">
                                <h3 className="text-3xl serif-font uppercase mb-8 luxury-text-gradient">Enquiry.</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required placeholder="Student Name" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 outline-none focus:border-premium-accent text-sm" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                    <input required placeholder="Parent Name" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 outline-none focus:border-premium-accent text-sm" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
                                </div>
                                <input required type="tel" placeholder="Mobile Number" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 outline-none focus:border-premium-accent text-sm" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.4em] rounded-xl hover:bg-premium-accent transition-all text-xs">Send Message</button>
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