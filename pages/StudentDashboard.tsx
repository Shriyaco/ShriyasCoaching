
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { TabView } from '../types';
import { 
    LayoutDashboard, Book, PenBox, HelpCircle, 
    FileText, LogOut, ChevronRight, Star, 
    Calendar, CheckCircle, Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabView>('dashboard');
    const [student, setStudent] = useState<any>(null);
    const [stats, setStats] = useState<any>({ total: 0, present: 0, percentage: 0 });

    useEffect(() => {
        const userStr = sessionStorage.getItem('sc_user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'student') { navigate('/login'); return; }
        setStudent(user);
        db.getStudentAttendanceSummary(user.id).then(setStats);
    }, [navigate]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    if (!student) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col">
                <div className="mb-12">
                    <img src="https://advedasolutions.in/sc.png" className="h-10 mb-6 brightness-0 invert" alt="Logo" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Student Portal</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} icon={Book} label="Homework" />
                    <SidebarItem active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} icon={PenBox} label="Exams" />
                    <SidebarItem active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={FileText} label="Study Notes" />
                    <SidebarItem active={activeTab === 'doubts'} onClick={() => setActiveTab('doubts')} icon={HelpCircle} label="Doubts" />
                </nav>

                <div className="mt-auto p-6 bg-white/5 rounded-[24px] border border-white/5 mb-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Attendance Score</p>
                    <p className="text-2xl serif-font italic text-premium-accent">{stats.percentage.toFixed(1)}%</p>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500/60 hover:text-rose-500 text-[11px] font-black uppercase tracking-widest transition-all">
                    <LogOut size={16} /> Exit Secure Hub
                </button>
            </aside>

            {/* Main Area */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-premium-accent text-black flex items-center justify-center text-2xl font-black shadow-2xl">
                            {student.username[0]}
                        </div>
                        <div>
                            <h1 className="text-4xl serif-font italic luxury-text-gradient">Hello, {student.username}</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Institutional ID: {student.id.slice(0, 8)}</p>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {activeTab === 'dashboard' && <StudentOverview stats={stats} />}
                        {/* More modules will be added as required */}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

const SidebarItem = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white text-black font-black shadow-2xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
        <Icon size={18} />
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
    </button>
);

const StudentOverview = ({ stats }: any) => (
    <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DashboardCard 
                title="Next Exam" 
                content="Mathematics Final" 
                footer="Begins tomorrow • 10:00 AM" 
                icon={Calendar} 
                highlight 
            />
            <DashboardCard 
                title="Homework Status" 
                content="02 Pending Tasks" 
                footer="Science, English Literature" 
                icon={Book} 
            />
        </div>

        <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 ml-2">Recent Performance Log</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] flex justify-between items-center group hover:border-premium-accent/20 transition-all">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Unit Test {i}</p>
                            <p className="text-xl serif-font italic">A+ Grade</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

const DashboardCard = ({ title, content, footer, icon: Icon, highlight }: any) => (
    <div className={`p-10 rounded-[48px] border transition-all ${highlight ? 'bg-premium-accent text-black border-premium-accent shadow-[0_20px_60px_rgba(197,160,89,0.3)]' : 'bg-[#0A0A0A] text-white border-white/5 hover:border-white/10'}`}>
        <div className="flex justify-between items-start mb-10">
            <div className={`p-4 rounded-2xl ${highlight ? 'bg-black text-premium-accent' : 'bg-white/5 text-premium-accent'}`}>
                <Icon size={24} />
            </div>
            <ChevronRight className={highlight ? 'text-black/40' : 'text-white/20'} />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-3 ${highlight ? 'text-black/60' : 'text-white/30'}`}>{title}</p>
        <p className="text-4xl serif-font italic mb-6">{content}</p>
        <div className="flex items-center gap-2">
            <Clock size={12} className="opacity-40" />
            <p className={`text-[9px] font-black uppercase tracking-widest ${highlight ? 'text-black/40' : 'text-white/20'}`}>{footer}</p>
        </div>
    </div>
);

export default StudentDashboard;
