
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, Database, ChevronLeft, Info, Share2, Scale, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-black overflow-x-hidden pt-32 transition-colors duration-300">
      <SEO 
        title="Privacy Policy" 
        description="Official privacy policy and data protection guidelines for Shriya's Coaching Platform." 
      />
      <ThreeOrb className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none -translate-y-1/4" color="#C5A059" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
        </button>

        <div className="mb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-4 mb-6"
            >
                <div className="p-3 bg-premium-accent/10 rounded-xl text-premium-accent shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                    <Eye size={28} />
                </div>
                <h1 className="text-4xl md:text-6xl font-light serif-font uppercase luxury-text-gradient">Privacy Policy.</h1>
            </motion.div>
            <p className="text-xs text-white/30 uppercase tracking-[0.4em] font-black">Last Updated: October 2023</p>
        </div>

        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="space-y-12 text-white/70 leading-relaxed font-light text-sm md:text-base"
        >
            {/* Introduction */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <Info size={16} className="text-premium-accent" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Introduction</h2>
                </div>
                <p>
                    This Privacy Policy describes how <span className="font-bold text-white uppercase tracking-wider">Shriya Tejani</span> and its affiliates (collectively "Shriya Tejani, we, our, us") collect, use, share, protect or otherwise process your information/ personal data through our website <span className="text-premium-accent">https://shriyasgurukul.in/</span> (hereinafter referred to as Platform).
                </p>
                <p>
                    Please note that you may be able to browse certain sections of the Platform without registering with us. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India. By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree to be governed by the laws of India including but not limited to the laws applicable to data protection and privacy. If you do not agree please do not use or access our Platform.
                </p>
            </section>

            {/* Collection */}
            <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                    <Database size={20} className="text-premium-accent group-hover:scale-110 transition-transform" />
                    <h2 className="text-xl font-bold text-white serif-font italic">Data Collection</h2>
                </div>
                <p>
                    We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship. Some of the information that we may collect includes but is not limited to personal data / information provided to us during sign-up/registering or using our Platform such as name, date of birth, address, telephone/mobile number, email ID and/or any such information shared as proof of identity or address.
                </p>
                <p>
                    Some of the sensitive personal data may be collected with your consent, such as your bank account or credit or debit card or other payment instrument information or biometric information such as your facial features or physiological information etc. 
                </p>
                
                <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl mt-6 flex gap-4">
                    <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                    <p className="text-xs md:text-sm text-rose-200/70 font-bold italic">
                        If you receive an email, a call from a person/association claiming to be <span className="text-white not-italic">Shriya Tejani</span> seeking any personal data like debit/credit card PIN, net-banking or mobile banking password, we request you to never provide such information. If you have already revealed such information, report it immediately to an appropriate law enforcement agency.
                    </p>
                </div>
            </section>

            {/* Usage */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={16} className="text-premium-accent" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Data Usage</h2>
                </div>
                <p>
                    We use personal data to provide the services you request. To the extent we use your personal data to market to you, we will provide you the ability to opt-out of such uses. We use your personal data to assist sellers and business partners in handling and fulfilling orders; enhancing customer experience; to resolve disputes; troubleshoot problems; inform you about online and offline offers, products, services, and updates; customise your experience; detect and protect us against error, fraud and other criminal activity; enforce our terms and conditions; conduct marketing research, analysis and surveys; and as otherwise described to you at the time of collection of information.
                </p>
            </section>

            {/* Sharing */}
            <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4 group">
                <div className="flex items-center gap-3 mb-2">
                    <Share2 size={20} className="text-premium-accent" />
                    <h2 className="text-xl font-bold text-white serif-font italic">Information Sharing</h2>
                </div>
                <p>
                    We may share your personal data internally within our group entities, our other corporate entities, and affiliates to provide you access to the services and products offered by them. These entities and affiliates may market to you as a result of such sharing unless you explicitly opt-out.
                </p>
                <p>
                    We may disclose personal data to law enforcement offices, third party rights owners, or others in the good faith belief that such disclosure is reasonably necessary to: enforce our Terms of Use or Privacy Policy; respond to claims that an advertisement, posting or other content violates the rights of a third party; or protect the rights, property or personal safety of our users or the general public.
                </p>
            </section>

            {/* Security */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <Lock size={16} className="text-premium-accent" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Security Protocols</h2>
                </div>
                <p>
                    To protect your personal data from unauthorised access or disclosure, loss or misuse we adopt reasonable security practices and procedures. Once your information is in our possession, we adhere to our security guidelines to protect it against unauthorised access and offer the use of a secure server. However, the transmission of information is not completely secure for reasons beyond our control. Users are responsible for ensuring the protection of login and password records for their account.
                </p>
            </section>

            {/* Deletion and Retention */}
            <section className="p-8 border border-white/5 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <Trash2 size={20} className="text-rose-500" />
                    <h2 className="text-xl font-bold text-white serif-font italic">Deletion & Retention</h2>
                </div>
                <p>
                    You have an option to delete your account by visiting your profile and settings on our Platform, which would result in losing all information related to your account. We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law. However, we may retain data related to you if we believe it may be necessary to prevent fraud or future abuse or for other legitimate purposes.
                </p>
            </section>

            {/* Rights and Consent */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <Scale size={16} className="text-premium-accent" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Rights & Consent</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h4 className="text-white font-bold uppercase text-[11px] tracking-widest border-l-2 border-premium-accent pl-4">Your Rights</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                            You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-bold uppercase text-[11px] tracking-widest border-l-2 border-premium-accent pl-4">Your Consent</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                            By visiting our Platform, you consent to the collection, storage, and processing of your information in accordance with this Privacy Policy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Changes */}
            <section className="pt-10 border-t border-white/10">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Policy Updates</p>
                <p className="text-sm italic">
                    Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices and will notify you about significant changes in the manner required under applicable laws.
                </p>
            </section>

            <section className="pt-10 border-t border-white/10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Grievance Channel</p>
                <div className="flex flex-col gap-2">
                    <span className="text-lg serif-font text-premium-accent">admin@advedasolutions.in</span>
                </div>
            </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
