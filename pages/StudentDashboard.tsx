
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, StudentQuery, AttendanceRecord, StudentOwnExam, LeaveApplication, StudyNote, ExamSubmission, User } from '../types';
import { 
    LogOut, Calendar, BookOpen, PenTool, Award, X, MessageSquare, 
    Clock, Settings, Lock, Power, LayoutDashboard, FileText, 
    Check, ShoppingBag, CreditCard, Send, Upload, Camera, 
    Database, ChevronLeft, ChevronRight, Flame, Sparkles, 
    Target, AlertTriangle, ArrowRight, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- 3D AMBIENT BACKGROUND ---
const SpatialBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020204]">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20" />
    </div>
);

// --- ANIMATION VARIANTS ---
const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'homework' | 'notes' | 'exams' | 'results' | 'upcoming-exams' | 'leave' | 'doubts' | 'settings'>('dashboard');
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const loadData = useCallback(async (userId: string) => {
        try {
            const me = await db.getStudentById(userId);
            if (me) setStudent(me);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (!storedUser) { navigate('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'student') { navigate('/'); return; }
        setUser(parsedUser);
        loadData(parsedUser.id);

        // Standardized Real-time synchronization
        const channels = [
            db.subscribe('homework', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('exams', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('study_notes', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('queries', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('attendance', () => setRefreshTrigger(t => t + 1))
        ];

        return () => { channels.forEach(c => db.unsubscribe(c)); };
    }, [navigate, loadData]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'notes', label: 'Notes', icon: Database },
        { id: 'exams', label: 'Exam', icon: PenTool },
        { id: 'results', label: 'Result', icon: Award },
        { id: 'upcoming-exams', label: 'School Exam', icon: Calendar },
        { id: 'leave', label: 'Leave', icon: FileText },
        { id: 'doubts', label: 'Doubts', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#020204] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">Initializing Terminal...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020204] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <SpatialBackground />
            
            <header className="relative z-50 px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-6 md:h-8 w-auto invert opacity-80 cursor-pointer" onClick={() => navigate('/')} />
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 truncate max-w-[100px]">{student?.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex gap-1 flex-1 sm:flex-none p-1 bg-white/5 rounded-xl border border-white/5">
                        <div className="px-3 py-1.5 border-r border-white/10">
                            <p className="text-[7px] font-black uppercase text-white/20 leading-none mb-1">Rank</p>
                            <p className="text-[9px] font-black uppercase text-white/60 leading-none">Grade {student?.gradeId}</p>
                        </div>
                        <div className="px-3 py-1.5">
                            <p className="text-[7px] font-black uppercase text-white/20 leading-none mb-1">Sector</p>
                            <p className="text-[9px] font-black uppercase text-white/60 leading-none">ID: {student?.studentCustomId}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20 active:scale-95 transition-all"><Power size={12}/></button>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-12 py-6 relative z-10 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={`${activeTab}-${refreshTrigger}`} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-40">
                            {activeTab === 'dashboard' && <DashboardModule student={student!} />}
                            {activeTab === 'homework' && <HomeworkModule student={student!} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'notes' && <NotesModule student={student!} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'exams' && <ExamsModule student={student!} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'results' && <ResultsModule student={student!} />}
                            {activeTab === 'upcoming-exams' && <UpcomingExamsModule student={student!} />}
                            {activeTab === 'leave' && <LeaveModule student={student!} />}
                            {activeTab === 'doubts' && <DoubtsModule student={student!} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'settings' && <SettingsModule student={student!} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
                <nav className="bg-[#0A0A0E]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[24px] flex items-center gap-1 shadow-2xl overflow-x-auto scrollbar-hide max-w-[95vw]">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group relative flex flex-col items-center justify-center min-w-[44px] md:min-w-[60px] h-[44px] md:h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:bg-white/5'}`}
                        >
                            <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className={`text-[6px] font-black uppercase tracking-widest mt-1 hidden md:block ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

const DashboardModule = ({ student }: { student: Student }) => {
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        db.getAttendance(student.id).then(setAttendance);
    }, [student.id]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Dashboard.</h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Personnel Operation Registry</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/shop')} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group">
                        <ShoppingBag size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Shop</span>
                    </button>
                    <button onClick={() => navigate('/pay-fees')} className="bg-indigo-600 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 group">
                        <CreditCard size={16} className="text-white group-hover:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Pay Fees</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar size={120} /></div>
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div><h3 className="text-xl font-bold italic serif-font">Attendance Log</h3><p className="text-[8px] font-black uppercase tracking-widest text-white/30">{monthNames[month]} {year}</p></div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronLeft size={14}/></button>
                            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronRight size={14}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-3 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="text-center text-[8px] font-black text-white/20 uppercase">{d}</div>))}
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const record = attendance.find(a => a.date === dateStr);
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;
                            return (
                                <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                                    record?.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    record?.status === 'Absent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    record?.status === 'Leave' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    isToday ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/30'
                                }`}>
                                    {day}
                                    {isToday && <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-ping" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-500/20 transition-all shadow-xl">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl border border-indigo-500/5"><Flame size={28} strokeWidth={2.5}/></div>
                        <div><h4 className="text-3xl font-black text-white leading-none">98%</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mt-2">Persistence Level</p></div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 hover:border-emerald-500/20 transition-all shadow-xl">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl border border-emerald-500/5"><Award size={28} strokeWidth={2.5}/></div>
                        <div><h4 className="text-3xl font-black text-white leading-none">Elite</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mt-2">Academic Rank</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeworkModule = ({ student, refreshTrigger }: { student: Student, refreshTrigger: number }) => {
    const [missions, setMissions] = useState<Homework[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [form, setForm] = useState({ text: '', image: '' });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const load = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const data = await db.getHomeworkForStudent(student.gradeId, student.subdivisionId, student.id);
            setMissions(data);
        } finally {
            setIsRefreshing(false);
        }
    }, [student.gradeId, student.subdivisionId, student.id]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const r = new FileReader();
            r.onloadend = () => setForm({ ...form, image: r.result as string });
            r.readAsDataURL(file);
        }
    };

    const submit = async (id: string) => {
        if (!form.text) return alert("Intel Description Required.");
        await db.submitHomework(id, student.id, form.text, form.image);
        setIsSubmitting(null);
        setForm({ text: '', image: '' });
        alert("Mission Data Transmitted.");
    };

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Homework.</h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Tactical Assignments Log</p>
                </div>
                <button 
                    onClick={load} 
                    className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Force Refresh"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map(hw => (
                    <div key={hw.id} onClick={() => setIsSubmitting(hw.id)} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen size={80}/></div>
                        <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mb-4 block">{hw.subject} • {hw.targetType}</span>
                        <h4 className="text-xl font-bold text-white/90 italic leading-tight">"{hw.task}"</h4>
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2"><Clock size={12} className="text-white/20" /><span className="text-[8px] font-black uppercase text-white/20">Due: {hw.dueDate}</span></div>
                            <button className="px-4 py-2 bg-white/5 rounded-xl text-[7px] font-black uppercase tracking-widest text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">Transmit</button>
                        </div>
                    </div>
                ))}
                {missions.length === 0 && <div className="col-span-full py-20 text-center text-white/5 font-black uppercase tracking-[0.5em] text-[10px] border-2 border-dashed border-white/5 rounded-[40px]">No Assignments Logged</div>}
            </div>

            <AnimatePresence>
                {isSubmitting && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }} className="bg-[#0A0A0E] border border-white/10 rounded-[48px] w-full max-w-md p-10 relative shadow-2xl">
                            <button onClick={() => setIsSubmitting(null)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24}/></button>
                            <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">Submission.</h3>
                            <textarea placeholder="Task findings and details..." className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-indigo-500 h-32 resize-none text-white font-medium" value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-2xl p-5 text-center relative hover:bg-white/10 cursor-pointer transition-all">
                                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload size={20} className="mx-auto text-white/20 mb-2" /><p className="text-[8px] font-black uppercase text-white/20">Gallery</p>
                                </div>
                                <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-2xl p-5 text-center relative hover:bg-white/10 cursor-pointer transition-all">
                                    <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Camera size={20} className="mx-auto text-white/20 mb-2" /><p className="text-[8px] font-black uppercase text-white/20">Camera</p>
                                </div>
                            </div>
                            {form.image && <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10"><img src={form.image} className="w-full h-full object-cover" /></div>}
                            <button onClick={() => submit(isSubmitting)} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] mt-8 hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">Transmit Findings</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NotesModule = ({ student, refreshTrigger }: { student: Student, refreshTrigger: number }) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    
    const load = useCallback(() => {
        db.getNotes(student.gradeId, student.subdivisionId, student.id).then(setNotes);
    }, [student.gradeId, student.subdivisionId, student.id]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Notes.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Encrypted Study Archives</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:border-emerald-500/20 transition-all shadow-xl relative overflow-hidden h-72 flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={80}/></div>
                        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest mb-4 block">{n.subject} • {n.targetType}</span>
                        <h4 className="text-2xl font-bold text-white/90 italic mb-4 truncate">{n.title}</h4>
                        <p className="text-sm text-white/30 font-medium line-clamp-3 leading-relaxed flex-1">{n.content}</p>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">{n.createdAt?.split('T')[0]}</span>
                             <button className="px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">Access Data</button>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && <div className="col-span-full py-20 text-center text-white/5 font-black uppercase tracking-[0.5em] text-[10px] border-2 border-dashed border-white/5 rounded-[40px]">No Intel Logs Found</div>}
            </div>
        </div>
    );
};

const ExamsModule = ({ student, refreshTrigger }: { student: Student, refreshTrigger: number }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);

    const load = useCallback(() => {
        db.getExamsForStudent(student.gradeId, student.subdivisionId, student.id).then(setExams);
    }, [student.gradeId, student.subdivisionId, student.id]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const startExam = (e: Exam) => {
        setActiveExam(e);
        setTimeLeft(e.duration * 60);
        setAnswers({});
    };

    useEffect(() => {
        if (activeExam && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (activeExam && timeLeft === 0) {
            submitExam();
        }
    }, [activeExam, timeLeft]);

    const submitExam = async () => {
        if (!activeExam) return;
        alert("Evaluation terminated. Answer sheet uploaded.");
        setActiveExam(null);
    };

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Exam.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Live Institutional Assessments</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {exams.map(e => (
                    <div key={e.id} className="relative p-[1px] rounded-[48px] bg-gradient-to-br from-rose-500/20 to-orange-500/20 group hover:from-rose-500/40 hover:to-orange-500/40 transition-all">
                        <div className="bg-[#0A0A0E] rounded-[47px] p-10 h-full relative overflow-hidden transition-all group-hover:bg-black">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><PenTool size={160}/></div>
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-rose-500/20 shadow-rose-500/10 shadow-lg">Target: {e.targetType}</span>
                                <Flame size={24} className="text-orange-500 animate-pulse shadow-orange-500/20" />
                            </div>
                            <h3 className="text-4xl font-black text-white italic uppercase mb-2 group-hover:text-premium-accent transition-colors">{e.subject}</h3>
                            <p className="text-white/40 text-sm font-bold mb-10 border-l border-white/10 pl-6 uppercase tracking-widest leading-relaxed line-clamp-2">{e.title}</p>
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5"><p className="text-[8px] text-white/20 font-black uppercase mb-1">Time Slice</p><p className="text-xl font-mono font-bold text-white">{e.duration}m</p></div>
                                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5"><p className="text-[8px] text-white/20 font-black uppercase mb-1">Max Weight</p><p className="text-xl font-mono font-bold text-white">{e.totalMarks}pt</p></div>
                            </div>
                            <button onClick={() => startExam(e)} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95">Synchronize Entry</button>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-20 text-center text-white/5 font-black uppercase tracking-[0.5em] text-[10px] border-2 border-dashed border-white/5 rounded-[48px]">No Cycles Scheduled</div>}
            </div>

            <AnimatePresence>
                {activeExam && (
                    <div className="fixed inset-0 z-[300] bg-black p-4 md:p-12 flex flex-col overflow-hidden backdrop-blur-xl">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-[#0A0A0E] border border-white/10 rounded-[60px] relative overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20">
                                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/10"><Target size={24}/></div><div><h4 className="text-xl font-bold italic serif-font">{activeExam.title}</h4><p className="text-[8px] font-black uppercase text-white/20">SECURED ASSESSMENT TERMINAL</p></div></div>
                                <div className="text-right"><p className="text-[8px] font-black uppercase text-white/30 mb-1">Session Remaining</p><p className="text-3xl font-mono font-black text-rose-500 animate-pulse">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p></div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 space-y-16 scrollbar-hide">
                                {activeExam.questions.map((q, idx) => (
                                    <div key={q.id} className="space-y-8">
                                        <div className="flex items-start gap-6"><span className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-sm font-black italic text-indigo-400 shrink-0 border border-white/10 shadow-inner">#0{idx+1}</span><h5 className="text-2xl font-medium text-white/90 leading-snug">{q.text}</h5></div>
                                        {q.type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                                                {q.options.map((opt, oIdx) => (
                                                    <button key={oIdx} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`p-6 rounded-2xl border text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 ${answers[q.id] === opt ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 translate-x-2' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'}`}><span className={`mr-4 font-black transition-colors ${answers[q.id] === opt ? 'text-white' : 'text-white/10'}`}>{String.fromCharCode(65+oIdx)}</span> {opt}</button>
                                                ))}
                                            </div>
                                        )}
                                        {(q.type === 'short' || q.type === 'paragraph') && (<textarea placeholder="Input formulated intelligence response..." className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 ml-16 text-sm outline-none focus:border-indigo-500 h-40 resize-none text-white font-medium shadow-inner transition-all" value={answers[q.id] || ''} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />)}
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-center shrink-0"><button onClick={submitExam} className="bg-white text-black px-16 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95">Complete Assessment Cycle</button></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ResultsModule = ({ student }: { student: Student }) => {
    const [results, setResults] = useState<ExamSubmission[]>([]);
    useEffect(() => {
        db.getAllExamSubmissions().then(subs => {
            setResults(subs.filter(s => s.studentId === student.id && s.status === 'Graded'));
        });
    }, [student.id]);

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Result.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Post-Assessment intelligence</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(r => (
                    <div key={r.id} className="bg-white/[0.02] p-10 rounded-[48px] border border-white/5 shadow-2xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Award size={100}/></div>
                        <h4 className="text-xl font-bold text-white/80 italic mb-10 border-l-2 border-indigo-500 pl-6 uppercase tracking-widest">MODULE: {r.examId.slice(0, 8)}</h4>
                        <div className="flex items-end justify-between">
                            <div><p className="text-[8px] font-black uppercase text-white/20 mb-2 tracking-widest">Performance Score</p><p className="text-6xl font-light luxury-text-gradient serif-font italic">{r.totalObtained}pt</p></div>
                            <div className="flex flex-col items-center gap-2">
                                <Check size={24} className="text-emerald-500 shadow-emerald-500/20" />
                                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Validated</span>
                            </div>
                        </div>
                    </div>
                ))}
                {results.length === 0 && <div className="col-span-full py-40 text-center opacity-10 font-black uppercase text-[10px] tracking-[0.8em]">Archive Void</div>}
            </div>
        </div>
    );
};

const UpcomingExamsModule = ({ student }: { student: Student }) => {
    const [list, setList] = useState<StudentOwnExam[]>([]);
    const [form, setForm] = useState({ subject: '', examDate: '', description: '' });

    const load = useCallback(() => db.getStudentExams(student.id).then(setList), [student.id]);
    useEffect(() => { load(); }, [load]);

    const submit = async (e: any) => {
        e.preventDefault();
        await db.addStudentExam({ studentId: student.id, studentName: student.name, gradeId: student.gradeId, subdivisionId: student.subdivisionId, ...form });
        setForm({ subject: '', examDate: '', description: '' });
        load();
        alert("Upcoming external module indexed.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 shadow-2xl h-fit">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">School Module Log.</h3>
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Core Domain</label><input required placeholder="Enter Subject..." value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all text-white" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Chronological Coordinate</label><input required type="date" value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all text-white [color-scheme:dark]" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Syllabus Parameters</label><textarea placeholder="Specify coverage..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium h-32 resize-none outline-none focus:border-indigo-500 transition-all text-white" /></div>
                    <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-[0.98]">Index External Entry</button>
                </form>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">External Registry</h4>
                {list.map(ex => (
                    <div key={ex.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group shadow-lg">
                        <div><h4 className="text-2xl font-black text-white italic uppercase mb-1 group-hover:text-premium-accent transition-colors">{ex.subject}</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-widest line-clamp-1">{ex.description}</p></div>
                        <div className="text-right shrink-0">
                            <p className="text-[7px] font-black uppercase text-indigo-400 mb-1 tracking-widest">Date</p>
                            <p className="text-xl font-mono font-bold text-white shadow-indigo-500/10">{ex.examDate}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeaveModule = ({ student }: { student: Student }) => {
    const [list, setList] = useState<LeaveApplication[]>([]);
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });

    const load = useCallback(() => db.getLeaveApplications(student.id).then(setList), [student.id]);
    useEffect(() => { load(); }, [load]);

    const submit = async (e: any) => {
        e.preventDefault();
        await db.addLeaveApplication({ studentId: student.id, studentName: student.name, gradeId: student.gradeId, subdivisionId: student.subdivisionId, ...form });
        setForm({ startDate: '', endDate: '', reason: '' });
        load();
        alert("Absence protocol transmitted.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 shadow-2xl h-fit">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">Apply Leave.</h3>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Initiation</label><input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold [color-scheme:dark] outline-none focus:border-indigo-500" /></div>
                        <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Conclusion</label><input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold [color-scheme:dark] outline-none focus:border-indigo-500" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Justification</label><textarea required placeholder="Absence rationale..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium h-32 resize-none outline-none focus:border-indigo-500" /></div>
                    <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-rose-600 hover:text-white transition-all active:scale-[0.98]">Transmit Packet</button>
                </form>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Request History</h4>
                {list.map(l => (
                    <div key={l.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:bg-white/[0.04] transition-all shadow-md">
                         <div className="flex items-center gap-3 mb-3"><span className={`w-2 h-2 rounded-full shadow-lg ${l.status === 'Approved' ? 'bg-emerald-500 shadow-emerald-500/20' : l.status === 'Rejected' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-amber-500 shadow-amber-500/20'}`} /><span className="text-[9px] font-black uppercase tracking-widest text-white/50">{l.status} Protocol</span></div>
                         <h4 className="text-xl font-bold text-white mb-2 italic truncate">"{l.reason}"</h4>
                         <p className="text-[8px] font-black uppercase text-white/20 tracking-widest font-mono">{l.startDate} » {l.endDate}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DoubtsModule = ({ student, refreshTrigger }: { student: Student, refreshTrigger: number }) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [form, setForm] = useState({ subject: '', text: '' });

    const load = useCallback(() => {
        db.getQueries(student.id).then(setQueries);
    }, [student.id]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const submit = async (e: any) => {
        e.preventDefault();
        await db.addQuery({ studentId: student.id, studentName: student.name, subject: form.subject, queryText: form.text });
        setForm({ subject: '', text: '' });
        load();
        alert("Inquiry Dispatched.");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Doubts.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Faculty Communication Channel</p>
            </div>
            
            <div className="flex flex-col gap-6 max-h-[50vh] overflow-y-auto scrollbar-hide p-4 mb-10">
                {queries.map(q => (
                    <div key={q.id} className="flex flex-col gap-4">
                        <div className="self-end bg-indigo-600/10 border border-indigo-500/10 p-6 rounded-[32px] rounded-tr-lg max-w-[85%] shadow-xl">
                            <p className="text-[8px] font-black uppercase text-indigo-400 mb-2 tracking-widest">{q.subject} Domain</p>
                            <p className="text-sm font-medium leading-relaxed italic text-white/90">"{q.queryText}"</p>
                        </div>
                        {q.status === 'Answered' && (
                            <div className="self-start bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] rounded-tl-lg max-w-[85%] animate-fade-in shadow-xl">
                                <div className="flex items-center gap-2 mb-3"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-emerald-500/40 shadow-lg" /><span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Faculty Transmission Received</span></div>
                                <p className="text-sm text-white/70 leading-relaxed font-bold tracking-tight italic">"{q.replyText}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="bg-white/[0.02] p-2 rounded-[32px] border border-white/10 flex flex-col sm:flex-row gap-2 shadow-2xl relative z-20 backdrop-blur-md">
                <input required placeholder="Subject..." value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full sm:w-1/4 bg-transparent px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none border-b sm:border-b-0 sm:border-r border-white/5" />
                <input required placeholder="Formulate transmission..." value={form.text} onChange={e => setForm({...form, text: e.target.value})} className="flex-1 bg-transparent px-6 py-4 text-sm text-white outline-none font-medium italic placeholder:text-white/10" />
                <button type="submit" className="bg-white text-black p-4 rounded-[24px] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center"><Send size={20}/></button>
            </form>
        </div>
    );
};

const SettingsModule = ({ student }: { student: Student }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Encryption Mismatch: Keys do not align.');
        setLoading(true);
        try { 
            await db.changePassword(student.id, 'student', form.current, form.new); 
            alert('Security keys re-indexed.'); 
            setForm({current:'',new:'',confirm:''}); 
        } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-md mx-auto py-20 space-y-12 text-center">
            <div className="bg-[#0A0A0E] p-12 rounded-[60px] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-10 text-indigo-400 border border-white/10 shadow-inner">
                    <Lock size={32} className="group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-3xl font-light serif-font mb-10 luxury-text-gradient italic">Terminal Settings.</h3>
                <form onSubmit={update} className="space-y-4">
                    <input required type="password" placeholder="CURRENT KEY" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase transition-all" />
                    <input required type="password" placeholder="NEW KEY" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase transition-all" />
                    <input required type="password" placeholder="VERIFY KEY" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase transition-all" />
                    <button disabled={loading} className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] rounded-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all mt-8 active:scale-95 disabled:opacity-50">Authorize Key Rotation</button>
                </form>
            </div>
        </div>
    );
};

export default StudentDashboard;
