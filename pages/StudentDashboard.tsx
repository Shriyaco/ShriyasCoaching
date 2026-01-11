
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { TabView, Homework, HomeworkSubmission, Exam, Doubt, LeaveRequest } from '../types';
import { 
    LayoutDashboard, Book, PenBox, HelpCircle, 
    FileText, LogOut, ChevronRight, Star, 
    Calendar, CheckCircle, Clock, Plus, Send, 
    User, AlertCircle, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabView>('dashboard');
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = sessionStorage.getItem('sc_user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'student') { navigate('/login'); return; }
        setStudent(user);
        setLoading(false);
    }, [navigate]);

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Hub' },
        { id: 'homework', icon: Book, label: 'Work' },
        { id: 'exams', icon: PenBox, label: 'Tests' },
        { id: 'doubts', icon: HelpCircle, label: 'Help' },
        { id: 'leave', icon: Calendar, label: 'Leave' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen shadow-sm">
                <div className="p-8 border-b border-slate-100 mb-6">
                    <img src="https://advedasolutions.in/sc.png" className="h-10 mb-2" alt="Logo" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Academic Protocol</p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <tab.icon size={18} />
                            <span className="text-sm font-semibold">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-100">
                    <button onClick={() => { sessionStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-6 py-3 text-rose-600 font-bold text-sm">
                        <LogOut size={18} /> Exit Portal
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-4 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <tab.icon size={22} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div className="p-6 md:p-12 max-w-6xl mx-auto">
                    <header className="mb-10 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Academic Hub</h1>
                            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Shriya's Gurukul • Session 2024</p>
                        </div>
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-600 font-black">{student.username[0]}</div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'dashboard' && <StudentOverview student={student} />}
                            {activeTab === 'homework' && <HomeworkModule student={student} />}
                            {activeTab === 'exams' && <ExamModule student={student} />}
                            {activeTab === 'doubts' && <DoubtModule student={student} />}
                            {activeTab === 'leave' && <LeaveModule student={student} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

const StudentOverview = ({ student }: any) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard label="Attendance" value="94%" icon={CheckCircle} color="text-emerald-500" />
            <SummaryCard label="HW Pending" value="02" icon={Book} color="text-amber-500" />
            <SummaryCard label="Exam Score" value="A+" icon={TrendingUp} color="text-indigo-500" />
            <SummaryCard label="Resolved Queries" value="05" icon={HelpCircle} color="text-cyan-500" />
        </div>
        
        <div className="bg-white border border-slate-200 p-10 rounded-[40px] relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><PenBox size={140} /></div>
            <h3 className="text-xl font-bold mb-2">Next Scheduled Evaluation</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Physics Mid-Term • 25th Oct</p>
            <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-600 transition-all">Download Syllabus</button>
        </div>
    </div>
);

const SummaryCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white border border-slate-200 p-8 rounded-[40px] hover:shadow-lg transition-all">
        <Icon className={`${color} mb-6`} size={24} />
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
    </div>
);

const HomeworkModule = ({ student }: any) => {
    const [hw, setHw] = useState<Homework[]>([]);
    const [activeSub, setActiveSub] = useState<Homework | null>(null);
    const [content, setContent] = useState('');

    useEffect(() => { db.getHomework('grade-1').then(setHw); }, []);

    const handleSubmit = async () => {
        if (!activeSub || !content) return;
        await db.submitHomework({ 
            homeworkId: activeSub.id, studentId: student.id, 
            studentName: student.username, content 
        });
        alert("Task Committed Successfully.");
        setActiveSub(null); setContent('');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight">Active Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hw.map(h => (
                    <div key={h.id} className="bg-white border border-slate-200 p-10 rounded-[40px] flex flex-col justify-between hover:border-indigo-500 transition-all group">
                        <div>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">{h.subject}</span>
                            <h4 className="text-xl font-bold mb-4">{h.topic}</h4>
                            <p className="text-sm text-slate-500 mb-8 line-clamp-2">{h.description}</p>
                        </div>
                        <button onClick={() => setActiveSub(h)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                           <Send size={14}/> Submit Response
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {activeSub && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[50px] p-10">
                            <h3 className="text-2xl font-bold mb-2">Submit: {activeSub.topic}</h3>
                            <p className="text-slate-400 text-xs mb-8 uppercase tracking-[0.2em] font-bold">{activeSub.subject} • Faculty Directive</p>
                            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Enter your response or findings here..." className="w-full h-48 bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm outline-none focus:ring-2 ring-indigo-50 mb-6 resize-none" />
                            <div className="flex gap-4">
                                <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">Upload Final</button>
                                <button onClick={() => setActiveSub(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ExamModule = ({ student }: any) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold uppercase tracking-tight">Evaluations Registry</h3>
        <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[50px] text-center">
            <PenBox size={64} className="mx-auto mb-6 text-slate-200" />
            <p className="text-sm font-black uppercase text-slate-300 tracking-[0.3em]">No Live Evaluations</p>
            <p className="text-xs text-slate-400 mt-2">Papers will appear here automatically when faculty launches a test.</p>
        </div>
    </div>
);

const DoubtModule = ({ student }: any) => {
    const [form, setForm] = useState({ subject: '', question: '' });
    const handleAdd = async (e: any) => {
        e.preventDefault();
        await db.raiseDoubt({ studentId: student.id, studentName: student.username, ...form });
        alert("Query Dispatched to Faculty.");
        setForm({ subject: '', question: '' });
    };
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight">Ask Faculty</h3>
            <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-10 rounded-[40px] space-y-4 max-w-xl">
                <input required placeholder="Subject (e.g. Maths Trigonometry)" className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none ring-1 ring-slate-100 outline-none focus:ring-indigo-600" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                <textarea required placeholder="What is your doubt exactly? Explain in detail..." className="w-full h-32 bg-slate-50 p-4 rounded-2xl text-sm border-none ring-1 ring-slate-100 outline-none focus:ring-indigo-600 resize-none" value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Dispatch Query</button>
            </form>
        </div>
    );
};

const LeaveModule = ({ student }: any) => {
    const [form, setForm] = useState({ reason: '', startDate: '', endDate: '' });
    const handleApply = async (e: any) => {
        e.preventDefault();
        await db.applyLeave({ studentId: student.id, studentName: student.username, ...form });
        alert("Leave Request Submitted.");
        setForm({ reason: '', startDate: '', endDate: '' });
    };
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight">Apply Absence</h3>
            <form onSubmit={handleApply} className="bg-white border border-slate-200 p-10 rounded-[40px] space-y-4 max-w-xl">
                <textarea required placeholder="Valid reason for absence..." className="w-full h-32 bg-slate-50 p-4 rounded-2xl text-sm border-none ring-1 ring-slate-100 outline-none focus:ring-indigo-600 resize-none" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <input required type="date" className="bg-slate-50 p-4 rounded-2xl text-sm border-none ring-1 ring-slate-100" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    <input required type="date" className="bg-slate-50 p-4 rounded-2xl text-sm border-none ring-1 ring-slate-100" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Submit Application</button>
            </form>
        </div>
    );
};

export default StudentDashboard;
