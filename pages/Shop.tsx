
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Order, User, SystemSettings, GatewayConfig } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import Footer from '../components/Footer';
import { 
  ShoppingBag, ArrowRight, Check, X, CreditCard, 
  Smartphone, QrCode, Copy, MapPin, User as UserIcon, 
  Phone, Hash, Plus, Minus, ShoppingCart, Trash2,
  Sparkles, MessageCircle, Filter, Zap, PencilLine, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const INDIAN_STATES = [
    "Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Chandigarh", "Puducherry"
];

const Shop: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'my-orders'>('products');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    
    // Cart State
    const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Checkout Form States
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
                setCheckoutForm(prev => ({ ...prev, name: u.username, mobile: u.mobile || '' }));
                if (u.role === 'student') {
                    const o = await db.getOrders(u.id);
                    setOrders(o);
                }
            }
        };
        load();
    }, []);

    const categories = ['All', 'Decor', 'Stationery', 'Gifts', 'Jewelry'];
    const filteredProducts = activeCategory === 'All' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const totalCartValue = cart.reduce((sum, item) => sum + (parseInt(item.product.basePrice) * item.quantity), 0);

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setIsSubmitting(true);
        
        try {
            // Bulk product description for order summary
            const productSummary = cart.map(item => `${item.product.name} (x${item.quantity})`).join(', ');
            const mainProduct = cart[0].product;

            const orderData: Omit<Order, 'id' | 'createdAt'> = {
                studentId: user?.id || 'guest',
                studentName: checkoutForm.name,
                productId: mainProduct.id,
                productName: productSummary,
                productImage: mainProduct.imageUrl,
                customName: checkoutForm.customName,
                changeRequest: checkoutForm.changeRequest,
                address: checkoutForm.address,
                pincode: checkoutForm.pincode,
                state: checkoutForm.state,
                mobile: checkoutForm.mobile,
                status: 'Payment Pending',
                finalPrice: totalCartValue.toString()
            };
            
            const newOrder = await db.createOrder(orderData);
            setActiveOrder(newOrder);
            setIsCheckoutOpen(false);
            setCart([]); 
            
            const s = await db.getSettings();
            setSettings(s);
            const firstKey = Object.keys(s.gateways).find(k => s.gateways[k].enabled);
            if (firstKey) setSelectedGatewayKey(firstKey);

        } catch (err) {
            console.error(err);
            alert("Order registry failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openWhatsAppInquiry = (productName: string) => {
        const msg = encodeURIComponent(`Hi Shriya, I'm interested in the "${productName}" resin art. Can you share more details or custom options?`);
        window.open(`https://wa.me/919724111369?text=${msg}`, '_blank');
    };

    const handlePaymentRefSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeOrder || !transactionRef) return;
        await db.updateOrder(activeOrder.id, { status: 'Payment Under Verification', transactionRef: transactionRef });
        alert("Payment Logged. Verification in progress.");
        setActiveOrder(null);
        setTransactionRef('');
        if (user && user.role === 'student') { const o = await db.getOrders(user.id); setOrders(o); }
        setActiveTab('my-orders');
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentGateway = settings && selectedGatewayKey ? settings.gateways[selectedGatewayKey] : null;

    // --- DYNAMIC QR GENERATION FOR SHOP (FIXED) ---
    const getDynamicQR = () => {
        // Updated UPI VPA provided by user
        const upiID = "tejanishriya64-3@oksbi";
        const name = "SHRIYA BRAHMBHATT";
        const am = activeOrder?.finalPrice || "0";
        
        // mode=02 and purpose=00 help lock the amount in UPI apps
        const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${am}&cu=INR&mode=02&purpose=00`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}&ecc=H&margin=1`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-12 relative overflow-x-hidden transition-colors duration-300">
            <ThreeOrb className="absolute top-0 left-0 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2" color="#C5A059" />
            
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-[160] flex flex-col shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold serif-font flex items-center gap-3">
                                    <ShoppingBag className="text-premium-accent" /> Shopping Bag
                                </h3>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 text-white/40 hover:text-white"><X/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                {cart.map(item => (
                                    <div key={item.product.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                                            <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <h4 className="text-sm font-bold truncate max-w-[150px]">{item.product.name}</h4>
                                                <button onClick={() => removeFromCart(item.product.id)} className="text-white/10 hover:text-rose-500"><Trash2 size={14}/></button>
                                            </div>
                                            <p className="text-xs text-premium-accent font-black mb-4">₹{item.product.basePrice}</p>
                                            <div className="flex items-center gap-4 bg-white/5 w-fit rounded-lg px-2 py-1">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-premium-accent"><Minus size={12}/></button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-premium-accent"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4">Bag is empty</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                                <div className="flex justify-between items-end mb-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Total Value</p>
                                    <p className="text-3xl font-light serif-font">₹{totalCartValue}</p>
                                </div>
                                <button 
                                    disabled={cart.length === 0}
                                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-xl hover:bg-premium-accent transition-all disabled:opacity-20"
                                >
                                    Secure Checkout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-light serif-font uppercase mb-4 luxury-text-gradient">
                            Boutique.
                        </motion.h1>
                        <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.5em] font-black ml-1">Handcrafted Resin Collectibles</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                            <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>Products</button>
                            <button onClick={() => setActiveTab('my-orders')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-orders' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>My Registry</button>
                        </div>
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group"
                        >
                            <ShoppingCart size={24} className="group-hover:text-premium-accent transition-colors" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-premium-accent text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-reveal">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                <div className="flex items-center gap-4 mb-12 overflow-x-auto scrollbar-hide pb-2">
                    <Filter size={14} className="text-white/20 shrink-0" />
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border shrink-0 ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {activeTab === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
                        {filteredProducts.map(product => (
                            <motion.div 
                                key={product.id} 
                                initial={{ opacity: 0, y: 20 }} 
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group relative bg-[#0A0A0A] rounded-[40px] border border-white/5 overflow-hidden hover:border-premium-accent/20 transition-all flex flex-col"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative">
                                    <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="bg-white text-black p-5 rounded-full shadow-2xl hover:bg-premium-accent transition-all active:scale-90"
                                            title="Add to Cart"
                                        >
                                            <Plus size={24} strokeWidth={2.5} />
                                        </button>
                                        <button 
                                            onClick={() => openWhatsAppInquiry(product.name)}
                                            className="bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:brightness-110 transition-all active:scale-90"
                                            title="Inquire on WhatsApp"
                                        >
                                            <MessageCircle size={24} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-light serif-font mb-1 tracking-tight group-hover:text-premium-accent transition-colors">{product.name}</h3>
                                            <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em]">{product.stockStatus} • Authenticated</p>
                                        </div>
                                        <p className="text-xl font-light text-white/80">₹{product.basePrice}</p>
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium mb-10 line-clamp-2">{product.description}</p>
                                    <button 
                                        onClick={() => addToCart(product)}
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all"
                                    >
                                        Instant Purchase
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {filteredProducts.length === 0 && <div className="col-span-full py-40 text-center opacity-20 font-black uppercase tracking-[1em] text-xs">Category Empty</div>}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-6 mb-32">
                        {orders.map(order => (
                            <div key={order.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row items-center gap-8 group">
                                <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                    <img src={order.productImage} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-1">{order.productName}</h4>
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-4">Tracking ID: {order.id.slice(0, 10)}</p>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        order.status === 'Payment Under Verification' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/30'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[9px] font-black uppercase text-white/20 mb-1">Final Price</p>
                                    <p className="text-3xl font-light serif-font">₹{order.finalPrice}</p>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <div className="py-40 text-center opacity-20 font-black uppercase tracking-[1em] text-xs">Registry Empty</div>}
                    </div>
                )}
            </div>

            <Footer />

            <AnimatePresence>
                {isCheckoutOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0A0A0A] border border-white/10 rounded-[50px] w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[95vh]">
                            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-10 right-10 text-white/20 hover:text-white z-50"><X size={32}/></button>
                            
                            <div className="p-12 md:p-16 overflow-y-auto scrollbar-hide">
                                <h3 className="text-4xl font-light serif-font mb-4 luxury-text-gradient">Secure Entry.</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-12">Authorized Shipment Protocol</p>
                                
                                <form onSubmit={handleCheckoutSubmit} className="space-y-10">
                                    {/* --- Client Details --- */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                            <UserIcon size={14} className="text-premium-accent" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Contact Identity</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-white/20 ml-1">Full Name</label>
                                                <input required value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-premium-accent text-sm" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-white/20 ml-1">Mobile Contact</label>
                                                <input required type="tel" value={checkoutForm.mobile} onChange={e => setCheckoutForm({...checkoutForm, mobile: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-premium-accent text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Bespoke Customization --- */}
                                    <div className="space-y-6 p-8 bg-white/[0.02] rounded-[32px] border border-white/5">
                                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                            <Wand2 size={14} className="text-premium-accent" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Bespoke Customization</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-white/20 ml-1">Name/Text on Product (Optional)</label>
                                                <input 
                                                    placeholder="e.g. SANYA, HAPPY BIRTHDAY"
                                                    value={checkoutForm.customName} 
                                                    onChange={e => setCheckoutForm({...checkoutForm, customName: e.target.value})} 
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-premium-accent text-sm placeholder:text-white/10" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-white/20 ml-1">Change Request / Design Notes</label>
                                                <textarea 
                                                    placeholder="Describe colors, flower preferences, or specific layout requests..."
                                                    value={checkoutForm.changeRequest} 
                                                    onChange={e => setCheckoutForm({...checkoutForm, changeRequest: e.target.value})} 
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 h-24 outline-none resize-none focus:border-premium-accent text-sm placeholder:text-white/10" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Logistics --- */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                            <MapPin size={14} className="text-premium-accent" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Logistics Destination</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-white/20 ml-1">Shipment Address</label>
                                                <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 h-20 outline-none resize-none focus:border-premium-accent text-sm" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase text-white/20 ml-1">Pincode</label>
                                                    <input required value={checkoutForm.pincode} onChange={e => setCheckoutForm({...checkoutForm, pincode: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-premium-accent text-sm font-mono" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase text-white/20 ml-1">State Origin</label>
                                                    <select required value={checkoutForm.state} onChange={e => setCheckoutForm({...checkoutForm, state: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-premium-accent text-sm appearance-none">
                                                        {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <div className="flex justify-between items-end mb-8">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Final Amount</span>
                                            <span className="text-4xl font-light text-premium-accent">₹{totalCartValue}</span>
                                        </div>
                                        <button disabled={isSubmitting} className="w-full py-6 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.5em] shadow-2xl hover:bg-premium-accent transition-all">
                                            {isSubmitting ? 'Syncing...' : 'Authorize Transaction'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PAYMENT PORTAL OVERLAY --- */}
            <AnimatePresence>
                {activeOrder && settings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[60px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
                            <button onClick={() => setActiveOrder(null)} className="absolute top-10 right-10 text-white/20 hover:text-white z-50"><X size={32}/></button>
                            
                            <div className="w-full md:w-2/5 bg-white/[0.02] p-12 border-r border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="p-4 bg-premium-accent/10 w-fit rounded-2xl text-premium-accent mb-8"><Zap size={32}/></div>
                                    <h3 className="text-3xl font-light serif-font mb-4">Financial Protocol</h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-10">Order ID: {activeOrder.id.slice(0, 10)}</p>
                                    
                                    <div className="space-y-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                        <div className="flex justify-between border-b border-white/5 pb-4"><span>Product</span><span className="text-white truncate max-w-[120px]">{activeOrder.productName}</span></div>
                                        <div className="flex justify-between border-b border-white/5 pb-4"><span>Mobile</span><span className="text-white">{activeOrder.mobile}</span></div>
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Amount Due</p>
                                    <p className="text-5xl font-light text-premium-accent">₹{activeOrder.finalPrice}</p>
                                </div>
                            </div>

                            <div className="w-full md:w-3/5 p-12 bg-black flex flex-col">
                                <div className="mb-10 flex gap-4 overflow-x-auto scrollbar-hide">
                                    {Object.entries(settings.gateways).filter(([_, c]: [string, GatewayConfig]) => c.enabled).map(([k, c]: [string, GatewayConfig]) => (
                                        <button 
                                            key={k} 
                                            onClick={() => setSelectedGatewayKey(k)} 
                                            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedGatewayKey === k ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-white/20 border border-white/5'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>

                                {currentGateway && selectedGatewayKey === 'manual' ? (
                                    <div className="flex-1 flex flex-col justify-center animate-fade-in">
                                        <div className="flex justify-center mb-10">
                                            <div className="p-6 bg-white rounded-[40px] shadow-[0_0_60px_rgba(255,255,255,0.05)]">
                                                <img 
                                                    src={getDynamicQR()} 
                                                    className="w-48 h-48 md:w-56 md:h-56 object-contain" 
                                                    alt="UPI QR" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] flex items-center justify-between mb-10">
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-1">Corporate VPA</p>
                                                <p className="font-mono text-sm text-white/80 font-bold">tejanishriya64-3@oksbi</p>
                                            </div>
                                            <button onClick={() => handleCopy('tejanishriya64-3@oksbi')} className="p-3 text-white/20 hover:text-white"><Copy size={20} /></button>
                                        </div>

                                        <form onSubmit={handlePaymentRefSubmit} className="mt-auto">
                                            <label className="block text-[9px] font-black text-white/20 mb-3 uppercase tracking-widest ml-1">Reference UTR Protocol</label>
                                            <input required placeholder="12 DIGIT REFERENCE" value={transactionRef} onChange={e => setTransactionRef(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-lg font-black tracking-[0.5em] text-center outline-none focus:border-premium-accent transition-all" />
                                            <button type="submit" className="w-full mt-6 bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-2xl">Confirm Submission</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                                        <Smartphone size={80} className="text-white/5 mb-8 animate-pulse" strokeWidth={1} />
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Establishing Secure Gateway Connection...</p>
                                        <button className="mt-12 bg-white/5 px-12 py-4 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Manual Launch</button>
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
