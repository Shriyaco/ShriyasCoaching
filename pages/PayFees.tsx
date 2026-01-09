
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, SystemSettings, Student, GatewayConfig } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
    QrCode, Smartphone, Copy, Check, Shield, 
    ArrowRight, Search, User as UserIcon, 
    AlertCircle, Lock, CreditCard, Phone, 
    ShieldCheck, Zap, Waves, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 3D AMBIENT BACKGROUND ---
const SpatialBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020204]">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-premium-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-indigo-900/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20" />
    </div>
);

export default function PayFees() {
    const navigate = useNavigate();
    
    // State
    const [user, setUser] = useState<User | null>(null);
    const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    
    // Payment State
    const [amount, setAmount] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [agreedToPolicies, setAgreedToPolicies] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Selected Gateway
    const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);

    // Guest Lookup State
    const [lookupMobile, setLookupMobile] = useState('');
    const [lookupError, setLookupError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const load = async () => {
            const storedUser = sessionStorage.getItem('sc_user');
            const promises: any[] = [db.getSettings()];
            
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.role === 'student') {
                    setUser(parsed);
                    promises.push(db.getStudentById(parsed.id));
                }
            }

            const results = await Promise.all(promises);
            const s = results[0] as SystemSettings;
            const me = results[1] as Student | undefined;

            setSettings(s);
            const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
            if (firstKey) setSelectedGatewayKey(firstKey);

            if (me) {
                setIdentifiedStudent(me);
                setAmount(me.monthlyFees || '5000');
            }
        }
        load();
    }, []);

    const activeStudentId = user?.id || identifiedStudent?.id;
    const activeStudentName = identifiedStudent?.name || user?.username;

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLookupError('');
        if (lookupMobile.length < 10) {
            setLookupError("Enter a valid 10-digit mobile number.");
            return;
        }
        
        setIsSearching(true);
        try {
            const student = await db.findStudentByMobile(lookupMobile);
            if (student) {
                setIdentifiedStudent(student);
                setLookupError('');
                setAmount(student.monthlyFees || '5000');
            } else {
                setLookupError('No student found with this mobile number.');
            }
        } catch (err) {
            setLookupError('Network error. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStudentId || !activeStudentName || !transactionRef) return;
        if (!agreedToPolicies) {
            alert("You must acknowledge the legal policies before submitting.");
            return;
        }

        await db.addFeeSubmission({
            studentId: activeStudentId,
            studentName: activeStudentName,
            amount: amount,
            transactionRef: transactionRef,
            paymentMethod: 'Manual UPI'
        });
        setSubmitted(true);
    };

    const getDynamicQR = () => {
        const upiID = "tejanishriya64-3@oksbi";
        const name = "SHRIYA TEJANI";
        const am = amount || "0";
        const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${am}&cu=INR&mode=02`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}&ecc=M&margin=1`;
    };

    if (!settings) return (
        <div className="min-h-screen bg-[#020204] flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-premium-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Handshaking Gateways...</p>
        </div>
    );

    const currentGateway = selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-black overflow-x-hidden pt-32 transition-colors duration-300">
            <SEO 
                title="Pay Fees" 
                description="Secure official fee payment portal for Shriya's Coaching students." 
            />
            <SpatialBackground />
            <ThreeOrb className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none -translate-y-1/4" color="#C5A059" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 pb-24">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
                </button>

                <div className="mb-20 text-center md:text-left">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex flex-col md:flex-row md:items-end gap-4 mb-4"
                    >
                        <h1 className="text-5xl md:text-8xl font-light serif-font uppercase luxury-text-gradient tracking-tighter">Financials.</h1>
                        <div className="px-4 py-1 bg-premium-accent/10 border border-premium-accent/20 rounded-full w-fit mx-auto md:mx-0 mb-4 md:mb-6">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-premium-accent">Secure Transaction Layer</span>
                        </div>
                    </motion.div>
                    <p className="text-xs text-white/30 uppercase tracking-[0.4em] font-black">Official Tuition & Services Payment Terminal</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* --- LEFT WING: VERIFICATION & IDENTITY --- */}
                    <div className="lg:col-span-5 space-y-8">
                        <AnimatePresence mode="wait">
                            {!activeStudentId ? (
                                <motion.div 
                                    key="lookup"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white/[0.02] border border-white/5 p-10 rounded-[50px] shadow-2xl backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                        <Search size={120} />
                                    </div>
                                    <h3 className="text-2xl font-bold serif-font italic mb-8">Access Identity</h3>
                                    <form onSubmit={handleLookup} className="space-y-8">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase text-white/30 ml-2 tracking-widest">Registered Mobile Protocol</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-premium-accent" />
                                                <input 
                                                    type="tel" 
                                                    required
                                                    value={lookupMobile}
                                                    onChange={(e) => setLookupMobile(e.target.value)}
                                                    placeholder="Enter 10 Digits"
                                                    className="w-full bg-black border border-white/10 rounded-[28px] pl-14 pr-8 py-5 outline-none focus:border-premium-accent text-lg font-mono tracking-[0.3em] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSearching}
                                            className="w-full bg-white text-black py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-premium-accent hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                        >
                                            {isSearching ? 'Synchronizing...' : <><Search size={16} /> Locate Academic File</>}
                                        </button>
                                        
                                        {lookupError && (
                                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                                                <AlertCircle size={14} /> {lookupError}
                                            </motion.div>
                                        )}
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="identity"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="p-10 bg-premium-accent/5 border border-premium-accent/10 rounded-[50px] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                                            <UserIcon size={160} />
                                        </div>
                                        <p className="text-[9px] text-premium-accent font-black uppercase mb-4 tracking-[0.4em]">Verified Academic Entity</p>
                                        <h3 className="text-4xl font-bold text-white serif-font italic leading-tight mb-6">{activeStudentName}</h3>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white/50">Sector: Grade {identifiedStudent?.gradeId}</span>
                                            <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white/50">Hash ID: {identifiedStudent?.studentCustomId}</span>
                                        </div>

                                        {!user && (
                                            <button onClick={() => setIdentifiedStudent(null)} className="text-[8px] text-premium-accent/40 hover:text-premium-accent mt-8 font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors">
                                                <ArrowRight size={12}/> Reset Transmission Session
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[50px] relative">
                                        <label className="block text-[9px] font-black uppercase text-white/20 mb-4 tracking-widest ml-2">Transaction Value (INR)</label>
                                        <div className="flex items-end gap-4 border-b border-white/10 pb-4">
                                            <span className="text-4xl font-light text-premium-accent serif-font">₹</span>
                                            <input 
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="w-full bg-transparent text-6xl font-light serif-font text-white outline-none focus:text-premium-accent transition-colors"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-[8px] text-white/20 mt-4 uppercase font-black tracking-widest italic leading-relaxed">
                                            Value modifiable for modular or part-payment protocols. QR dynamic sync active.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center space-x-6 p-8 bg-white/[0.01] rounded-[40px] border border-white/5">
                            <div className="p-4 bg-emerald-500/5 rounded-2xl text-emerald-500 border border-emerald-500/10">
                                 <ShieldCheck size={32} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-1">Encrypted Gateway</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider leading-relaxed">Verified 256-bit institutional authentication.</p>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT WING: GATEWAY TERMINAL --- */}
                    <div className="lg:col-span-7 bg-[#0A0A0E] text-white rounded-[60px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-[600px] relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-premium-accent/[0.02] to-transparent pointer-events-none" />
                        
                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="h-full flex flex-col items-center justify-center p-16 text-center space-y-8"
                            >
                                <div className="w-32 h-32 bg-premium-accent/10 rounded-full flex items-center justify-center text-premium-accent mb-4 border border-premium-accent/20 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                                    <Check size={64} strokeWidth={3} className="animate-reveal" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-light serif-font italic luxury-text-gradient">Registry Updated.</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Transmission Logged for Verification</p>
                                </div>
                                <button onClick={() => navigate('/')} className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-premium-accent transition-all shadow-xl">Return to Hub</button>
                            </motion.div>
                        ) : (
                            <div className="p-12 flex-1 flex flex-col relative z-10">
                                {/* Gateway Switcher */}
                                <div className="mb-12 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                                    {Object.entries(settings.gateways)
                                        .filter(([_, conf]: [string, GatewayConfig]) => conf.enabled)
                                        .map(([key, conf]: [string, GatewayConfig]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedGatewayKey(key)}
                                            className={`px-8 py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] whitespace-nowrap transition-all border shrink-0 ${
                                                selectedGatewayKey === key 
                                                ? 'bg-white text-black border-white shadow-2xl' 
                                                : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {key === 'manual' ? <QrCode size={14} className="inline mr-2"/> : <Smartphone size={14} className="inline mr-2"/>}
                                            {conf.name}
                                        </button>
                                    ))}
                                </div>
                                
                                {currentGateway && (
                                    <div className="flex-1 flex flex-col animate-fade-in">
                                        {selectedGatewayKey === 'manual' ? (
                                            <div className="space-y-10 flex-1 flex flex-col">
                                                <div className="flex flex-col md:flex-row items-center gap-10">
                                                    <div className="p-6 bg-white border border-white/20 rounded-[40px] shadow-[0_20px_50px_rgba(255,255,255,0.05)] shrink-0">
                                                        <img 
                                                            src={getDynamicQR()}
                                                            alt="UPI QR Code" 
                                                            className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                                        />
                                                    </div>
                                                    <div className="space-y-6 flex-1">
                                                        <div className="bg-white/5 p-6 rounded-[32px] flex items-center justify-between border border-white/5">
                                                            <div className="overflow-hidden mr-4">
                                                                <p className="text-[8px] text-white/20 font-black uppercase mb-1 tracking-widest">Master Handle VPA</p>
                                                                <p className="text-sm font-mono text-premium-accent font-bold truncate">tejanishriya64-3@oksbi</p>
                                                            </div>
                                                            <button onClick={() => handleCopy('tejanishriya64-3@oksbi')} className="p-3 bg-white/5 hover:bg-premium-accent hover:text-black rounded-xl transition-all border border-white/10 group/copy">
                                                                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-4 p-5 bg-white/[0.02] rounded-[32px] border border-white/5">
                                                            <div className="w-10 h-10 rounded-xl bg-premium-accent/10 flex items-center justify-center text-premium-accent shrink-0"><Zap size={20}/></div>
                                                            <p className="text-[10px] font-bold text-white/40 uppercase leading-relaxed tracking-widest">Scan with any UPI app. QR updates in real-time based on input amount.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={handleManualSubmit} className="mt-auto space-y-8">
                                                    <div className="space-y-3">
                                                        <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em] ml-2">Verification Registry ID (UTR/TXN)</label>
                                                        <input 
                                                            required
                                                            type="text" 
                                                            placeholder="12 DIGIT REFERENCE"
                                                            value={transactionRef}
                                                            onChange={(e) => setTransactionRef(e.target.value)}
                                                            className="w-full bg-white/[0.03] border border-white/10 rounded-[28px] px-8 py-5 focus:border-premium-accent outline-none font-mono text-xl tracking-[0.5em] text-center uppercase transition-all"
                                                        />
                                                    </div>

                                                    <label className="flex items-start gap-4 cursor-pointer group p-2">
                                                        <div className="relative mt-1 shrink-0">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={agreedToPolicies} 
                                                                onChange={e => setAgreedToPolicies(e.target.checked)} 
                                                                className="sr-only" 
                                                            />
                                                            <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${agreedToPolicies ? 'bg-premium-accent border-premium-accent' : 'bg-white/5 border-white/20'}`}>
                                                                {agreedToPolicies && <Check size={12} className="text-black" strokeWidth={4} />}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-relaxed group-hover:text-white/60 transition-colors">
                                                            I verify transaction accuracy and agree to the <Link to="/terms-and-conditions" target="_blank" className="text-premium-accent underline">Terms</Link> & <Link to="/refund-policy" target="_blank" className="text-premium-accent underline">Refund Protocol</Link>.
                                                        </p>
                                                    </label>

                                                    <button 
                                                        disabled={!activeStudentId || !amount || !agreedToPolicies}
                                                        type="submit" 
                                                        className="w-full bg-white text-black py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-premium-accent hover:text-white transition-all active:scale-95 disabled:opacity-20"
                                                    >
                                                        {activeStudentId ? 'Commit Payment Log' : 'Authorize Identity to Pay'}
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-10 py-12">
                                                <div className="w-32 h-32 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center text-premium-accent shadow-2xl relative group-hover:scale-105 transition-transform duration-700">
                                                    <Smartphone size={64} strokeWidth={1} className="animate-pulse" />
                                                    <div className="absolute inset-0 rounded-full border-2 border-premium-accent/20 animate-ping opacity-20" />
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-3xl font-light serif-font italic">Handshake Pending.</h3>
                                                    <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.5em]">Establishing Connection with {currentGateway.name} Secure Cloud</p>
                                                </div>
                                                <button 
                                                    disabled={!activeStudentId}
                                                    className="w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.5em] bg-white text-black hover:bg-premium-accent hover:text-white transition-all shadow-2xl disabled:opacity-20 max-w-sm"
                                                >
                                                    {activeStudentId ? 'Launch Portal' : 'Identity Verification Required'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

