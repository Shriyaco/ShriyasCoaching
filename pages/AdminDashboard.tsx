import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings, GatewayConfig, Enquiry, Product, Order, StudentNotification, Notice } from '../types';
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, ShieldAlert, Key, Power, X, Trash2, GraduationCap, TrendingUp, DollarSign, RefreshCw, Menu, Check, Upload, Calendar, MessageCircle, Phone, Clock, ShoppingBag, Send, MapPin, Truck, Megaphone, Bell, Info, AlertTriangle, User, UserCheck, AlertCircle, Globe, Smartphone, QrCode, Package, Image as ImageIcon, Filter, CheckCircle2, Wand2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<FeeSubmission[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const refreshData = useCallback(async () => {
    try {
        const [s, g, sd, t, f, set, enq, p, o, n] = await Promise.all([
            db.getStudents(),
            db.getGrades(),
            db.getSubdivisions(),
            db.getTeachers(),
            db.getFeeSubmissions(),
            db.getSettings(),
            db.getEnquiries(),
            db.getProducts(),
            db.getOrders(),
            db.getNotices()
        ]);
        setStudents(s);
        setGrades(g);
        setSubdivisions(sd);
        setTeachers(t);
        setFees(f);
        setSettings(set);
        setEnquiries(enq);
        setProducts(p);
        setOrders(o);
        setNotices(n);
    } catch(e) {
        console.error(e);
    }
  }, []);

  useEffect(() => {
    const userStr = sessionStorage.getItem('sc_user');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') { navigate('/login'); return; }
    
    refreshData().then(() => setLoading(false));
    
    const channels = [
        db.subscribe('students', refreshData),
        db.subscribe('teachers', refreshData),
        db.subscribe('grades', refreshData),
        db.subscribe('subdivisions', refreshData),
        db.subscribe('fee_submissions', refreshData),
        db.subscribe('shop_orders', refreshData),
        db.subscribe('products', refreshData),
        db.subscribe('notices', refreshData),
        db.subscribe('app_notifications', refreshData)
    ];
    return () => { channels.forEach(c => db.unsubscribe(c)); };
  }, [navigate, refreshData]);

  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(''), 3000);
  };

  const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

  const SidebarItem = ({ tab, icon: Icon, label }: any) => (
    <button onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-200 group relative overflow-hidden ${activeTab === tab ? 'text-white bg-indigo-600/10 border-r-4 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={20} />
      <span className="font-medium tracking-wide">{label}</span>
      {activeTab === tab && <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
    </button>
  );

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </motion.div>
  );

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black uppercase text-[10px] tracking-[1em] text-slate-300">Loading SMS Hub...</div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      <AnimatePresence>
        {notification && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                className="fixed top-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl z-[70] flex items-center gap-3 border border-slate-700">
                <Check className="text-emerald-400" size={18} />
                <span className="text-sm font-bold">{notification}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0B1120] flex flex-col shadow-2xl transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-10 w-auto mr-3" />
          <span className="text-white font-black uppercase tracking-tighter">Admin <span className="text-indigo-400">SMS</span></span>
        </div>
        <div className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarItem tab="dashboard" icon={TrendingUp} label="Insights" />
          <SidebarItem tab="broadcast" icon={Megaphone} label="Push Alerts" />
          <SidebarItem tab="products" icon={Package} label="Product Catalog" />
          <SidebarItem tab="shop" icon={ShoppingBag} label="Orders Tracking" />
          <SidebarItem tab="fees" icon={CreditCard} label="Fee Records" />
          <SidebarItem tab="students" icon={Users} label="Students" />
          <SidebarItem tab="teachers" icon={Briefcase} label="Faculty" />
          <SidebarItem tab="grades" icon={Layers} label="Classes" />
          <SidebarItem tab="notices" icon={Bell} label="Notice Board" />
          <SidebarItem tab="enquiries" icon={MessageCircle} label="Enquiries" />
          <SidebarItem tab="settings" icon={Settings} label="Config" />
        </div>
        <div className="p-6 border-t border-white/5"><button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-bold text-sm"><LogOut size={16}/> Sign Out</button></div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={24}/></button>
              <h2 className="text-2xl font-black text-slate-800 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Orders Paid" value={orders.filter(o => o.status === 'Payment Under Verification').length} icon={ShoppingBag} color="bg-pink-500" subtext="Verification Required" />
                        <StatCard title="Active Students" value={students.filter(s=>s.status==='Active').length} icon={Users} color="bg-indigo-500" subtext="Enrolled students" />
                        <StatCard title="Revenue (Fees)" value={`₹${fees.filter(f=>f.status==='Approved').reduce((a,b)=>a+parseInt(b.amount||'0'), 0)}`} icon={DollarSign} color="bg-emerald-500" subtext="Total Validated Revenue" />
                        <StatCard title="New Leads" value={enquiries.filter(e => e.status === 'New').length} icon={MessageCircle} color="bg-blue-500" subtext="Unattended Enquiries" />
                    </div>
                )}
                {activeTab === 'products' && <ProductsModule products={products} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'shop' && <OrdersModule orders={orders} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'broadcast' && <BroadcastModule grades={grades} subdivisions={subdivisions} students={students} onNotify={showNotification} />}
                {activeTab === 'students' && <StudentsModule grades={grades} subdivisions={subdivisions} students={students} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'teachers' && <TeachersModule teachers={teachers} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'grades' && <GradesModule grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'fees' && <FeesModule fees={fees} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'notices' && <NoticesModule notices={notices} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'enquiries' && <EnquiriesModule enquiries={enquiries} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'settings' && settings && <SettingsModule settings={settings} onNotify={showNotification} refresh={refreshData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

const ProductsModule = ({ products, onNotify, refresh }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ 
        name: '', description: '', basePrice: '', category: 'Decor', stockStatus: 'In Stock' as 'In Stock' | 'Out of Stock', imageUrl: '' 
    });

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name,
                description: editingProduct.description,
                basePrice: editingProduct.basePrice,
                category: editingProduct.category || 'Decor',
                stockStatus: editingProduct.stockStatus || 'In Stock',
                imageUrl: editingProduct.imageUrl || ''
            });
        } else {
            setForm({ name: '', description: '', basePrice: '', category: 'Decor', stockStatus: 'In Stock', imageUrl: '' });
        }
    }, [editingProduct]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await db.updateProduct(editingProduct.id, form);
                onNotify("Product updated successfully!");
            } else {
                await db.addProduct(form);
                onNotify("New product added to catalog!");
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            refresh();
        } catch (err: any) { 
            console.error("Product Save Error:", err);
            alert(`Failed to save product: ${err.message || 'Unknown database error'}.`); 
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Permanently delete this product? This cannot be undone.")) {
            try {
                await db.deleteProduct(id);
                onNotify("Product deleted successfully.");
                refresh();
            } catch (err) {
                alert("Failed to delete product.");
            }
        }
    };

    const filtered = products.filter((p: Product) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20}/> Add Product</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                        <tr><th className="p-4">Product Details</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock Status</th><th className="p-4 text-center">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filtered.map((p: Product) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                            {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-slate-300" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{p.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{p.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{p.category}</span></td>
                                <td className="p-4 font-black text-slate-800">₹{p.basePrice}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${p.stockStatus === 'In Stock' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {p.stockStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-center min-w-[120px]">
                                    <div className="flex justify-center gap-3">
                                        <button 
                                            onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} 
                                            className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Modify Product"
                                        >
                                            <Edit2 size={16} strokeWidth={2.5}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.id)} 
                                            className="p-2.5 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-50 hover:text-white transition-all shadow-sm"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">No Items Found</div>}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                <Package className="text-indigo-600" size={32}/> {editingProduct ? 'Modify Product' : 'Add New Item'}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Boutique Inventory Protocol</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Product Name</label>
                                        <input required className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                                        <select className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                            <option value="Decor">Resin Decor</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Stationery">Stationery</option>
                                            <option value="Gifts">Bespoke Gifts</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                                    <textarea required className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 h-28 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-sm text-slate-900" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base Price (₹)</label>
                                        <input required type="number" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg font-black text-slate-900" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Stock Status</label>
                                        <select className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.stockStatus} onChange={e => setForm({...form, stockStatus: e.target.value as any})}>
                                            <option value="In Stock">Active (In Stock)</option>
                                            <option value="Out of Stock">Unavailable (Out of Stock)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">High-Res Image URL</label>
                                    <input required placeholder="https://..." className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-slate-900" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all mt-4 flex items-center justify-center gap-3">
                                    {editingProduct ? <RefreshCw size={24}/> : <Save size={24}/>}
                                    {editingProduct ? 'Update Product' : 'Store in Catalog'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OrdersModule = ({ orders, onNotify, refresh }: any) => {
    const handleStatusUpdate = async (id: string, status: Order['status']) => {
        try {
            await db.updateOrder(id, { status });
            onNotify(`Order status marked: ${status}`);
            refresh();
        } catch (err) { alert("Registry update failed."); }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><ShoppingBag className="text-pink-500"/> Order Registry Tracking</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Client & Bespoke Details</th><th className="p-6">Shipping Destination</th><th className="p-6">UTR Reference</th><th className="p-6">Price</th><th className="p-6">Status Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {orders.map((o: Order) => (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            <img src={o.productImage} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-black text-slate-800 text-base">{o.studentName}</p>
                                            <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 rounded-lg w-fit">
                                                <Package size={12} className="text-indigo-600" />
                                                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">{o.productName}</span>
                                            </div>
                                            
                                            {(o.customName || o.changeRequest) && (
                                                <div className="mt-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Wand2 size={12} className="text-amber-600" />
                                                        <span className="text-[10px] font-black uppercase text-amber-700">Customization Protocol</span>
                                                    </div>
                                                    {o.customName && (
                                                        <p className="text-xs font-bold text-slate-700">
                                                            <span className="text-slate-400 uppercase text-[9px] mr-1">Name:</span> {o.customName}
                                                        </p>
                                                    )}
                                                    {o.changeRequest && (
                                                        <p className="text-xs text-slate-500 italic leading-relaxed">
                                                            <span className="text-slate-400 uppercase text-[9px] mr-1 not-italic">Instructions:</span> {o.changeRequest}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Phone size={12} />
                                            <span className="text-xs font-mono font-bold">{o.mobile}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-slate-500 max-w-[200px]">
                                            <MapPin size={12} className="shrink-0 mt-1" />
                                            <p className="text-xs leading-tight">{o.address}, {o.pincode}, {o.state}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    {o.transactionRef ? (
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-slate-400">Transaction ID</p>
                                            <p className="font-mono text-xs font-black text-indigo-600 uppercase tracking-widest">{o.transactionRef}</p>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-rose-300 uppercase italic">Awaiting Payment</span>
                                    )}
                                </td>
                                <td className="p-6 font-black text-slate-800 text-lg">₹{o.finalPrice}</td>
                                <td className="p-6">
                                    <select 
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm transition-all cursor-pointer ${
                                            o.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                                            o.status === 'Rejected' ? 'bg-rose-500 text-white' : 
                                            o.status === 'Processing Order' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                        value={o.status}
                                        onChange={(e) => handleStatusUpdate(o.id, e.target.value as Order['status'])}
                                    >
                                        <option value="Payment Pending">Payment Pending</option>
                                        <option value="Payment Under Verification">Under Verif.</option>
                                        <option value="Processing Order">Processing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No Active Orders</div>}
            </div>
        </div>
    );
};

const BroadcastModule = ({ grades, subdivisions, students, onNotify }: any) => {
    const [targetType, setTargetType] = useState<'all' | 'grade' | 'division' | 'student'>('all');
    const [targetId, setTargetId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: any) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await db.pushNotification({ targetType, targetId: targetId || undefined, type: 'announcement', title, message });
            onNotify("Push alert deployed successfully!");
            setTitle(''); setMessage('');
        } catch (e) { alert("Transmission failed."); }
        finally { setIsSending(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Megaphone size={32}/></div>
                    <div><h3 className="text-2xl font-black text-slate-800">Push Deployment</h3><p className="text-sm text-slate-400 font-medium">Broadcast academic or financial alerts.</p></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Group</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={targetType} onChange={e => { setTargetType(e.target.value as any); setTargetId(''); }}>
                            <option value="all">Entire Institution</option>
                            <option value="grade">Specific Grade</option>
                            <option value="division">Specific Division</option>
                            <option value="student">Specific Student</option>
                        </select>
                    </div>
                    {targetType !== 'all' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Identity</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={targetId} onChange={e => setTargetId(e.target.value)}>
                                <option value="">Select ID</option>
                                {targetType === 'grade' && grades.map((g:any) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                {targetType === 'division' && subdivisions.map((s:any) => <option key={s.id} value={s.id}>Grade {s.gradeId} - {s.divisionName}</option>)}
                                {targetType === 'student' && students.map((s:any) => <option key={s.id} value={s.id}>{s.name} ({s.studentCustomId})</option>)}
                            </select>
                        </div>
                    )}
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Alert Heading</label>
                        <input required placeholder="URGENT: TITLE" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Alert Payload (Message)</label>
                        <textarea required placeholder="Deployment message content..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none font-medium text-slate-900" value={message} onChange={e => setMessage(e.target.value)} />
                    </div>
                 </div>

                 <button disabled={isSending} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                    <Send size={24}/> {isSending ? 'Transmitting...' : 'Authorize Broadcast'}
                 </button>
            </form>
        </div>
    );
};

const StudentsModule = ({ students, grades, subdivisions, onNotify, refresh }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ 
        name: '', mobile: '', parentName: '', gradeId: '', subdivisionId: '', 
        joiningDate: new Date().toISOString().split('T')[0], monthlyFees: '5000', 
        schoolName: '', address: '', dob: '', imageUrl: '' 
    });

    useEffect(() => {
        if (editingStudent) {
            setForm({
                name: editingStudent.name,
                mobile: editingStudent.mobile,
                parentName: editingStudent.parentName,
                gradeId: editingStudent.gradeId,
                subdivisionId: editingStudent.subdivisionId,
                joiningDate: editingStudent.joiningDate,
                monthlyFees: editingStudent.monthlyFees,
                schoolName: editingStudent.schoolName,
                address: editingStudent.address,
                dob: editingStudent.dob || '',
                imageUrl: editingStudent.imageUrl || ''
            });
        } else {
            setForm({ 
                name: '', mobile: '', parentName: '', gradeId: '', subdivisionId: '', 
                joiningDate: new Date().toISOString().split('T')[0], monthlyFees: '5000', 
                schoolName: '', address: '', dob: '', imageUrl: '' 
            });
        }
    }, [editingStudent]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await db.updateStudent(editingStudent.id, form);
                onNotify("Student updated successfully!");
            } else {
                await db.addStudent(form);
                onNotify("Student enrolled successfully!");
            }
            setIsModalOpen(false);
            setEditingStudent(null);
            refresh();
        } catch (err: any) { 
            console.error("Student Enrollment Error:", err);
            alert("Failed to save student: " + (err.message || "Please check your network and try again.")); 
        }
    };

    const handleResetPassword = async (id: string) => {
        if (confirm("Reset student's password to their mobile number?")) {
            try {
                await db.resetUserPassword('student', id);
                onNotify("Password reset successful!");
            } catch (err: any) {
                alert("Reset failed: " + err.message);
            }
        }
    };

    const filtered = students.filter((s: Student) => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentCustomId.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900" placeholder="Search ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"><Plus size={20}/> New Enrollment</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                        <tr><th className="p-4">Student</th><th className="p-4">Class</th><th className="p-4">Mobile</th><th className="p-4">Fees</th><th className="p-4 text-center">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filtered.map((s: Student) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-indigo-600 font-bold border border-slate-200 shrink-0">
                                            {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{s.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{s.studentCustomId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 font-medium">Grade {grades.find((g:any)=>g.id===s.gradeId)?.gradeName || s.gradeId}</td>
                                <td className="p-4 text-slate-500 font-mono">{s.mobile}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${s.feesStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{s.feesStatus}</span></td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => { setEditingStudent(s); setIsModalOpen(true); }} 
                                            className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" 
                                            title="Modify Student Details"
                                        >
                                            <Edit2 size={16} strokeWidth={2.5}/>
                                        </button>
                                        <button 
                                            onClick={() => handleResetPassword(s.id)} 
                                            className="p-2.5 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white transition-all shadow-sm" 
                                            title="Reset Password to Mobile No."
                                        >
                                            <Key size={16} strokeWidth={2.5}/>
                                        </button>
                                        <button 
                                            onClick={async () => { if(confirm("Change status?")) { await db.updateStudentStatus(s.id, s.status === 'Active' ? 'Suspended' : 'Active'); refresh(); } }} 
                                            className={`p-2.5 rounded-xl transition-all shadow-sm ${s.status === 'Active' ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white' : 'text-slate-400 bg-slate-100 hover:bg-slate-400 hover:text-white'}`}
                                            title="Toggle Active/Suspended"
                                        >
                                            <Power size={16} strokeWidth={2.5}/>
                                        </button>
                                        <button 
                                            onClick={async () => { if(confirm("Permanent Delete?")) { await db.deleteStudent(s.id); refresh(); } }} 
                                            className="p-2.5 rounded-xl text-rose-400 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            title="Permanently Remove student"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                {editingStudent ? <Edit2 className="text-indigo-600"/> : <UserPlus className="text-indigo-600"/>} 
                                {editingStudent ? 'Modify Record' : 'Student Enrollment'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile No (Used as Password)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 font-mono" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Parent Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date of Birth</label><input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
                                
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Grade</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-900" value={form.gradeId} onChange={e => setForm({...form, gradeId: e.target.value})}>
                                        <option value="">Select Grade</option>
                                        {grades.map((g: any) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Division</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-900" value={form.subdivisionId} onChange={e => setForm({...form, subdivisionId: e.target.value})}>
                                        <option value="">Select Division</option>
                                        {subdivisions.filter((sd: any) => sd.gradeId === form.gradeId).map((sd: any) => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Monthly Fees (₹)</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 font-mono text-lg" value={form.monthlyFees} onChange={e => setForm({...form, monthlyFees: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Joining Date</label><input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">School Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Address</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 h-24 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-slate-900" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Image URL</label><input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-slate-900" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." /></div>
                                
                                <div className="col-span-1 md:col-span-2 pt-6">
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                                        <Save size={24}/> {editingStudent ? 'Apply Updates' : 'Confirm Enrollment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TeachersModule = ({ teachers, onNotify, refresh }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [form, setForm] = useState({ name: '', mobile: '', specialization: '' });

    useEffect(() => {
        if (editingTeacher) setForm({ name: editingTeacher.name, mobile: editingTeacher.mobile, specialization: editingTeacher.specialization });
        else setForm({ name: '', mobile: '', specialization: '' });
    }, [editingTeacher]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editingTeacher) await db.updateTeacher(editingTeacher.id, form);
            else await db.addTeacher(form);
            onNotify(editingTeacher ? "Teacher profile updated!" : "Faculty added successfully!");
            setIsModalOpen(false);
            setEditingTeacher(null);
            refresh();
        } catch (err) { alert("Error saving faculty profile."); }
    };

    const handleResetPassword = async (id: string) => {
        if (confirm("Reset teacher's password to their mobile number?")) {
            await db.resetUserPassword('teacher', id);
            onNotify("Password reset successful!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20}/> New Faculty</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachers.map((t: Teacher) => (
                    <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setEditingTeacher(t); setIsModalOpen(true); }} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14}/></button>
                             <button onClick={() => handleResetPassword(t.id)} className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Key size={14}/></button>
                        </div>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">{t.name.charAt(0)}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{t.status}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg">{t.name}</h4>
                            <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">{t.specialization || 'General Faculty'}</p>
                            <div className="space-y-2 border-t border-slate-50 pt-4 text-xs text-slate-500 font-medium">
                                <p className="flex items-center gap-2"><Phone size={12}/> {t.mobile}</p>
                                <p className="flex items-center gap-2"><UserCheck size={12}/> ID: {t.teacherCustomId}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                             <button onClick={async () => { if(confirm("Change status?")) { await db.updateTeacherStatus(t.id, t.status === 'Active' ? 'Suspended' : 'Active'); refresh(); } }} className="flex-1 bg-slate-50 text-slate-500 py-2 rounded-lg font-bold text-xs hover:bg-slate-100 transition-all">Toggle State</button>
                             <button onClick={async () => { if(confirm("Permanent Delete?")) { await db.deleteTeacher(t.id); refresh(); } }} className="p-2 text-rose-400 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-md shadow-2xl relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="text-indigo-600"/> {editingTeacher ? 'Modify Profile' : 'New Teacher Profile'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Teacher Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Mobile Number (Password)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Specialization</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg shadow-xl mt-4">Save Profile</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GradesModule = ({ grades, subdivisions, onNotify, refresh }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', subdivisions: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const subs = form.subdivisions.split(',').map(s => s.trim()).filter(s => s);
            await db.addGrade(form.name, subs);
            onNotify("New Class and Divisions added!");
            setIsAdding(false);
            setForm({ name: '', subdivisions: '' });
            refresh();
        } catch (err) { alert("Failed to add grade."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Layers className="text-indigo-600"/> Class Management</h3>
                 <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"><Plus size={20}/> Create Class</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grades.map((g: Grade) => (
                    <div key={g.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800">{g.gradeName}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Group</p>
                            </div>
                            <button onClick={async () => { if(confirm("Permanently delete this Class and all Divisions?")) { await db.deleteGrade(g.id); refresh(); } }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {subdivisions.filter((sd: any) => sd.gradeId === g.id).map((sd: Subdivision) => (
                                <span key={sd.id} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black border border-indigo-100/50 uppercase shadow-sm">Div {sd.divisionName}</span>
                            ))}
                            <button className="px-4 py-2 border-2 border-dashed border-slate-100 text-slate-300 rounded-xl text-xs font-black hover:border-indigo-200 hover:text-indigo-400 transition-all flex items-center gap-1"><Plus size={14}/> Add Div</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-400"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-2">New Class</h3>
                            <p className="text-slate-400 text-sm mb-8">Define a grade and its subdivisions.</p>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Grade Name (e.g. 1st Grade)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Divisions (Comma separated: A, B, C)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-slate-900" value={form.subdivisions} onChange={e => setForm({...form, subdivisions: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl shadow-xl mt-4 hover:shadow-indigo-500/20 transition-all">Create Class Group</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FeesModule = ({ fees, onNotify, refresh }: any) => {
    const handleAction = async (id: string, status: 'Approved' | 'Rejected', studentId: string) => {
        try {
            await db.updateFeeSubmissionStatus(id, status, studentId);
            onNotify(`Fee marked as ${status}`);
            refresh();
        } catch (err) { alert("Update failed."); }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><CreditCard className="text-indigo-600"/> Payment Verification Portal</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Student Name</th><th className="p-6">Amount</th><th className="p-6">UTR / Reference</th><th className="p-6">Date</th><th className="p-6 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {fees.map((f: FeeSubmission) => (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6 font-black text-slate-800">{f.studentName}</td>
                                <td className="p-6"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black">₹{f.amount}</span></td>
                                <td className="p-6 font-mono text-xs uppercase font-bold text-indigo-600">{f.transactionRef}</td>
                                <td className="p-6 text-slate-500 font-medium">{f.date}</td>
                                <td className="p-6">
                                    <div className="flex justify-center gap-2">
                                        {f.status === 'Pending' ? (
                                            <>
                                                <button onClick={() => handleAction(f.id, 'Approved', f.studentId)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 shadow-md transition-all">Approve</button>
                                                <button onClick={() => handleAction(f.id, 'Rejected', f.studentId)} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 shadow-md transition-all">Reject</button>
                                            </>
                                        ) : (
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${f.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{f.status}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {fees.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No pending verifications.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NoticesModule = ({ notices, onNotify, refresh }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], important: true });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addNotice({ title: form.title, content: form.title, date: form.date, important: form.important });
            onNotify("Notice published to ticker!");
            setIsAdding(false);
            setForm({ title: '', date: new Date().toISOString().split('T')[0], important: true });
            refresh();
        } catch (err) { alert("Failed to save notice."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Bell className="text-indigo-600"/> Public Notice Board</h3>
                <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20}/> Create Notice</button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Title & Message</th><th className="p-6">Date</th><th className="p-6">Status</th><th className="p-6 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {notices.map((n: Notice) => (
                            <tr key={n.id} className="hover:bg-slate-50/50">
                                <td className="p-6"><p className="font-black text-slate-800 text-base">{n.title}</p></td>
                                <td className="p-6 text-slate-500 font-bold">{n.date}</td>
                                <td className="p-6"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${n.important ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{n.important ? 'Ticker Active' : 'Draft'}</span></td>
                                <td className="p-6 text-center"><button onClick={async () => { if(confirm("Remove notice?")) { await db.deleteNotice(n.id); refresh(); } }} className="text-rose-400 hover:text-rose-600 p-2 bg-rose-50 rounded-xl"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Broadcast News</h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Notice Heading</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-900" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Admission 2026 Open" /></div>
                                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xl shadow-xl">Post to Ticker</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EnquiriesModule = ({ enquiries, onNotify, refresh }: any) => {
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                    <tr><th className="p-6">Lead Details</th><th className="p-6">Contact</th><th className="p-6">Grade</th><th className="p-6">Status</th><th className="p-6 text-center">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {enquiries.map((e: Enquiry) => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-6"><div><p className="font-bold text-slate-800">{e.studentName}</p><p className="text-[10px] text-slate-400 font-medium">Parent: {e.parentName}</p></div></td>
                            <td className="p-6 text-slate-600 font-mono text-xs">{e.mobile}</td>
                            <td className="p-6 font-bold text-slate-500">{e.grade} Grade</td>
                            <td className="p-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${e.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{e.status}</span></td>
                            <td className="p-6 text-center">
                                <button 
                                    onClick={() => setSelectedEnquiry(e)} 
                                    className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-100 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Eye size={14}/> View Full Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {enquiries.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs">No Leads Registered</div>}

            <AnimatePresence>
                {selectedEnquiry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <button onClick={() => setSelectedEnquiry(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-2">Lead Information</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Detailed Enrollment Enquiry</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Student Name</label>
                                    <p className="text-lg font-bold text-slate-900">{selectedEnquiry.studentName}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Parent Name</label>
                                    <p className="text-lg font-bold text-slate-900">{selectedEnquiry.parentName} ({selectedEnquiry.relation})</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mobile Contact</label>
                                    <p className="text-lg font-bold text-indigo-600 font-mono">{selectedEnquiry.mobile}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Grade Applied</label>
                                    <p className="text-lg font-bold text-slate-900">{selectedEnquiry.grade} Grade</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Current School</label>
                                    <p className="text-lg font-bold text-slate-900">{selectedEnquiry.schoolName}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Preferred Connect Time</label>
                                    <p className="text-lg font-bold text-slate-900">{selectedEnquiry.connectTime}</p>
                                </div>
                                <div className="md:col-span-2 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-4">Reason for shift / Expectations</label>
                                    <p className="text-slate-700 leading-relaxed italic text-lg">"{selectedEnquiry.reason}"</p>
                                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Registry Status: {selectedEnquiry.status}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Received: {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedEnquiry(null)}
                                className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                            >
                                Close Details
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingsModule = ({ settings, onNotify, refresh }: any) => {
    const [form, setForm] = useState(settings);
    const [activeSection, setActiveSection] = useState<'general' | 'payment'>('general');

    const handleSave = async (e: any) => {
        e.preventDefault();
        try { await db.updateSettings(form); onNotify("System variables updated!"); refresh(); } catch (err) { alert("Error saving config."); }
    };

    const updateGateway = (key: string, field: string, val: any) => {
        setForm({ ...form, gateways: { ...form.gateways, [key]: { ...form.gateways[key], [field === 'enabled' ? 'enabled' : 'credentials']: field === 'enabled' ? val : { ...form.gateways[key].credentials, [field]: val } } } });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-[32px] p-2 border border-slate-200 flex shadow-sm">
                <button onClick={() => setActiveSection('general')} className={`flex-1 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeSection === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-600'}`}>System Variables</button>
                <button onClick={() => setActiveSection('payment')} className={`flex-1 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeSection === 'payment' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-600'}`}>Payment Integration</button>
            </div>
            <form onSubmit={handleSave} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                 {activeSection === 'general' ? (
                     <div className="space-y-8">
                        <div className="flex items-center gap-4"><Settings size={32} className="text-indigo-600"/><h3 className="text-2xl font-black text-slate-800">Global Config</h3></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Recaptcha V2 Key</label><input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-slate-900" value={form.googleSiteKey} onChange={e => setForm({...form, googleSiteKey: e.target.value})} /></div>
                     </div>
                 ) : (
                    <div className="space-y-10">
                        {Object.entries(form.gateways).map(([key, config]: [string, any]) => (
                            <div key={key} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${config.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>{key === 'manual' ? <QrCode size={24}/> : <Smartphone size={24}/>}</div>
                                        <div><h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm">{config.name}</h4><p className="text-[10px] text-slate-400 font-bold">{config.enabled ? 'Operational' : 'Disabled'}</p></div>
                                    </div>
                                    <button type="button" onClick={() => updateGateway(key, 'enabled', !config.enabled)} className={`w-14 h-8 rounded-full transition-all relative ${config.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.enabled ? 'right-1' : 'left-1'}`} /></button>
                                </div>
                                {config.enabled && key === 'manual' && <div className="space-y-4"><label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Business UPI VPA</label><input className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-900" value={config.credentials.upiId || ''} onChange={e => updateGateway(key, 'upiId', e.target.value)} placeholder="e.g. shriyas@upi" /></div>}
                            </div>
                        ))}
                    </div>
                 )}
                 <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"><Save size={24}/> Authorize Global Updates</button>
            </form>
        </div>
    );
};