
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { TabView, Grade, FeeSubmission, Enquiry, Profile, TeacherAssignment, Homework, Exam, Product } from '../types';
import { 
  Settings, LogOut, CreditCard, Layers, Trash2, 
  TrendingUp, DollarSign, Menu, MessageCircle, 
  Users, UserPlus, GitMerge, BookOpen, PenTool, 
  ShoppingBag, Megaphone, Plus, ShieldAlert, Eye, 
  CheckCircle2, AlertCircle, FileText, Camera, Upload, X,
  GraduationCap, Copy, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  
  // Data State
  const [grades, setGrades] = useState<Grade[]>([]);
  const [fees, setFees] = useState<FeeSubmission[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const refreshData = useCallback(async () => {
    try {
        const results = await Promise.allSettled([
            db.getGrades(),
            db.getFeeSubmissions(),
            db.getEnquiries(),
            db.getAllProfiles(),
            db.getTeacherAssignments(),
            db.getAdminAllHomework(),
            db.getAdminAllExams(),
            db.getAnnouncements(),
            db.getProducts()
        ]);

        const [g, f, enq, prof, assign, hw, ex, ann, prod] = results;

        if (g.status === 'fulfilled') setGrades(g.value);
        if (f.status === 'fulfilled') setFees(f.value);
        if (enq.status === 'fulfilled') setEnquiries(enq.value);
        if (prof.status === 'fulfilled') setProfiles(prof.value);
        if (assign.status === 'fulfilled') setAssignments(assign.value);
        if (hw.status === 'fulfilled') setHomework(hw.value);
        if (ex.status === 'fulfilled') setExams(ex.value);
        if (ann.status === 'fulfilled') setAnnouncements(ann.value);
        if (prod.status === 'fulfilled') setProducts(prod.value);

    } catch(e) {
        console.error("Sync Error:", e);
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
  }, [navigate, refreshData]);

  const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

  const SidebarItem = ({ tab, icon: Icon, label }: any) => (
    <button onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-200 group relative overflow-hidden ${activeTab === tab ? 'text-white bg-indigo-600/10 border-r-4 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} />
      <span className="font-medium text-xs tracking-wider">{label}</span>
    </button>
  );

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505]"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-sans relative">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0A0A] flex flex-col shadow-2xl transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <span className="text-white font-black uppercase tracking-tighter text-sm">Gurukul <span className="text-indigo-400">Admin</span></span>
        </div>
        <div className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="px-8 text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">Core Control</p>
          <SidebarItem tab="dashboard" icon={TrendingUp} label="Insights" />
          <SidebarItem tab="users" icon={Users} label="User Registry" />
          <SidebarItem tab="mapping" icon={GitMerge} label="Academic Mapping" />
          <SidebarItem tab="grades" icon={Layers} label="Academic Structure" />
          
          <p className="px-8 text-[9px] font-black text-white/20 uppercase tracking-widest mb-4 mt-6">Oversight</p>
          <SidebarItem tab="homework" icon={BookOpen} label="Homework Hub" />
          <SidebarItem tab="exams" icon={PenTool} label="Exam Master" />
          <SidebarItem tab="fees" icon={CreditCard} label="Financials" />
          
          <p className="px-8 text-[9px] font-black text-white/20 uppercase tracking-widest mb-4 mt-6">SaaS Ops</p>
          <SidebarItem tab="products" icon={ShoppingBag} label="Shop Manager" />
          <SidebarItem tab="broadcast" icon={Megaphone} label="Announcements" />
          <SidebarItem tab="enquiries" icon={MessageCircle} label="Enquiries" />
        </div>
        <div className="p-6 border-t border-white/5"><button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest"><LogOut size={14}/> Logout</button></div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={24}/></button>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
              {notification && <span className="text-indigo-400 font-bold text-xs animate-pulse">{notification}</span>}
              <div className="p-2 bg-white/5 rounded-full border border-white/10"><ShieldAlert size={20} className="text-amber-500" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'dashboard' && <InsightsModule profiles={profiles} grades={grades} enquiries={enquiries} fees={fees} />}
                {activeTab === 'users' && <UserManagementModule profiles={profiles} refresh={refreshData} />}
                {activeTab === 'mapping' && <MappingModule assignments={assignments} profiles={profiles} grades={grades} refresh={refreshData} />}
                {activeTab === 'homework' && <OversightModule data={homework} type="homework" refresh={refreshData} />}
                {activeTab === 'exams' && <OversightModule data={exams} type="exam" refresh={refreshData} />}
                {activeTab === 'products' && <ShopManagerModule products={products} refresh={refreshData} />}
                {activeTab === 'broadcast' && <AnnouncementModule announcements={announcements} refresh={refreshData} />}
                {activeTab === 'grades' && <GradesModule grades={grades} refresh={refreshData} />}
                {activeTab === 'fees' && <FeesModule fees={fees} />}
                {activeTab === 'enquiries' && <EnquiryModule enquiries={enquiries} />}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- SUB-MODULES ---

const InsightsModule = ({ profiles, grades, enquiries, fees }: any) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Students" value={profiles.filter((p:any)=>p.role==='student').length} icon={Users} color="text-indigo-400" />
            <StatCard label="Faculty Count" value={profiles.filter((p:any)=>p.role==='teacher').length} icon={GraduationCap} color="text-emerald-400" />
            <StatCard label="New Enquiries" value={enquiries.length} icon={MessageCircle} color="text-amber-400" />
            <StatCard label="Revenue Log" value={`₹${fees.reduce((acc:any, f:any)=>acc + parseInt(f.amount || 0), 0)}`} icon={DollarSign} color="text-cyan-400" />
        </div>
        <div className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5">
            <h3 className="text-xl font-black mb-4">System Operational Status</h3>
            <p className="text-slate-500 text-sm leading-relaxed">All modules are nominal. RLS Policies enforced. Audit trails active for {profiles.length} profiles across {grades.length} grades.</p>
        </div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
        <div className={`p-3 bg-white/5 w-fit rounded-xl mb-4 ${color}`}><Icon size={20}/></div>
        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-light serif-font italic">{value}</p>
    </div>
);

const UserManagementModule = ({ profiles, refresh }: any) => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [role, setRole] = useState<any>('student');
    const [lastCreated, setLastCreated] = useState<any>(null);
    const [copyState, setCopyState] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await db.createProfile({ fullName: name, mobile, role });
            setLastCreated(result);
            setName(''); 
            setMobile(''); 
            refresh();
        } catch (e: any) { 
            setError(e.message || "Registry Error: Identity collision detected.");
        } finally {
            setLoading(false);
        }
    };

    const copyCreds = () => {
        if(!lastCreated) return;
        const text = `Gurukul Credentials\nUser: ${lastCreated.generatedUsername}\nPass: ${lastCreated.password}`;
        navigator.clipboard.writeText(text);
        setCopyState(true);
        setTimeout(() => setCopyState(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
                <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 h-fit">
                    <h3 className="text-sm font-black mb-6 text-white uppercase tracking-widest flex items-center gap-2"><UserPlus size={16} /> Identity Registry</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <input required placeholder="Legal Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" value={name} onChange={e => setName(e.target.value)} />
                        <input required placeholder="Mobile Protcol" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" value={mobile} onChange={e => setMobile(e.target.value)} />
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="student">Student Account</option>
                            <option value="teacher">Faculty Account</option>
                            <option value="admin">System Admin</option>
                        </select>
                        <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition-colors uppercase tracking-widest text-[10px] disabled:opacity-50">
                            {loading ? 'Processing Registry...' : 'Commit Identity'}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-rose-500 font-bold leading-relaxed">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {lastCreated && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden">
                            <button onClick={() => setLastCreated(null)} className="absolute top-4 right-4 text-white/20 hover:text-white"><X size={14}/></button>
                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">New Identity Generated</p>
                            <div className="space-y-2 mb-6">
                                <p className="text-xs text-white/60">Username: <span className="text-white font-mono font-bold">{lastCreated.generatedUsername}</span></p>
                                <p className="text-xs text-white/60">Key: <span className="text-white font-mono font-bold">{lastCreated.password}</span></p>
                            </div>
                            <button onClick={copyCreds} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
                                {copyState ? <><Check size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy Credentials</>}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="lg:col-span-2 bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] uppercase font-black text-slate-400 tracking-widest border-b border-white/5">
                        <tr><th className="p-6">Identity</th><th className="p-6">Role</th><th className="p-6">Status</th><th className="p-6">Contact</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {profiles.map((p: Profile) => (
                            <tr key={p.id} className="text-xs hover:bg-white/[0.02]">
                                <td className="p-6 text-white font-bold">{p.fullName}</td>
                                <td className="p-6"><span className="px-3 py-1 bg-white/5 rounded-full text-[9px] uppercase font-black">{p.role}</span></td>
                                <td className="p-6"><span className="text-emerald-500 flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"/> {p.status}</span></td>
                                <td className="p-6 text-slate-400 font-mono tracking-tighter">{p.mobile}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OversightModule = ({ data, type, refresh }: any) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-widest">Active {type === 'homework' ? 'Homework' : 'Exams'} Registry</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest">System Overrides Active</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item: any) => (
                <div key={item.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 group hover:border-red-500/20 transition-all">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-white/5 rounded-xl"><FileText size={20} className="text-indigo-400" /></div>
                        <button onClick={async () => {
                            if(confirm(`ARCHIVE ${type.toUpperCase()} ID: ${item.id}? ACTION IS LOGGED.`)) {
                                type === 'homework' ? await db.adminDeleteHomework(item.id) : await db.adminDeleteExam(item.id);
                                refresh();
                            }
                        }} className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                    <h4 className="text-lg font-bold mb-2 truncate">{item.topic || item.title}</h4>
                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-4">{item.subject}</p>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-6">{item.description}</p>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Target: {item.target_type || item.targetType}</span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500"><AlertCircle size={10}/> Admin Control</div>
                    </div>
                </div>
            ))}
            {data.length === 0 && <div className="col-span-full py-20 text-center opacity-20 uppercase tracking-[1em] text-xs">Registry Empty</div>}
        </div>
    </div>
);

const ShopManagerModule = ({ products, refresh }: any) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [img, setImg] = useState('');
    const [cat, setCat] = useState('Decor');

    const handleAdd = async (e: any) => {
        e.preventDefault();
        await db.adminAddProduct({ name, description: '', basePrice: price, imageUrl: img, category: cat, stockStatus: 'In Stock' });
        setName(''); setPrice(''); setImg(''); refresh();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 h-fit">
                <h3 className="text-sm font-black mb-6 uppercase tracking-widest">Inventory Log</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <input placeholder="Product Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" value={name} onChange={e => setName(e.target.value)} />
                    <input placeholder="Base Price (₹)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" value={price} onChange={e => setPrice(e.target.value)} />
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" value={cat} onChange={e => setCat(e.target.value)}>
                        {['Decor', 'Stationery', 'Gifts', 'Jewelry'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Image URL (Manual)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" value={img} onChange={e => setImg(e.target.value)} />
                    <button className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Add Product</button>
                </form>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((p: Product) => (
                    <div key={p.id} className="bg-[#0A0A0A] p-6 rounded-[32px] border border-white/5 flex gap-6 items-center group">
                        <img src={p.imageUrl} className="w-20 h-20 rounded-2xl object-cover bg-white/5" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{p.name}</h4>
                            <p className="text-indigo-400 font-bold text-xs">₹{p.basePrice}</p>
                            <p className="text-[9px] uppercase tracking-widest text-white/20 mt-2">{p.category} • {p.stockStatus}</p>
                        </div>
                        <button onClick={async () => {
                            const newStatus = p.stockStatus === 'In Stock' ? 'Sold Out' : 'In Stock';
                            await db.adminUpdateProduct(p.id, { stockStatus: newStatus });
                            refresh();
                        }} className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all">
                            {p.stockStatus === 'In Stock' ? <Eye size={16}/> : <ShieldAlert size={16} className="text-rose-500" />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnnouncementModule = ({ announcements, refresh }: any) => {
    const [title, setTitle] = useState('');
    const [isTicker, setIsTicker] = useState(false);

    const handleAdd = async (e:any) => {
        e.preventDefault();
        await db.adminAddAnnouncement({ title, isTicker, priority: 'Normal' });
        setTitle(''); refresh();
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleAdd} className="bg-[#0A0A0A] p-8 rounded-[40px] border border-white/5 flex items-end gap-6">
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-white/20 mb-2 block">System Announcement Message</label>
                    <input required placeholder="Enter broadcast message..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none text-sm" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                    <input type="checkbox" checked={isTicker} onChange={e => setIsTicker(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Enable Ticker</span>
                </div>
                <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all">Broadcast</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((a:any) => (
                    <div key={a.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex justify-between items-center group">
                        <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-2xl ${a.is_ticker ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-white/40'}`}><Megaphone size={20}/></div>
                            <div>
                                <h4 className="font-bold text-white mb-1">{a.title}</h4>
                                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Type: {a.is_ticker ? 'Ticker Scroll' : 'Static Panel'}</p>
                            </div>
                        </div>
                        <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAINTAINED RE-IMPLEMENTED MODULES ---

const MappingModule = ({ assignments, profiles, grades, refresh }: any) => {
    const [tId, setTId] = useState('');
    const [gId, setGId] = useState('');
    const [subject, setSubject] = useState('');
    const teachers = profiles.filter((p: Profile) => p.role === 'teacher');
    const handleMap = async () => { if (!tId || !gId || !subject) return; await db.addTeacherAssignment({ teacherId: tId, gradeId: gId, subject }); refresh(); };
    return (
        <div className="space-y-8">
            <div className="bg-[#0A0A0A] p-8 rounded-[40px] border border-white/5 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]"><label className="text-[10px] font-black uppercase text-white/20 mb-2 block">Faculty</label><select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs" value={tId} onChange={e => setTId(e.target.value)}><option value="">Select Teacher</option>{teachers.map((t: Profile) => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select></div>
                <div className="flex-1 min-w-[200px]"><label className="text-[10px] font-black uppercase text-white/20 mb-2 block">Grade Scope</label><select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs" value={gId} onChange={e => setGId(e.target.value)}><option value="">Select Grade</option>{grades.map((g: Grade) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}</select></div>
                <div className="flex-1 min-w-[200px]"><label className="text-[10px] font-black uppercase text-white/20 mb-2 block">Subject Authority</label><input placeholder="e.g. Logic & Design" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs" value={subject} onChange={e => setSubject(e.target.value)} /></div>
                <button onClick={handleMap} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"><Plus size={16}/> Link</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((a: TeacherAssignment) => {
                    const teacher = profiles.find((p: Profile) => p.id === a.teacherId);
                    const grade = grades.find((g: Grade) => g.id === a.gradeId);
                    return (
                        <div key={a.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex justify-between items-center group">
                            <div><h4 className="text-white font-bold text-sm">{teacher?.fullName || 'Identity Lost'}</h4><p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">{grade?.gradeName} • {a.subject}</p></div>
                            <button onClick={() => db.deleteTeacherAssignment(a.id).then(refresh)} className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-xl"><Trash2 size={16}/></button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GradesModule = ({ grades, refresh }: any) => {
    const [name, setName] = useState('');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Layers size={20}/> Structural Logic</h3>
                <div className="space-y-4">
                    <input placeholder="Structural Name (e.g. Sector 5)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm" value={name} onChange={e => setName(e.target.value)} />
                    <button onClick={() => db.addGrade(name).then(() => { setName(''); refresh(); })} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Add Node</button>
                </div>
            </div>
            <div className="space-y-4">
                {grades.map((g: Grade) => (
                    <div key={g.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                        <p className="text-lg font-black text-white">{g.gradeName}</p>
                        <button onClick={() => db.deleteGrade(g.id).then(refresh)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FeesModule = ({ fees }: any) => (
    <div className="bg-[#0A0A0A] rounded-[40px] border border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5"><h3 className="font-black text-white text-xl flex items-center gap-2"><DollarSign className="text-emerald-500"/> Revenue Log</h3></div>
        <div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]"><thead className="bg-white/5 text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-white/5"><tr><th className="p-8">Identity</th><th className="p-8">Value</th><th className="p-8">Status</th><th className="p-8">Log Ref</th></tr></thead><tbody className="divide-y divide-white/5 text-xs">{fees.map((f: any) => (<tr key={f.id} className="hover:bg-white/5 transition-colors"><td className="p-8 font-bold text-white">{f.student_name}</td><td className="p-8 font-black text-emerald-500 tracking-tighter">₹{f.amount}</td><td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${f.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{f.status}</span></td><td className="p-8 font-mono text-slate-500 text-[10px]">{f.transaction_ref}</td></tr>))}</tbody></table></div>
    </div>
);

const EnquiryModule = ({ enquiries }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enquiries.map((e: Enquiry) => (
            <div key={e.id} className="bg-[#0A0A0A] p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                <div>
                    <h4 className="text-xl font-bold text-white mb-2">{e.studentName}</h4>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-4">Grade {e.grade} • {e.board}</p>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">Guardian: {e.parentName} ({e.relation})</p>
                </div>
                <div className="pt-8 border-t border-white/5 mt-8 flex justify-between items-center">
                    <span className="text-xs font-mono text-emerald-400">{e.mobile}</span>
                    <p className="text-[9px] text-white/20 font-black uppercase">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        ))}
    </div>
);
