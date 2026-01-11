
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings, Enquiry, Product, Order, Notice, Homework, Exam } from '../types';
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, Key, Power, X, Trash2, TrendingUp, DollarSign, RefreshCw, Menu, Check, MessageCircle, Phone, ShoppingBag, Send, MapPin, Megaphone, Bell, Image as ImageIcon, Package, FileText, BookOpen, Wand2, Eye, UserCheck, QrCode, Smartphone, Upload, Camera, Clock } from 'lucide-react';
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
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [examList, setExamList] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const refreshData = useCallback(async () => {
    try {
        const results = await Promise.allSettled([
            db.getStudents(),
            db.getGrades(),
            db.getSubdivisions(),
            db.getTeachers(),
            db.getFeeSubmissions(),
            db.getSettings(),
            db.getEnquiries(),
            db.getProducts(),
            db.getOrders(),
            db.getNotices(),
            db.getAllHomework(),
            db.getExams()
        ]);

        const [s, g, sd, t, f, settingsRes, enq, p, o, n, hw, ex] = results;

        if (s.status === 'fulfilled') setStudents(s.value);
        if (g.status === 'fulfilled') setGrades(g.value);
        if (sd.status === 'fulfilled') setSubdivisions(sd.value);
        if (t.status === 'fulfilled') setTeachers(t.value);
        if (f.status === 'fulfilled') setFees(f.value);
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
        if (enq.status === 'fulfilled') setEnquiries(enq.value);
        if (p.status === 'fulfilled') setProducts(p.value);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (n.status === 'fulfilled') setNotices(n.value);
        if (hw.status === 'fulfilled') setHomeworkList(hw.value);
        if (ex.status === 'fulfilled') setExamList(ex.value);

    } catch(e) {
        console.error("Dashboard Sync Error:", e);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userStr = sessionStorage.getItem('sc_user');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') { navigate('/login'); return; }
    
    refreshData();
    
    const channels = [
        db.subscribe('students', refreshData),
        db.subscribe('teachers', refreshData),
        db.subscribe('grades', refreshData),
        db.subscribe('subdivisions', refreshData),
        db.subscribe('fee_submissions', refreshData),
        db.subscribe('shop_orders', refreshData),
        db.subscribe('products', refreshData),
        db.subscribe('notices', refreshData),
        db.subscribe('app_notifications', refreshData),
        db.subscribe('homework', refreshData),
        db.subscribe('exams', refreshData)
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

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black uppercase text-[10px] tracking-[0.5em] text-slate-400">Loading Dashboard...</p>
    </div>
  );

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
          <SidebarItem tab="students" icon={Users} label="Students" />
          <SidebarItem tab="teachers" icon={Briefcase} label="Faculty" />
          <SidebarItem tab="grades" icon={Layers} label="Classes" />
          <SidebarItem tab="exams" icon={FileText} label="Exams" />
          <SidebarItem tab="homework" icon={BookOpen} label="Assignments" />
          <SidebarItem tab="fees" icon={CreditCard} label="Fee Records" />
          <SidebarItem tab="products" icon={Package} label="Product Catalog" />
          <SidebarItem tab="shop" icon={ShoppingBag} label="Orders Tracking" />
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-slate-50/50">
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
                {activeTab === 'teachers' && <TeachersModule teachers={teachers} grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'grades' && <GradesModule grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'fees' && <FeesModule fees={fees} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'notices' && <NoticesModule notices={notices} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'enquiries' && <EnquiriesModule enquiries={enquiries} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'settings' && settings && <SettingsModule settings={settings} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'homework' && <HomeworkAdminModule homeworkList={homeworkList} grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'exams' && <ExamsAdminModule examList={examList} grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- MODULE COMPONENTS ---

const HomeworkAdminModule = ({ homeworkList, grades, subdivisions, onNotify, refresh }: any) => {
    const handleDelete = async (id: string) => {
        if(confirm("Are you sure you want to delete this assignment?")) {
            try {
                await db.deleteHomework(id);
                onNotify("Assignment deleted successfully.");
                refresh();
            } catch (e) { alert("Delete failed"); }
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><BookOpen className="text-indigo-600"/> Homework Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Class Context</th><th className="p-6">Subject</th><th className="p-6">Task Description</th><th className="p-6">Due Date</th><th className="p-6 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {homeworkList.map((hw: Homework) => (
                            <tr key={hw.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6">
                                    <p className="font-bold text-slate-800">Grade {grades.find((g:any)=>g.id===hw.gradeId)?.gradeName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Div {subdivisions.find((s:any)=>s.id===hw.subdivisionId)?.divisionName}</p>
                                </td>
                                <td className="p-6 font-bold text-indigo-600">{hw.subject}</td>
                                <td className="p-6 max-w-xs truncate text-slate-600 font-medium" title={hw.task}>{hw.task}</td>
                                <td className="p-6 text-slate-500 font-mono text-xs">{hw.dueDate}</td>
                                <td className="p-6 text-center">
                                    <button onClick={() => handleDelete(hw.id)} className="p-2.5 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={16} strokeWidth={2.5}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {homeworkList.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No Active Assignments</div>}
        </div>
    );
};

const ExamsAdminModule = ({ examList, grades, subdivisions, onNotify, refresh }: any) => {
    const handleDelete = async (id: string) => {
        if(confirm("Are you sure you want to delete this exam?")) {
            try {
                await db.deleteExam(id);
                onNotify("Exam deleted successfully.");
                refresh();
            } catch (e) { alert("Delete failed"); }
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><FileText className="text-indigo-600"/> Exam Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Class Context</th><th className="p-6">Title & Subject</th><th className="p-6">Schedule</th><th className="p-6">Details</th><th className="p-6 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {examList.map((ex: Exam) => (
                            <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6">
                                    <p className="font-bold text-slate-800">Grade {grades.find((g:any)=>g.id===ex.gradeId)?.gradeName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Div {subdivisions.find((s:any)=>s.id===ex.subdivisionId)?.divisionName}</p>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-slate-900">{ex.title}</p>
                                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{ex.subject}</span>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-bold text-slate-600">{ex.examDate}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">{ex.startTime}</p>
                                </td>
                                <td className="p-6 text-xs font-bold text-slate-500">{ex.duration} mins • {ex.totalMarks} Marks</td>
                                <td className="p-6 text-center">
                                    <button onClick={() => handleDelete(ex.id)} className="p-2.5 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={16} strokeWidth={2.5}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {examList.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No Exams Scheduled</div>}
        </div>
    );
};

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><Plus size={20}/> Add Product</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
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
                                    <td className="p-4 text-center min-w-[140px]">
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
                                                className="p-2.5 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
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
                </div>
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
                                            <option value="In Stock">In Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Visual Content</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center relative hover:bg-slate-200 transition-all cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="mx-auto text-indigo-600 mb-2" size={20} />
                                            <p className="text-[10px] font-bold uppercase text-slate-400">From gallery</p>
                                        </div>
                                        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center relative hover:bg-slate-200 transition-all cursor-pointer">
                                            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Camera className="mx-auto text-slate-600 mb-2" size={20} />
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Use Camera</p>
                                        </div>
                                    </div>
                                    <input placeholder="...OR PASTE URL" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[10px] text-slate-900" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
                                    {form.imageUrl && (
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={form.imageUrl} className="w-full h-full object-contain" />
                                            <button onClick={() => setForm({...form, imageUrl: ''})} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"><X size={12}/></button>
                                        </div>
                                    )}
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
                <table className="w-full text-left min-w-[1000px]">
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
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

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
        } catch (err) { alert("Failed to save student."); }
    };

    const handleResetPassword = async (id: string) => {
        if (confirm("Reset student's password to their mobile number?")) {
            await db.resetUserPassword('student', id);
            onNotify("Password reset successful!");
        }
    };

    const filtered = students.filter((s: Student) => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentCustomId.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900" placeholder="Search ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"><Plus size={20}/> New Enrollment</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
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
                                                onClick={() => setSelectedStudent(s)} 
                                                className="p-2.5 rounded-xl text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all shadow-sm"
                                                title="View Full Profile"
                                            >
                                                <Eye size={16} strokeWidth={2.5}/>
                                            </button>
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
                                                className={`p-2.5 rounded-xl transition-all shadow-sm ${s.status === 'Active' ? 'text-emerald-500 bg-emerald-500 hover:bg-emerald-500 hover:text-white' : 'text-slate-400 bg-slate-100 hover:bg-slate-400 hover:text-white'}`}
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
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                {editingStudent ? <Edit2 className="text-indigo-600"/> : <UserPlus className="text-indigo-600"/>} 
                                {editingStudent ? 'Modify Record' : 'Student Enrollment'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile No</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 font-mono" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
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
                                
                                <div className="space-y-3 md:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Profile Identity Image</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center relative hover:bg-slate-100 transition-all cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="mx-auto text-indigo-600 mb-2" size={20} />
                                            <p className="text-[9px] font-bold uppercase text-slate-400">Library</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center relative hover:bg-slate-100 transition-all cursor-pointer">
                                            <input type="file" accept="image/*" capture="user" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Camera className="mx-auto text-slate-600 mb-2" size={20} />
                                            <p className="text-[9px] font-bold uppercase text-slate-400">Camera</p>
                                        </div>
                                    </div>
                                    <input className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[10px] text-slate-900 mt-2" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
                                    {form.imageUrl && (
                                        <div className="mt-4 flex justify-center">
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                <img src={form.imageUrl} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setForm({...form, imageUrl: ''})} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white">
                                                    <Trash2 size={24}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="col-span-1 md:col-span-2 pt-6">
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                                        <Save size={24}/> {editingStudent ? 'Apply Updates' : 'Confirm Enrollment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* --- STUDENT VIEW MODAL --- */}
                {selectedStudent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden flex items-center justify-center text-indigo-600 font-black text-4xl border-2 border-slate-200">
                                    {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" /> : selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h3>
                                    <p className="text-indigo-600 font-mono font-bold">{selectedStudent.studentCustomId}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2">Academic Profile</h4>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Class & Div</label><p className="font-bold">Grade {selectedStudent.gradeId} - {subdivisions.find((sd:any)=>sd.id===selectedStudent.subdivisionId)?.divisionName || 'N/A'}</p></div>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Registered Mobile</label><p className="font-bold">{selectedStudent.mobile}</p></div>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Date of Birth</label><p className="font-bold">{selectedStudent.dob || 'Not provided'}</p></div>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Current School</label><p className="font-bold">{selectedStudent.schoolName}</p></div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2">Parental & Logistics</h4>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Parent/Guardian</label><p className="font-bold">{selectedStudent.parentName}</p></div>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Fees Plan</label><p className="font-bold">₹{selectedStudent.monthlyFees} / Month</p></div>
                                    <div><label className="text-[9px] font-bold text-slate-400 uppercase">Residential Address</label><p className="font-bold text-sm leading-relaxed">{selectedStudent.address}</p></div>
                                </div>
                            </div>
                            
                            <div className="mt-12 flex gap-4">
                                <button onClick={() => { setEditingStudent(selectedStudent); setSelectedStudent(null); setIsModalOpen(true); }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Edit2 size={16}/> Modify Details
                                </button>
                                <button onClick={() => setSelectedStudent(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                                    Close Profile
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TeachersModule = ({ teachers, onNotify, refresh, grades, subdivisions }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [form, setForm] = useState({ name: '', mobile: '', specialization: '', gradeId: '', subdivisionId: '' });

    useEffect(() => {
        if (editingTeacher) {
            setForm({
                name: editingTeacher.name,
                mobile: editingTeacher.mobile,
                specialization: editingTeacher.specialization,
                gradeId: editingTeacher.gradeId || '',
                subdivisionId: editingTeacher.subdivisionId || ''
            });
        } else {
            setForm({ name: '', mobile: '', specialization: '', gradeId: '', subdivisionId: '' });
        }
    }, [editingTeacher]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                await db.updateTeacher(editingTeacher.id, form);
                onNotify("Faculty record updated.");
            } else {
                await db.addTeacher(form);
                onNotify("Faculty member registered.");
            }
            setIsModalOpen(false);
            refresh();
        } catch (err: any) { 
            alert(`Failed to save teacher. ${err.message || 'Check for duplicate mobile number or network issues.'}`); 
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"><Plus size={20}/> Add Faculty</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                            <tr><th className="p-4">Faculty Member</th><th className="p-4">Class</th><th className="p-4">Mobile</th><th className="p-4">Specialization</th><th className="p-4 text-center">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {teachers.map((t: Teacher) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{t.name}</p>
                                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{t.teacherCustomId}</p>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">
                                        {t.gradeId ? `Grade ${grades.find((g:any)=>g.id===t.gradeId)?.gradeName || t.gradeId}` : 'All Grades'} 
                                        {t.subdivisionId ? ` - ${subdivisions.find((s:any)=>s.id===t.subdivisionId)?.divisionName || t.subdivisionId}` : ''}
                                    </td>
                                    <td className="p-4 text-slate-500 font-mono">{t.mobile}</td>
                                    <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{t.specialization}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => { setEditingTeacher(t); setIsModalOpen(true); }} className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit2 size={16} strokeWidth={2.5}/></button>
                                            <button onClick={async () => { if(confirm("Reset Password?")) { await db.resetUserPassword('teacher', t.id); onNotify("Password reset successful."); } }} className="p-2.5 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Key size={16} strokeWidth={2.5}/></button>
                                            <button onClick={async () => { if(confirm("Permanent Delete?")) { await db.deleteTeacher(t.id); refresh(); } }} className="p-2.5 rounded-xl text-rose-400 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16} strokeWidth={2.5}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                {editingTeacher ? <Edit2 className="text-indigo-600"/> : <UserPlus className="text-indigo-600"/>} 
                                {editingTeacher ? 'Modify Faculty' : 'Faculty Registration'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile No</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 font-mono" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Specialization</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Mathematics" /></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Grade (Optional)</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none font-bold text-slate-900 text-xs" value={form.gradeId} onChange={e => setForm({...form, gradeId: e.target.value, subdivisionId: ''})}>
                                            <option value="">All Grades</option>
                                            {grades.map((g: any) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Division</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none font-bold text-slate-900 text-xs" value={form.subdivisionId} onChange={e => setForm({...form, subdivisionId: e.target.value})}>
                                            <option value="">All Divisions</option>
                                            {subdivisions.filter((sd: any) => sd.gradeId === form.gradeId).map((sd: any) => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                                    <Save size={24}/> {editingTeacher ? 'Apply Updates' : 'Confirm Registration'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GradesModule = ({ grades, subdivisions, onNotify, refresh }: any) => {
    const [name, setName] = useState('');
    const [subs, setSubs] = useState('');
    
    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const subdivisionNames = subs.split(',').map(s => s.trim()).filter(Boolean);
            await db.addGrade(name, subdivisionNames);
            setName(''); setSubs(''); refresh(); onNotify("New class architecture deployed.");
        } catch (e) { alert("Failed to build class."); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-black mb-6">Define New Class</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <input required placeholder="Grade Name (e.g. 5th)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-bold text-slate-900" value={name} onChange={e => setName(e.target.value)} />
                    <textarea placeholder="Subdivisions (comma separated: A, B, Rose)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 h-24 resize-none font-medium text-slate-900" value={subs} onChange={e => setSubs(e.target.value)} />
                    <p className="text-[10px] text-slate-400 italic">Sections allow for smaller mentor batches within a grade.</p>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all">Construct Grade Architecture</button>
                </form>
            </div>
            <div className="space-y-4">
                {grades.map((g: Grade) => (
                    <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                        <div>
                            <p className="text-lg font-black text-slate-800">Grade {g.gradeName}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {subdivisions.filter((s:any)=>s.gradeId===g.id).map((s:any)=> (
                                    <span key={s.id} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{s.divisionName}</span>
                                ))}
                                {subdivisions.filter((s:any)=>s.gradeId===g.id).length === 0 && <span className="text-[9px] text-slate-300 font-bold uppercase italic">No Sections</span>}
                            </div>
                        </div>
                        <button onClick={async () => { if(confirm("Permanently Delete Grade and all its sections? This action is irreversible.")) { await db.deleteGrade(g.id); refresh(); } }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={20}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FeesModule = ({ fees, onNotify, refresh }: any) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><CreditCard className="text-emerald-500"/> Fee Submission Ledger</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Student Participant</th><th className="p-6">Amount</th><th className="p-6">UTR Reference ID</th><th className="p-6">Verification Status</th><th className="p-6 text-center">Protocol Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {fees.map((f: FeeSubmission) => (
                            <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6 font-bold text-slate-800">{f.studentName}</td>
                                <td className="p-6 font-black text-emerald-600 text-lg">₹{f.amount}</td>
                                <td className="p-6 font-mono text-xs text-slate-500 uppercase tracking-widest">{f.transactionRef}</td>
                                <td className="p-6">
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${f.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : f.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {f.status}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    {f.status === 'Pending' ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={async () => { await db.updateFeeSubmissionStatus(f.id, 'Approved', f.studentId); refresh(); onNotify("Transaction Authenticated."); }} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-sm transition-all active:scale-90" title="Approve Payment"><Check size={18} strokeWidth={3}/></button>
                                            <button onClick={async () => { await db.updateFeeSubmissionStatus(f.id, 'Rejected', f.studentId); refresh(); onNotify("Transaction Denied."); }} className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-sm transition-all active:scale-90" title="Reject Payment"><X size={18} strokeWidth={3}/></button>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-black uppercase italic">Registry Closed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {fees.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Financial Registry Clear</div>}
            </div>
        </div>
    );
};

const NoticesModule = ({ notices, onNotify, refresh }: any) => {
    const [form, setForm] = useState({ title: '', content: '', important: false });
    
    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addNotice({ ...form, date: new Date().toISOString().split('T')[0] });
            setForm({ title: '', content: '', important: false }); 
            refresh(); 
            onNotify("Notice Board Synchronized.");
        } catch (e) { alert("Failed to deploy notice."); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 sticky top-8 h-fit">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Bell className="text-indigo-600"/> Broadcast Directive</h3>
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Notice Heading</label>
                        <input required placeholder="Announcement Title" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Directive Payload</label>
                        <textarea required placeholder="Deployment message content..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-none font-medium text-slate-900" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
                    </div>
                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer group">
                        <input type="checkbox" checked={form.important} onChange={e => setForm({...form, important: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /> 
                        Mark as Urgent Priority (Critical Alert)
                    </label>
                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition-all shadow-lg active:scale-98">Post Institutional Broadcast</button>
                </form>
            </div>
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-3 custom-scrollbar">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 ml-2">Active Log</h4>
                {notices.map((n: Notice) => (
                    <div key={n.id} className={`p-8 rounded-[32px] border flex justify-between items-start group transition-all relative overflow-hidden ${n.important ? 'bg-rose-50 border-rose-200 shadow-rose-100 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <h4 className={`font-black text-lg leading-tight ${n.important ? 'text-rose-900' : 'text-slate-800'}`}>{n.title}</h4>
                                {n.important && <span className="bg-rose-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm animate-pulse">URGENT</span>}
                            </div>
                            <p className={`text-sm leading-relaxed font-medium ${n.important ? 'text-rose-700/80' : 'text-slate-500'}`}>{n.content}</p>
                            <div className="flex items-center gap-2 mt-6">
                                <Clock size={12} className="text-slate-400" />
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{n.date}</p>
                            </div>
                        </div>
                        <button onClick={async () => { if(confirm("Erase from active log?")) { await db.deleteNotice(n.id); refresh(); } }} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all relative z-10"><Trash2 size={20}/></button>
                    </div>
                ))}
                {notices.length === 0 && <div className="p-20 text-center text-slate-200 font-black uppercase text-sm tracking-[0.3em] border-4 border-dashed border-slate-100 rounded-[50px]">Log Terminal Clear</div>}
            </div>
        </div>
    );
};

const EnquiriesModule = ({ enquiries, onNotify, refresh }: any) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><MessageCircle className="text-blue-500"/> Candidate Lead Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                        <tr><th className="p-6">Prospective Candidate</th><th className="p-6">Parent Identity</th><th className="p-6">Mobile & Availability</th><th className="p-6">Status</th><th className="p-6 text-center">Registry Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {enquiries.map((e: Enquiry) => (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6">
                                    <p className="font-black text-slate-800 text-base">{e.studentName}</p>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-tight">{e.grade} Grade</span>
                                </td>
                                <td className="p-6">
                                    <p className="text-slate-600 font-bold">{e.parentName}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{e.relation}</p>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2 text-slate-500 font-mono font-bold mb-1">
                                        <Phone size={12} /> {e.mobile}
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[9px] tracking-widest">
                                        <Clock size={10} /> Call Window: {e.connectTime}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${e.status === 'Contacted' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 shadow-sm'}`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    <button 
                                        onClick={async () => { await db.updateEnquiryStatus(e.id, e.status === 'New' ? 'Contacted' : 'New'); refresh(); onNotify("Lead Status Synchronized."); }} 
                                        className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 ${e.status === 'New' ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        Mark {e.status === 'New' ? 'Contacted' : 'Pending'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {enquiries.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Lead Database Dormant</div>}
            </div>
        </div>
    );
};

const SettingsModule = ({ settings, onNotify, refresh }: any) => {
    const [form, setForm] = useState(settings);
    
    const save = async () => { 
        try {
            await db.updateSettings(form); 
            refresh(); 
            onNotify("System Config Secured."); 
        } catch (e) { alert("Write error."); }
    };

    return (
        <div className="max-w-4xl space-y-10">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Lock className="text-indigo-600"/> Security & Master Integrations</h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 block ml-1 tracking-[0.2em]">Google Site Verification Key</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-600" value={form.googleSiteKey} onChange={e => setForm({...form, googleSiteKey: e.target.value})} placeholder="Verification ID String..." />
                        <p className="text-[10px] text-slate-400 italic px-1">Used for Search Console Authentication.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><DollarSign size={28}/></div>
                    <div><h3 className="text-xl font-black text-slate-800">Financial Infrastructure</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Gateways & Receivables</p></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(form.gateways).map(([key, config]: [string, any]) => (
                        <div key={key} className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 space-y-6 group hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                <h4 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">{config.name} Protocol</h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={config.enabled} onChange={e => setForm({...form, gateways: {...form.gateways, [key]: {...config, enabled: e.target.checked}}})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            {key === 'manual' ? (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Institutional VPA Address</label>
                                    <input placeholder="institution@bank" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-indigo-600 outline-none focus:ring-1 focus:ring-indigo-500" value={config.credentials.upiId || ''} onChange={e => setForm({...form, gateways: {...form.gateways, [key]: {...config, credentials: {upiId: e.target.value}}}})} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                                    <Lock size={20} className="text-slate-300 mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Automated API Handshake Required</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <button onClick={save} className="w-full bg-indigo-600 text-white py-6 rounded-[28px] font-black text-xl mt-12 hover:shadow-2xl transition-all shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-98">
                    <Save size={24}/> Commit System Architecture
                </button>
            </div>
            
            <div className="p-8 bg-slate-900 text-white rounded-[40px] flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-3xl"><Smartphone size={32} className="text-indigo-400" /></div>
                    <div>
                        <h4 className="text-xl font-black">SMS Terminal Sync</h4>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Version 4.1.0 High Performance Stable</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-slate-500">Node Status</span>
                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operational
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
