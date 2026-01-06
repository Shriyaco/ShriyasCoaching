
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, StudentQuery, AttendanceRecord, StudyNote, HomeworkSubmission, StudentOwnExam, LeaveApplication } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, Plus, Trash2, Award, ClipboardCheck, X, MessageSquare, Clock, Settings, Lock, Radio, Power, ChevronRight, LayoutDashboard, FileText, UserCheck, Menu, Loader2, Check, ExternalLink, Sparkles, AlertCircle, Send, Upload, Camera, Database, ShieldCheck, ChevronDown, Rocket, Waves } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- 3D AMBIENT BACKGROUND ---
const SpatialBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[#050508]" />
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20" />
    </div>
);

// --- ANIMATION VARIANTS ---
const pageTransition: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
};

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'live' | 'homework' | 'notes' | 'exams' | 'grading' | 'queries' | 'student-exams' | 'leaves' | 'settings'>('attendance');
    
    const [grades, setGrades] = useState<Grade[]>([]);
    const [availableSubdivisions, setAvailableSubdivisions] = useState<Subdivision[]>([]);
    const [selectedGradeId, setSelectedGradeId] = useState('');
    const [selectedDivisionId, setSelectedDivisionId] = useState('');

    const refreshGrades = useCallback(async () => {
        const g = await db.getGrades();
        setGrades(g);
        if(g.length > 0 && !selectedGradeId) setSelectedGradeId(g[0].id);
    }, [selectedGradeId]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (!storedUser) { navigate('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') { navigate('/'); return; }
        setUser(parsedUser);
        refreshGrades();
    }, [navigate, refreshGrades]);

    useEffect(() => {
        const loadSubs = async () => {
            if (selectedGradeId) {
                const subs = await db.getSubdivisions(selectedGradeId);
                setAvailableSubdivisions(subs);
                if (subs.length > 0 && !selectedDivisionId) {
                    setSelectedDivisionId(subs[0].id);
                }
            }
        }
        loadSubs();
    }, [selectedGradeId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'attendance', label: 'Registry', icon: UserCheck },
        { id: 'live', label: 'Warp', icon: Radio },
        { id: 'homework', label: 'Directives', icon: BookOpen },
        { id: 'notes', label: 'Vault', icon: Database },
        { id: 'exams', label: 'Assess', icon: PenTool },
        { id: 'grading', label: 'Review', icon: Award },
        { id: 'leaves', label: 'Permits', icon: Clock },
        { id: 'queries', label: 'Intel', icon: MessageSquare },
        { id: 'settings', label: 'Core', icon: Settings }
    ];

    const selectedDivision = availableSubdivisions.find(s => s.id === selectedDivisionId);

    return (
        <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <SpatialBackground />
            
            {/* --- IMMERSIVE TOP BAR --- */}
            <header className="relative z-50 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-10 w-auto invert relative z-10" />
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl rounded-full px-5 py-2 border border-white/5 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sector: {user?.username}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-inner">
                        <select className="bg-transparent text-[9px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                            {grades.map(g => <option key={g.id} value={g.id} className="bg-[#050508]">Grade {g.gradeName}</option>)}
                        </select>
                        <select className="bg-transparent text-[9px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                            {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#050508]">Div {s.divisionName}</option>)}
                        </select>
                    </div>
                    <button onClick={handleLogout} className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"><Power size={18}/></button>
                </div>
            </header>

            {/* --- MAIN CONTENT STAGE --- */}
            <main className="flex-1 px-8 md:px-20 py-10 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-40">
                            {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                            {activeTab === 'live' && <LiveModule division={selectedDivision} userName={user?.username || ''} />}
                            {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'notes' && <NotesModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'exams' && <ExamModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'grading' && <GradingModule />}
                            {activeTab === 'leaves' && <LeaveModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                            {activeTab === 'queries' && <IntelModule />}
                            {activeTab === 'settings' && <CoreSettings user={user!} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- THE FLOATING DOCK (3D PERSPECTIVE) --- */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
                <motion.nav 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#0A0A0E]/80 backdrop-blur-3xl border border-white/10 p-3 rounded-[32px] flex items-center gap-1 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative"
                >
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group relative flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-[24px] transition-all duration-500 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] -translate-y-2' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} className="relative z-10 transition-transform group-hover:scale-110" />
                            <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 transition-all ${activeTab === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="dock-glow" className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                            )}
                        </button>
                    ))}
                </motion.nav>
            </div>
        </div>
    );
};

// --- MODULE: ATTENDANCE (Creative Island) ---

const AttendanceModule = ({ gradeId, divisionId }: any) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});

    useEffect(() => {
        if (!gradeId || !divisionId) return;
        db.getStudents(gradeId, divisionId).then(st => {
            setStudents(st);
            const map: Record<string, 'Present' | 'Absent'> = {};
            st.forEach(s => map[s.id] = 'Present');
            setAttendanceMap(map);
        });
    }, [gradeId, divisionId]);

    const save = async () => {
        const records = students.map(s => ({ studentId: s.id, division_id: divisionId, date, status: attendanceMap[s.id] }));
        await db.markAttendance(records);
        alert('Registry Synchronized.');
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="space-y-2">
                    <h2 className="text-6xl md:text-8xl font-light serif-font italic luxury-text-gradient tracking-tighter">Registry.</h2>
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20 ml-2">Presence Management Protocol</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-4 rounded-[32px] border border-white/5 shadow-2xl">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest uppercase outline-none focus:border-indigo-500 transition-all" />
                    <button onClick={save} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">Sync All</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {students.map(s => (
                    <motion.div 
                        whileHover={{ y: -5, scale: 1.02 }}
                        key={s.id} 
                        className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[48px] border border-white/10 shadow-2xl flex items-center justify-between group transition-all relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-white/5 p-1 border border-white/10 shadow-inner overflow-hidden">
                                {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full rounded-full flex items-center justify-center font-black text-xl text-white/20">{s.name.charAt(0)}</div>}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold tracking-tight text-white/90">{s.name}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{s.studentCustomId}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`w-28 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white'}`}
                        >
                            {attendanceMap[s.id]}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE: LIVE CLASS (3D Portal) ---

const LiveModule = ({ division, userName }: any) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    if (!division) return null;

    const startLive = async () => {
        const meetingId = `SG_HUB_${division.id.slice(0, 8)}`;
        setIsInMeeting(true);
        await db.setLiveStatus(division.id, true, meetingId);
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-80 h-80 rounded-full border-4 border-dashed border-indigo-500/20 flex items-center justify-center p-8 relative"
                >
                    <motion.div 
                        animate={division.isLive ? { scale: [1, 1.1, 1], rotate: [0, -360] } : {}}
                        transition={{ duration: 10, repeat: Infinity }}
                        className={`w-full h-full rounded-full border-2 transition-all duration-1000 flex items-center justify-center ${division.isLive ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_100px_rgba(79,70,229,0.3)]' : 'bg-white/5 border-white/10'}`}
                    >
                        <Radio size={80} className={division.isLive ? 'text-white' : 'text-white/10'} strokeWidth={1} />
                    </motion.div>
                    {division.isLive && <div className="absolute inset-0 bg-indigo-500/10 blur-3xl animate-pulse rounded-full" />}
                </motion.div>
                {division.isLive && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl animate-bounce">Broadcasting</motion.span>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-6xl font-light serif-font italic luxury-text-gradient">Warp Portal.</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.8em]">Secure Dimensional Relay</p>
            </div>

            <div className="w-full max-w-sm space-y-6">
                {!division.isLive ? (
                    <button onClick={startLive} className="w-full bg-white text-black py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-500 hover:text-white transition-all">Initialize Gateway</button>
                ) : (
                    <>
                        <button onClick={() => setIsInMeeting(true)} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 transition-all">Enter Dimension</button>
                        <button onClick={async () => await db.setLiveStatus(division.id, false)} className="text-rose-500/50 hover:text-rose-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-3 mx-auto"><X size={14}/> Terminate Relay</button>
                    </>
                )}
            </div>

            {isInMeeting && division.liveMeetingId && <JitsiMeeting roomName={division.liveMeetingId} userName={userName} onClose={() => setIsInMeeting(false)} />}
        </div>
    );
};

// --- MODULE: HOMEWORK (Spatial List) ---

const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [list, setList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
                <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[60px] border border-white/10 shadow-2xl sticky top-10">
                    <h3 className="text-4xl font-light serif-font italic mb-12">New Directive.</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-8">
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-white/20 ml-2">Sector</label><input required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="SUBJECT IDENTITY" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-white/20 ml-2">Mission Payload</label><textarea required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500 h-32 resize-none" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="DIRECTIVE OBJECTIVES..." /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-white/20 ml-2">Sync Deadline</label><input required type="date" className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] shadow-xl hover:shadow-indigo-500/20 transition-all">Authorize Deployment</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
                {list.map(hw => (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={hw.id} className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 flex justify-between items-start group hover:bg-white/[0.04] transition-all shadow-xl">
                        <div className="flex-1">
                            <span className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.5em] mb-6 block border border-indigo-500/20 w-fit px-4 py-1.5 rounded-full">{hw.subject}</span>
                            <p className="text-3xl font-serif italic text-white/80 leading-snug tracking-tight">"{hw.task}"</p>
                            <p className="text-[10px] font-black uppercase text-white/20 mt-8 tracking-widest flex items-center gap-3"><Clock size={12}/> Due {hw.dueDate}</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Purge Directive?')){await db.deleteHomework(hw.id); load();}}} className="p-3 text-white/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE: VAULT (Notes with Image Support) ---

const NotesModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ subject: '', title: '', content: '', fileUrl: '' });
    
    const load = useCallback(() => { if(gradeId && divisionId) db.getNotes(gradeId, divisionId).then(setNotes); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, fileUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end pb-8 border-b border-white/10">
                <div>
                    <h3 className="text-6xl font-light serif-font italic luxury-text-gradient tracking-tighter">Vault.</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-2 ml-1">Academic Resource Repository</p>
                </div>
                <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">+ Archive Entry</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {notes.map(n => (
                    <motion.div whileHover={{ y: -10 }} key={n.id} className="bg-white/[0.03] p-10 rounded-[60px] border border-white/5 shadow-2xl flex flex-col h-full group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-all">
                             <Database size={100} />
                        </div>
                        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.5em] mb-10">{n.subject}</span>
                        <h4 className="text-3xl font-bold mb-6 text-white/90 leading-tight italic tracking-tighter">{n.title}</h4>
                        <p className="text-xs text-white/30 mb-10 line-clamp-3 leading-relaxed font-bold uppercase tracking-widest">{n.content}</p>
                        {n.fileUrl && (
                            <a href={n.fileUrl} target="_blank" className="w-full py-5 bg-white/5 border border-white/5 rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                                <ExternalLink size={14}/> Access Data
                            </a>
                        )}
                        <button onClick={async ()=>{if(confirm('Purge Archive?')){await db.deleteNote(n.id); load();}}} className="absolute top-8 right-8 text-white/5 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0E] border border-white/10 rounded-[80px] w-full max-w-xl p-16 relative shadow-2xl">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-12 right-12 text-white/20 hover:text-white"><X size={32}/></button>
                            <h3 className="text-5xl font-light serif-font mb-12 text-center italic luxury-text-gradient tracking-tighter">Registry Input.</h3>
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-6">
                                <input required placeholder="SUBJECT CATEGORY" className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[10px] font-black tracking-[0.5em] outline-none focus:border-emerald-500 transition-all" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="RESOURCE TITLE" className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[10px] font-black tracking-[0.5em] outline-none focus:border-emerald-500 transition-all" onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="SUMMARY OVERVIEW..." className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-xs outline-none focus:border-emerald-500 h-32 resize-none" onChange={e=>setForm({...form, content:e.target.value})} />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center relative hover:bg-white/10 transition-all group cursor-pointer shadow-inner">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="mx-auto text-emerald-500 mb-2" size={28} strokeWidth={1.5} />
                                        <p className="text-[9px] font-black uppercase text-white/30">Local Memory</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center relative hover:bg-white/10 transition-all group cursor-pointer shadow-inner">
                                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Camera className="mx-auto text-indigo-500 mb-2" size={28} strokeWidth={1.5} />
                                        <p className="text-[9px] font-black uppercase text-white/30">Capture Visual</p>
                                    </div>
                                </div>
                                
                                <button className="w-full bg-white text-black py-7 rounded-[40px] font-black text-xs uppercase tracking-[0.7em] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all">Commit to Vault</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- STUB MODULES (REUSE CORE DESIGNS) ---

const ExamModule = ({ gradeId, divisionId, teacherId }: any) => (
    <div className="py-20 text-center space-y-6">
        <PenTool size={80} className="mx-auto text-white/10" />
        <h3 className="text-4xl font-light serif-font italic opacity-30">Assessment Suite Active</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10">Protocol 4.0 Construction Required</p>
    </div>
);

const GradingModule = () => (
    <div className="py-20 text-center space-y-6">
        <Award size={80} className="mx-auto text-white/10" />
        <h3 className="text-4xl font-light serif-font italic opacity-30">Review Console Idle</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10">Awaiting External Relays</p>
    </div>
);

const LeaveModule = ({ gradeId, divisionId }: any) => (
    <div className="py-20 text-center space-y-6">
        <Clock size={80} className="mx-auto text-white/10" />
        <h3 className="text-4xl font-light serif-font italic opacity-30">Personnel Logs nominal</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10">No Exit Permits Pending</p>
    </div>
);

const IntelModule = () => (
    <div className="py-20 text-center space-y-6">
        <MessageSquare size={80} className="mx-auto text-white/10" />
        <h3 className="text-4xl font-light serif-font italic opacity-30">Intel Channel Secure</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10">Zero Unattended Transmissions</p>
    </div>
);

const CoreSettings = ({ user }: { user: User }) => (
    <div className="max-w-md mx-auto py-20">
        <div className="bg-white/[0.03] backdrop-blur-3xl p-16 rounded-[80px] border border-white/10 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
             <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-indigo-400 shadow-inner"><Lock size={40} /></div>
             <h3 className="text-4xl font-light serif-font mb-12 uppercase tracking-[0.3em] italic luxury-text-gradient">Control.</h3>
             <div className="space-y-6">
                <div className="bg-black/60 p-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/5">Identity Hash: {user.id.slice(0, 16)}</div>
                <button className="w-full py-6 bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] rounded-3xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">Authorize Key Refresh</button>
             </div>
        </div>
    </div>
);

export default TeacherDashboard;
