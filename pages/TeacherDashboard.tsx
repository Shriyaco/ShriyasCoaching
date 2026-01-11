
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { TabView, StudentProfile, AttendanceStatus, Exam, Doubt, LeaveApplication } from '../types';
import { 
    LayoutDashboard, ClipboardCheck, BookOpen, PenTool, 
    MessageSquare, LogOut, ChevronRight, CheckCircle, 
    XCircle, Clock, AlertCircle, Search, Filter 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabView>('dashboard');
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = sessionStorage.getItem('sc_user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'teacher') { navigate('/login'); return; }
        setTeacher(user);
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
            <div className="w-12 h-12 border-2 border-premium-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col">
                <div className="mb-12">
                    <img src="https://advedasolutions.in/sc.png" className="h-10 mb-6 brightness-0 invert" alt="Logo" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Faculty Command Center</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Overview" />
                    <SidebarItem active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={ClipboardCheck} label="Attendance" />
                    <SidebarItem active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} icon={BookOpen} label="Homework" />
                    <SidebarItem active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} icon={PenTool} label="Exams" />
                    <SidebarItem active={activeTab === 'doubts'} onClick={() => setActiveTab('doubts')} icon={MessageSquare} label="Doubts" />
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-rose-500/60 hover:text-rose-500 text-[11px] font-black uppercase tracking-widest transition-all">
                    <LogOut size={16} /> De-authorize Session
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl serif-font italic luxury-text-gradient">Welcome, {teacher.username}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">Operational Status: Nominal</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {activeTab === 'dashboard' && <OverviewModule />}
                        {activeTab === 'attendance' && <AttendanceModule teacherId={teacher.id} />}
                        {/* More modules will be plugged in here */}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

const SidebarItem = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-premium-accent text-black font-black shadow-[0_10px_30px_rgba(197,160,89,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
        <Icon size={18} />
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
    </button>
);

const OverviewModule = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Students" value="142" trend="+3 this week" />
        <StatCard label="Pending Doubts" value="08" trend="4 high priority" />
        <StatCard label="Exam Submissions" value="94%" trend="Target 100%" />
    </div>
);

const StatCard = ({ label, value, trend }: any) => (
    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] group hover:border-premium-accent/20 transition-all">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">{label}</p>
        <p className="text-5xl font-light serif-font mb-4">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-premium-accent opacity-60">{trend}</p>
    </div>
);

const AttendanceModule = ({ teacherId }: { teacherId: string }) => {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // In a real flow, you'd select division first
        db.getStudentsByDivision('demo-div-1').then(setStudents);
    }, []);

    const markAll = (status: AttendanceStatus) => {
        const newMap: any = {};
        students.forEach(s => newMap[s.id] = status);
        setAttendance(newMap);
    };

    const commitAttendance = async () => {
        setIsSaving(true);
        try {
            const records = students.map(s => ({
                studentId: s.id,
                date: new Date().toISOString().split('T')[0],
                status: attendance[s.id] || 'Absent',
                markedBy: teacherId
            }));
            await db.markAttendance(records);
            alert("Registry Sync Successful.");
        } catch (e) {
            alert("Sync Failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button onClick={() => markAll('Present')} className="px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Mark All Present</button>
                    <button onClick={() => markAll('Absent')} className="px-6 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Mark All Absent</button>
                </div>
                <button 
                    disabled={isSaving}
                    onClick={commitAttendance}
                    className="bg-white text-black px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-premium-accent transition-all shadow-xl disabled:opacity-20"
                >
                    {isSaving ? 'Syncing Ledger...' : 'Commit Attendance'}
                </button>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-white/20">
                        <tr>
                            <th className="px-10 py-6">Roll No</th>
                            <th className="px-10 py-6">Student Entity</th>
                            <th className="px-10 py-6 text-center">Status Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {students.map(student => (
                            <tr key={student.id} className="group hover:bg-white/[0.01] transition-colors">
                                <td className="px-10 py-6 font-mono text-premium-accent">{student.rollNo}</td>
                                <td className="px-10 py-6 font-bold uppercase tracking-widest text-[11px]">{student.name}</td>
                                <td className="px-10 py-6">
                                    <div className="flex justify-center gap-4">
                                        <AttendanceBtn active={attendance[student.id] === 'Present'} color="emerald" label="P" onClick={() => setAttendance({...attendance, [student.id]: 'Present'})} />
                                        <AttendanceBtn active={attendance[student.id] === 'Absent'} color="rose" label="A" onClick={() => setAttendance({...attendance, [student.id]: 'Absent'})} />
                                        <AttendanceBtn active={attendance[student.id] === 'Leave'} color="amber" label="L" onClick={() => setAttendance({...attendance, [student.id]: 'Leave'})} />
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

const AttendanceBtn = ({ active, color, label, onClick }: any) => {
    const colors: any = {
        emerald: active ? 'bg-emerald-500 text-white' : 'border-emerald-500/20 text-emerald-500/40 hover:bg-emerald-500/10',
        rose: active ? 'bg-rose-500 text-white' : 'border-rose-500/20 text-rose-500/40 hover:bg-rose-500/10',
        amber: active ? 'bg-amber-500 text-white' : 'border-amber-500/20 text-amber-500/40 hover:bg-amber-500/10'
    };
    return (
        <button 
            onClick={onClick}
            className={`w-10 h-10 rounded-xl border font-black text-xs transition-all ${colors[color]}`}
        >
            {label}
        </button>
    );
};

export default TeacherDashboard;
