
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, SystemSettings, Student, GatewayConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import { QrCode, Smartphone, Copy, Check, Shield, ArrowRight, Search, User as UserIcon, AlertCircle, Lock, CreditCard, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayFees() {
    const navigate = useNavigate();
    
    // State
    const [user, setUser] = useState<User | null>(null);
    const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    
    // Payment State
    const [amount, setAmount] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Selected Gateway
    const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);

    // Guest Lookup State
    const [lookupMobile, setLookupMobile] = useState('');
    const [lookupError, setLookupError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role === 'student') {
                setUser(parsed);
                db.getStudents().then(all => {
                    const me = all.find(s => s.id === parsed.id);
                    if (me) {
                        setIdentifiedStudent(me);
                        setAmount(me.monthlyFees || '5000');
                    }
                });
            }
        }
        
        const load = async () => {
             const s = await db.getSettings();
             setSettings(s);
             const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
             if (firstKey) setSelectedGatewayKey(firstKey);
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

        await db.addFeeSubmission({
            studentId: activeStudentId,
            studentName: activeStudentName,
            amount: amount,
            transactionRef: transactionRef,
            paymentMethod: 'Manual UPI'
        });
        setSubmitted(true);
    };

    if (!settings) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    );

    const currentGateway = selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    // --- DYNAMIC QR GENERATION ---
    const getDynamicQR = () => {
        if (!currentGateway?.credentials.upiId) return "https://advedasolutions.in/qr.jpg"; // Fallback
        const upiID = currentGateway.credentials.upiId;
        const name = "Shriyas Gurukul";
        const am = amount || "0";
        const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${am}&cu=INR`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}`;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white relative font-sans pt-32 pb-16 px-4 flex justify-center">
             <ThreeOrb className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none" color="#00E5FF" />
            
             <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                
                {/* Left Side: Information */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h1 className="text-4xl font-extrabold font-[Poppins] mb-2 tracking-tight">Fee Payment</h1>
                        <p className="text-cyan-400 text-lg flex items-center gap-2">
                             <Shield size={20} /> Official Payment Portal
                        </p>
                    </div>
                    
                    {!activeStudentId ? (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#00E5FF]/10 rounded-2xl text-[#00E5FF]">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Student Verification</h3>
                                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Use Registered Mobile</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleLookup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Registered Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={lookupMobile}
                                        onChange={(e) => setLookupMobile(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        className="w-full bg-slate-800 border border-gray-600 rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#00E5FF] outline-none text-white transition-all text-xl font-mono"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSearching}
                                    className="w-full bg-gradient-to-r from-[#00E5FF] to-cyan-600 text-[#002366] py-4 rounded-xl hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all font-black text-lg flex items-center justify-center gap-2"
                                >
                                    {isSearching ? 'Verifying...' : <><Search size={20} /> Find Student Details</>}
                                </button>
                                
                                {lookupError && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
                                        <AlertCircle size={16} /> {lookupError}
                                    </div>
                                )}
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl shadow-lg backdrop-blur-md relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                    <UserIcon size={120} />
                                </div>
                                <p className="text-xs text-emerald-400 font-bold uppercase mb-2 tracking-widest">Identified Student</p>
                                <p className="text-3xl font-black text-white font-[Poppins] leading-tight">{activeStudentName}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-300">ID: {identifiedStudent?.studentCustomId}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-300">Grade: {identifiedStudent?.gradeId}</span>
                                </div>
                                {!user && (
                                    <button onClick={() => setIdentifiedStudent(null)} className="text-xs text-[#00E5FF] hover:underline mt-6 font-bold flex items-center gap-1">
                                        Not you? Change Mobile Number <ArrowRight size={14}/>
                                    </button>
                                )}
                            </div>
                            
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Payment Amount (₹)</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-5xl font-black text-white outline-none focus:text-[#00E5FF] transition-colors"
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 mt-2 italic">You can modify this amount for part-payments.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-4 p-5 bg-white/5 rounded-2xl border border-white/10 mt-auto">
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                             <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Secure Gateway</p>
                            <p className="text-xs text-gray-500">Your payments are protected and verified.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Methods */}
                <div className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 shadow-inner">
                                <Check size={48} strokeWidth={3} />
                            </motion.div>
                            <h3 className="text-3xl font-black text-gray-800 font-[Poppins]">Sent Successfully!</h3>
                            <p className="text-gray-500">Your payment reference has been recorded for verification.</p>
                            <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Done</button>
                        </div>
                    ) : (
                        <div className="p-8 flex-1 flex flex-col">
                            {/* Tabs */}
                            <div className="mb-8 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                {Object.entries(settings.gateways)
                                    .filter(([_, conf]: [string, GatewayConfig]) => conf.enabled)
                                    .map(([key, conf]: [string, GatewayConfig]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedGatewayKey(key)}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
                                            selectedGatewayKey === key 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                            : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        {key === 'manual' ? <QrCode size={18} className="inline mr-2"/> : <Smartphone size={18} className="inline mr-2"/>}
                                        {conf.name}
                                    </button>
                                ))}
                            </div>
                            
                            {currentGateway && (
                                <div className="flex-1 flex flex-col animate-fade-in">
                                    {selectedGatewayKey === 'manual' ? (
                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div className="flex justify-center">
                                                <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-xl">
                                                    <img 
                                                        src={getDynamicQR()}
                                                        alt="UPI QR Code" 
                                                        className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                                                <div className="overflow-hidden mr-2">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Receiver UPI ID</p>
                                                    <p className="text-sm font-mono text-slate-800 font-bold truncate">{currentGateway.credentials.upiId}</p>
                                                </div>
                                                <button onClick={() => handleCopy(currentGateway.credentials.upiId || '')} className="text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl transition-all border border-indigo-100">
                                                    {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>

                                            <form onSubmit={handleManualSubmit} className="mt-auto pt-6">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Transaction ID / UTR Number</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="Enter 12-digit number"
                                                    value={transactionRef}
                                                    onChange={(e) => setTransactionRef(e.target.value)}
                                                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none font-mono uppercase bg-slate-50 transition-all text-lg"
                                                />
                                                <button 
                                                    disabled={!activeStudentId || !amount}
                                                    type="submit" 
                                                    className="w-full mt-4 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    {activeStudentId ? 'Submit Payment Details' : 'Verify ID to Pay'}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                                            <div className="w-28 h-28 bg-white border-4 border-purple-50 rounded-full flex items-center justify-center text-purple-600 shadow-2xl">
                                                <Smartphone size={56} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 font-[Poppins]">Direct Checkout</h3>
                                            <p className="text-slate-500">Redirecting to {currentGateway.name} secure portal.</p>
                                            <button 
                                                disabled={!activeStudentId}
                                                className="w-full py-5 rounded-2xl font-black text-xl bg-purple-700 text-white hover:bg-purple-800 transition-all shadow-xl disabled:opacity-30"
                                            >
                                                {activeStudentId ? 'Pay Now' : 'Verify ID First'}
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
    );
}
