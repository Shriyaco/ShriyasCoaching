
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings, GatewayConfig, Enquiry, Product, Order, StudentNotification } from '../types';
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, ShieldAlert, Key, Power, X, Trash2, GraduationCap, TrendingUp, DollarSign, RefreshCw, Menu, Check, Upload, Calendar, MessageCircle, Phone, Clock, ShoppingBag, Send, MapPin, Truck, Megaphone, Bell, Info, AlertTriangle, User } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [notification, setNotification] = useState('');

  const refreshData = useCallback(async () => {
    try {
        const [s, g, sd, t, f, set, enq, p, o] = await Promise.all([
            db.getStudents(),
            db.getGrades(),
            db.getSubdivisions(),
            db.getTeachers(),
            db.getFeeSubmissions(),
            db.getSettings(),
            db.getEnquiries(),
            db.getProducts(),
            db.getOrders()
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

          {/* shop tab */}
          {activeTab === 'shop' && (
              <div className="space-y-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="text-lg font-bold text-slate-800">Order Verification Center</h3>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                  <tr>
                                      <th className="p-4">Customer/Contact</th>
                                      <th className="p-4">Order Summary</th>
                                      <th className="p-4">UTR Ref</th>
                                      <th className="p-4">Status</th>
                                      <th className="p-4 text-center">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm">
                                  {orders.map(order => (
                                      <tr key={order.id} className="hover:bg-slate-50">
                                          <td className="p-4">
                                              <p className="font-bold text-slate-800">{order.studentName}</p>
                                              <p className="text-xs text-slate-500">{order.mobile}</p>
                                              <button onClick={() => setSelectedOrderDetails(order)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View Address</button>
                                          </td>
                                          <td className="p-4">
                                              <p className="font-medium">{order.productName}</p>
                                              <p className="text-xs text-slate-500">₹{order.finalPrice}</p>
                                          </td>
                                          <td className="p-4 font-mono font-bold text-indigo-600">{order.transactionRef || '---'}</td>
                                          <td className="p-4">
                                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                  order.status === 'Processing Order' ? 'bg-blue-100 text-blue-600' :
                                                  order.status === 'Payment Under Verification' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                                              }`}>
                                                  {order.status}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <div className="flex justify-center gap-2">
                                                  {order.status === 'Payment Under Verification' && (
                                                      <button onClick={async () => { await db.updateOrder(order.id, { status: 'Processing Order' }); refreshData(); }} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1"><Check size={14}/> Accept Order</button>
                                                  )}
                                                  {order.status === 'Processing Order' && (
                                                      <button onClick={async () => { await db.updateOrder(order.id, { status: 'Completed' }); refreshData(); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1"><Truck size={14}/> Ship/Finish</button>
                                                  )}
                                                  <button onClick={async () => { await db.updateOrder(order.id, { status: 'Rejected' }); refreshData(); }} className="text-red-400 p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* Placeholder for other tabs if not explicitly provided */}
          {!['dashboard', 'shop', 'broadcast'].includes(activeTab) && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                  <Megaphone className="mx-auto mb-4 opacity-10" size={64} />
                  <p>Existing Student/Teacher management active. Navigate via sidebar.</p>
              </div>
          )}

          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
          {selectedOrderDetails && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                      <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-4 right-4 text-slate-400"><X/></button>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-600"><MapPin/> Delivery Details</h3>
                      <div className="space-y-4 text-sm">
                          <div className="bg-slate-50 p-4 rounded-xl">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Shipping Address</p>
                              <p className="text-slate-800 font-medium leading-relaxed">{selectedOrderDetails.address}</p>
                              <p className="text-slate-800 font-bold mt-1">{selectedOrderDetails.pincode}, {selectedOrderDetails.state}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Customization</p>
                              <p className="text-slate-800 font-bold italic">"{selectedOrderDetails.customName}"</p>
                          </div>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

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
