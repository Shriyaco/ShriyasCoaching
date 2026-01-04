import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Order, User, SystemSettings, GatewayConfig } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { ShoppingBag, ArrowRight, Tag, MessageSquare, Check, X, CreditCard, Lock, Smartphone, QrCode, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Shop: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'my-orders'>('products');
    
    // Modal States
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quoteForm, setQuoteForm] = useState({ customName: '', changeRequest: '' });
    
    // Payment Modal States
    const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);
    const [transactionRef, setTransactionRef] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Load Data
        const load = async () => {
            const p = await db.getProducts();
            setProducts(p);
            
            const storedUser = sessionStorage.getItem('sc_user');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                setUser(u);
                if (u.role === 'student') {
                    const o = await db.getOrders(u.id);
                    setOrders(o);
                }
            }
        };
        load();
    }, []);

    const handleRequestQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedProduct) return;
        
        await db.createOrder({
            studentId: user.id,
            studentName: user.username,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productImage: selectedProduct.imageUrl,
            customName: quoteForm.customName,
            changeRequest: quoteForm.changeRequest
        });
        
        alert("Quote Requested Successfully! Check 'My Orders' for updates.");
        setSelectedProduct(null);
        setQuoteForm({ customName: '', changeRequest: '' });
        
        // Refresh orders
        const o = await db.getOrders(user.id);
        setOrders(o);
        setActiveTab('my-orders');
    };

    const openPaymentModal = async (order: Order) => {
        const s = await db.getSettings();
        setSettings(s);
        // Auto-select first enabled gateway
        const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
        if (firstKey) setSelectedGatewayKey(firstKey);
        
        setPaymentOrder(order);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentOrder || !transactionRef) return;
        
        await db.updateOrder(paymentOrder.id, { 
            status: 'Paid',
            transactionRef: transactionRef
        });
        
        alert("Payment Details Submitted!");
        setPaymentOrder(null);
        setTransactionRef('');
        
        // Refresh orders
        if (user) {
            const o = await db.getOrders(user.id);
            setOrders(o);
        }
    };

    const currentGateway = settings && selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            <ThreeOrb className="absolute top-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/2" color="#f472b6" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-[Poppins] mb-4">
                        Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Resin Art</span>
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Handcrafted with love. Request a quote for personalized keychains, bookmarks, and more.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10 space-x-4">
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'products' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100'}`}
                    >
                        Browse Products
                    </button>
                    {user?.role === 'student' && (
                        <button 
                            onClick={() => setActiveTab('my-orders')}
                            className={`px-6 py-2 rounded-full font-bold transition-all relative ${activeTab === 'my-orders' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100'}`}
                        >
                            My Requests
                            {orders.filter(o => o.status === 'Awaiting Payment').length > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#0B1120] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 group hover:border-purple-400 transition-all"
                            >
                                <div className="h-64 overflow-hidden bg-slate-100 dark:bg-black/50 relative">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        From ₹{product.basePrice}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold font-[Poppins] mb-2">{product.name}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{product.description}</p>
                                    
                                    <button 
                                        onClick={() => user ? setSelectedProduct(product) : navigate('/login')}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        Request Custom Quote <ArrowRight size={18}/>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {products.length === 0 && (
                             <div className="col-span-full text-center py-20 text-slate-400">
                                 No products available at the moment.
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {orders.map(order => (
                            <motion.div 
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                         {order.productImage ? <img src={order.productImage} className="w-full h-full object-cover"/> : <ShoppingBag className="m-auto mt-4 text-slate-400"/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{order.productName}</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">Custom: {order.customName}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
                                          order.status === 'Awaiting Payment' ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                                          order.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                                        }
                                    `}>
                                        {order.status}
                                    </div>
                                    
                                    {order.finalPrice && (
                                        <p className="text-xl font-bold font-mono">₹{order.finalPrice}</p>
                                    )}
                                    
                                    {order.status === 'Awaiting Payment' && (
                                        <button 
                                            onClick={() => openPaymentModal(order)}
                                            className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            Pay Now <CreditCard size={16}/>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                You haven't requested any quotes yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Request Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                        >
                             <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                             <div className="bg-purple-600 p-6 text-white">
                                 <h3 className="text-xl font-bold">Request Quote</h3>
                                 <p className="opacity-80 text-sm">For {selectedProduct.name}</p>
                             </div>
                             <div className="p-6">
                                 <form onSubmit={handleRequestQuote} className="space-y-4">
                                     <div>
                                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1 block">Custom Name/Text</label>
                                         <input 
                                            required
                                            value={quoteForm.customName}
                                            onChange={e => setQuoteForm({...quoteForm, customName: e.target.value})}
                                            placeholder="e.g. Priya"
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1 block">Change Requests</label>
                                         <textarea 
                                            required
                                            value={quoteForm.changeRequest}
                                            onChange={e => setQuoteForm({...quoteForm, changeRequest: e.target.value})}
                                            placeholder="e.g. Blue flowers instead of Red, Gold flakes..."
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                         />
                                     </div>
                                     <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg">
                                         Submit Request
                                     </button>
                                     <p className="text-xs text-center text-slate-400">
                                         Note: This is just a request. Admin will review and send a final price.
                                     </p>
                                 </form>
                             </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {paymentOrder && settings && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <button onClick={() => { setPaymentOrder(null); setTransactionRef(''); }} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20 text-white"><X size={20}/></button>
                            
                            {/* Left: Summary */}
                            <div className="w-full md:w-1/3 bg-slate-900 p-6 text-white flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-xl mb-4">Payment Summary</h3>
                                    <p className="text-sm opacity-70 mb-1">Product</p>
                                    <p className="font-bold mb-4">{paymentOrder.productName}</p>
                                    <p className="text-sm opacity-70 mb-1">Customization</p>
                                    <p className="text-sm mb-4">{paymentOrder.customName}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Total Payable</p>
                                    <p className="text-4xl font-black text-[#00E5FF]">₹{paymentOrder.finalPrice}</p>
                                </div>
                            </div>

                            {/* Right: Gateway Logic */}
                            <div className="w-full md:w-2/3 p-6 bg-white dark:bg-[#0B1120] overflow-y-auto">
                                <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
                                    {Object.entries(settings.gateways)
                                        .filter(([_, conf]: [string, GatewayConfig]) => conf.enabled)
                                        .map(([key, conf]: [string, GatewayConfig]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedGatewayKey(key)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-2 border ${
                                                selectedGatewayKey === key 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent'
                                            }`}
                                        >
                                            {key === 'manual' ? <QrCode size={14}/> : <Smartphone size={14}/>}
                                            {conf.name}
                                        </button>
                                    ))}
                                </div>

                                {currentGateway && (
                                    <div className="animate-fade-in">
                                        {selectedGatewayKey === 'manual' ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${currentGateway.credentials.upiId || ''}&pn=ShriyasShop&am=${paymentOrder.finalPrice}&cu=INR`)}`}
                                                        alt="UPI QR Code" 
                                                        className="w-32 h-32 object-contain"
                                                    />
                                                </div>
                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex items-center justify-between border border-indigo-100 dark:border-indigo-500/30">
                                                    <div className="overflow-hidden mr-2">
                                                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Pay to UPI ID</p>
                                                        <p className="font-mono text-indigo-900 dark:text-indigo-300 font-bold truncate select-all">{currentGateway.credentials.upiId}</p>
                                                    </div>
                                                    <button onClick={() => handleCopy(currentGateway.credentials.upiId || '')} className="text-indigo-600 p-2 hover:bg-white/50 rounded transition-colors">
                                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>

                                                <form onSubmit={handlePaymentSubmit} className="pt-4 border-t border-slate-100 dark:border-white/5">
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Enter Transaction ID (UTR)</label>
                                                    <input 
                                                        required
                                                        type="text" 
                                                        placeholder="e.g. 3324XXXXXXXX"
                                                        value={transactionRef}
                                                        onChange={(e) => setTransactionRef(e.target.value)}
                                                        className="w-full border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase bg-slate-50 dark:bg-black/20"
                                                    />
                                                    <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all">
                                                        Verify & Submit
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                             <div className="text-center py-10">
                                                 <Smartphone size={48} className="mx-auto text-purple-500 mb-4" />
                                                 <p className="text-slate-600 dark:text-gray-300 mb-4">Redirecting to {currentGateway.name}...</p>
                                                 <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold">Proceed</button>
                                             </div>
                                        )}
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