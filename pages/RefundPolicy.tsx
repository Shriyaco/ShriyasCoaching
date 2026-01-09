
import React from 'react';
import { motion } from 'framer-motion';
// Added Check and X to the imports below
import { RefreshCcw, ShieldCheck, Clock, Mail, ChevronLeft, AlertCircle, Package, GraduationCap, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const RefundPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-black overflow-x-hidden pt-32 transition-colors duration-300">
      <SEO 
        title="Refund and Cancellation Policy" 
        description="Official refund, cancellation, and return policy for Shriya's Gurukul educational services and resin products." 
      />
      <ThreeOrb className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none -translate-y-1/4" color="#C5A059" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Hub</span>
        </button>

        <div className="mb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-4 mb-6"
            >
                <div className="p-3 bg-premium-accent/10 rounded-xl text-premium-accent shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                    <RefreshCcw size={28} />
                </div>
                <h1 className="text-4xl md:text-6xl font-light serif-font uppercase luxury-text-gradient leading-tight">Refund & Cancellation.</h1>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">Effective: 01/01/2025</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">Updated: 10/03/2025</p>
            </div>
        </div>

        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="space-y-16 text-white/70 leading-relaxed font-light text-sm md:text-base"
        >
            <section className="space-y-4">
                <p className="text-lg italic serif-font text-white/90">
                    At Shriya’s Gurukul, we value trust, transparency, and customer satisfaction. This policy explains the terms under which refunds, cancellations, and returns are processed for tuition services and resin products purchased through our website.
                </p>
            </section>

            {/* 1. Scope */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white serif-font italic flex items-center gap-3">
                    <ShieldCheck className="text-premium-accent" size={20} /> 1. Scope of This Policy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-2">Sector A</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Online/Offline Tuition Fees</p>
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-2">Sector B</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Resin Physical Products</p>
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-2">Sector C</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">All Digital Transactions</p>
                    </div>
                </div>
            </section>

            {/* 2. Tuition Fees */}
            <section className="space-y-8">
                <h2 className="text-xl font-bold text-white serif-font italic flex items-center gap-3 border-b border-white/10 pb-4">
                    <GraduationCap className="text-premium-accent" size={20} /> 2. Tuition Fees & Educational Services
                </h2>
                
                <div className="space-y-6 pl-4 md:pl-8 border-l border-white/5">
                    <div className="space-y-3">
                        <h3 className="text-white font-bold uppercase text-[11px] tracking-widest">2.1 Payment Terms</h3>
                        <p>Tuition fees must be paid in advance to confirm enrollment. Access to classes, schedules, learning materials, or recorded content is granted only after successful payment.</p>
                    </div>
                    
                    <div className="space-y-3">
                        <h3 className="text-emerald-400 font-bold uppercase text-[11px] tracking-widest">2.2 Refund Eligibility</h3>
                        <p>Refunds are strictly limited and considered only in the following situations:</p>
                        <ul className="space-y-2 list-none text-xs md:text-sm">
                            <li className="flex gap-2 items-start"><Check className="text-emerald-500 shrink-0" size={14}/> Duplicate payment made by the customer</li>
                            <li className="flex gap-2 items-start"><Check className="text-emerald-500 shrink-0" size={14}/> Payment debited but not reflected due to technical/gateway error</li>
                            <li className="flex gap-2 items-start"><Check className="text-emerald-500 shrink-0" size={14}/> Cancellation request raised before the commencement of classes, provided no sessions or materials have been accessed</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-rose-400 font-bold uppercase text-[11px] tracking-widest">2.3 Non-Refundable Status</h3>
                        <p>Refunds will NOT be issued if:</p>
                        <ul className="space-y-2 list-none text-xs md:text-sm opacity-60">
                            <li className="flex gap-2 items-start"><X className="text-rose-500 shrink-0" size={14}/> The student has attended one or more classes</li>
                            <li className="flex gap-2 items-start"><X className="text-rose-500 shrink-0" size={14}/> Any recorded session, notes, or learning resources have been accessed</li>
                            <li className="flex gap-2 items-start"><X className="text-rose-500 shrink-0" size={14}/> The request is made after the course or batch has started</li>
                            <li className="flex gap-2 items-start"><X className="text-rose-500 shrink-0" size={14}/> Non-attendance is due to personal reasons (absence, conflicts, loss of interest)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 3. Resin Products */}
            <section className="space-y-8 p-8 bg-white/[0.02] border border-white/5 rounded-[40px]">
                <h2 className="text-xl font-bold text-white serif-font italic flex items-center gap-3">
                    <Package className="text-premium-accent" size={20} /> 3. Resin Products (Physical Goods)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-white font-bold uppercase text-[11px] tracking-widest">3.1 Return Window</h3>
                        <p className="text-sm">Customers may request a return or refund within <span className="text-white font-bold">7 days</span> from the date of delivery. The product must be unused, undamaged, and in original packaging.</p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-white font-bold uppercase text-[11px] tracking-widest">3.2 Damage Protocol</h3>
                        <p className="text-sm">Issues must be reported within <span className="text-white font-bold">48 hours</span> of delivery. Clear photos/videos are mandatory for verification to authorize a replacement or refund.</p>
                    </div>
                </div>
            </section>

            {/* 4. Cancellations */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white serif-font italic flex items-center gap-3 border-b border-white/10 pb-4">
                    <X className="text-premium-accent" size={20} /> 4. Order Cancellations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h4 className="text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-premium-accent rounded-full" /> Services</h4>
                        <p className="text-xs">Requests must be emailed before classes begin to be considered for cancellation.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-premium-accent rounded-full" /> Product Orders</h4>
                        <p className="text-xs">Orders can be cancelled before shipment only. Once shipped, the standard return policy applies.</p>
                    </div>
                </div>
            </section>

            {/* 5. Process & Timelines */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white serif-font italic flex items-center gap-3">
                    <Clock className="text-premium-accent" size={20} /> 5. Refund Process & Timelines
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><RefreshCcw size={120} /></div>
                    <p className="mb-6">Send requests to <span className="text-premium-accent font-bold">support@shriyasgurukul.in</span> with:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 mb-8 text-[11px] font-black uppercase tracking-widest text-white/40">
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-premium-accent rounded-full" /> Full Name</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-premium-accent rounded-full" /> Order / Transaction ID</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-premium-accent rounded-full" /> Date of Payment</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-premium-accent rounded-full" /> Reason for Refund</li>
                    </ul>
                    <div className="flex flex-col md:flex-row gap-6 md:items-center p-6 bg-black/40 rounded-2xl border border-white/5">
                        <div className="flex-1">
                            <p className="text-xs md:text-sm italic">Approved refunds are processed within <span className="text-white font-bold">7–15 business days</span> to the original payment method only.</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0 flex items-center gap-3">
                             <AlertCircle size={16} className="text-amber-500" />
                             <span className="text-[9px] font-black uppercase text-white/50">Note: Bank fees may be deducted</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Non-Refundable */}
            <section className="space-y-4 border-l-2 border-rose-500/20 pl-8">
                <h2 className="text-xl font-bold text-white serif-font italic">6. Non-Refundable Items & Charges</h2>
                <p className="text-sm opacity-60">Convenience fees, payment gateway charges, and customized or personalized products are non-refundable unless required by law.</p>
            </section>

            {/* 7. Support */}
            <section className="pt-10 border-t border-white/10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Communication & Support</p>
                <div className="flex flex-col gap-2">
                    <a href="mailto:support@shriyasgurukul.in" className="text-xl md:text-2xl serif-font text-premium-accent hover:underline flex items-center gap-3">
                        <Mail size={24}/> support@shriyasgurukul.in
                    </a>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">Response window: 2–3 business days</p>
                </div>
            </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
