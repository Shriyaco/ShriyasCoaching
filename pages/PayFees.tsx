import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, SystemSettings, Student, GatewayConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import ThreeOrb from '../components/ThreeOrb';
import { QrCode, Smartphone, Copy, Check, Shield, ArrowRight, Search, User as UserIcon, AlertCircle, Lock, CreditCard } from 'lucide-react';

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
    
    // New: Selected Gateway
    const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);

    // Guest Lookup State
    const [lookupEmail, setLookupEmail] = useState('');
    const [lookupError, setLookupError] = useState('');

    useEffect(() => {
        // Check for logged-in user
        const storedUser = sessionStorage.getItem('sc_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role === 'student') {
                setUser(parsed);
            }
        }
        
        const load = async () => {
             const s = await db.getSettings();
             setSettings(s);
             // Auto-select first enabled gateway
             const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
             if (firstKey) setSelectedGatewayKey(firstKey);
        }
        load();
    }, []);

    // Determine who is paying
    const activeStudentId = user?.id || identifiedStudent?.id;
    const activeStudentName = user?.username || identifiedStudent?.name;

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        const students = await db.getStudents();
        const found = students.find(s => s.email && s.email.toLowerCase() === lookupEmail.toLowerCase().trim());
        
        if (found) {
            setIdentifiedStudent(found);
            setLookupError('');
        } else {
            setLookupError('Student record not found. Please check the email.');
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
                        <h1 className="text-4xl font-extrabold font-[Poppins] mb-2">Pay Fees</h1>
                        <p className="text-cyan-400 text-lg">Secure Student Portal</p>
                    </div>
                    
                    {!activeStudentId ? (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 shadow-lg backdrop-blur-sm">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                <UserIcon className="text-[#00E5FF]" /> Student Identification
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Please identify the student account to link your payment. You can scan the QR code first, but identification is required to submit.
                            </p>
                            
                            <form onSubmit={handleLookup} className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Registered Email Address</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="email" 
                                            required
                                            value={lookupEmail}
                                            onChange={(e) => setLookupEmail(e.target.value)}
                                            placeholder="student@example.com"
                                            className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00E5FF] outline-none text-white transition-all"
                                        />
                                        <button type="submit" className="bg-[#00E5FF] text-[#002366] px-4 rounded-lg hover:bg-cyan-400 transition-colors font-bold">
                                            <Search size={20} />
                                        </button>
                                    </div>
                                    {lookupError && (
                                        <div className="flex items-center gap-2 mt-3 text-rose-400 text-sm animate-pulse bg-rose-400/10 p-2 rounded">
                                            <AlertCircle size={14} /> {lookupError}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-center text-gray-500 pt-2 border-t border-white/10">
                                    <span className="cursor-pointer hover:text-white transition-colors underline" onClick={() => navigate('/login')}>Already have an account? Login here</span>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4 text-gray-300 animate-fade-in">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-lg backdrop-blur-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-emerald-400 font-bold uppercase mb-1 tracking-wider">Paying Fees For</p>
                                        <p className="text-2xl font-bold text-white font-[Poppins]">{activeStudentName}</p>
                                        <p className="text-sm opacity-70 mt-1">{user ? 'Logged In User' : identifiedStudent?.email}</p>
                                    </div>
                                    <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                                        <Check size={24} />
                                    </div>
                                </div>
                                {!user && (
                                    <button onClick={() => setIdentifiedStudent(null)} className="text-xs text-[#00E5FF] hover:text-white transition-colors mt-4 flex items-center gap-1">
                                        Change Student <ArrowRight size={12}/>
                                    </button>
                                )}
                            </div>
                            
                             <div className="pt-4 px-2">
                                <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-bold">Total Payable Amount</p>
                                <p className="text-5xl font-extrabold text-white tracking-tight">₹{amount}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-auto">
                        <Shield className="text-emerald-400" size={24} />
                        <div>
                            <p className="text-sm font-bold text-white">Secure Transaction</p>
                            <p className="text-xs text-gray-400">256-bit SSL Encrypted Payment</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Methods */}
                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col min-h-[550px]">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 animate-fade-in">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 shadow-inner">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-2">Success!</h3>
                                <p className="text-gray-500 text-lg">Submission Received</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transaction Ref</p>
                                <p className="font-mono font-bold text-xl text-gray-800 tracking-wider">{transactionRef}</p>
                            </div>
                            <button onClick={() => navigate('/')} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">Return Home</button>
                        </div>
                    ) : (
                        <div className="p-8 flex-1 flex flex-col">
                            {/* Payment Method Tabs */}
                            <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                {Object.entries(settings.gateways)
                                    .filter(([_, conf]) => conf.enabled)
                                    .map(([key, conf]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedGatewayKey(key)}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 border ${
                                            selectedGatewayKey === key 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {key === 'manual' ? <QrCode size={16}/> : <Smartphone size={16}/>}
                                        {conf.name}
                                    </button>
                                ))}
                                {Object.values(settings.gateways).every(g => !g.enabled) && (
                                    <p className="text-sm text-gray-400 italic w-full text-center">No payment methods enabled.</p>
                                )}
                            </div>
                            
                            {/* Selected Gateway Content */}
                            {currentGateway && (
                                <div className="flex-1 flex flex-col animate-fade-in">
                                    <div className="mb-6 pb-6 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                            {selectedGatewayKey === 'manual' ? <QrCode className="text-indigo-600"/> : <CreditCard className="text-purple-600"/>}
                                            {currentGateway.name}
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">INR</span>
                                    </div>

                                    {selectedGatewayKey === 'manual' ? (
                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div className="flex justify-center py-4">
                                                <div className="p-4 bg-white border-2 border-indigo-50 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${currentGateway.credentials.upiId || ''}&pn=ShriyasCoaching&cu=INR`)}`}
                                                        alt="UPI QR Code" 
                                                        className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                                                <div className="overflow-hidden mr-2">
                                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Pay to UPI ID</p>
                                                    <p className="text-sm md:text-base font-mono text-indigo-900 font-bold truncate select-all">{currentGateway.credentials.upiId}</p>
                                                </div>
                                                <button onClick={() => handleCopy(currentGateway.credentials.upiId || '')} className="text-indigo-600 hover:text-indigo-800 p-2 bg-white rounded-lg shadow-sm hover:shadow transition-all">
                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>

                                            <form onSubmit={handleManualSubmit} className="mt-auto pt-6 border-t border-gray-50">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Reference ID (UTR)</label>
                                                <div className="space-y-3">
                                                    <input 
                                                        required
                                                        type="text" 
                                                        placeholder="e.g. 3324XXXXXXXX"
                                                        value={transactionRef}
                                                        onChange={(e) => setTransactionRef(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
                                                    />
                                                    
                                                    {activeStudentId ? (
                                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
                                                            Submit Payment Details
                                                        </button>
                                                    ) : (
                                                        <div className="bg-gray-100 text-gray-500 py-3 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                                            <Lock size={16} /> Identify Student to Submit
                                                        </div>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                                <div className="w-24 h-24 bg-white border-2 border-purple-100 rounded-full flex items-center justify-center text-purple-600 relative z-10 shadow-lg">
                                                    <Smartphone size={48} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">Pay via {currentGateway.name}</h3>
                                                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">Secure instant payment gateway. You will be redirected to complete the transaction.</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => initiateGatewayPayment(selectedGatewayKey!)}
                                                disabled={!activeStudentId}
                                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                                                    ${activeStudentId 
                                                        ? 'bg-[#5f259f] hover:bg-[#4a1c7c] text-white hover:shadow-purple-500/30 transform hover:-translate-y-0.5' 
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                {activeStudentId ? <>Proceed to Pay <ArrowRight size={20} /></> : <>Identify Student to Pay <Lock size={18}/></>}
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