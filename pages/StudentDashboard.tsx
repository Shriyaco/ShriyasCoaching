
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, Notice, TimetableEntry, User, StudentQuery } from '../types';
import { Sword, Calendar, Timer, BookOpen, Clock, User as UserIcon, LogOut, Bell, Menu, X, Trophy, AlertCircle, Layout, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ExamSection Component
const ExamSection = ({ student }: { student: Student }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    
    useEffect(() => { 
        if(student) {
             db.getExamsForStudent(student.gradeId, student.subdivisionId).then(setExams); 
        }
    }, [student]);
    
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Skills Battles</h2>
                <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">Prove your skills in these challenges</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sword size={120} />
                        </div>
                        
                        <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 block">{ex.subject} Challenge</span>
                        <h4 className="text-3xl font-black text-white mb-8 leading-tight">{ex.title}</h4>
                        
                        <div className="flex gap-4 mb-10">
                            <div className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300 text-xs font-bold">
                                <Calendar size={14} className="text-rose-500" /> {ex.examDate}
                            </div>
                            <div className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300 text-xs font-bold">
                                <Timer size={14} className="text-rose-500" /> {ex.duration} min
                            </div>
                        </div>
                        
                        <div className="w-full py-5 bg-white text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all shadow-xl text-center cursor-pointer">
                            Start Battle
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-40 text-center text-slate-600 font-black uppercase text-xs tracking-widest">No Active Battles</div>}
            </div>
        </div>
    );
};

// Doubts Component
const DoubtsSection = ({ student }: { student: Student }) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [form, setForm] = useState({ subject: '', queryText: '' });
    
    useEffect(() => {
        if(student) {
            db.getQueries(student.id).then(setQueries);
        }
    }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addQuery({ studentId: student.id, studentName: student.name, subject: form.subject, queryText: form.queryText });
        setForm({ subject: '', queryText: '' });
        db.getQueries(student.id).then(setQueries);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-[#0A0A0A] p-10 rounded-[32px] border border-white/5">
                <h3 className="text-2xl font-light serif-font text-white mb-8">Ask a Doubt</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input 
                        required
                        placeholder="Subject (e.g. Physics, Math)"
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    />
                    <textarea 
                        required
                        placeholder="Describe your question here..."
                        value={form.queryText}
                        onChange={e => setForm({...form, queryText: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-white/80 outline-none focus:border-indigo-500 h-32 resize-none transition-all"
                    />
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all flex items-center gap-2">
                        <Send size={14} /> Submit Query
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-white/40">History</h3>
                {queries.map(q => (
                    <div key={q.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 space-y-6">
                        <div className="flex justify-between items-start">
                            <span className="text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em] bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{q.subject}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${q.status === 'Answered' ? 'text-emerald-500' : 'text-amber-500'}`}>{q.status}</span>
                        </div>
                        <p className="text-lg font-medium text-white/90">"{q.queryText}"</p>
                        {q.status === 'Answered' && (
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[9px] font-black uppercase text-white/20 mb-2">Faculty Response</p>
                                <p className="text-white/60 text-sm leading-relaxed">{q.replyText}</p>
                            </div>
                        )}
                    </div>
                ))}
                {queries.length === 0 && <div className="py-20 text-center text-white/10 font-black uppercase text-[10px] tracking-[0.2em]">No Doubts Raised</div>}
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState<User | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data states
    const [notices, setNotices] = useState<Notice[]>([]);
    const [homework, setHomework] = useState<Homework[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== 'student') {
            navigate('/');
            return;
        }
        setUser(parsed);

        const loadData = async () => {
             // We need to fetch the full student profile to get grade/subdivision
             const me = await db.getStudentById(parsed.id);
             if (me) {
                 setStudent(me);
                 const [n, h, t] = await Promise.all([
                     db.getNotices(),
                     db.getHomeworkForStudent(me.gradeId, me.subdivisionId),
                     db.getTimetable(me.subdivisionId)
                 ]);
                 setNotices(n);
                 setHomework(h);
                 setTimetable(t);
             }
             setLoading(false);
        };
        loadData();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('sc_user');
        navigate('/');
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Loading Student Portal...</div>;
    if (!student) return <div className="min-h-screen bg-black flex items-center justify-center text-rose-500 font-black uppercase tracking-widest text-xs">Student Profile Not Found</div>;

    const navItems = [
        { id: 'dashboard', label: 'Command Center', icon: Layout },
        { id: 'exams', label: 'Battle Arena', icon: Sword },
        { id: 'homework', label: 'Missions', icon: BookOpen },
        { id: 'timetable', label: 'Schedule', icon: Clock },
        { id: 'notices', label: 'Intel', icon: Bell },
        { id: 'doubts', label: 'Doubt', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-rose-500/30 overflow-hidden flex">
            
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                        <img src="https://advedasolutions.in/sc.png" className="h-8 w-auto invert opacity-80" alt="Logo" />
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white/40"><X size={20}/></button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${activeTab === item.id ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={16} strokeWidth={2.5} className={activeTab === item.id ? 'text-black' : 'text-white/20 group-hover:text-white'} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/50">
                                {student.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white/80 truncate">{student.name}</p>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">{student.studentCustomId}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500/50 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                            <LogOut size={14} /> Abort Session
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen overflow-y-auto">
                <header className="h-24 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white/40"><Menu size={24}/></button>
                        <h1 className="text-2xl font-light serif-font text-white/90">{navItems.find(i=>i.id===activeTab)?.label}</h1>
                    </div>
                </header>

                <div className="p-8 md:p-12 pb-32">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            
                            {activeTab === 'dashboard' && (
                                <div className="space-y-12">
                                    <div className="p-12 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-black border border-white/5 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-4">Welcome back</p>
                                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">{student.name.split(' ')[0]}</h2>
                                            <div className="flex gap-4">
                                                <span className="px-4 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 text-white/60">Grade {student.gradeId}</span>
                                                <span className="px-4 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 text-white/60">Division {student.subdivisionId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-8 bg-[#0A0A0A] rounded-[32px] border border-white/5">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6"><Trophy size={24}/></div>
                                            <h3 className="text-3xl font-black text-white mb-1">{homework.filter(h=>true).length}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Missions</p>
                                        </div>
                                        <div className="p-8 bg-[#0A0A0A] rounded-[32px] border border-white/5">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6"><Bell size={24}/></div>
                                            <h3 className="text-3xl font-black text-white mb-1">{notices.length}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">New Intel</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'exams' && <ExamSection student={student} />}

                            {activeTab === 'homework' && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {homework.map(hw => (
                                        <div key={hw.id} className="p-8 bg-[#0A0A0A] rounded-[32px] border border-white/5 flex gap-8 group hover:border-white/10 transition-all">
                                            <div className="flex flex-col items-center justify-center w-20 h-20 bg-white/5 rounded-2xl border border-white/5 shrink-0">
                                                <span className="text-xl font-black text-white">{new Date(hw.dueDate).getDate()}</span>
                                                <span className="text-[9px] font-bold uppercase text-white/40">{new Date(hw.dueDate).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                <span className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block">{hw.subject}</span>
                                                <h4 className="text-xl font-medium text-white/90 leading-relaxed mb-4">"{hw.task}"</h4>
                                                <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                                    <UserIcon size={12}/> Assigned by Faculty
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {homework.length === 0 && <div className="py-40 text-center text-white/20 font-black uppercase text-xs tracking-widest">No Active Missions</div>}
                                </div>
                            )}

                            {activeTab === 'timetable' && (
                                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                        const dayEntries = timetable.filter(t => t.day === day);
                                        return (
                                            <div key={day} className="p-8 bg-[#0A0A0A] rounded-[32px] border border-white/5">
                                                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-4">{day}</h3>
                                                <div className="space-y-4">
                                                    {dayEntries.length > 0 ? dayEntries.map(t => (
                                                        <div key={t.id} className="flex items-center gap-4">
                                                            <div className="w-20 text-[10px] font-bold text-white/40 font-mono text-right">{t.startTime}</div>
                                                            <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                                <p className="font-bold text-white text-sm">{t.subject}</p>
                                                                {t.teacherName && <p className="text-[9px] text-white/30 uppercase mt-1">{t.teacherName}</p>}
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">No Schedules</p>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {activeTab === 'notices' && (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {notices.map(n => (
                                        <div key={n.id} className="p-8 bg-[#0A0A0A] rounded-[32px] border border-white/5 relative overflow-hidden">
                                            {n.important && <div className="absolute top-0 right-0 p-4"><AlertCircle className="text-rose-500" size={20}/></div>}
                                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mb-4">{n.date}</p>
                                            <h3 className="text-2xl font-light serif-font text-white mb-4">{n.title}</h3>
                                            <p className="text-sm text-white/50 leading-relaxed">{n.content}</p>
                                        </div>
                                    ))}
                                    {notices.length === 0 && <div className="py-40 text-center text-white/20 font-black uppercase text-xs tracking-widest">No New Intel</div>}
                                </div>
                            )}

                            {activeTab === 'doubts' && <DoubtsSection student={student} />}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
