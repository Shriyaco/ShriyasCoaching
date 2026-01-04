
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, SystemSettings, Student, GatewayConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import { QrCode, Smartphone, Copy, Check, Shield, ArrowRight, Search, User as UserIcon, AlertCircle, Lock, CreditCard, Phone } from 'lucide-react';
// Import motion for animations
import { motion } from 'framer-motion';

export default function PayFees() {
    const navigate = useNavigate();
    
    // State
    const [user, setUser] = useState<User | null>(null);
    const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    
    // Payment State
    const [amount, setAmount] = useState('5000'); // Default mock amount
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
                // Also fetch full details for accurate name if needed
                db.getStudents().then(all => {
                    const me = all.find(s => s.id === parsed.id);
                    if (me) setIdentifiedStudent(me);
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
            setLookupError("Please enter a valid 10-digit mobile number.");
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

    const initiateGatewayPayment = (gatewayKey: string) => {
        if (!activeStudentId) return;
        const gwName = settings?.gateways[gatewayKey]?.name || 'Gateway';
        alert(`Redirecting to ${gwName} Secure Gateway...\n(Integration Pending - Using Mock)`);
    };

    if (!settings) return null;

    const currentGateway = selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    return (
        <div className="min-h-screen bg-slate-900 text-white relative font-sans pt-32 pb-16 px-4 flex justify-center">
             <ThreeOrb className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none" color="#00E5FF" />
            
             <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                
                {/* Left Side: Information */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h1 className="text-4xl font-extrabold font-[Poppins] mb-2 tracking-tight">Pay Fees</h1>
                        <p className="text-cyan-400 text-lg flex items-center gap-2">
                             <Shield size={20} /> Secure Student Portal
                        </p>
                    </div>
                    
                    {!activeStudentId ? (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#00E5FF]/10 rounded-2xl text-[#00E5FF]">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Student Identification</h3>
                                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Verification Required</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleLookup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Registered Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                        <input 
                                            type="tel" 
                                            required
                                            value={lookupMobile}
                                            onChange={(e) => setLookupMobile(e.target.value)}
                                            placeholder="Enter your 10-digit mobile"
                                            className="w-full bg-slate-800 border border-gray-600 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#00E5FF] outline-none text-white transition-all placeholder-gray-600 text-lg font-mono"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSearching}
                                    className="w-full bg-gradient-to-r from-[#00E5FF] to-cyan-600 text-[#002366] py-4 rounded-xl hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSearching ? <div className="w-6 h-6 border-2 border-[#002366]/30 border-t-[#002366] rounded-full animate-spin" /> : <><Search size={20} /> Verify Details</>}
                                </button>
                                
                                {lookupError && (
                                    <div className="flex items-center gap-2 mt-3 text-rose-400 text-sm animate-pulse bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
                                        <AlertCircle size={16} /> {lookupError}
                                    </div>
                                )}

                                <div className="text-xs text-center text-gray-500 pt-4 border-t border-white/5">
                                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/login')}>Need help? Contact administrator or login to portal.</span>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6 text-gray-300 animate-fade-in">
                            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl shadow-lg backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <UserIcon size={120} />
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs text-emerald-400 font-bold uppercase mb-2 tracking-widest">Identified Student</p>
                                        <p className="text-3xl font-black text-white font-[Poppins] leading-tight">{activeStudentName}</p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-300">ID: {identifiedStudent?.studentCustomId || user?.id}</span>
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-300">Class: {identifiedStudent?.gradeId}</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500 text-[#020617] p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                        <Check size={24} strokeWidth={3} />
                                    </div>
                                </div>
                                {!user && (
                                    <button onClick={() => setIdentifiedStudent(null)} className="text-xs text-[#00E5FF] hover:text-white transition-colors mt-6 flex items-center gap-1 font-bold">
                                        Not you? Change Mobile Number <ArrowRight size={14}/>
                                    </button>
                                )}
                            </div>
                            
                             <div className="pt-4 px-4 border-l-4 border-[#00E5FF] bg-white/5 py-4 rounded-r-2xl">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">Amount to Pay</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white tracking-tight">₹{amount}</span>
                                    <span className="text-gray-500 font-bold">/ month</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-4 p-5 bg-white/5 rounded-2xl border border-white/10 mt-auto">
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                             <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Encrypted Transaction</p>
                            <p className="text-xs text-gray-500">Your payment data is fully secured using SSL.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Methods */}
                <div className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 animate-fade-in">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 shadow-inner">
                                <Check size={48} strokeWidth={3} />
                            </motion.div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 mb-2 font-[Poppins]">Submission Success!</h3>
                                <p className="text-gray-500 text-lg">We have received your payment proof.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Reference ID</p>
                                <p className="font-mono font-bold text-2xl text-indigo-600 tracking-wider select-all">{transactionRef}</p>
                            </div>
                            <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-0.5">Return to Homepage</button>
                        </div>
                    ) : (
                        <div className="p-8 flex-1 flex flex-col">
                            {/* Payment Method Tabs */}
                            <div className="mb-8 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                {Object.entries(settings.gateways)
                                    .filter(([_, conf]: [string, GatewayConfig]) => conf.enabled)
                                    .map(([key, conf]: [string, GatewayConfig]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedGatewayKey(key)}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                                            selectedGatewayKey === key 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                                            : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        {key === 'manual' ? <QrCode size={18}/> : <Smartphone size={18}/>}
                                        {conf.name}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Selected Gateway Content */}
                            {currentGateway && (
                                <div className="flex-1 flex flex-col animate-fade-in">
                                    <div className="mb-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black flex items-center gap-2 text-slate-800 font-[Poppins]">
                                                {selectedGatewayKey === 'manual' ? <QrCode className="text-indigo-600"/> : <CreditCard className="text-purple-600"/>}
                                                {currentGateway.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">Gateway Provider</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-500 uppercase">Secure</span>
                                        </div>
                                    </div>

                                    {selectedGatewayKey === 'manual' ? (
                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div className="flex justify-center py-2">
                                                <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-xl">
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${currentGateway.credentials.upiId || ''}&pn=ShriyasCoaching&am=${amount}&cu=INR`)}`}
                                                        alt="UPI QR Code" 
                                                        className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                                                <div className="overflow-hidden mr-2">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Receiver UPI ID</p>
                                                    <p className="text-sm md:text-base font-mono text-slate-800 font-bold truncate select-all">{currentGateway.credentials.upiId}</p>
                                                </div>
                                                <button onClick={() => handleCopy(currentGateway.credentials.upiId || '')} className="text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl transition-all border border-indigo-100">
                                                    {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>

                                            <form onSubmit={handleManualSubmit} className="mt-auto pt-6 border-t border-slate-100">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Transaction UTR / Reference ID</label>
                                                <div className="space-y-4">
                                                    <input 
                                                        required
                                                        type="text" 
                                                        placeholder="Enter the 12-digit UTR number"
                                                        value={transactionRef}
                                                        onChange={(e) => setTransactionRef(e.target.value)}
                                                        className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none font-mono uppercase text-slate-800 placeholder-slate-300 bg-slate-50 transition-all text-lg"
                                                    />
                                                    
                                                    {activeStudentId ? (
                                                        <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl transition-all transform hover:-translate-y-0.5">
                                                            Submit Transaction Detail
                                                        </button>
                                                    ) : (
                                                        <div className="bg-slate-100 text-slate-400 py-4 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-slate-200">
                                                            <Lock size={18} /> Verify Student to Enable
                                                        </div>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-purple-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                                                <div className="w-28 h-28 bg-white border-4 border-purple-50 rounded-full flex items-center justify-center text-purple-600 relative z-10 shadow-2xl">
                                                    <Smartphone size={56} strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-800 mb-2 font-[Poppins]">Auto-Gateway Pay</h3>
                                                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">Click below to proceed to the secure {currentGateway.name} checkout portal.</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => initiateGatewayPayment(selectedGatewayKey!)}
                                                disabled={!activeStudentId}
                                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3
                                                    ${activeStudentId 
                                                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:shadow-purple-500/40 transform hover:-translate-y-1' 
                                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-dashed border-slate-200 shadow-none'}`}
                                            >
                                                {activeStudentId ? <>Launch Secure Checkout <ArrowRight size={24} /></> : <>Verify ID First <Lock size={20}/></>}
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
