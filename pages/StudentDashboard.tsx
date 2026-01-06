
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, StudentQuery, AttendanceRecord, StudentOwnExam, LeaveApplication, StudyNote, ExamSubmission, User } from '../types';
import { 
    LogOut, Calendar, BookOpen, PenTool, Award, X, MessageSquare, 
    Clock, Settings, Lock, Power, LayoutDashboard, FileText, 
    Check, ShoppingBag, CreditCard, Send, Upload, Camera, 
    Database, ChevronLeft, ChevronRight, Flame, Sparkles, 
    Target, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- 3D AMBIENT BACKGROUND (Matching Teacher Panel) ---
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
    }, [navigate, loadData]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'dashboard', label: 'Base', icon: LayoutDashboard },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'notes', label: 'Vault', icon: Database },
        { id: 'exams', label: 'Battle', icon: PenTool },
        { id: 'results', label: 'Intel', icon: Award },
        { id: 'upcoming-exams', label: 'Log', icon: Calendar },
        { id: 'leave', label: 'Permit', icon: FileText },
        { id: 'doubts', label: 'Comm', icon: MessageSquare },
        { id: 'settings', label: 'Core', icon: Settings }
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
            
            {/* --- TOP BAR --- */}
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

            {/* --- MAIN STAGE --- */}
            <main className="flex-1 px-4 md:px-12 py-6 relative z-10 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-40">
                            {activeTab === 'dashboard' && <DashboardModule student={student!} />}
                            {activeTab === 'homework' && <HomeworkModule student={student!} />}
                            {activeTab === 'notes' && <NotesModule student={student!} />}
                            {activeTab === 'exams' && <ExamsModule student={student!} />}
                            {activeTab === 'results' && <ResultsModule student={student!} />}
                            {activeTab === 'upcoming-exams' && <UpcomingExamsModule student={student!} />}
                            {activeTab === 'leave' && <LeaveModule student={student!} />}
                            {activeTab === 'doubts' && <DoubtsModule student={student!} />}
                            {activeTab === 'settings' && <SettingsModule student={student!} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- BOTTOM DOCK --- */}
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

// --- MODULE: DASHBOARD ---
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
                    <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Command Hub.</h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Operational Overview & Registry</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/shop')} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group">
                        <ShoppingBag size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Boutique</span>
                    </button>
                    <button onClick={() => navigate('/pay-fees')} className="bg-indigo-600 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 group">
                        <CreditCard size={16} className="text-white group-hover:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Treasury</span>
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
                                    isToday ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/30'
                                }`}>
                                    {day}
                                    {isToday && <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-ping" />}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-6 justify-center pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div><span className="text-[7px] text-white/30 uppercase font-black">Present</span></div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div><span className="text-[7px] text-white/30 uppercase font-black">Absent</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-500/20 transition-all">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl"><Flame size={28} strokeWidth={2.5}/></div>
                        <div><h4 className="text-3xl font-black text-white leading-none">98%</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mt-2">Persistence Level</p></div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 hover:border-emerald-500/20 transition-all">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl"><Award size={28} strokeWidth={2.5}/></div>
                        <div><h4 className="text-3xl font-black text-white leading-none">Elite</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em] mt-2">Academic Rank</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODULE: HOMEWORK ---
const HomeworkModule = ({ student }: { student: Student }) => {
    const [missions, setMissions] = useState<Homework[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [form, setForm] = useState({ text: '', image: '' });

    const load = useCallback(() => {
        db.getHomeworkForStudent(student.gradeId, student.subdivisionId).then(setMissions);
    }, [student.gradeId, student.subdivisionId]);

    useEffect(() => { load(); }, [load]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const r = new FileReader();
            r.onloadend = () => setForm({ ...form, image: r.result as string });
            r.readAsDataURL(file);
        }
    };

    const submit = async (id: string) => {
        if (!form.text) return alert("Description required.");
        await db.submitHomework(id, student.id, form.text, form.image);
        setIsSubmitting(null);
        setForm({ text: '', image: '' });
        alert("Mission Data Transmitted.");
    };

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Directives.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Tactical Assignments</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map(hw => (
                    <div key={hw.id} onClick={() => setIsSubmitting(hw.id)} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10"><BookOpen size={80}/></div>
                        <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mb-4 block">{hw.subject}</span>
                        <h4 className="text-xl font-bold text-white/90 italic leading-tight">"{hw.task}"</h4>
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2"><Clock size={12} className="text-white/20" /><span className="text-[8px] font-black uppercase text-white/20">Due: {hw.dueDate}</span></div>
                            <button className="px-4 py-2 bg-white/5 rounded-xl text-[7px] font-black uppercase tracking-widest text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white">Transmit</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isSubmitting && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0E] border border-white/10 rounded-[48px] w-full max-w-md p-10 relative shadow-2xl">
                            <button onClick={() => setIsSubmitting(null)} className="absolute top-8 right-8 text-white/20"><X size={24}/></button>
                            <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">Report Submit.</h3>
                            <textarea placeholder="Mission details..." className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-indigo-500 h-32 resize-none" value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-2xl p-5 text-center relative hover:bg-white/10 cursor-pointer">
                                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload size={20} className="mx-auto text-white/20 mb-2" /><p className="text-[8px] font-black uppercase text-white/20">Gallery</p>
                                </div>
                                <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-2xl p-5 text-center relative hover:bg-white/10 cursor-pointer">
                                    <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Camera size={20} className="mx-auto text-white/20 mb-2" /><p className="text-[8px] font-black uppercase text-white/20">Camera</p>
                                </div>
                            </div>
                            {form.image && <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10"><img src={form.image} className="w-full h-full object-cover" /></div>}
                            <button onClick={() => submit(isSubmitting)} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] mt-8 hover:bg-indigo-500 hover:text-white transition-all">Authorize Transmission</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MODULE: NOTES ---
const NotesModule = ({ student }: { student: Student }) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    useEffect(() => {
        db.getNotes(student.gradeId, student.subdivisionId).then(setNotes);
    }, [student.gradeId, student.subdivisionId]);

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Vault.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Study Archives</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:border-emerald-500/20 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10"><Database size={80}/></div>
                        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest mb-4 block">{n.subject}</span>
                        <h4 className="text-2xl font-bold text-white/90 italic mb-4">{n.title}</h4>
                        <p className="text-sm text-white/30 font-medium line-clamp-3 leading-relaxed">{n.content}</p>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">{n.createdAt?.split('T')[0]}</span>
                             <button className="px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all">Download Archive</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE: EXAMS ---
const ExamsModule = ({ student }: { student: Student }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => { db.getExams(student.gradeId).then(setExams); }, [student.gradeId]);

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
        // Logic to write results to DB
        await db.updateSettings(await db.getSettings()); // Mock sync
        alert("Battle protocol terminated. Result logged.");
        setActiveExam(null);
    };

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Arena.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Live Combat Assessments</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {exams.map(e => (
                    <div key={e.id} className="relative p-[1px] rounded-[48px] bg-gradient-to-br from-rose-500/20 to-orange-500/20 group">
                        <div className="bg-[#0A0A0E] rounded-[47px] p-10 h-full relative overflow-hidden transition-all group-hover:bg-black">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08]"><PenTool size={160}/></div>
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-rose-500/20">Live Raid</span>
                                <Flame size={24} className="text-orange-500 animate-pulse" />
                            </div>
                            <h3 className="text-4xl font-black text-white italic uppercase mb-2">{e.subject}</h3>
                            <p className="text-white/40 text-sm font-bold mb-10 border-l border-white/10 pl-6 uppercase tracking-widest">{e.title}</p>
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-white/5 rounded-2xl p-5 text-center"><p className="text-[8px] text-white/20 font-black uppercase mb-1">Timeline</p><p className="text-xl font-mono font-bold text-white">{e.duration}m</p></div>
                                <div className="bg-white/5 rounded-2xl p-5 text-center"><p className="text-[8px] text-white/20 font-black uppercase mb-1">Max Damage</p><p className="text-xl font-mono font-bold text-white">{e.totalMarks}pt</p></div>
                            </div>
                            <button onClick={() => startExam(e)} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-rose-600 hover:text-white">Begin Raid</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {activeExam && (
                    <div className="fixed inset-0 z-[300] bg-black p-4 md:p-12 flex flex-col overflow-hidden">
                        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-[#0A0A0E] border border-white/10 rounded-[60px] relative overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500"><Target size={24}/></div><div><h4 className="text-xl font-bold italic serif-font">{activeExam.title}</h4><p className="text-[8px] font-black uppercase text-white/20">AUTHORIZED RAID PROTOCOL</p></div></div>
                                <div className="text-right"><p className="text-[8px] font-black uppercase text-white/30 mb-1">Clock Sync</p><p className="text-3xl font-mono font-black text-rose-500 animate-pulse">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p></div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                                {activeExam.questions.map((q, idx) => (
                                    <div key={q.id} className="space-y-6">
                                        <div className="flex items-start gap-6"><span className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-sm font-black italic text-white/40 shrink-0">#0{idx+1}</span><h5 className="text-2xl font-medium text-white/90 leading-tight">{q.text}</h5></div>
                                        {q.type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                                                {q.options.map((opt, oIdx) => (
                                                    <button key={oIdx} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`p-5 rounded-2xl border text-left text-sm font-bold uppercase tracking-wider transition-all ${answers[q.id] === opt ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}><span className="text-white/20 mr-4 font-black">{String.fromCharCode(65+oIdx)}</span> {opt}</button>
                                                ))}
                                            </div>
                                        )}
                                        {(q.type === 'short' || q.type === 'paragraph') && (<textarea placeholder="Input response..." className="w-full bg-white/5 border border-white/5 rounded-3xl p-8 ml-16 text-sm outline-none focus:border-indigo-500 h-32 resize-none" value={answers[q.id] || ''} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />)}
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-center shrink-0"><button onClick={submitExam} className="bg-white text-black px-16 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-xl hover:bg-emerald-500 hover:text-white transition-all">Authorize Transmission</button></div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MODULE: RESULTS ---
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
                <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Intel Logs.</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Operational Scores</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(r => (
                    <div key={r.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 shadow-2xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Award size={80}/></div>
                        <h4 className="text-xl font-bold text-white/80 italic mb-8 border-l-2 border-indigo-500 pl-6 uppercase tracking-widest">RAID: {r.examId.slice(0, 8)}</h4>
                        <div className="flex items-end justify-between">
                            <div><p className="text-[8px] font-black uppercase text-white/20 mb-1">Combat Rating</p><p className="text-5xl font-light luxury-text-gradient serif-font italic">{r.totalObtained}pt</p></div>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-4 py-2 rounded-xl border border-emerald-500/20">Authenticated</span>
                        </div>
                    </div>
                ))}
                {results.length === 0 && <div className="col-span-full py-40 text-center opacity-10 font-black uppercase text-[10px] tracking-[0.5em]">Intel Database Nominal</div>}
            </div>
        </div>
    );
};

// --- MODULE: UPCOMING EXAMS ---
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
        alert("Schedule Logged.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 shadow-2xl h-fit">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">External Log.</h3>
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">Objective</label><input required placeholder="Subject..." value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">Timeline</label><input required type="date" value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs [color-scheme:dark]" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">Syllabus Intel</label><textarea placeholder="Add topics..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs h-32 resize-none" /></div>
                    <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all">Authorize Log</button>
                </form>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Schedule Registry</h4>
                {list.map(ex => (
                    <div key={ex.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                        <div><h4 className="text-2xl font-black text-white italic uppercase mb-1">{ex.subject}</h4><p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{ex.description}</p></div>
                        <div className="text-right"><p className="text-[7px] font-black uppercase text-indigo-400 mb-1">Date</p><p className="text-xl font-mono font-bold text-white">{ex.examDate}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE: REQUEST LEAVE ---
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
        alert("Permit transmission complete.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 shadow-2xl h-fit">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-8">Absence Permit.</h3>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">Start</label><input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs [color-scheme:dark]" /></div>
                        <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">End</label><input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs [color-scheme:dark]" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-2">Justification</label><textarea required placeholder="Reason for leave..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs h-32 resize-none" /></div>
                    <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-rose-600 hover:text-white transition-all">Transmit Permit</button>
                </form>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Request History</h4>
                {list.map(l => (
                    <div key={l.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 group hover:bg-white/[0.04] transition-all">
                         <div className="flex items-center gap-2 mb-2"><span className={`w-1.5 h-1.5 rounded-full ${l.status === 'Approved' ? 'bg-emerald-500' : l.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} /><span className="text-[8px] font-black uppercase tracking-widest text-white/40">{l.status} Protocol</span></div>
                         <h4 className="text-xl font-bold text-white mb-1 italic">"{l.reason}"</h4>
                         <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{l.startDate} » {l.endDate}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE: DOUBTS ---
const DoubtsModule = ({ student }: { student: Student }) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [form, setForm] = useState({ subject: '', text: '' });

    const load = useCallback(() => db.getQueries(student.id).then(setQueries), [student.id]);
    useEffect(() => { load(); }, [load]);

    const submit = async (e: any) => {
        e.preventDefault();
        await db.addQuery({ studentId: student.id, studentName: student.name, subject: form.subject, queryText: form.text });
        setForm({ subject: '', text: '' });
        load();
        alert("Intel Inquiry Secured.");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Comm Center.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Secured Doubt Transmission</p>
            </div>
            
            <div className="flex flex-col gap-6 max-h-[50vh] overflow-y-auto scrollbar-hide p-4 mb-10">
                {queries.map(q => (
                    <div key={q.id} className="flex flex-col gap-3">
                        <div className="self-end bg-indigo-600/20 border border-indigo-500/20 p-6 rounded-[32px] rounded-tr-lg max-w-[85%]">
                            <p className="text-[8px] font-black uppercase text-indigo-400 mb-2 tracking-widest">{q.subject}</p>
                            <p className="text-sm font-medium leading-relaxed italic">"{q.queryText}"</p>
                        </div>
                        {q.status === 'Answered' && (
                            <div className="self-start bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] rounded-tl-lg max-w-[85%] animate-fade-in">
                                <div className="flex items-center gap-2 mb-3"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Faculty Response</span></div>
                                <p className="text-sm text-white/70 leading-relaxed font-bold tracking-tight">"{q.replyText}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="bg-white/[0.02] p-2 rounded-[32px] border border-white/10 flex gap-2 shadow-2xl relative z-20">
                <input required placeholder="Domain..." value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-1/4 bg-transparent px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none border-r border-white/5" />
                <input required placeholder="Formulate Transmission..." value={form.text} onChange={e => setForm({...form, text: e.target.value})} className="flex-1 bg-transparent px-6 py-4 text-sm text-white outline-none font-medium italic" />
                <button className="bg-white text-black p-4 rounded-[24px] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"><Send size={20}/></button>
            </form>
        </div>
    );
};

// --- MODULE: SETTINGS ---
const SettingsModule = ({ student }: { student: Student }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Hash Mismatch Detected');
        setLoading(true);
        try { 
            await db.changePassword(student.id, 'student', form.current, form.new); 
            alert('Security keys updated.'); 
            setForm({current:'',new:'',confirm:''}); 
        } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-md mx-auto py-20 space-y-12 text-center">
            <div className="bg-[#0A0A0E] p-12 rounded-[60px] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-10 text-indigo-400 border border-white/10 shadow-inner group">
                    <Lock size={32} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-3xl font-light serif-font mb-10 luxury-text-gradient italic">Security Core.</h3>
                <form onSubmit={update} className="space-y-4">
                    <input required type="password" placeholder="CURRENT KEY" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase" />
                    <input required type="password" placeholder="NEW KEY" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase" />
                    <input required type="password" placeholder="VERIFY KEY" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-[10px] text-white font-mono tracking-[0.4em] text-center outline-none focus:border-indigo-500 uppercase" />
                    <button disabled={loading} className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] rounded-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all mt-8 active:scale-95 disabled:opacity-50">Authorize Security Update</button>
                </form>
            </div>
        </div>
    );
};

export default StudentDashboard;
