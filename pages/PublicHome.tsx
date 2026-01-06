
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import Footer from '../components/Footer';
import { db } from '../services/db';
import { Notice } from '../types';
import { ArrowRight, X, CheckCircle2, Zap, Users, Brain, Target, Star, Quote, Award, BookOpen, Trophy, Microscope, Layout } from 'lucide-react';
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

  // Dynamic Content State with Defaults
  const [content, setContent] = useState<any>({
      heroTitle1: 'Future',
      heroTitle2: 'Crafted here.',
      heroTagline: 'The Zenith of Learning',
      tickerText: 'ADMISSION OPENS FOR 2026-27. LIMITED SEATS AVAILABLE.',
      philHeading: 'Precision \n Mastery.',
      philDesc: "The most sophisticated coaching environment for primary years. Our collective experience and tailored methodology elevate education to a whole new level. We don't just teach; we sculpt intellects.",
      philImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000"
  });

  useEffect(() => {
    const load = async () => {
        try {
            const all = await db.getNotices();
            setNotices(all.filter(n => n.important));
            
            // Fetch CMS Content
            const cmsData = await db.getPageContent('home');
            if (cmsData) {
                // Merge with defaults to ensure no keys are missing
                setContent((prev: any) => ({ ...prev, ...cmsData }));
            }
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

  const headlineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const features = [
    { title: "Personal Attention", desc: "Limited batch size ensures every student gets individual guidance and mentorship, mimicking the ancient Gurukul system.", icon: Users },
    { title: "Concept Mastery", desc: "We focus on the 'Why' and 'How' before the 'What'. Deep conceptual clarity is prioritized over rote memorization.", icon: Brain },
    { title: "Regular Evaluation", desc: "Weekly tests and detailed performance analysis to track progress and identify improvement areas early.", icon: Target },
    { title: "Hybrid Ecosystem", desc: "The best of offline teaching combined with digital resources, recorded lectures, and smart notes for 24/7 support.", icon: Zap }
  ];

  const stats = [
    { value: "12+", label: "Years Experience" },
    { value: "850+", label: "Students Mentored" },
    { value: "100%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-premium-accent overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <ThreeHero />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={headlineVariants}
              className="flex flex-col items-center mb-10"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-premium-accent mb-8 block opacity-90">
                {content.heroTagline}
              </span>
              <h1 className="flex flex-col items-center">
                <span className="text-7xl md:text-[9rem] font-black uppercase tracking-tighter leading-none luxury-text-gradient font-[Montserrat]">
                  {content.heroTitle1}
                </span>
                <span className="text-5xl md:text-[7.5rem] font-light serif-font italic leading-none text-white/90 -mt-2 md:-mt-6">
                  {content.heroTitle2}
                </span>
              </h1>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              onClick={() => setIsEnquiryModalOpen(true)}
              className="group relative flex items-center gap-3 px-10 py-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-700 backdrop-blur-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-12"
            >
              <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.5em] ml-[0.5em]">ENROLL NOW</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="w-full max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/10 py-5 rounded-[2rem] overflow-hidden"
            >
                <div className="flex whitespace-nowrap">
                  <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-20 px-8 min-w-full shrink-0"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-10 shrink-0">
                        <div className="flex items-center gap-2">
                           <Zap size={14} className="text-premium-accent fill-premium-accent" />
                           <span className="text-premium-accent text-[10px] font-black uppercase tracking-[0.4em]">ALERT</span>
                        </div>
                        <p className="text-white/80 text-[11px] md:text-[13px] font-bold uppercase tracking-[0.2em]">
                            {content.tickerText}
                        </p>
                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                      </div>
                    ))}
                  </motion.div>
                </div>
            </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
          <span className="text-[8px] font-black uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* --- STATS BANNER --- */}
      <section className="py-20 border-b border-white/5 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, index) => (
                  <div key={index} className="py-8 md:py-0 text-center">
                      <h3 className="text-5xl md:text-6xl font-light serif-font text-white mb-2">{stat.value}</h3>
                      <p className="text-premium-accent text-[10px] font-black uppercase tracking-[0.4em]">{stat.label}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* --- Philosophy Section --- */}
      <section className="py-32 px-6 bg-[#050505]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                  <h2 className="text-5xl md:text-7xl font-light serif-font uppercase leading-tight whitespace-pre-line">{content.philHeading}</h2>
                  <p className="text-lg text-white/40 leading-relaxed font-light">
                      {content.philDesc}
                  </p>
                  <Link to="/why-us" className="inline-block text-premium-accent text-[11px] font-black uppercase tracking-[0.5em] border-b border-premium-accent/20 pb-1 hover:border-premium-accent transition-all">
                    OUR VISION
                  </Link>
              </div>
              <div className="h-[500px] bg-white/5 rounded-[60px] border border-white/5 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                <img src={content.philImage} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000 transform group-hover:scale-105" />
                <div className="absolute bottom-10 left-10 z-20">
                    <p className="text-white text-3xl serif-font italic">"Excellence is a habit."</p>
                </div>
              </div>
          </div>
      </section>

      {/* --- ACADEMIC PATHWAYS --- */}
      <section className="py-32 px-6 bg-[#030303] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
              <div className="mb-20 text-center md:text-left">
                  <h2 className="text-4xl md:text-6xl font-light serif-font uppercase mb-4">Academic <span className="text-premium-accent">Pathways</span></h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Structured Modules for every stage</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { icon: BookOpen, title: "Foundation Years", grade: "Grades 1 - 4", text: "Building robust basics in Math and Literacy through interactive learning and curiosity-driven modules." },
                      { icon: Microscope, title: "Transition Years", grade: "Grades 5 - 6", text: "Introduction to specialized sciences and complex logic. Bridging the gap between primary play and middle school rigor." },
                      { icon: Layout, title: "Mastery Years", grade: "Grades 7 - 8", text: "Advanced conceptual depth aligned with competitive exam standards. Preparing the mind for high school challenges." }
                  ].map((path, i) => (
                      <div key={i} className="p-12 bg-white/[0.02] border border-white/5 rounded-[48px] hover:bg-white/[0.04] transition-all group">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-10 group-hover:bg-premium-accent group-hover:text-black transition-colors">
                              <path.icon size={32} strokeWidth={1.5} />
                          </div>
                          <span className="text-premium-accent text-[9px] font-black uppercase tracking-[0.4em] mb-4 block">{path.grade}</span>
                          <h3 className="text-3xl font-light serif-font mb-6 text-white/90">{path.title}</h3>
                          <p className="text-sm text-white/40 leading-relaxed font-bold uppercase tracking-wider">{path.text}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- THE EDGE / FEATURES --- */}
      <section className="py-32 px-6 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 block mb-6">Why Choose Us</span>
                  <h2 className="text-4xl md:text-6xl font-light serif-font uppercase">The Shriya's <span className="text-premium-accent">Edge</span></h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((f, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -10 }} 
                        className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-premium-accent/30 transition-all group"
                      >
                          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-premium-accent mb-8 group-hover:bg-premium-accent group-hover:text-black transition-colors">
                              <f.icon size={28} strokeWidth={1.5} />
                          </div>
                          <h3 className="text-xl font-bold mb-4 text-white/90">{f.title}</h3>
                          <p className="text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- HALL OF FAME --- */}
      <section className="py-24 px-6 bg-premium-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-premium-accent/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex items-center gap-4 mb-16">
                  <Trophy size={32} className="text-premium-accent" />
                  <h2 className="text-4xl md:text-5xl font-light serif-font uppercase">Hall of <span className="text-premium-accent">Fame</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                      { label: "Olympiad Gold", value: "15+", sub: "National Level" },
                      { label: "Scholarship Exams", value: "100%", sub: "Selection Rate" },
                      { label: "A1 Grade", value: "92%", sub: "Board Results" },
                      { label: "Student Retention", value: "98%", sub: "Year on Year" }
                  ].map((stat, i) => (
                      <div key={i} className="p-8 border-l border-white/10">
                          <h4 className="text-5xl font-light text-white mb-2">{stat.value}</h4>
                          <p className="text-lg font-bold text-white/80 mb-1">{stat.label}</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{stat.sub}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOUNDER SECTION --- */}
      <section className="py-32 px-6 bg-[#050505] border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 items-center">
              <div className="md:w-2/5">
                  <div className="aspect-[3/4] rounded-[50px] overflow-hidden relative border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
                      <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000" alt="Mentor" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                          <p className="text-2xl serif-font text-white">Shriya Ma'am</p>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-premium-accent">Founder & Principal Mentor</p>
                      </div>
                  </div>
              </div>
              <div className="md:w-3/5 space-y-8">
                  <Quote size={64} className="text-white/10" />
                  <h2 className="text-4xl md:text-5xl font-light serif-font leading-tight">
                      "Education is not just about filling a bucket, but lighting a fire."
                  </h2>
                  <p className="text-lg text-white/40 leading-relaxed font-light">
                      With over a decade of experience in shaping young minds, we believe in education that goes beyond textbooks. Our unique methodology combines traditional values with modern pedagogical techniques to create a learning environment that is both rigorous and nurturing.
                  </p>
                  <div className="flex gap-8 pt-8">
                      <div>
                          <p className="text-3xl font-light serif-font text-white">12+</p>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Years exp.</p>
                      </div>
                      <div>
                          <p className="text-3xl font-light serif-font text-white">Masters</p>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Education</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-white/10 to-black border border-white/10 rounded-[60px] p-16 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              <div className="relative z-10">
                  <Award size={64} className="mx-auto text-premium-accent mb-8" />
                  <h2 className="text-4xl md:text-7xl font-light serif-font uppercase mb-8 leading-tight">Begin the <br/>Journey.</h2>
                  <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto">Limited seats available for the upcoming academic session. Secure your child's future today.</p>
                  <button onClick={() => setIsEnquiryModalOpen(true)} className="bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-premium-accent transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">Apply Now</button>
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
