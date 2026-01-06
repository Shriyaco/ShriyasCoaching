
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
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[#020204]" />
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-purple-600/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:30px_30px] opacity-20" />
    </div>
);

// --- ANIMATION VARIANTS ---
const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
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
        <div className="min-h-screen bg-[#020204] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <SpatialBackground />
            
            {/* --- TOP BAR (FIXED HEIGHT, CLEAN GRID) --- */}
            <header className="relative z-50 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-8 w-auto invert opacity-80" onClick={() => navigate('/')} />
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate max-w-[100px]">{user?.username}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-2 flex-1 sm:flex-none p-1 bg-white/5 rounded-xl border border-white/5">
                        <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-2 outline-none cursor-pointer border-r border-white/10" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                            {grades.map(g => <option key={g.id} value={g.id} className="bg-[#050508]">Grade {g.gradeName}</option>)}
                        </select>
                        <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-2 outline-none cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                            {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#050508]">Div {s.divisionName}</option>)}
                        </select>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20"><Power size={14}/></button>
                </div>
            </header>

            {/* --- MAIN STAGE --- */}
            <main className="flex-1 px-4 md:px-12 py-6 relative z-10 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-32">
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

            {/* --- DOCK NAVIGATION (RESPONSIVE SIZING) --- */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
                <nav className="bg-[#0A0A0E]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] flex items-center gap-1 shadow-2xl overflow-x-auto scrollbar-hide max-w-[95vw]">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group relative flex flex-col items-center justify-center min-w-[56px] md:min-w-[70px] h-[56px] md:h-[70px] rounded-[20px] transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:bg-white/5'}`}
                        >
                            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className={`text-[7px] font-black uppercase tracking-widest mt-1 hidden md:block ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="dock-dot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

// --- COMPONENT: ATTENDANCE ---

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
        <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-4xl md:text-6xl font-light serif-font italic luxury-text-gradient tracking-tighter">Registry.</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20 mt-1">Presence Management Protocol</p>
                </div>
                <div className="flex flex-col xs:flex-row gap-3 bg-white/5 p-3 rounded-[24px] border border-white/5">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black tracking-widest uppercase outline-none focus:border-indigo-500 text-white" />
                    <button onClick={save} className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 transition-all">Sync All</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(s => (
                    <div key={s.id} className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : <span className="text-sm font-black text-white/20">{s.name.charAt(0)}</span>}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-base font-bold text-white/90 truncate max-w-[120px]">{s.name}</h4>
                                <p className="text-[8px] font-black uppercase text-white/20">{s.studentCustomId}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                        >
                            {attendanceMap[s.id]}
                        </button>
                    </div>
                ))}
            </div>
            {students.length === 0 && <div className="py-20 text-center text-white/10 font-black uppercase tracking-widest text-xs">No active units in sector.</div>}
        </div>
    );
};

// --- COMPONENT: LIVE ---

const LiveModule = ({ division, userName }: any) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    if (!division) return <div className="py-20 text-center opacity-20">Sector Undefined</div>;

    const startLive = async () => {
        const meetingId = `SG_HUB_${division.id.slice(0, 8)}`;
        setIsInMeeting(true);
        await db.setLiveStatus(division.id, true, meetingId);
    };

    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-10">
            <div className={`w-40 h-40 md:w-60 md:h-60 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${division.isLive ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-pulse' : 'bg-white/5 border-white/10'}`}>
                <Radio size={division.isLive ? 64 : 40} className={division.isLive ? 'text-white' : 'text-white/10'} />
            </div>

            <div className="space-y-2">
                <h3 className="text-4xl md:text-6xl font-light serif-font italic luxury-text-gradient">Warp Portal.</h3>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">Dimensional Relay Status: {division.isLive ? 'ACTIVE' : 'IDLE'}</p>
            </div>

            <div className="w-full max-w-xs space-y-4">
                {!division.isLive ? (
                    <button onClick={startLive} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Initialize Gateway</button>
                ) : (
                    <>
                        <button onClick={() => setIsInMeeting(true)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Enter Dimension</button>
                        <button onClick={async () => await db.setLiveStatus(division.id, false)} className="text-rose-500/50 hover:text-rose-500 text-[9px] font-black uppercase flex items-center gap-2 mx-auto"><X size={14}/> Close Relay</button>
                    </>
                )}
            </div>

            {isInMeeting && division.liveMeetingId && <JitsiMeeting roomName={division.liveMeetingId} userName={userName} onClose={() => setIsInMeeting(false)} />}
        </div>
    );
};

// --- COMPONENT: HOMEWORK ---

const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [list, setList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
                <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-light serif-font italic mb-8">New Directive.</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-6">
                        <input required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="Subject" />
                        <textarea required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500 h-24 resize-none" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Directives..." />
                        <input required type="date" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
                        <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Deploy</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
                {list.map(hw => (
                    <div key={hw.id} className="bg-white/[0.02] p-6 rounded-[24px] border border-white/5 flex justify-between items-start group">
                        <div className="flex-1 overflow-hidden">
                            <span className="text-indigo-400 text-[8px] font-black uppercase mb-3 block">{hw.subject}</span>
                            <p className="text-lg font-serif italic text-white/80 leading-snug truncate">"{hw.task}"</p>
                            <p className="text-[8px] font-black uppercase text-white/20 mt-4">Due: {hw.dueDate}</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Purge?')){await db.deleteHomework(hw.id); load();}}} className="p-2 text-white/10 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: NOTES ---

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
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient">Vault.</h3>
                <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest">+ Entry</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(n => (
                    <div key={n.id} className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 flex flex-col group relative">
                        <span className="text-emerald-400 text-[8px] font-black uppercase mb-4">{n.subject}</span>
                        <h4 className="text-xl font-bold mb-3 text-white/90 truncate italic">{n.title}</h4>
                        <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed mb-6 font-bold uppercase">{n.content}</p>
                        {n.fileUrl && (
                            <a href={n.fileUrl} target="_blank" className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center">Data Link</a>
                        )}
                        <button onClick={async ()=>{if(confirm('Purge?')){await db.deleteNote(n.id); load();}}} className="absolute top-4 right-4 text-white/5 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                        <div className="bg-[#0A0A0E] border border-white/10 rounded-[32px] w-full max-w-md p-8 relative shadow-2xl">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-6 right-6 text-white/20"><X/></button>
                            <h3 className="text-2xl font-light serif-font mb-6 text-center italic">Archive.</h3>
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-4">
                                <input required placeholder="Subject" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="Title" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none" onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="Overview..." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs h-24" onChange={e=>setForm({...form, content:e.target.value})} />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center relative group">
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="mx-auto text-emerald-500 mb-1" size={20} />
                                        <p className="text-[8px] font-black uppercase opacity-40">Library</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center relative group">
                                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Camera className="mx-auto text-indigo-500 mb-1" size={20} />
                                        <p className="text-[8px] font-black uppercase opacity-40">Camera</p>
                                    </div>
                                </div>
                                <button className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase">Commit</button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- STUBS ---

const ExamModule = ({ gradeId, divisionId, teacherId }: any) => (
    <div className="py-20 text-center opacity-20"><PenTool size={48} className="mx-auto mb-4" /><p className="text-xs uppercase font-black tracking-widest">Assessment Matrix Offline</p></div>
);
const GradingModule = () => (
    <div className="py-20 text-center opacity-20"><Award size={48} className="mx-auto mb-4" /><p className="text-xs uppercase font-black tracking-widest">Review Console Idle</p></div>
);
const LeaveModule = ({ gradeId, divisionId }: any) => (
    <div className="py-20 text-center opacity-20"><Clock size={48} className="mx-auto mb-4" /><p className="text-xs uppercase font-black tracking-widest">Personnel Logs Nominal</p></div>
);
const IntelModule = () => (
    <div className="py-20 text-center opacity-20"><MessageSquare size={48} className="mx-auto mb-4" /><p className="text-xs uppercase font-black tracking-widest">Intel Channel Secure</p></div>
);
const CoreSettings = ({ user }: { user: User }) => (
    <div className="max-w-xs mx-auto py-10 text-center space-y-6">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 text-indigo-400"><Lock size={24} /></div>
        <div className="space-y-1">
            <h3 className="text-xl font-bold">Terminal Core</h3>
            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">ID: {user.id.slice(0, 12)}</p>
        </div>
        <button className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl">Refresh Credentials</button>
    </div>
);

export default TeacherDashboard;
