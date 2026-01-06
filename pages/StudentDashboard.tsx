
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, Notice, TimetableEntry, StudentQuery, Subdivision, AttendanceRecord, StudentOwnExam, LeaveApplication } from '../types';
import { Gamepad2, Radio, Zap, Bell, Settings, LogOut, CheckCircle2, Target, Trophy, Flame, Lock, Send, X, CalendarDays, ShoppingBag, CreditCard, BookOpen, PenTool, HelpCircle, AlertTriangle, ChevronRight, ChevronLeft, Star, Sparkles, Upload, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import JitsiMeeting from '../components/JitsiMeeting';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    },
    exit: { opacity: 0 }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

// --- COMPONENTS ---

const AttendanceCalendar = ({ attendance }: { attendance: AttendanceRecord[] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <motion.div 
            variants={itemVariants}
            className="col-span-full h-full bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 relative overflow-hidden"
        >
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2"><CalendarDays size={20} className="text-indigo-500"/> Attendance</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{monthNames[month]} {year}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                    <button onClick={nextMonth} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ChevronRight size={16}/></button>
                </div>
             </div>

             <div className="grid grid-cols-7 gap-2 mb-2">
                {['S','M','T','W','T','F','S'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-white/20 uppercase">{d}</div>
                ))}
             </div>
             <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const record = attendance.find(a => a.date === dateStr);
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    let statusClass = "bg-white/[0.02] text-white/30 hover:bg-white/10";
                    if (record?.status === 'Present') statusClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
                    if (record?.status === 'Absent') statusClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    if (isToday && !record) statusClass = "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";

                    return (
                        <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-default ${statusClass}`}>
                            {day}
                        </div>
                    );
                })}
             </div>
             
             <div className="flex gap-6 mt-6 justify-center border-t border-white/5 pt-4">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div><span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Present</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div><span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Absent</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div><span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Today</span></div>
             </div>
        </motion.div>
    );
};

const PortalCard = ({ subdivision, studentName }: { subdivision: Subdivision, studentName: string }) => {
    const [isMeetingOpen, setIsMeetingOpen] = useState(false);

    if (!subdivision?.isLive) return (
        <motion.div variants={itemVariants} className="col-span-full bg-[#0a0a0a] border border-white/5 rounded-[32px] p-8 flex items-center gap-8 relative overflow-hidden group h-full">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                <Radio size={32} className="text-white/20" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white/30 uppercase tracking-widest">Portal Offline</h3>
                <p className="text-xs font-bold text-white/20 mt-1">No active warp signatures detected.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </motion.div>
    );

    return (
        <>
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMeetingOpen(true)}
                className="col-span-full relative overflow-hidden rounded-[32px] p-[1px] cursor-pointer group h-full"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 animate-gradient-xy opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay" />
                
                <div className="relative bg-black/80 backdrop-blur-xl rounded-[31px] p-8 flex items-center justify-between h-full">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full backdrop-blur-md">Live Event</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">WARP GATE OPEN</h3>
                        <p className="text-indigo-200 text-xs font-bold mt-2 uppercase tracking-widest opacity-80">Tap to teleport to class</p>
                    </div>
                    
                    <div className="w-24 h-24 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 animate-pulse" />
                        <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Zap size={40} fill="currentColor" className="text-white animate-bounce" />
                        </div>
                    </div>
                </div>
            </motion.div>
            {isMeetingOpen && subdivision.liveMeetingId && (
                <JitsiMeeting 
                    roomName={subdivision.liveMeetingId} 
                    userName={studentName} 
                    onClose={() => setIsMeetingOpen(false)} 
                />
            )}
        </>
    );
};

const StatCard = ({ title, value, label, icon: Icon, colorClass, borderClass }: any) => (
    <motion.div 
        variants={itemVariants}
        className={`bg-[#0a0a0a] p-6 rounded-[32px] border ${borderClass} flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group hover:bg-white/[0.02] transition-colors`}
    >
        <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mb-1 transition-transform group-hover:scale-110 duration-300 shadow-lg`}>
            <Icon size={24} strokeWidth={2.5}/>
        </div>
        <div>
            <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors">{label}</p>
        </div>
    </motion.div>
);

// Expanded Homework Card with Submission Logic
const HomeworkCard = ({ homework, studentId, onSubmission }: { homework: Homework, studentId: string, onSubmission: () => void }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [image, setImage] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submit = async () => {
        if (!text) return alert("Submission text required.");
        setIsSubmitting(true);
        await db.submitHomework(homework.id, studentId, text, image);
        setIsSubmitting(false);
        setIsOpen(false);
        onSubmission();
        alert("Homework Submitted!");
    };

    return (
        <>
            <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => setIsOpen(true)}
                className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] group relative overflow-hidden hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-900/10 cursor-pointer"
            >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                    <BookOpen size={120} />
                </div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        {homework.subject}
                    </span>
                    <Target size={20} className="text-white/10 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-emerald-200 transition-colors relative z-10">"{homework.task}"</h4>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 relative z-10">
                    <CalendarDays size={16} className="text-emerald-500" />
                    <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white/60 transition-colors">Due: {homework.dueDate}</span>
                </div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#111] p-8 rounded-[40px] w-full max-w-md border border-white/10 shadow-2xl relative">
                            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="absolute top-6 right-6 text-white/40 hover:text-white"><X/></button>
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><BookOpen className="text-emerald-500"/> Submit Work</h3>
                            <div className="space-y-4">
                                <textarea placeholder="Type your answer or notes here..." className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 h-32 resize-none" value={text} onChange={e => setText(e.target.value)} />
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 text-center hover:bg-white/5 transition-all relative">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload className="mx-auto text-emerald-500 mb-2" size={24} />
                                    <p className="text-[10px] font-bold uppercase text-white/40">Upload Image (Optional)</p>
                                    {image && <p className="text-[10px] text-emerald-400 mt-2 font-black">Image Selected</p>}
                                </div>
                                <button onClick={submit} disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl">
                                    {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const ExamCard = ({ exam }: { exam: Exam }) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="relative p-[1px] rounded-[40px] bg-gradient-to-br from-rose-500/50 to-orange-500/50"
    >
        <div className="bg-[#0a0a0a] rounded-[39px] p-8 h-full relative overflow-hidden">
            <div className="absolute -right-8 -top-8 text-rose-500/5 group-hover:text-rose-500/10 transition-colors">
                <PenTool size={180} />
            </div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <span className="text-rose-400 font-black text-[10px] uppercase tracking-[0.3em] bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20">Boss Raid</span>
                    <Flame size={24} className="text-orange-500 animate-pulse" fill="currentColor" />
                </div>
                
                <h3 className="text-3xl font-black text-white italic uppercase tracking-wide mb-2">{exam.subject}</h3>
                <p className="text-white/60 text-sm font-bold mb-10 border-l-2 border-rose-500/30 pl-4">{exam.title}</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] text-orange-400 font-black uppercase tracking-wider mb-1">Battle Date</p>
                        <p className="text-white font-mono text-sm font-bold">{exam.examDate}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] text-orange-400 font-black uppercase tracking-wider mb-1">Start Time</p>
                        <p className="text-white font-mono text-sm font-bold">{exam.startTime}</p>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const SettingsPanel = ({ student, refresh }: { student: Student, refresh: () => void }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.new !== form.confirm) return alert("New passwords do not match!");
        setLoading(true);
        try {
            await db.changePassword(student.id, 'student', form.current, form.new);
            alert("Password updated successfully!");
            setForm({ current: '', new: '', confirm: '' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto py-10">
            <div className="bg-[#0a0a0a] p-10 rounded-[40px] border border-white/10 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <Lock size={36} />
                </div>
                <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-[0.2em]">Security Protocol</h3>
                
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-3 tracking-widest">Current Password</label>
                        <input type="password" required value={form.current} onChange={e => setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono" />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-3 tracking-widest">New Password</label>
                        <input type="password" required value={form.new} onChange={e => setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono" />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-3 tracking-widest">Verify Password</label>
                        <input type="password" required value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono" />
                    </div>
                    
                    <button disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-white transition-all mt-8 disabled:opacity-50 shadow-xl">
                        {loading ? 'Updating...' : 'Update Credentials'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

// --- MAIN DASHBOARD ---

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [subdivision, setSubdivision] = useState<Subdivision | null>(null);
    const [activeTab, setActiveTab] = useState('command');
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [missions, setMissions] = useState<Homework[]>([]);
    const [challenges, setChallenges] = useState<Exam[]>([]);
    const [intel, setIntel] = useState<Notice[]>([]);
    const [doubts, setDoubts] = useState<StudentQuery[]>([]);
    const [myExams, setMyExams] = useState<StudentOwnExam[]>([]);
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const [doubtForm, setDoubtForm] = useState({ subject: '', queryText: '' });
    
    // Forms for new modules
    const [examForm, setExamForm] = useState({ subject: '', examDate: '', description: '' });
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

    useEffect(() => {
        const init = async () => {
            const stored = sessionStorage.getItem('sc_user');
            if (!stored) { navigate('/login'); return; }
            const user = JSON.parse(stored);
            if (user.role !== 'student') { navigate('/'); return; }

            try {
                const [me] = await Promise.all([db.getStudentById(user.id)]);
                
                if (me) {
                    setStudent(me);
                    const subs = await db.getSubdivisions(me.gradeId);
                    const mySub = subs.find(s => s.id === me.subdivisionId);
                    setSubdivision(mySub || null);

                    const [att, hw, ex, not, q, myEx, lv] = await Promise.all([
                        db.getAttendance(me.id),
                        db.getHomeworkForStudent(me.gradeId, me.subdivisionId),
                        db.getExamsForStudent(me.gradeId, me.subdivisionId),
                        db.getNotices(),
                        db.getQueries(me.id),
                        db.getStudentExams(me.id),
                        db.getLeaveApplications(me.id)
                    ]);

                    setAttendance(att);
                    setMissions(hw);
                    setChallenges(ex);
                    setIntel(not);
                    setDoubts(q);
                    setMyExams(myEx);
                    setLeaves(lv);
                }
            } catch (e) {
                console.error("Dashboard Load Error", e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [navigate]);

    const handleDoubtSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!student) return;
        await db.addQuery({ studentId: student.id, studentName: student.name, ...doubtForm });
        setDoubtForm({ subject: '', queryText: '' });
        const q = await db.getQueries(student.id);
        setDoubts(q);
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!student) return;
        await db.addStudentExam({ studentId: student.id, studentName: student.name, gradeId: student.gradeId, subdivisionId: student.subdivisionId, ...examForm });
        setExamForm({ subject: '', examDate: '', description: '' });
        const ex = await db.getStudentExams(student.id);
        setMyExams(ex);
    };

    const handleLeaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!student) return;
        await db.addLeaveApplication({ studentId: student.id, studentName: student.name, gradeId: student.gradeId, subdivisionId: student.subdivisionId, ...leaveForm });
        setLeaveForm({ startDate: '', endDate: '', reason: '' });
        const lv = await db.getLeaveApplications(student.id);
        setLeaves(lv);
    };

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 bg-cyan-500/20 rounded-full blur-md animate-pulse"></div>
            </div>
            <p className="text-white/40 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Initializing System...</p>
        </div>
    );
    
    if (!student) return null;

    const navItems = [
        { id: 'command', label: 'Base', icon: Gamepad2 },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'exams', label: 'Exam', icon: PenTool },
        { id: 'my-exams', label: 'My Exams', icon: Calendar },
        { id: 'leave', label: 'Leave', icon: FileText },
        { id: 'doubts', label: 'Doubt', icon: HelpCircle },
        { id: 'settings', label: 'Config', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#020204] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-40 md:pb-0 relative">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen opacity-40" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[100px] mix-blend-screen opacity-40" />
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[80px] mix-blend-screen opacity-30" />
            </div>

            {/* Glass Header */}
            <header className="sticky top-0 z-40 bg-[#020204]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <div className="w-full h-full bg-black rounded-[14px] overflow-hidden">
                                {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-cyan-400">{student.name.charAt(0)}</div>}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border border-emerald-400"></div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic tracking-wide text-white uppercase leading-none mb-1">{student.name.split(' ')[0]}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Cadet Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-white/5">
                    <LogOut size={18} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
                <AnimatePresence mode="wait">
                    
                    {activeTab === 'command' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                            
                            {/* Hero Section Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* XP Bar spans full width on mobile, 2 cols on large */}
                                <div className="lg:col-span-2">
                                    <AttendanceCalendar attendance={attendance} />
                                </div>
                                {/* Portal Card (Live Class) */}
                                <div className="lg:col-span-1 h-full">
                                    {subdivision && <PortalCard subdivision={subdivision} studentName={student.name} />}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Active Missions" value={missions.length} label="Pending HW" icon={BookOpen} colorClass="bg-cyan-500/20 text-cyan-400" borderClass="border-cyan-500/20" />
                                <StatCard title="Boss Raids" value={challenges.length} label="Exams" icon={PenTool} colorClass="bg-rose-500/20 text-rose-400" borderClass="border-rose-500/20" />
                                <StatCard title="Intel" value={intel.length} label="New Alerts" icon={Bell} colorClass="bg-yellow-500/20 text-yellow-400" borderClass="border-yellow-500/20" />
                                <StatCard title="Reputation" value="98%" label="Elite Status" icon={Trophy} colorClass="bg-emerald-500/20 text-emerald-400" borderClass="border-emerald-500/20" />
                            </div>

                            {/* Two Column Layout: Alerts & Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Alerts Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 animate-pulse"><AlertTriangle size={20} /></div>
                                        <h3 className="text-xl font-black italic tracking-wide text-white uppercase">Mission Updates</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {intel.slice(0, 3).map((n, i) => (
                                            <motion.div 
                                                key={n.id} 
                                                variants={itemVariants}
                                                className="bg-[#0a0a0a] border-l-4 border-yellow-500 p-6 rounded-r-[24px] relative overflow-hidden group hover:bg-white/5 transition-colors"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Bell size={40}/></div>
                                                <div className="flex justify-between items-start mb-2 relative z-10">
                                                    <h4 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">{n.title}</h4>
                                                    {n.important && <span className="bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase px-2 py-1 rounded border border-rose-500/30">Urgent</span>}
                                                </div>
                                                <p className="text-white/50 text-sm leading-relaxed mb-4 relative z-10">{n.content}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 relative z-10">{n.date}</p>
                                            </motion.div>
                                        ))}
                                        {intel.length === 0 && (
                                            <div className="py-12 bg-white/[0.02] rounded-[24px] border border-dashed border-white/10 text-center">
                                                <p className="text-white/20 font-black uppercase text-xs tracking-[0.2em]">All Systems Nominal</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions Column */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Sparkles size={20} /></div>
                                        <h3 className="text-xl font-black italic tracking-wide text-white uppercase">Quick Access</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        <motion.button 
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate('/shop')}
                                            className="w-full bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 p-6 rounded-[24px] text-left relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-1">Item Shop</h4>
                                                    <p className="text-[10px] uppercase tracking-wider text-purple-300">Browse Equipment</p>
                                                </div>
                                                <ShoppingBag className="text-purple-400" size={24} />
                                            </div>
                                        </motion.button>

                                        <motion.button 
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate('/pay-fees')}
                                            className="w-full bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-6 rounded-[24px] text-left relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-1">Treasury</h4>
                                                    <p className="text-[10px] uppercase tracking-wider text-emerald-300">Settle Dues</p>
                                                </div>
                                                <CreditCard className="text-emerald-400" size={24} />
                                            </div>
                                        </motion.button>
                                        
                                        <div className="p-6 bg-white/[0.02] rounded-[24px] border border-white/5">
                                            <h4 className="text-sm font-bold text-white mb-4">Latest Homework</h4>
                                            {missions.slice(0, 1).map(m => (
                                                <div key={m.id} onClick={() => setActiveTab('homework')} className="cursor-pointer group">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{m.subject}</span>
                                                        <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                                                    </div>
                                                    <p className="text-xs text-white/60 line-clamp-2 italic">"{m.task}"</p>
                                                </div>
                                            ))}
                                            {missions.length === 0 && <p className="text-[10px] text-white/20 uppercase tracking-wider font-bold">None Pending</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'homework' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {missions.map(m => <HomeworkCard key={m.id} homework={m} studentId={student.id} onSubmission={() => {}} />)}
                            {missions.length === 0 && <div className="col-span-full text-center py-40 text-white/20 font-black uppercase tracking-[0.5em] border border-dashed border-white/10 rounded-[40px]">Log Empty</div>}
                        </motion.div>
                    )}

                    {activeTab === 'exams' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {challenges.map(c => <ExamCard key={c.id} exam={c} />)}
                            {challenges.length === 0 && <div className="col-span-full text-center py-40 text-white/20 font-black uppercase tracking-[0.5em] border border-dashed border-white/10 rounded-[40px]">No Active Raids</div>}
                        </motion.div>
                    )}

                    {activeTab === 'my-exams' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col pb-32">
                            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                                {myExams.map(ex => (
                                    <motion.div key={ex.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/10 p-6 rounded-[28px] flex justify-between items-center group hover:border-white/20 transition-all">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">{ex.subject}</h4>
                                            <p className="text-xs text-white/40">{ex.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-premium-accent tracking-widest bg-premium-accent/5 px-3 py-1 rounded-full border border-premium-accent/10">{ex.examDate}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {myExams.length === 0 && <div className="text-center py-40 opacity-20 font-black uppercase tracking-[0.3em] text-xs">No Upcoming Exams Registered</div>}
                            </div>
                            <form onSubmit={handleExamSubmit} className="bg-[#0a0a0a] p-6 rounded-[32px] border border-white/10 shadow-2xl relative z-20 space-y-4">
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">Register Upcoming Exam</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Subject Name" value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all" />
                                    <input required type="date" value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all" />
                                </div>
                                <input required placeholder="Syllabus / Notes..." value={examForm.description} onChange={e => setExamForm({...examForm, description: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all" />
                                <button className="w-full bg-white text-black p-4 rounded-xl hover:bg-indigo-400 hover:text-white transition-all shadow-lg font-black text-xs uppercase tracking-[0.2em]">Notify Teacher</button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'leave' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col pb-32">
                            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                                {leaves.map(l => (
                                    <motion.div key={l.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/10 p-6 rounded-[28px] flex justify-between items-start group hover:border-white/20 transition-all">
                                        <div>
                                            <div className="flex gap-2 items-center mb-2">
                                                <span className={`w-2 h-2 rounded-full ${l.status === 'Approved' ? 'bg-emerald-500' : l.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{l.status}</span>
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">Reason: {l.reason}</p>
                                            <p className="text-xs text-white/40 font-mono">{l.startDate} to {l.endDate}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {leaves.length === 0 && <div className="text-center py-40 opacity-20 font-black uppercase tracking-[0.3em] text-xs">No Leave History</div>}
                            </div>
                            <form onSubmit={handleLeaveSubmit} className="bg-[#0a0a0a] p-6 rounded-[32px] border border-white/10 shadow-2xl relative z-20 space-y-4">
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">Request Leave</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1">From</label>
                                        <input required type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-1">To</label>
                                        <input required type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500 transition-all" />
                                    </div>
                                </div>
                                <input required placeholder="Reason for leave..." value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500 transition-all" />
                                <button className="w-full bg-white text-black p-4 rounded-xl hover:bg-rose-400 hover:text-white transition-all shadow-lg font-black text-xs uppercase tracking-[0.2em]">Submit Request</button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'doubts' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col pb-32">
                            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                                {doubts.map(d => (
                                    <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                                        <div className="self-end bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-6 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg">
                                            <p className="text-[9px] font-black uppercase text-indigo-200 mb-2 tracking-widest">{d.subject}</p>
                                            <p className="text-sm font-medium leading-relaxed">{d.queryText}</p>
                                        </div>
                                        {d.status === 'Answered' && (
                                            <div className="self-start bg-[#111] border border-white/10 p-6 rounded-2xl rounded-tl-sm max-w-[85%]">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Incoming Transmission</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed">{d.replyText}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {doubts.length === 0 && <div className="text-center py-40 opacity-20 font-black uppercase tracking-[0.3em] text-xs">Secure Channel Open</div>}
                            </div>
                            <form onSubmit={handleDoubtSubmit} className="bg-[#0a0a0a] p-2 rounded-[28px] border border-white/10 flex gap-2 shadow-2xl relative z-20">
                                <input required placeholder="Subject..." value={doubtForm.subject} onChange={e => setDoubtForm({...doubtForm, subject: e.target.value})} className="w-1/3 bg-transparent px-6 py-4 text-xs font-bold text-white outline-none border-r border-white/10 placeholder:text-white/20" />
                                <input required placeholder="Transmission content..." value={doubtForm.queryText} onChange={e => setDoubtForm({...doubtForm, queryText: e.target.value})} className="flex-1 bg-transparent px-6 py-4 text-sm text-white outline-none placeholder:text-white/20" />
                                <button className="bg-white text-black p-4 rounded-[24px] hover:bg-indigo-400 hover:text-white transition-all shadow-lg active:scale-95"><Send size={20} /></button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && <SettingsPanel student={student} refresh={() => {}} />}

                </AnimatePresence>
            </main>

            <AnimatePresence>
                {/* Removed AttendanceModal call as it was part of the old design flow, if needed re-add */}
            </AnimatePresence>

            {/* Enhanced Floating Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <nav className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-[95vw] overflow-x-auto scrollbar-hide">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { 
                                setActiveTab(item.id); 
                            }}
                            className={`relative min-w-[64px] h-[64px] rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all duration-300 group ${activeTab === item.id ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105 -translate-y-2' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                            <span className={`text-[8px] font-black uppercase tracking-widest scale-75 transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <motion.span layoutId="active-dot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};
