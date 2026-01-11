
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { TabView, Grade, Subdivision, FeeSubmission, SystemSettings, Enquiry, Product, Order, Notice } from '../types';
import { Settings, LogOut, Search, CreditCard, Layers, Power, X, Trash2, TrendingUp, DollarSign, Menu, Check, MessageCircle, ShoppingBag, Send, Megaphone, Bell, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  
  // Data State
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
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
        const results = await Promise.allSettled([
            db.getGrades(),
            db.getSubdivisions(),
            db.getFeeSubmissions(),
            db.getSettings(),
            db.getEnquiries(),
            db.getProducts(),
            db.getOrders(),
            db.getNotices()
        ]);

        const [g, sd, f, settingsRes, enq, p, o, n] = results;

        if (g.status === 'fulfilled') setGrades(g.value);
        if (sd.status === 'fulfilled') setSubdivisions(sd.value);
        if (f.status === 'fulfilled') setFees(f.value);
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
        if (enq.status === 'fulfilled') setEnquiries(enq.value);
        if (p.status === 'fulfilled') setProducts(p.value);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (n.status === 'fulfilled') setNotices(n.value);

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
    
    const channels = [
        db.subscribe('grades', refreshData),
        db.subscribe('subdivisions', refreshData),
        db.subscribe('fee_submissions', refreshData),
        db.subscribe('shop_orders', refreshData),
        db.subscribe('products', refreshData),
        db.subscribe('notices', refreshData)
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
    </button>
  );

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0B1120] flex flex-col shadow-2xl transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <span className="text-white font-black uppercase tracking-tighter">System <span className="text-indigo-400">Core</span></span>
        </div>
        <div className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarItem tab="dashboard" icon={TrendingUp} label="Insights" />
          <SidebarItem tab="broadcast" icon={Megaphone} label="Broadcast" />
          <SidebarItem tab="grades" icon={Layers} label="Classes" />
          <SidebarItem tab="fees" icon={CreditCard} label="Finance" />
          <SidebarItem tab="products" icon={Package} label="Inventory" />
          <SidebarItem tab="shop" icon={ShoppingBag} label="Orders" />
          <SidebarItem tab="notices" icon={Bell} label="Notices" />
          <SidebarItem tab="enquiries" icon={MessageCircle} label="Leads" />
          <SidebarItem tab="settings" icon={Settings} label="Config" />
        </div>
        <div className="p-6 border-t border-white/5"><button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-bold text-sm"><LogOut size={16}/> Terminate</button></div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={24}/></button>
              <h2 className="text-2xl font-black text-slate-800 capitalize">{activeTab}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'dashboard' && <p className="text-slate-400 uppercase font-black tracking-widest text-xs">Analytics layer active.</p>}
                {activeTab === 'grades' && <GradesModule grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'fees' && <FeesModule fees={fees} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'notices' && <NoticesModule notices={notices} onNotify={showNotification} refresh={refreshData} />}
                {activeTab === 'settings' && settings && <SettingsModule settings={settings} onNotify={showNotification} refresh={refreshData} />}
                {/* Other standard modules removed for brevity, keeping skeleton */}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const GradesModule = ({ grades, subdivisions, onNotify, refresh }: any) => {
    const [name, setName] = useState('');
    const [subs, setSubs] = useState('');
    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addGrade(name, subs.split(',').map(s => s.trim()).filter(Boolean));
            setName(''); setSubs(''); refresh(); onNotify("Grade architecture updated.");
        } catch (e) { alert("Error."); }
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-black mb-6">Structural Configuration</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <input required placeholder="Grade ID" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={name} onChange={e => setName(e.target.value)} />
                    <textarea placeholder="Subdivisions (comma separated)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 outline-none resize-none" value={subs} onChange={e => setSubs(e.target.value)} />
                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Commit Build</button>
                </form>
            </div>
            <div className="space-y-4">
                {grades.map((g: Grade) => (
                    <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <p className="text-lg font-black text-slate-800">Grade {g.gradeName}</p>
                        <button onClick={async () => { if(confirm("Delete?")) { await db.deleteGrade(g.id); refresh(); } }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={20}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FeesModule = ({ fees, onNotify, refresh }: any) => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100"><h3 className="font-black text-slate-800 text-xl flex items-center gap-2"><DollarSign className="text-emerald-500"/> Financial Ledger</h3></div>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b">
                    <tr><th className="p-6">Entity</th><th className="p-6">Valuation</th><th className="p-6">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {fees.map((f: FeeSubmission) => (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-6 font-bold text-slate-800">{f.studentName}</td>
                            <td className="p-6 font-black text-emerald-600">₹{f.amount}</td>
                            <td className="p-6"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${f.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{f.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const NoticesModule = ({ notices, onNotify, refresh }: any) => {
    const [form, setForm] = useState({ title: '', content: '', important: false });
    const handleAdd = async (e: any) => {
        e.preventDefault();
        await db.addNotice({ ...form, date: new Date().toISOString().split('T')[0] });
        setForm({ title: '', content: '', important: false }); refresh(); onNotify("Log synced.");
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 h-fit">
                <h3 className="text-2xl font-black mb-8">Deploy Notice</h3>
                <form onSubmit={handleAdd} className="space-y-6">
                    <input required placeholder="Heading" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    <textarea required placeholder="Payload" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none h-40 resize-none" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black">Broadcast</button>
                </form>
            </div>
        </div>
    );
};

const SettingsModule = ({ settings, onNotify, refresh }: any) => {
    const [form, setForm] = useState(settings);
    const save = async () => { await db.updateSettings(form); refresh(); onNotify("Config Secured."); };
    return (
        <div className="max-w-4xl space-y-10">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black mb-10">Security Architecture</h3>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-mono text-xs" value={form.googleSiteKey} onChange={e => setForm({...form, googleSiteKey: e.target.value})} placeholder="Verification ID..." />
                <button onClick={save} className="w-full bg-indigo-600 text-white py-6 rounded-[28px] font-black text-xl mt-12">Commit Hardware Sync</button>
            </div>
        </div>
    );
};
