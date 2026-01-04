
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Order, User, SystemSettings, GatewayConfig } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { ShoppingBag, ArrowRight, Check, X, CreditCard, Smartphone, QrCode, Copy, MapPin, User as UserIcon, Phone, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry"
];

const Shop: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'my-orders'>('products');
    
    // Form States
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [checkoutForm, setCheckoutForm] = useState({ 
        name: '', 
        customName: '', 
        changeRequest: '', 
        address: '', 
        pincode: '', 
        state: 'Gujarat', 
        mobile: '' 
    });
    
    // Payment States
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);
    const [transactionRef, setTransactionRef] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            const p = await db.getProducts();
            setProducts(p);
            
            const storedUser = sessionStorage.getItem('sc_user');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                setUser(u);
                setCheckoutForm(prev => ({ ...prev, name: u.username }));
                if (u.role === 'student') {
                    const o = await db.getOrders(u.id);
                    setOrders(o);
                }
            }
        };
        load();
    }, []);

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setIsSubmitting(true);
        
        try {
            const orderData: Omit<Order, 'id' | 'createdAt'> = {
                studentId: user?.id || 'guest',
                studentName: checkoutForm.name,
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                productImage: selectedProduct.imageUrl,
                customName: checkoutForm.customName,
                changeRequest: checkoutForm.changeRequest,
                address: checkoutForm.address,
                pincode: checkoutForm.pincode,
                state: checkoutForm.state,
                mobile: checkoutForm.mobile,
                status: 'Payment Pending',
                finalPrice: selectedProduct.basePrice
            };
            
            const newOrder = await db.createOrder(orderData);
            setActiveOrder(newOrder);
            setSelectedProduct(null);
            
            // Prepare payment config
            const s = await db.getSettings();
            setSettings(s);
            const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
            if (firstKey) setSelectedGatewayKey(firstKey);

        } catch (err) {
            alert("Error creating order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentRefSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeOrder || !transactionRef) return;
        
        await db.updateOrder(activeOrder.id, { 
            status: 'Payment Under Verification',
            transactionRef: transactionRef
        });
        
        alert("Payment details submitted! Status: Under Verification.");
        setActiveOrder(null);
        setTransactionRef('');
        if (user && user.role === 'student') {
            const o = await db.getOrders(user.id);
            setOrders(o);
        }
        setActiveTab('my-orders');
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentGateway = settings && selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            <ThreeOrb className="absolute top-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/2" color="#f472b6" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-[Poppins] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                        Creative Resin Shop
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400">Unique handcrafted pieces for your home and school.</p>
                </div>

                <div className="flex justify-center mb-10 space-x-4">
                    <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'products' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500'}`}>Products</button>
                    {user?.role === 'student' && <button onClick={() => setActiveTab('my-orders')} className={`px-6 py-2 rounded-full font-bold transition-all relative ${activeTab === 'my-orders' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500'}`}>Track Orders</button>}
                </div>

                {activeTab === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0B1120] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 group h-full flex flex-col">
                                <div className="h-64 bg-slate-100 dark:bg-black/50 relative overflow-hidden shrink-0">
                                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={48} /></div>}
                                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-4 py-1 rounded-full text-sm font-black shadow-lg">₹{product.basePrice}</div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 line-clamp-3">{product.description}</p>
                                    <div className="mt-auto">
                                        <button 
                                            onClick={() => user ? setSelectedProduct(product) : navigate('/login')} 
                                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                                        >
                                            Buy Now <ArrowRight size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {orders.map(order => (
                            <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border dark:border-white/5">{order.productImage ? <img src={order.productImage} className="w-full h-full object-cover"/> : <ShoppingBag className="m-auto text-slate-400"/>}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{order.productName}</h3>
                                        <p className="text-[10px] text-slate-400 font-mono mb-1">ID: #{order.id.slice(0, 8)}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                order.status === 'Processing Order' ? 'bg-blue-100 text-blue-600' : 
                                                order.status === 'Payment Under Verification' ? 'bg-amber-100 text-amber-600' :
                                                order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Amount Paid</p>
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{order.finalPrice}</span>
                                    </div>
                                    {order.status === 'Payment Pending' && (
                                        <button onClick={() => { setActiveOrder(order); db.getSettings().then(s => { setSettings(s); const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled); if (firstKey) setSelectedGatewayKey(firstKey); }); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm"><CreditCard size={16}/> Retry Payment</button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {orders.length === 0 && <div className="text-center py-20 text-slate-400">No purchase history found.</div>}
                    </div>
                )}
            </div>

            {/* Step 1: Order Details Form Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                             <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white shrink-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-2xl font-black font-[Poppins]">Order Details</h3>
                                    <button onClick={() => setSelectedProduct(null)}><X size={24}/></button>
                                </div>
                                <p className="text-xs opacity-80 uppercase font-black tracking-widest">{selectedProduct.name} • ₹{selectedProduct.basePrice}</p>
                             </div>
                             
                             <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                 <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><UserIcon size={12}/> Your Full Name</label>
                                             <input required value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="John Doe" />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Phone size={12}/> Mobile Number</label>
                                             <input required type="tel" value={checkoutForm.mobile} onChange={e => setCheckoutForm({...checkoutForm, mobile: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="10-digit mobile" />
                                         </div>
                                     </div>

                                     <div className="space-y-1">
                                         <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">Customization Requirements</label>
                                         <textarea required value={checkoutForm.customName} onChange={e => setCheckoutForm({...checkoutForm, customName: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 h-20 outline-none resize-none focus:ring-2 focus:ring-purple-500" placeholder="What names or text should be on the resin art?" />
                                     </div>

                                     <div className="space-y-1">
                                         <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">Shipping Address</label>
                                         <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 h-24 outline-none resize-none focus:ring-2 focus:ring-purple-500" placeholder="Street, House No, Landmark..." />
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Hash size={12}/> Pincode</label>
                                             <input required value={checkoutForm.pincode} onChange={e => setCheckoutForm({...checkoutForm, pincode: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="6-digit pincode" />
                                         </div>
                                         <div className="space-y-1">
                                             <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><MapPin size={12}/> State</label>
                                             <select required value={checkoutForm.state} onChange={e => setCheckoutForm({...checkoutForm, state: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none bg-white focus:ring-2 focus:ring-purple-500">
                                                 {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                             </select>
                                         </div>
                                     </div>

                                     <div className="pt-4">
                                         <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                             {isSubmitting ? 'Creating Order...' : 'Proceed to Payment'}
                                         </button>
                                     </div>
                                 </form>
                             </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 2: Payment Modal */}
            <AnimatePresence>
                {activeOrder && settings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
                            <button onClick={() => setActiveOrder(null)} className="absolute top-4 right-4 text-white z-20 hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
                            
                            {/* Invoice Sidebar */}
                            <div className="w-full md:w-2/5 bg-slate-900 p-8 text-white flex flex-col justify-between border-r border-white/5">
                                <div>
                                    <h3 className="font-bold text-2xl mb-2 text-[#00E5FF]">Payment</h3>
                                    <p className="text-xs text-slate-400 font-mono mb-6">Order ID: #{activeOrder.id.slice(0, 8)}</p>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Shipping To</p>
                                            <p className="text-sm font-bold truncate">{activeOrder.studentName}</p>
                                            <p className="text-xs text-slate-400 truncate">{activeOrder.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Product</p>
                                            <p className="text-sm font-bold">{activeOrder.productName}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total Amount</p>
                                    <p className="text-5xl font-black text-[#00E5FF] tracking-tighter">₹{activeOrder.finalPrice}</p>
                                </div>
                            </div>

                            {/* Gateway Content */}
                            <div className="w-full md:w-3/5 p-8 bg-white dark:bg-[#0B1120]">
                                <div className="mb-8 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {Object.entries(settings.gateways).filter(([_, c]: [string, GatewayConfig]) => c.enabled).map(([k, c]: [string, GatewayConfig]) => (
                                        <button 
                                            key={k} 
                                            onClick={() => setSelectedGatewayKey(k)} 
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedGatewayKey === k ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>

                                {currentGateway && selectedGatewayKey === 'manual' ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex justify-center p-4 bg-white border-4 border-slate-50 rounded-2xl shadow-inner">
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${currentGateway.credentials.upiId || ''}&pn=ShriyasShop&am=${activeOrder.finalPrice}&cu=INR`)}`} 
                                                className="w-44 h-44" 
                                                alt="Payment QR"
                                            />
                                        </div>
                                        
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-500/20">
                                            <div className="overflow-hidden mr-2">
                                                <p className="text-[10px] text-indigo-500 dark:text-[#00E5FF] font-black uppercase">Official UPI ID</p>
                                                <p className="font-mono text-indigo-900 dark:text-indigo-200 font-bold truncate text-sm">{currentGateway.credentials.upiId}</p>
                                            </div>
                                            <button onClick={() => handleCopy(currentGateway.credentials.upiId || '')} className="text-indigo-600 dark:text-[#00E5FF] p-2 hover:bg-white/20 rounded-lg"><Copy size={18} /></button>
                                        </div>

                                        <form onSubmit={handlePaymentRefSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Transaction UTR / Reference Number</label>
                                                <input 
                                                    required 
                                                    placeholder="Enter 12-digit number" 
                                                    value={transactionRef} 
                                                    onChange={e => setTransactionRef(e.target.value)} 
                                                    className="w-full border-2 border-slate-100 dark:border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-black/20 font-mono text-center text-lg" 
                                                />
                                            </div>
                                            <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all">Submit for Verification</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Smartphone className="text-slate-300 animate-pulse" />
                                        </div>
                                        <p className="text-slate-400 text-sm">Redirecting to {currentGateway?.name || 'Gateway'} secure checkout...</p>
                                        <button className="mt-8 text-indigo-600 font-bold text-sm">Launch Checkout Manually</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shop;
