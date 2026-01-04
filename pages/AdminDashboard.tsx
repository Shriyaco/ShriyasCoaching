
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings, GatewayConfig, Enquiry, Product, Order, StudentNotification, Notice } from '../types';
// Fixed missing Smartphone import from lucide-react
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, ShieldAlert, Key, Power, X, Trash2, GraduationCap, TrendingUp, DollarSign, RefreshCw, Menu, Check, Upload, Calendar, MessageCircle, Phone, Clock, ShoppingBag, Send, MapPin, Truck, Megaphone, Bell, Info, AlertTriangle, User, UserCheck, AlertCircle, Globe, Smartphone } from 'lucide-react';
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

          {activeTab === 'students' && <StudentsModule grades={grades} subdivisions={subdivisions} students={students} onNotify={showNotification} refresh={refreshData} />}

          {activeTab === 'teachers' && <TeachersModule teachers={teachers} grades={grades} subdivisions={subdivisions} onNotify={showNotification} refresh={refreshData} />}

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
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none" placeholder="Search ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20}/> New Enrollment</button>
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
                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-indigo-600 font-bold">
                                            {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{s.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase">{s.studentCustomId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 font-medium">Grade {s.gradeId}</td>
                                <td className="p-4 text-slate-500 font-mono">{s.mobile}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${s.feesStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{s.feesStatus}</span></td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => { setEditingStudent(s); setIsModalOpen(true); }} className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all" title="Modify Details"><Edit2 size={16}/></button>
                                        <button onClick={() => handleResetPassword(s.id)} className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all" title="Reset Password"><Key size={16}/></button>
                                        <button onClick={async () => { if(confirm("Change status?")) { await db.updateStudentStatus(s.id, s.status === 'Active' ? 'Suspended' : 'Active'); refresh(); } }} className={`p-2 rounded-lg ${s.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}><Power size={16}/></button>
                                        <button onClick={async () => { if(confirm("Permanent Delete?")) { await db.deleteStudent(s.id); refresh(); } }} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={16}/></button>
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
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                {editingStudent ? <Edit2 className="text-indigo-600"/> : <UserPlus className="text-indigo-600"/>} 
                                {editingStudent ? 'Modify Student Info' : 'Student Enrollment Form'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Mobile No (Used as Password)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Parent/Guardian Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Date of Birth</label><input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
                                
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Grade / Class</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gradeId} onChange={e => setForm({...form, gradeId: e.target.value})}>
                                        <option value="">Select Grade</option>
                                        {grades.map((g: any) => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Division</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.subdivisionId} onChange={e => setForm({...form, subdivisionId: e.target.value})}>
                                        <option value="">Select Division</option>
                                        {subdivisions.filter((sd: any) => sd.gradeId === form.gradeId).map((sd: any) => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Monthly Fees (₹)</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.monthlyFees} onChange={e => setForm({...form, monthlyFees: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Joining Date</label><input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Current School Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Home Address</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                                <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Profile Image URL (Public URL)</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://example.com/photo.jpg" /></div>
                                
                                <div className="col-span-1 md:col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all">
                                        {editingStudent ? 'Update Records' : 'Confirm Registration'}
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
            onNotify(editingTeacher ? "Profile updated!" : "Teacher added!");
            setIsModalOpen(false);
            setEditingTeacher(null);
            refresh();
        } catch (err) { alert("Error saving faculty profile."); }
    };

    const handleResetPassword = async (id: string) => {
        if (confirm("Reset faculty password to their mobile number?")) {
            await db.resetUserPassword('teacher', id);
            onNotify("Password reset successful!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> New Faculty</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachers.map((t: Teacher) => (
                    <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex gap-1">
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
                             <button onClick={async () => { if(confirm("Suspend teacher?")) { await db.updateTeacherStatus(t.id, t.status === 'Active' ? 'Suspended' : 'Active'); refresh(); } }} className="flex-1 bg-slate-50 text-slate-500 py-2 rounded-lg font-bold text-xs hover:bg-slate-100 transition-all">Toggle State</button>
                             <button onClick={async () => { if(confirm("Permanent Delete?")) { await db.deleteTeacher(t.id); refresh(); } }} className="p-2 text-rose-400 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="text-indigo-600"/> {editingTeacher ? 'Modify Faculty' : 'Add Faculty'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Mobile / Login Password</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Subject Specialization</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-lg shadow-xl mt-4">Save Profile</button>
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
    const [activeSection, setActiveSection] = useState<'general' | 'payment'>('general');

    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            await db.updateSettings(form);
            onNotify("System settings updated!");
            refresh();
        } catch (err) { alert("Error saving config."); }
    };

    const updateGateway = (key: string, field: string, val: any) => {
        setForm({
            ...form,
            gateways: {
                ...form.gateways,
                [key]: {
                    ...form.gateways[key],
                    [field === 'enabled' ? 'enabled' : 'credentials']: field === 'enabled' ? val : {
                        ...form.gateways[key].credentials,
                        [field]: val
                    }
                }
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-2 border border-slate-200 flex shadow-sm">
                <button onClick={() => setActiveSection('general')} className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSection === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>General Config</button>
                <button onClick={() => setActiveSection('payment')} className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSection === 'payment' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Payment Gateways</button>
            </div>

            <form onSubmit={handleSave} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8 animate-fade-in">
                 {activeSection === 'general' ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Settings size={32}/></div>
                            <div><h3 className="text-2xl font-black text-slate-800">Global Settings</h3><p className="text-sm text-slate-400 font-medium">Site keys and system-wide variables.</p></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Google Recaptcha V2 Site Key</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={form.googleSiteKey} onChange={e => setForm({...form, googleSiteKey: e.target.value})} placeholder="VITE_RECAPTCHA_KEY" />
                            <p className="text-[10px] text-slate-400 font-medium italic">Required for enquiry forms and secure login.</p>
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-10">
                        {/* Manual UPI */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><CreditCard size={14}/> Manual UPI Checkout</label>
                                <input type="checkbox" checked={form.gateways.manual.enabled} onChange={e => updateGateway('manual', 'enabled', e.target.checked)} className="h-5 w-5 text-indigo-600 rounded" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Receiver UPI VPA (ID)</label>
                                    <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" value={form.gateways.manual.credentials.upiId} onChange={e => updateGateway('manual', 'upiId', e.target.value)} placeholder="shriya@ybl" />
                                </div>
                            </div>
                        </div>

                        {/* PhonePe */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-t pt-8 border-slate-100">
                                <label className="text-[10px] font-black uppercase text-purple-600 tracking-widest flex items-center gap-2"><Smartphone size={14}/> PhonePe Integration</label>
                                <input type="checkbox" checked={form.gateways.phonepe.enabled} onChange={e => updateGateway('phonepe', 'enabled', e.target.checked)} className="h-5 w-5 text-indigo-600 rounded" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Merchant ID</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.phonepe.credentials.merchantId} onChange={e => updateGateway('phonepe', 'merchantId', e.target.value)} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Salt Key</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.phonepe.credentials.saltKey} onChange={e => updateGateway('phonepe', 'saltKey', e.target.value)} /></div>
                            </div>
                        </div>

                        {/* Paytm */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-t pt-8 border-slate-100">
                                <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Globe size={14}/> Paytm PG Integration</label>
                                <input type="checkbox" checked={form.gateways.paytm.enabled} onChange={e => updateGateway('paytm', 'enabled', e.target.checked)} className="h-5 w-5 text-indigo-600 rounded" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Merchant ID (MID)</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.paytm.credentials.mid} onChange={e => updateGateway('paytm', 'mid', e.target.value)} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Merchant Key</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.paytm.credentials.merchantKey} onChange={e => updateGateway('paytm', 'merchantKey', e.target.value)} /></div>
                            </div>
                        </div>

                        {/* BillDesk */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-t pt-8 border-slate-100">
                                <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2"><Lock size={14}/> BillDesk Integration</label>
                                <input type="checkbox" checked={form.gateways.billdesk.enabled} onChange={e => updateGateway('billdesk', 'enabled', e.target.checked)} className="h-5 w-5 text-indigo-600 rounded" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Merchant ID</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.billdesk.credentials.merchantId} onChange={e => updateGateway('billdesk', 'merchantId', e.target.value)} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Secret Key</label><input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none" value={form.gateways.billdesk.credentials.secret} onChange={e => updateGateway('billdesk', 'secret', e.target.value)} /></div>
                            </div>
                        </div>
                     </div>
                 )}

                 <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"><Save size={24}/> Save Configurations</button>
            </form>
        </div>
    );
};

// Placeholder components for remaining tabs
const GradesModule = ({ grades, subdivisions, onNotify }: any) => (
    <div className="p-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
        <Layers size={64} className="mx-auto mb-4 opacity-10" />
        <p className="font-bold">Class management ready. Navigate via Sidebar to manage Divisions.</p>
    </div>
);
const FeesModule = ({ fees, refresh, onNotify }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h3 className="font-bold">Manual Payment Verifications</h3></div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                <tr><th className="p-4">Student</th><th className="p-4">Ref</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody>
                {fees.map((f: any) => (
                    <tr key={f.id} className="border-b border-slate-50">
                        <td className="p-4 font-bold">{f.studentName}</td>
                        <td className="p-4 font-mono">{f.transactionRef}</td>
                        <td className="p-4">{f.status}</td>
                        <td className="p-4">
                            {f.status === 'Pending' && <button onClick={async () => { await db.updateFeeSubmissionStatus(f.id, 'Approved', f.studentId); refresh(); }} className="text-emerald-500 font-bold">Approve</button>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
const NoticesModule = ({ notices, refresh, onNotify }: any) => (
    <div className="space-y-6">
        <div className="flex justify-end"><button onClick={async () => { const t = prompt("Title?"); const c = prompt("Content?"); if(t&&c) await db.addNotice({title:t, content:c, date:new Date().toISOString().split('T')[0], important:true}); refresh(); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold">+ New Notice</button></div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                    <tr><th className="p-4">Notice Title</th><th className="p-4">Date</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody>
                    {notices.map((n: any) => (
                        <tr key={n.id} className="border-b border-slate-50">
                            <td className="p-4 font-bold">{n.title}</td>
                            <td className="p-4">{n.date}</td>
                            <td className="p-4"><button onClick={async () => { if(confirm("Delete?")) { await db.deleteNotice(n.id); refresh(); } }} className="text-rose-500"><Trash2 size={16}/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
const EnquiriesModule = ({ enquiries }: any) => (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 font-bold">Admission Leads</div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase"><tr><th className="p-4">Student</th><th className="p-4">Parent</th><th className="p-4">Grade</th><th className="p-4">Mobile</th></tr></thead>
            <tbody>{enquiries.map((e: any) => <tr key={e.id} className="border-b"><td className="p-4 font-bold">{e.studentName}</td><td className="p-4">{e.parentName}</td><td className="p-4">{e.grade}</td><td className="p-4 font-mono">{e.mobile}</td></tr>)}</tbody>
        </table>
    </div>
);
const OrdersModule = ({ orders, refresh }: any) => (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 font-bold">Shop Orders</div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase"><tr><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
            <tbody>{orders.map((o: any) => <tr key={o.id} className="border-b"><td className="p-4 font-bold">{o.studentName}</td><td className="p-4">{o.productName}</td><td className="p-4 font-black uppercase text-[10px]">{o.status}</td><td className="p-4">{o.status === 'Payment Under Verification' && <button onClick={async () => { await db.updateOrder(o.id, {status:'Processing Order'}); refresh(); }} className="text-indigo-600 font-bold">Process</button>}</td></tr>)}</tbody>
        </table>
    </div>
);
const BroadcastModule = ({ grades, subdivisions, students, onNotify }: any) => {
    const [form, setForm] = useState({ targetType: 'all', targetId: '', type: 'announcement', title: '', message: '' });
    return (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-2"><Megaphone className="text-indigo-600"/> Broadcaster</h3>
            <div className="space-y-4">
                <select className="w-full p-3 bg-slate-50 rounded-xl border" value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value})}>
                    <option value="all">All Students</option>
                    <option value="student">One student</option>
                    <option value="grade">Specific Grade</option>
                    <option value="division">Specific Division</option>
                </select>
                {form.targetType === 'student' && <select className="w-full p-3 bg-slate-50 rounded-xl border" onChange={e=>setForm({...form, targetId:e.target.value})}>{students.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
                <input className="w-full p-3 bg-slate-50 rounded-xl border" placeholder="Title" onChange={e=>setForm({...form, title: e.target.value})} />
                <textarea className="w-full p-3 bg-slate-50 rounded-xl border h-32" placeholder="Message..." onChange={e=>setForm({...form, message: e.target.value})} />
                <button onClick={async () => { await db.pushNotification(form as any); onNotify("Pushed!"); }} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">Send Broadcast</button>
            </div>
        </div>
    );
};
