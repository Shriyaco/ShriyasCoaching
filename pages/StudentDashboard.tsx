
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, Notice, TimetableEntry, User, StudentQuery, Subdivision, AttendanceRecord } from '../types';
import { Rocket, Sword, Scroll, Radio, Zap, Shield, Star, Menu, X, LogOut, MessageCircle, Clock, Bell, CheckCircle2, AlertTriangle, Send, Target, Map, Battery, User as UserIcon, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JitsiMeeting from '../components/JitsiMeeting';

// --- GAMIFIED COMPONENTS ---

const PowerLevel = ({ attendance }: { attendance: AttendanceRecord[] }) => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const percentage = total === 0 ? 100 : Math.round((present / total) * 100);
    const level = Math.floor(present / 5) + 1; // Level up every 5 days present

    return (
        <div className="flex items-center gap-4 bg-slate-800/50 border border-indigo-500/30 px-4 py-2 rounded-full backdrop-blur-md">
            <div className="relative">
                <Battery className="text-emerald-400 fill-emerald-400/20" size={24} />
                <div className="absolute inset-0 bg-emerald-400/20 blur-sm rounded-full" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Power Level {level}</p>
                <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" 
                    />
                </div>
            </div>
        </div>
    );
};

const HolographicCard = ({ subdivision, studentName }: { subdivision: Subdivision, studentName: string }) => {
    const [isMeetingOpen, setIsMeetingOpen] = useState(false);

    if (!subdivision?.isLive) return (
        <div className="p-1 bg-slate-800/30 rounded-[32px] border border-white/5 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            <div className="bg-[#0f172a] rounded-[28px] p-8 flex items-center justify-between">
                <div>
                    <h3 className="text-white/40 font-black uppercase text-xs tracking-[0.3em] mb-2">Transmission Offline</h3>
                    <p className="text-indigo-400 text-lg font-bold font-sans">No Active Signal</p>
                </div>
                <Radio size={40} className="text-white/20" />
            </div>
        </div>
    );

    return (
        <>
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative group cursor-pointer"
                onClick={() => setIsMeetingOpen(true)}
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 rounded-[35px] blur opacity-75 group-hover:opacity-100 animate-pulse transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-[32px] p-8 border border-white/10 flex items-center justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                            <span className="text-rose-400 font-black uppercase text-[9px] tracking-[0.3em]">Live Transmission</span>
                        </div>
                        <h3 className="text-2xl font-black text-white italic tracking-wide">CLASSROOM ACTIVE</h3>
                        <p className="text-indigo-300 text-xs font-bold mt-2">Tap to Establish Link</p>
                    </div>
                    <div className="relative z-10 w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 border border-rose-500/50 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                        <Zap size={32} fill="currentColor" />
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

const MissionCard = ({ homework }: { homework: Homework }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -5 }}
        className="bg-slate-800/40 backdrop-blur-md border border-indigo-500/20 p-6 rounded-3xl group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={80} />
        </div>
        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest mb-4 border border-indigo-500/30">
            {homework.subject}
        </span>
        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">"{homework.task}"</h4>
        <div className="flex items-center gap-2 text-slate-400 text-xs mt-4">
            <Clock size={14} className="text-amber-400" />
            <span className="font-mono font-bold text-amber-100">Deadline: {homework.dueDate}</span>
        </div>
    </motion.div>
);

const BossBattleCard = ({ exam }: { exam: Exam }) => (
    <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/30 p-8 rounded-[32px] relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className="text-rose-400 font-black text-[10px] uppercase tracking-[0.3em]">Boss Battle</span>
                    <Sword size={24} className="text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-wider mb-2">{exam.subject}</h3>
                <p className="text-rose-200/60 text-sm font-bold">{exam.title}</p>
            </div>
            <div className="mt-8 flex gap-4">
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-rose-500/20">
                    <p className="text-[9px] text-rose-400 font-black uppercase">Date</p>
                    <p className="text-white font-mono text-xs">{exam.examDate}</p>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-rose-500/20">
                    <p className="text-[9px] text-rose-400 font-black uppercase">Time</p>
                    <p className="text-white font-mono text-xs">{exam.startTime}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const IntelCard = ({ notice }: { notice: Notice }) => (
    <div className="bg-slate-800/40 border border-cyan-500/20 p-6 rounded-3xl relative overflow-hidden">
        {notice.important && (
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                Priority Alpha
            </div>
        )}
        <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-3">{notice.date}</p>
        <h4 className="text-white font-bold text-lg mb-2">{notice.title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{notice.content}</p>
    </div>
);

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
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [doubts, setDoubts] = useState<StudentQuery[]>([]);
    const [doubtForm, setDoubtForm] = useState({ subject: '', queryText: '' });

    useEffect(() => {
        const init = async () => {
            const stored = sessionStorage.getItem('sc_user');
            if (!stored) { navigate('/login'); return; }
            const user = JSON.parse(stored);
            if (user.role !== 'student') { navigate('/'); return; }

            try {
                // Parallel Fetching for Speed
                const [me] = await Promise.all([db.getStudentById(user.id)]);
                
                if (me) {
                    setStudent(me);
                    // Fetch subdivision for Live status
                    const subs = await db.getSubdivisions(me.gradeId);
                    const mySub = subs.find(s => s.id === me.subdivisionId);
                    setSubdivision(mySub || null);

                    // Fetch Dashboard Data
                    const [att, hw, ex, not, tt, q] = await Promise.all([
                        db.getAttendance(me.id),
                        db.getHomeworkForStudent(me.gradeId, me.subdivisionId),
                        db.getExamsForStudent(me.gradeId, me.subdivisionId),
                        db.getNotices(),
                        db.getTimetable(me.subdivisionId),
                        db.getQueries(me.id)
                    ]);

                    setAttendance(att);
                    setMissions(hw);
                    setChallenges(ex);
                    setIntel(not);
                    setTimetable(tt);
                    setDoubts(q);
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

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!student) return null;

    const navItems = [
        { id: 'command', label: 'Command', icon: Rocket },
        { id: 'missions', label: 'Missions', icon: Target },
        { id: 'challenges', label: 'Battles', icon: Sword },
        { id: 'schedule', label: 'Schedule', icon: Clock },
        { id: 'intel', label: 'Intel', icon: Bell },
        { id: 'doubts', label: 'Doubt', icon: HelpCircle }, // Renamed Label to Doubt as requested
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-32 md:pb-0 relative">
            {/* Cosmic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-rose-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Header / Command Deck */}
            <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full bg-[#0f172a] rounded-xl flex items-center justify-center">
                            {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <UserIcon className="text-indigo-400" />}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-black italic tracking-wide text-white">{student.name.split(' ')[0]}</h2>
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Grade {student.gradeId} • Div {student.subdivisionId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <PowerLevel attendance={attendance} />
                    </div>
                    <button onClick={handleLogout} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
                <AnimatePresence mode="wait">
                    
                    {activeTab === 'command' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                            {subdivision && <HolographicCard subdivision={subdivision} studentName={student.name} />}
                            
                            <div className="md:hidden">
                                <PowerLevel attendance={attendance} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                                    <h3 className="text-3xl font-black text-cyan-400 mb-1">{missions.length}</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Active Missions</p>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                                    <h3 className="text-3xl font-black text-rose-400 mb-1">{challenges.length}</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Boss Battles</p>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                                    <h3 className="text-3xl font-black text-amber-400 mb-1">{intel.length}</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Intel Logs</p>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                                    <h3 className="text-3xl font-black text-emerald-400 mb-1">100%</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Shield Integrity</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-6">
                                    <h3 className="text-xl font-black italic tracking-wide text-white">PRIORITY MISSIONS</h3>
                                    <button onClick={() => setActiveTab('missions')} className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:text-white transition-colors">View All</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {missions.slice(0, 2).map(m => <MissionCard key={m.id} homework={m} />)}
                                    {missions.length === 0 && <div className="col-span-full p-8 border border-dashed border-white/10 rounded-3xl text-center text-white/20 font-black uppercase text-xs tracking-widest">No Active Missions</div>}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'missions' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {missions.map(m => <MissionCard key={m.id} homework={m} />)}
                            {missions.length === 0 && <div className="col-span-full text-center py-20 text-white/20 font-black uppercase tracking-widest">All Missions Complete</div>}
                        </motion.div>
                    )}

                    {activeTab === 'challenges' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {challenges.map(c => <BossBattleCard key={c.id} exam={c} />)}
                            {challenges.length === 0 && <div className="col-span-full text-center py-20 text-white/20 font-black uppercase tracking-widest">No Boss Battles Detected</div>}
                        </motion.div>
                    )}

                    {activeTab === 'intel' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-3xl mx-auto">
                            {intel.map(n => <IntelCard key={n.id} notice={n} />)}
                        </motion.div>
                    )}

                    {activeTab === 'schedule' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                const entries = timetable.filter(t => t.day === day);
                                return (
                                    <div key={day} className="bg-slate-800/40 border border-white/5 rounded-3xl p-6">
                                        <h4 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-4 border-b border-white/5 pb-2">{day}</h4>
                                        <div className="space-y-3">
                                            {entries.length > 0 ? entries.map(t => (
                                                <div key={t.id} className="flex gap-4 items-center">
                                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono font-bold text-slate-300 w-20 text-center">{t.startTime}</div>
                                                    <div className="text-sm font-bold text-white">{t.subject}</div>
                                                </div>
                                            )) : <p className="text-white/10 text-[10px] uppercase font-bold tracking-widest italic">Rest Cycle</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'doubts' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto h-[75vh] flex flex-col">
                            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                                {doubts.map(d => (
                                    <div key={d.id} className="flex flex-col gap-2">
                                        <div className="self-end bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                                            <p className="text-[10px] font-black uppercase text-indigo-200 mb-1 tracking-widest">{d.subject}</p>
                                            <p className="text-sm font-medium">{d.queryText}</p>
                                        </div>
                                        {d.status === 'Answered' && (
                                            <div className="self-start bg-slate-800 border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-[80%]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Faculty Response</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed">{d.replyText}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {doubts.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase tracking-[0.3em] text-xs">Comms Channel Quiet</div>}
                            </div>
                            <form onSubmit={handleDoubtSubmit} className="bg-slate-800/80 backdrop-blur-md p-2 rounded-[24px] border border-white/10 flex gap-2">
                                <input required placeholder="Subject..." value={doubtForm.subject} onChange={e => setDoubtForm({...doubtForm, subject: e.target.value})} className="w-1/3 bg-transparent px-4 py-3 text-xs font-bold text-white outline-none border-r border-white/10 placeholder:text-white/20" />
                                <input required placeholder="Type your doubt..." value={doubtForm.queryText} onChange={e => setDoubtForm({...doubtForm, queryText: e.target.value})} className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/20" />
                                <button className="bg-indigo-600 text-white p-3 rounded-[20px] hover:bg-indigo-500 transition-all shadow-lg active:scale-95"><Send size={20} /></button>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* Navigation Bar */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-1 shadow-2xl z-50 max-w-[95vw] overflow-x-auto scrollbar-hide">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`relative px-6 py-3 rounded-full flex flex-col items-center gap-1 transition-all min-w-[70px] ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        {activeTab === item.id && <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]" />}
                    </button>
                ))}
            </nav>
        </div>
    );
};
