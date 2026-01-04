import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle2, X, MessageCircle, ArrowRight, ChevronRight } from 'lucide-react';
import ThreeOrb from '../components/ThreeOrb';
import { db } from '../services/db';

const ContactUs: React.FC = () => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans selection:bg-[#00E5FF] selection:text-[#020617] overflow-x-hidden pt-20 transition-colors duration-300">
      <ThreeOrb className="absolute top-0 right-0 w-[800px] h-[800px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/4" color="#00E5FF" />
      <ThreeOrb className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-x-1/3 translate-y-1/4" color="#a855f7" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black font-[Poppins] text-slate-900 dark:text-white mb-4"
            >
                Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-[#00E5FF] dark:to-purple-500">Touch</span>
            </motion.h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                Have questions about our curriculum or admission process? We're here to help you build a strong foundation for your child.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Contact Info & Button */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
            >
                {/* Info Cards */}
                <div className="grid gap-6">
                    <div className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl group hover:border-blue-400 dark:hover:border-[#00E5FF]/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-[#00E5FF]/10 text-blue-600 dark:text-[#00E5FF] rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-[#00E5FF] group-hover:text-white dark:group-hover:text-[#020617] transition-colors">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Email Us</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">For general enquiries and admissions</p>
                                <a href="mailto:info@shriyasgurukul.in" className="text-blue-600 dark:text-[#00E5FF] font-semibold hover:underline">info@shriyasgurukul.in</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl group hover:border-blue-400 dark:hover:border-[#00E5FF]/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-[#00E5FF]/10 text-blue-600 dark:text-[#00E5FF] rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-[#00E5FF] group-hover:text-white dark:group-hover:text-[#020617] transition-colors">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Call Us</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Mon-Sat from 9am to 6pm</p>
                                <a href="tel:+919724111369" className="text-blue-600 dark:text-[#00E5FF] font-semibold hover:underline">+91 97241 11369</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl group hover:border-blue-400 dark:hover:border-[#00E5FF]/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-[#00E5FF]/10 text-blue-600 dark:text-[#00E5FF] rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-[#00E5FF] group-hover:text-white dark:group-hover:text-[#020617] transition-colors">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Visit Us</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    Bungalow no 19, Abhishek Bungalows,<br/>
                                    Behind Aman Indian Colony, Hathijan Circle,<br/>
                                    Ahmedabad, Gujarat - 382445
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enroll Button */}
                <div className="pt-4">
                     <button 
                        onClick={() => setIsEnquiryModalOpen(true)}
                        className="w-full group relative px-8 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-[#00E5FF] dark:to-cyan-600 text-white dark:text-[#020617] rounded-2xl font-black text-xl shadow-lg dark:shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_60px_rgba(0,229,255,0.5)] transition-all overflow-hidden hover:-translate-y-1 flex items-center justify-center gap-3"
                     >
                         <span className="relative z-10 flex items-center gap-2">Enroll Now <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform"/></span>
                         <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                     </button>
                     <p className="text-center text-slate-500 text-sm mt-3">Start your journey with Shriya's Coaching today!</p>
                </div>

            </motion.div>

            {/* Google Map */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="h-full min-h-[500px] bg-slate-100 dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative"
            >
                <iframe 
                    src="https://maps.google.com/maps?q=Abhishek%20Bungalows%2C%20Behind%20Aman%20Indian%20Colony%2C%20Hathijan%20Circle%2C%20Ahmedabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                ></iframe>
                
                {/* Map Overlay Gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-[#020617] dark:via-transparent dark:to-transparent opacity-60" />
            </motion.div>
        </div>
      </div>

      {/* Footer */}
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
                <li><a href="/" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Home</a></li>
                <li><a href="/#about" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> About Us</a></li>
                <li><a href="/#results" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Results</a></li>
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
                    className="bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-[#00E5FF]/20 shadow-2xl dark:shadow-[0_0_50px_rgba(0,229,255,0.1)] w-full max-w-2xl overflow-hidden relative"
                >
                    <button onClick={closeEnquiryModal} className="absolute top-4 right-4 text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors z-20"><X size={24} /></button>
                    
                    {enquirySubmitted ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-blue-100 dark:bg-[#00E5FF]/10 rounded-full flex items-center justify-center text-blue-600 dark:text-[#00E5FF] mb-6">
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 font-[Poppins]">Thank You!</h3>
                            <p className="text-slate-500 dark:text-gray-400 max-w-md">Your enquiry has been received. Our team will connect with you at your preferred time.</p>
                            <button onClick={closeEnquiryModal} className="mt-8 px-8 py-3 bg-blue-600 dark:bg-[#00E5FF] text-white dark:text-[#020617] font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-cyan-400 transition-colors">Close</button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <div className="p-6 md:p-8 bg-slate-50 dark:bg-[#020617] border-b border-slate-200 dark:border-white/5">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-[Poppins] flex items-center gap-3">
                                    <MessageCircle className="text-blue-600 dark:text-[#00E5FF]" /> Admission Enquiry
                                </h3>
                                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Fill in the details below to start your journey with us.</p>
                            </div>
                            
                            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                                <form id="enquiryForm" onSubmit={handleEnquirySubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Student Name</label>
                                            <input required className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" placeholder="Child's Name" value={enquiryForm.studentName} onChange={e => setEnquiryForm({...enquiryForm, studentName: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Your Name</label>
                                            <input required className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" placeholder="Parent/Guardian Name" value={enquiryForm.parentName} onChange={e => setEnquiryForm({...enquiryForm, parentName: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Relation with Student</label>
                                            <select required className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" value={enquiryForm.relation} onChange={e => setEnquiryForm({...enquiryForm, relation: e.target.value})}>
                                                <option value="" disabled>Select Relation</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Guardian">Guardian</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Grade Applying For</label>
                                            <select required className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" value={enquiryForm.grade} onChange={e => setEnquiryForm({...enquiryForm, grade: e.target.value})}>
                                                <option value="" disabled>Select Grade</option>
                                                {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Current School Name</label>
                                        <input required className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" placeholder="School Name" value={enquiryForm.schoolName} onChange={e => setEnquiryForm({...enquiryForm, schoolName: e.target.value})} />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-[#020617] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300">Is your child already getting coaching somewhere?</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enquiryForm.hasCoaching === true ? 'border-blue-500 dark:border-[#00E5FF]' : 'border-slate-400 dark:border-gray-500 group-hover:border-slate-600 dark:group-hover:border-gray-300'}`}>
                                                    {enquiryForm.hasCoaching === true && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-[#00E5FF]" />}
                                                </div>
                                                <input type="radio" name="coaching" className="hidden" checked={enquiryForm.hasCoaching === true} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: true, reason: ''})} />
                                                <span className="text-slate-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enquiryForm.hasCoaching === false ? 'border-blue-500 dark:border-[#00E5FF]' : 'border-slate-400 dark:border-gray-500 group-hover:border-slate-600 dark:group-hover:border-gray-300'}`}>
                                                    {enquiryForm.hasCoaching === false && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-[#00E5FF]" />}
                                                </div>
                                                <input type="radio" name="coaching" className="hidden" checked={enquiryForm.hasCoaching === false} onChange={() => setEnquiryForm({...enquiryForm, hasCoaching: false, reason: ''})} />
                                                <span className="text-slate-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">No</span>
                                            </label>
                                        </div>
                                        
                                        {enquiryForm.hasCoaching !== null && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                                <label className="text-xs font-bold text-blue-600 dark:text-[#00E5FF] uppercase block mb-1">
                                                    {enquiryForm.hasCoaching ? "Reason for Shifting" : "Reason for Tuition from us"}
                                                </label>
                                                <input required className="w-full bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] outline-none" placeholder={enquiryForm.hasCoaching ? "Why do you want to change?" : "Why are you looking for tuition?"} value={enquiryForm.reason} onChange={e => setEnquiryForm({...enquiryForm, reason: e.target.value})} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Mobile Number</label>
                                            <input required type="tel" className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" placeholder="10-digit Mobile" value={enquiryForm.mobile} onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase">Right Time to Connect</label>
                                            <input required type="text" className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-colors" placeholder="e.g. After 6 PM" value={enquiryForm.connectTime} onChange={e => setEnquiryForm({...enquiryForm, connectTime: e.target.value})} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#020617]/50 flex justify-end">
                                <button type="submit" form="enquiryForm" className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-[#00E5FF] dark:to-cyan-600 text-white dark:text-[#020617] px-8 py-3 rounded-xl font-bold hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2">
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

export default ContactUs;