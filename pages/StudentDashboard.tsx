
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam, Homework, Notice, TimetableEntry, StudentQuery, Subdivision, AttendanceRecord } from '../types';
import { Rocket, Sword, Gamepad2, Radio, Zap, Bell, MessageCircle, Clock, Settings, LogOut, CheckCircle2, Target, Trophy, Flame, Lock, Save, RefreshCw, Send, X, CalendarDays, ShoppingBag, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JitsiMeeting from '../components/JitsiMeeting';

// --- GAMIFIED COMPONENTS ---

const XPBar = ({ attendance, onClick }: { attendance: AttendanceRecord[], onClick: () => void }) => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    const level = Math.floor(present / 5) + 1;

    return (
        <div onClick={onClick} className="bg-black/40 backdrop-blur-xl border-2 border-yellow-400/50 p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-all">
            <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors" />
            <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex flex-col items-center justify-center border-4 border-black shadow-xl transform group-hover:rotate-6 transition-transform">
                <span className="text-[10px] font-black uppercase text-black">Lvl</span>
                <span className="text-2xl font-black text-black leading-none">{level}</span>
            </div>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">XP Progress (Click for History)</span>
                    <span className="text-[10px] font-black text-white">{percentage}%</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const AttendanceModal = ({ attendance, onClose }: { attendance: AttendanceRecord[], onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={20}/> Mission Log</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {attendance.length === 0 && <p className="text-center text-white/20 py-10 font-black uppercase tracking-widest">No Records Found</p>}
                {attendance.map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-white/70 font-mono text-sm font-bold">{record.date}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                            {record.status}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    </motion.div>
);

const PortalCard = ({ subdivision, studentName }: { subdivision: Subdivision, studentName: string }) => {
    const [isMeetingOpen, setIsMeetingOpen] = useState(false);

    if (!subdivision?.isLive) return (
        <div className="bg-black/40 border-2 border-dashed border-white/10 rounded-[32px] p-8 flex items-center gap-6 opacity-60 grayscale">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <Radio size={32} className="text-white/20" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white/40 uppercase tracking-widest">Portal Offline</h3>
                <p className="text-xs font-bold text-white/20 mt-1">No active warp signatures detected.</p>
            </div>
        </div>
    );

    return (
        <>
            <motion.div 
                whileHover={{ scale: 1.02, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMeetingOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[32px] p-1 cursor-pointer shadow-[0_0_40px_rgba(124,58,237,0.5)] relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 animate-pulse"></div>
                <div className="bg-black/20 backdrop-blur-sm rounded-[28px] p-8 flex items-center justify-between relative z-10 h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] bg-red-500/20 px-2 py-1 rounded">Live Event</span>
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-wide drop-shadow-lg">WARP GATE OPEN</h3>
                        <p className="text-indigo-100 text-xs font-bold mt-2 opacity-80">Tap to teleport to class</p>
                    </div>
                    <div className="w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center border-4 border-indigo-400 shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Zap size={36} fill="currentColor" className="animate-bounce" />
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

const QuestCard = ({ homework }: { homework: Homework }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -5 }}
        className="bg-[#1a1a1a] border-2 border-gray-800 p-6 rounded-3xl group relative overflow-hidden hover:border-emerald-400 transition-colors"
    >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={100} />
        </div>
        <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                {homework.subject}
            </span>
            <Trophy size={20} className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors" />
        </div>
        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">"{homework.task}"</h4>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
            <Clock size={14} className="text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white/40">Complete by: {homework.dueDate}</span>
        </div>
    </motion.div>
);

const RaidCard = ({ exam }: { exam: Exam }) => (
    <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-rose-600 to-orange-600 p-1 rounded-[32px] shadow-2xl relative group"
    >
        <div className="bg-black/90 rounded-[28px] p-8 h-full relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
                <Sword size={150} />
            </div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-rose-400 font-black text-[10px] uppercase tracking-[0.3em] bg-rose-500/10 px-3 py-1 rounded border border-rose-500/20">Boss Raid</span>
                    <Flame size={24} className="text-orange-500 animate-pulse" fill="currentColor" />
                </div>
                
                <h3 className="text-2xl font-black text-white italic uppercase tracking-wider mb-2">{exam.subject}</h3>
                <p className="text-white/60 text-sm font-bold mb-8">{exam.title}</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[9px] text-orange-400 font-black uppercase">Battle Date</p>
                        <p className="text-white font-mono text-xs font-bold">{exam.examDate}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[9px] text-orange-400 font-black uppercase">Start Time</p>
                        <p className="text-white font-mono text-xs font-bold">{exam.startTime}</p>
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
            alert("Secret identity updated successfully!");
            setForm({ current: '', new: '', confirm: '' });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10">
            <div className="bg-[#111] p-10 rounded-[40px] border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-cyan-400 border border-cyan-500/30">
                    <Lock size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest">Secret Config</h3>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-2">Current Passcode</label>
                        <input type="password" required value={form.current} onChange={e => setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 transition-all font-mono" />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-2">New Passcode</label>
                        <input type="password" required value={form.new} onChange={e => setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 transition-all font-mono" />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/30 ml-2">Verify Passcode</label>
                        <input type="password" required value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-cyan-500 transition-all font-mono" />
                    </div>
                    
                    <button disabled={loading} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-cyan-500/20 transition-all mt-6 disabled:opacity-50">
                        {loading ? 'Encrypting...' : 'Save Configuration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD ---

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [subdivision, setSubdivision] = useState<Subdivision | null>(null);
    const [activeTab, setActiveTab] = useState('command');
    const [loading, setLoading] = useState(true);
    const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
    
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
                const [me] = await Promise.all([db.getStudentById(user.id)]);
                
                if (me) {
                    setStudent(me);
                    const subs = await db.getSubdivisions(me.gradeId);
                    const mySub = subs.find(s => s.id === me.subdivisionId);
                    setSubdivision(mySub || null);

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

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cyan-500 font-black uppercase text-xs tracking-[0.5em]">Loading Interface...</p>
        </div>
    );
    
    if (!student) return null;

    const navItems = [
        { id: 'command', label: 'Base', icon: Gamepad2 },
        { id: 'missions', label: 'Quests', icon: Target },
        { id: 'challenges', label: 'Raids', icon: Sword },
        { id: 'schedule', label: 'Time', icon: Clock },
        { id: 'alerts', label: 'Alerts', icon: Bell }, // Renamed from Intel
        { id: 'doubts', label: 'Comms', icon: MessageCircle },
        { id: 'shop', label: 'Shop', icon: ShoppingBag, action: () => navigate('/shop') },
        { id: 'fees', label: 'Fees', icon: CreditCard, action: () => navigate('/pay-fees') },
        { id: 'settings', label: 'Config', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-36 md:pb-0 relative">
            {/* Playful Background */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050505] to-[#050505]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Header / Hero Profile */}
            <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/20">
                        <div className="w-full h-full bg-black rounded-[10px] overflow-hidden">
                            {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-cyan-400">{student.name.charAt(0)}</div>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic tracking-wide text-white uppercase">{student.name.split(' ')[0]}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Online</p>
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                    <LogOut size={18} />
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
                <AnimatePresence mode="wait">
                    
                    {activeTab === 'command' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                            {/* Hero Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <XPBar attendance={attendance} onClick={() => setShowAttendanceHistory(true)} />
                                {subdivision && <PortalCard subdivision={subdivision} studentName={student.name} />}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#151515] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-cyan-500/50 transition-colors">
                                    <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mb-1"><Target size={20}/></div>
                                    <h3 className="text-2xl font-black text-white">{missions.length}</h3>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Active Quests</p>
                                </div>
                                <div className="bg-[#151515] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-rose-500/50 transition-colors">
                                    <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 mb-1"><Sword size={20}/></div>
                                    <h3 className="text-2xl font-black text-white">{challenges.length}</h3>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Raids Pending</p>
                                </div>
                                <div className="bg-[#151515] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-yellow-500/50 transition-colors">
                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-400 mb-1"><Bell size={20}/></div>
                                    <h3 className="text-2xl font-black text-white">{intel.length}</h3>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">New Alerts</p>
                                </div>
                                <div className="bg-[#151515] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/50 transition-colors">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-1"><Trophy size={20}/></div>
                                    <h3 className="text-2xl font-black text-white">98%</h3>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Reputation</p>
                                </div>
                            </div>

                            {/* Recent Missions */}
                            <div>
                                <div className="flex justify-between items-end mb-6 px-2">
                                    <h3 className="text-xl font-black italic tracking-wide text-white uppercase flex items-center gap-2">
                                        <Rocket size={20} className="text-purple-500"/> Priority Quests
                                    </h3>
                                    <button onClick={() => setActiveTab('missions')} className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">View All</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {missions.slice(0, 2).map(m => <QuestCard key={m.id} homework={m} />)}
                                    {missions.length === 0 && (
                                        <div className="col-span-full py-16 bg-white/5 rounded-[32px] border border-dashed border-white/10 text-center">
                                            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 opacity-50"/>
                                            <p className="text-white/20 font-black uppercase text-xs tracking-widest">All Objectives Cleared</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'missions' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {missions.map(m => <QuestCard key={m.id} homework={m} />)}
                            {missions.length === 0 && <div className="col-span-full text-center py-40 text-white/20 font-black uppercase tracking-widest">Quest Log Empty</div>}
                        </motion.div>
                    )}

                    {activeTab === 'challenges' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {challenges.map(c => <RaidCard key={c.id} exam={c} />)}
                            {challenges.length === 0 && <div className="col-span-full text-center py-40 text-white/20 font-black uppercase tracking-widest">No Raids Detected</div>}
                        </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-3xl mx-auto">
                            {intel.map(n => (
                                <div key={n.id} className="bg-[#111] border-l-4 border-cyan-500 p-8 rounded-r-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Bell size={40}/></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{n.title}</h4>
                                        {n.important && <span className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded">Urgent</span>}
                                    </div>
                                    <p className="text-white/50 text-sm leading-relaxed">{n.content}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-6">{n.date}</p>
                                </div>
                            ))}
                            {intel.length === 0 && <div className="text-center py-40 opacity-20 font-black uppercase tracking-[0.3em] text-xs">No Active Alerts</div>}
                        </motion.div>
                    )}

                    {activeTab === 'schedule' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                const entries = timetable.filter(t => t.day === day);
                                return (
                                    <div key={day} className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-colors">
                                        <h4 className="text-purple-400 font-black uppercase tracking-widest text-xs mb-4 border-b border-white/5 pb-2">{day}</h4>
                                        <div className="space-y-3">
                                            {entries.length > 0 ? entries.map(t => (
                                                <div key={t.id} className="flex gap-4 items-center">
                                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono font-bold text-purple-200 w-20 text-center">{t.startTime}</div>
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
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col pb-32">
                            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-hide">
                                {doubts.map(d => (
                                    <div key={d.id} className="flex flex-col gap-2">
                                        <div className="self-end bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-5 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                                            <p className="text-[9px] font-black uppercase text-indigo-200 mb-2 tracking-widest">{d.subject}</p>
                                            <p className="text-sm font-medium">{d.queryText}</p>
                                        </div>
                                        {d.status === 'Answered' && (
                                            <div className="self-start bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl rounded-tl-sm max-w-[80%]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Faculty Response</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed">{d.replyText}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {doubts.length === 0 && <div className="text-center py-40 opacity-20 font-black uppercase tracking-[0.3em] text-xs">Secure Channel Open</div>}
                            </div>
                            <form onSubmit={handleDoubtSubmit} className="bg-[#111] p-2 rounded-[24px] border border-white/10 flex gap-2 shadow-2xl">
                                <input required placeholder="Subject..." value={doubtForm.subject} onChange={e => setDoubtForm({...doubtForm, subject: e.target.value})} className="w-1/3 bg-transparent px-6 py-4 text-xs font-bold text-white outline-none border-r border-white/10 placeholder:text-white/20" />
                                <input required placeholder="Transmission content..." value={doubtForm.queryText} onChange={e => setDoubtForm({...doubtForm, queryText: e.target.value})} className="flex-1 bg-transparent px-6 py-4 text-sm text-white outline-none placeholder:text-white/20" />
                                <button className="bg-indigo-600 text-white p-4 rounded-[20px] hover:bg-indigo-500 transition-all shadow-lg active:scale-95"><Send size={20} /></button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && <SettingsPanel student={student} refresh={() => {}} />}

                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showAttendanceHistory && <AttendanceModal attendance={attendance} onClose={() => setShowAttendanceHistory(false)} />}
            </AnimatePresence>

            {/* Floating Nav Dock */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center gap-2 shadow-2xl z-50 max-w-[95vw] overflow-x-auto scrollbar-hide">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => { 
                            if(item.action) item.action();
                            else setActiveTab(item.id); 
                        }}
                        className={`relative min-w-[60px] h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === item.id ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg -translate-y-2' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-widest scale-75">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.span layoutId="active-dot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};
