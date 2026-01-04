
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings, GatewayConfig, Enquiry, Product, Order, StudentNotification, Notice } from '../types';
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, ShieldAlert, Key, Power, X, Trash2, GraduationCap, TrendingUp, DollarSign, RefreshCw, Menu, Check, Upload, Calendar, MessageCircle, Phone, Clock, ShoppingBag, Send, MapPin, Truck, Megaphone, Bell, Info, AlertTriangle, User, UserCheck, AlertCircle } from 'lucide-react';
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
    const user = sessionStorage.getItem('sc_user');
    if (!user) { navigate('/login'); return; }
    refreshData().then(() => setLoading(false));
    const channels = [
        db.subscribe('students', refreshData),
        db.subscribe('teachers', refreshData),
        db.subscribe('grades', refreshData),
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
              <h2 className="text-2xl font-black text-slate-800 capitalize font-[Poppins]">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="max-w-7xl mx-auto">

          {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard title="Orders Paid" value={orders.filter(o => o.status === 'Payment Under Verification').length} icon={ShoppingBag} color="bg-pink-500" subtext="Pending Verification" />
                  <StatCard title="Active Students" value={students.filter(s=>s.status==='Active').length} icon={Users} color="bg-indigo-500" subtext="Enrolled students" />
                  <StatCard title="Revenue (Fees)" value={`₹${fees.reduce((a,b)=>a+parseInt(b.amount||'0'), 0)}`} icon={DollarSign} color="bg-emerald-500" subtext="Collected this month" />
                  <StatCard title="New Leads" value={enquiries.length} icon={MessageCircle} color="bg-blue-500" subtext="Website enquiries" />
              </div>
          )}

          {activeTab === 'broadcast' && <BroadcastModule grades={grades} subdivisions={subdivisions} students={students} onNotify={showNotification} />}

          {activeTab === 'students' && <StudentsModule grades={grades} subdivisions={subdivisions} students={students} onNotify={showNotification} />}

          {activeTab === 'teachers' && <TeachersModule teachers={teachers} grades={grades} subdivisions={subdivisions} onNotify={showNotification} />}

          {activeTab === 'grades' && <GradesModule grades={grades} subdivisions={subdivisions} onNotify={showNotification} />}

          {activeTab === 'fees' && <FeesModule fees={fees} onNotify={showNotification} refresh={refreshData} />}

          {activeTab === 'notices' && <NoticesModule notices={notices} onNotify={showNotification} refresh={refreshData} />}

          {activeTab === 'settings' && settings && <SettingsModule settings={settings} onNotify={showNotification} refresh={refreshData} />}

          {activeTab === 'enquiries' && <EnquiriesModule enquiries={enquiries} onNotify={showNotification} refresh={refreshData} />}

          {activeTab === 'shop' && <OrdersModule orders={orders} onNotify={showNotification} refresh={refreshData} />}

          </div>
        </div>
      </main>
    </div>
  );
}

const StudentsModule = ({ students, grades, subdivisions, onNotify }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', mobile: '', parentName: '', gradeId: '', subdivisionId: '', joiningDate: new Date().toISOString().split('T')[0], monthlyFees: '5000', schoolName: '', address: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addStudent(form);
            onNotify("Student added successfully!");
            setIsAdding(false);
            setForm({ name: '', mobile: '', parentName: '', gradeId: '', subdivisionId: '', joiningDate: '', monthlyFees: '5000', schoolName: '', address: '' });
        } catch (err) { alert("Failed to add student."); }
    };

    const filtered = students.filter((s: Student) => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentCustomId.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none" placeholder="Search ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"><Plus size={20}/> Add Student</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                        <tr><th className="p-4">Student</th><th className="p-4">Class</th><th className="p-4">Mobile</th><th className="p-4">Fees</th><th className="p-4 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filtered.map((s: Student) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4"><p className="font-bold text-slate-800">{s.name}</p><p className="text-[10px] font-mono text-slate-400 uppercase">{s.studentCustomId}</p></td>
                                <td className="p-4 text-slate-500">{grades.find((g: any) => g.id === s.gradeId)?.gradeName || s.gradeId}</td>
                                <td className="p-4 text-slate-500 font-mono">{s.mobile}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${s.feesStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{s.feesStatus}</span></td>
                                <td className="p-4 text-center">
                                    <button onClick={async () => { if(confirm("Suspend student?")) await db.updateStudentStatus(s.id, s.status === 'Active' ? 'Suspended' : 'Active'); }} className={`p-2 rounded-lg ${s.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}><Power size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><UserPlus className="text-indigo-600"/> Enrol New Student</h3>
                            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Mobile No</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Grade</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gradeId} onChange={e => setForm({...form, gradeId: e.target.value})}>{grades.map((g: any) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}</select></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Division</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.subdivisionId} onChange={e => setForm({...form, subdivisionId: e.target.value})}>{subdivisions.filter((sd: any) => sd.gradeId === form.gradeId).map((sd: any) => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}</select></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Monthly Fees</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.monthlyFees} onChange={e => setForm({...form, monthlyFees: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Parent Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} /></div>
                                <div className="col-span-2"><button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg">Confirm Registration</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TeachersModule = ({ teachers, grades, subdivisions, onNotify }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', mobile: '', gradeId: '', subdivisionId: '', specialization: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addTeacher(form);
            onNotify("Teacher profile created!");
            setIsAdding(false);
        } catch (err) { alert("Error adding faculty."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> New Faculty</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachers.map((t: Teacher) => (
                    <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">{t.name.charAt(0)}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{t.status}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg">{t.name}</h4>
                            <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">{t.specialization || 'General Faculty'}</p>
                            <div className="space-y-2 border-t border-slate-50 pt-4">
                                <p className="text-xs text-slate-500 flex items-center gap-2"><Phone size={12}/> {t.mobile}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-2"><Lock size={12}/> Pass: {t.mobile}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                             <button onClick={async () => { if(confirm("Suspend teacher?")) await db.updateTeacherStatus(t.id, t.status === 'Active' ? 'Suspended' : 'Active'); }} className="flex-1 bg-slate-50 text-slate-500 py-2 rounded-lg font-bold text-xs hover:bg-slate-100 transition-all">Toggle Status</button>
                             <button onClick={async () => { if(confirm("Permanent Delete?")) await db.deleteTeacher(t.id); }} className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="text-indigo-600"/> Add Faculty</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Mobile / Password</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Subject Specialization</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg shadow-xl mt-4">Save Faculty Profile</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GradesModule = ({ grades, subdivisions, onNotify }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', subdivisions: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const subs = form.subdivisions.split(',').map(s => s.trim()).filter(s => s);
            await db.addGrade(form.name, subs);
            onNotify("New Class added!");
            setIsAdding(false);
            setForm({ name: '', subdivisions: '' });
        } catch (err) { alert("Failed to add grade."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> New Class</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grades.map((g: Grade) => (
                    <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-black text-slate-800">{g.gradeName}</h4>
                            <button onClick={async () => { if(confirm("Delete entire grade?")) await db.deleteGrade(g.id); }} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {subdivisions.filter((sd: any) => sd.gradeId === g.id).map((sd: Subdivision) => (
                                <span key={sd.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 uppercase">{sd.divisionName}</span>
                            ))}
                            <button className="px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 rounded-lg text-xs font-bold hover:border-indigo-300 hover:text-indigo-400 transition-all flex items-center gap-1"><Plus size={12}/> Div</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Create New Grade</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Grade Name (e.g. 1st Grade)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Divisions (Comma separated: A, B, C)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.subdivisions} onChange={e => setForm({...form, subdivisions: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg shadow-xl mt-4">Save Grade Config</button>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-800 text-lg">Payment Verifications</h3></div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr><th className="p-4">Student</th><th className="p-4">Amount</th><th className="p-4">Reference (UTR)</th><th className="p-4">Date</th><th className="p-4 text-center">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {fees.map((f: FeeSubmission) => (
                        <tr key={f.id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-800">{f.studentName}</td>
                            <td className="p-4 text-emerald-600 font-bold">₹{f.amount}</td>
                            <td className="p-4 font-mono text-xs uppercase font-bold text-indigo-600">{f.transactionRef}</td>
                            <td className="p-4 text-slate-500">{f.date}</td>
                            <td className="p-4 flex justify-center gap-2">
                                {f.status === 'Pending' ? (
                                    <>
                                        <button onClick={() => handleAction(f.id, 'Approved', f.studentId)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all">Verify</button>
                                        <button onClick={() => handleAction(f.id, 'Rejected', f.studentId)} className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all">Reject</button>
                                    </>
                                ) : (
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${f.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{f.status}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const NoticesModule = ({ notices, onNotify, refresh }: any) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], important: true });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await db.addNotice(form);
            onNotify("Notice published!");
            setIsAdding(false);
            refresh();
        } catch (err) { alert("Failed to save notice."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20}/> New Public Notice</button></div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <tr><th className="p-4">Notice Title & Preview</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {notices.map((n: Notice) => (
                            <tr key={n.id} className="hover:bg-slate-50">
                                <td className="p-4"><p className="font-bold text-slate-800">{n.title}</p><p className="text-xs text-slate-400 truncate max-w-xs">{n.content}</p></td>
                                <td className="p-4 text-slate-500">{n.date}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${n.important ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{n.important ? 'Live' : 'Draft'}</span></td>
                                <td className="p-4 text-center"><button onClick={async () => { if(confirm("Delete?")) { await db.deleteNotice(n.id); refresh(); } }} className="text-rose-400 hover:text-rose-600 p-2"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Post to Ticker</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Subject</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Message Content</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none h-24" value={form.content} onChange={e => setForm({...form, content: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg shadow-xl mt-4">Confirm & Publish</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingsModule = ({ settings, onNotify, refresh }: any) => {
    const [form, setForm] = useState(settings);

    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            await db.updateSettings(form);
            onNotify("System settings updated!");
            refresh();
        } catch (err) { alert("Error saving config."); }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <form onSubmit={handleSave} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                 <div className="flex items-center gap-4 mb-4">
                     <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Settings size={32}/></div>
                     <div><h3 className="text-2xl font-black text-slate-800">System Config</h3><p className="text-sm text-slate-400 font-medium">Control global variables and gateways.</p></div>
                 </div>

                 <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><CreditCard size={14}/> Manual UPI Gateway</label>
                     <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
                          <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase text-slate-400">UPI VPA (ID)</label>
                               <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.gateways.manual.credentials.upiId} onChange={e => setForm({...form, gateways: {...form.gateways, manual: {...form.gateways.manual, credentials: { upiId: e.target.value }}}})} placeholder="e.g. shriya@ybl" />
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                               <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600" checked={form.gateways.manual.enabled} onChange={e => setForm({...form, gateways: {...form.gateways, manual: {...form.gateways.manual, enabled: e.target.checked }}})} />
                               <span className="text-xs font-bold text-slate-600 uppercase">Enable Manual UPI</span>
                          </div>
                     </div>
                 </div>

                 <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Recaptcha / Google Keys</label>
                     <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={form.googleSiteKey} onChange={e => setForm({...form, googleSiteKey: e.target.value})} placeholder="VITE_RECAPTCHA_KEY" />
                 </div>

                 <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"><Save size={24}/> Save Changes</button>
            </form>
        </div>
    );
};

const EnquiriesModule = ({ enquiries, onNotify, refresh }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3"><MessageCircle className="text-indigo-600"/><h3 className="font-bold text-slate-800 text-lg">Website Enquiries</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <tr><th className="p-4">Prospect / Student</th><th className="p-4">Contact</th><th className="p-4">Current School</th><th className="p-4">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {enquiries.map((e: Enquiry) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{e.studentName}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">{e.grade} • {e.parentName} ({e.relation})</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-mono text-xs font-bold text-indigo-600">{e.mobile}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{e.connectTime}</p>
                                </td>
                                <td className="p-4 text-xs font-medium text-slate-500">{e.schoolName}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${e.status === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{e.status}</span>
                                </td>
                            </tr>
                        ))}
                        {enquiries.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400">No recent leads found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrdersModule = ({ orders, refresh }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3"><ShoppingBag className="text-indigo-600"/><h3 className="font-bold text-slate-800 text-lg">Store Transactions</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <tr><th className="p-4">Order / Customer</th><th className="p-4">Product</th><th className="p-4">Ref / UTR</th><th className="p-4">Status</th><th className="p-4 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {orders.map((o: Order) => (
                            <tr key={o.id} className="hover:bg-slate-50">
                                <td className="p-4"><p className="font-bold text-slate-800">{o.studentName}</p><p className="text-[10px] text-slate-400 uppercase font-mono">{o.mobile}</p></td>
                                <td className="p-4 font-medium text-slate-500">{o.productName}<br/><span className="text-[10px] font-black text-indigo-600 uppercase">₹{o.finalPrice}</span></td>
                                <td className="p-4 font-mono text-xs font-bold text-slate-400 uppercase tracking-tighter">{o.transactionRef || '---'}</td>
                                <td className="p-4">
                                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        o.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        o.status === 'Processing Order' ? 'bg-blue-100 text-blue-600' : 
                                        o.status === 'Payment Under Verification' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                                    }`}>{o.status}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        {o.status === 'Payment Under Verification' && (
                                            <button onClick={async () => { await db.updateOrder(o.id, { status: 'Processing Order' }); refresh(); }} className="bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase">Approve</button>
                                        )}
                                        {o.status === 'Processing Order' && (
                                            <button onClick={async () => { await db.updateOrder(o.id, { status: 'Completed' }); refresh(); }} className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase">Ship</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BroadcastModule = ({ grades, subdivisions, students, onNotify }: { grades: Grade[], subdivisions: Subdivision[], students: Student[], onNotify: (msg: string) => void }) => {
    const [form, setForm] = useState({ targetType: 'all', targetId: '', type: 'announcement', title: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await db.pushNotification({
                targetType: form.targetType as any,
                targetId: form.targetId,
                type: form.type as any,
                title: form.title,
                message: form.message
            });
            onNotify("Notification pushed successfully!");
            setForm({ targetType: 'all', targetId: '', type: 'announcement', title: '', message: '' });
        } catch (err) { alert("Failed to send."); } finally { setIsSending(false); }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                 <Megaphone size={120} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                 <h3 className="text-2xl font-black mb-2">Broadcaster</h3>
                 <p className="text-indigo-100 text-sm">Send real-time alerts to student dashboards.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Target Audience</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value, targetId: ''})}>
                            <option value="all">All Students</option>
                            <option value="student">One Student</option>
                            <option value="grade">Specific Grade</option>
                            <option value="division">Specific Division</option>
                        </select>
                    </div>

                    <AnimatePresence mode="wait">
                        {form.targetType !== 'all' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                key={form.targetType}
                            >
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                                    {form.targetType === 'student' ? 'Select Student Name' : 
                                     form.targetType === 'grade' ? 'Select Grade' : 'Select Division'}
                                </label>
                                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={form.targetId} onChange={e => setForm({...form, targetId: e.target.value})}>
                                    <option value="">Choose...</option>
                                    {form.targetType === 'grade' && grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                    {form.targetType === 'division' && subdivisions.map(s => <option key={s.id} value={s.id}>{s.divisionName}</option>)}
                                    {form.targetType === 'student' && students.map(st => <option key={st.id} value={st.id}>{st.name} ({st.studentCustomId})</option>)}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Alert Type</label>
                        <div className="flex gap-2">
                             {[
                                 { id: 'notice', label: 'General', icon: Info },
                                 { id: 'announcement', label: 'Announcement', icon: Megaphone },
                                 { id: 'fee', label: 'Fee Due', icon: CreditCard }
                             ].map(t => (
                                 <button 
                                     key={t.id} 
                                     type="button" 
                                     onClick={() => setForm({...form, type: t.id as any})} 
                                     className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${form.type === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                 >
                                     <t.icon size={16} />
                                     {t.label}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Headline / Title</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Important Update regarding Exams" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Message Details</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none h-32 resize-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Enter your notification content here..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                </div>

                <button disabled={isSending} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSending ? (
                        <>
                            <RefreshCw size={20} className="animate-spin" />
                            Pushing Alert...
                        </>
                    ) : (
                        <>
                            <Send size={20}/> Push Notification Now
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
