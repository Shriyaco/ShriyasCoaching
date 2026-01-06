
import React, { useState, useEffect, useCallback } from 'react';
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
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } }
};

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'live' | 'homework' | 'notes' | 'exams' | 'grading' | 'queries' | 'leaves' | 'settings'>('attendance');
    
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
            
            <header className="relative z-50 px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-7 w-auto invert opacity-80 cursor-pointer" onClick={() => navigate('/')} />
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 truncate max-w-[100px]">{user?.username}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-2 flex-1 sm:flex-none p-1 bg-white/5 rounded-xl border border-white/5">
                        <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-1.5 outline-none cursor-pointer border-r border-white/10" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                            {grades.map(g => <option key={g.id} value={g.id} className="bg-[#050508]">Grade {g.gradeName}</option>)}
                        </select>
                        <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-1.5 outline-none cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                            {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#050508]">Div {s.divisionName}</option>)}
                        </select>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20"><Power size={12}/></button>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-12 py-6 relative z-10 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto w-full">
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

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
                <nav className="bg-[#0A0A0E]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] flex items-center gap-1 shadow-2xl overflow-x-auto scrollbar-hide max-w-[95vw]">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group relative flex flex-col items-center justify-center min-w-[50px] md:min-w-[64px] h-[50px] md:h-[64px] rounded-[20px] transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:bg-white/5'}`}
                        >
                            <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className={`text-[7px] font-black uppercase tracking-widest mt-1 hidden md:block ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

// --- ATTENDANCE ---
const AttendanceModule = ({ gradeId, divisionId }: any) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});

    const load = useCallback(() => {
        if (!gradeId || !divisionId) return;
        db.getStudents(gradeId, divisionId).then(st => {
            setStudents(st);
            const map: Record<string, 'Present' | 'Absent'> = {};
            st.forEach(s => map[s.id] = 'Present');
            setAttendanceMap(map);
        });
    }, [gradeId, divisionId]);

    useEffect(() => { load(); }, [load]);

    const save = async () => {
        const records = students.map(s => ({ studentId: s.id, division_id: divisionId, date, status: attendanceMap[s.id] }));
        await db.markAttendance(records);
        alert('Registry Synchronized.');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Registry.</h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20 mt-1">Presence Management Protocol</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black outline-none text-white" />
                    <button onClick={save} className="bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Sync</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map(s => (
                    <div key={s.id} className="bg-white/[0.02] p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : <span className="text-xs font-black text-white/20">{s.name.charAt(0)}</span>}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-bold text-white/90 truncate max-w-[120px]">{s.name}</h4>
                                <p className="text-[7px] font-black uppercase text-white/20">{s.studentCustomId}</p>
                            </div>
                        </div>
                        <button onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {attendanceMap[s.id]}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- LIVE ---
const LiveModule = ({ division, userName }: any) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    if (!division) return <div className="py-20 text-center opacity-20">Sector Undefined</div>;
    const startLive = async () => {
        const meetingId = `SG_HUB_${division.id.slice(0, 8)}`;
        setIsInMeeting(true);
        await db.setLiveStatus(division.id, true, meetingId);
    };
    return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border flex items-center justify-center transition-all ${division.isLive ? 'bg-indigo-600/10 border-indigo-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                <Radio size={division.isLive ? 48 : 32} className={division.isLive ? 'text-white' : 'text-white/10'} />
            </div>
            <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient">Warp Portal.</h3>
            <div className="w-full max-w-xs space-y-3">
                {!division.isLive ? (
                    <button onClick={startLive} className="w-full bg-white text-black py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Initialize</button>
                ) : (
                    <>
                        <button onClick={() => setIsInMeeting(true)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Enter</button>
                        <button onClick={async () => await db.setLiveStatus(division.id, false)} className="text-rose-500/50 hover:text-rose-500 text-[8px] font-black uppercase flex items-center gap-1 mx-auto"><X size={12}/> Close</button>
                    </>
                )}
            </div>
            {isInMeeting && division.liveMeetingId && <JitsiMeeting roomName={division.liveMeetingId} userName={userName} onClose={() => setIsInMeeting(false)} />}
        </div>
    );
};

// --- HOMEWORK ---
const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [list, setList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-light serif-font italic mb-4">Directives.</h3>
                <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-4">
                    <input required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="Subject" />
                    <textarea required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white h-20 resize-none" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Task details..." />
                    <input required type="date" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
                    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest">Deploy</button>
                </form>
            </div>
            <div className="space-y-3">
                {list.map(hw => (
                    <div key={hw.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-start">
                        <div className="flex-1 overflow-hidden">
                            <span className="text-indigo-400 text-[7px] font-black uppercase block mb-1">{hw.subject}</span>
                            <p className="text-sm font-serif italic text-white/80 leading-snug truncate">"{hw.task}"</p>
                            <p className="text-[7px] font-black uppercase text-white/20 mt-2">Due: {hw.dueDate}</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Purge?')){await db.deleteHomework(hw.id); load();}}} className="p-2 text-white/10 hover:text-rose-500"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NOTES ---
const NotesModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ subject: '', title: '', content: '', fileUrl: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getNotes(gradeId, divisionId).then(setNotes); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-2xl font-light serif-font italic luxury-text-gradient">Vault.</h3>
                <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-4 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-widest">+ New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {notes.map(n => (
                    <div key={n.id} className="bg-white/[0.03] p-5 rounded-3xl border border-white/5 flex flex-col group relative">
                        <span className="text-emerald-400 text-[7px] font-black uppercase mb-3">{n.subject}</span>
                        <h4 className="text-lg font-bold mb-2 text-white/90 truncate italic">{n.title}</h4>
                        <p className="text-[9px] text-white/30 line-clamp-2 leading-relaxed mb-4">{n.content}</p>
                        <button onClick={async ()=>{if(confirm('Purge?')){await db.deleteNote(n.id); load();}}} className="absolute top-4 right-4 text-white/5 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                        <div className="bg-[#0A0A0E] border border-white/10 rounded-[32px] w-full max-w-md p-8 relative">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-6 right-6 text-white/20"><X/></button>
                            <h3 className="text-2xl font-light serif-font mb-6 text-center italic">Archive.</h3>
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-4">
                                <input required placeholder="Subject" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="Title" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white" onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="Content..." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white h-24" onChange={e=>setForm({...form, content:e.target.value})} />
                                <button className="w-full bg-white text-black py-3.5 rounded-xl font-black text-[9px] uppercase">Commit</button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- EXAMS ---
const ExamModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<any>({ title: '', subject: '', duration: 30, examDate: '', startTime: '', questions: [] });
    const load = useCallback(() => db.getExams(gradeId).then(setExams), [gradeId]);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-2xl font-light serif-font italic luxury-text-gradient">Assessments.</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-4 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-widest">+ Construct</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exams.map(e => (
                    <div key={e.id} className="bg-white/[0.03] p-5 rounded-3xl border border-white/5 flex flex-col group relative">
                        <span className="text-rose-400 text-[7px] font-black uppercase mb-3">{e.subject}</span>
                        <h4 className="text-lg font-bold mb-4 text-white/90 truncate italic">{e.title}</h4>
                        <div className="text-[8px] font-bold text-white/30 space-y-1 mb-4">
                            <p>Date: {e.examDate}</p>
                            <p>Start: {e.startTime}</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Purge?')){await db.deleteExam(e.id); load();}}} className="absolute top-4 right-4 text-white/5 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                        <div className="bg-[#0A0A0E] border border-white/10 rounded-[32px] w-full max-w-xl p-8 max-h-[80vh] overflow-y-auto scrollbar-hide relative">
                            <button onClick={()=>setIsCreating(false)} className="absolute top-6 right-6 text-white/20"><X/></button>
                            <h3 className="text-2xl font-light serif-font mb-6 text-center italic">Construct Assessment.</h3>
                            <form onSubmit={async(e)=>{e.preventDefault(); await db.addExam({ gradeId, subdivisionId: divisionId, ...form, totalMarks: form.questions.reduce((a:number,b:any)=>a+b.marks,0), createdBy: teacherId }); setIsCreating(false); load();}} className="space-y-4">
                                <input required placeholder="Title" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" onChange={e=>setForm({...form, title:e.target.value})} />
                                <input required placeholder="Subject" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input required type="date" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" onChange={e=>setForm({...form, examDate:e.target.value})} />
                                    <input required type="time" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" onChange={e=>setForm({...form, startTime:e.target.value})} />
                                </div>
                                <button type="button" onClick={()=>setForm({...form, questions:[...form.questions, {id:Math.random(), text:'', type:'mcq', marks:1}]})} className="text-[8px] font-black text-white/40 uppercase tracking-widest">+ Add Question</button>
                                <button className="w-full bg-white text-black py-3 rounded-xl font-black text-[9px] uppercase">Deploy Module</button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- GRADING ---
const GradingModule = () => {
    const [subs, setSubs] = useState<HomeworkSubmission[]>([]);
    const load = useCallback(() => db.getAllHomeworkSubmissions().then(all => setSubs(all.filter(s => s.status === 'Submitted'))), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-light serif-font italic luxury-text-gradient">Review Console.</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subs.map(sub => (
                    <div key={sub.id} className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-4">
                        <p className="text-[10px] font-black uppercase text-indigo-400">Student: {sub.studentId.slice(0, 10)}</p>
                        <p className="text-sm italic text-white/60">"{sub.submissionText}"</p>
                        <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="w-full py-2 bg-white text-black rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Check size={12}/> Confirm Review
                        </button>
                    </div>
                ))}
                {subs.length === 0 && <div className="py-20 text-center text-white/10 text-[8px] font-black uppercase tracking-[1em]">Log Nominal</div>}
            </div>
        </div>
    );
};

// --- LEAVES ---
const LeaveModule = ({ gradeId, divisionId }: any) => {
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const load = useCallback(() => { if(gradeId && divisionId) db.getLeaveApplications(undefined, gradeId, divisionId).then(setLeaves); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);
    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => { await db.updateLeaveStatus(id, status); load(); };
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-light serif-font italic luxury-text-gradient">Personnel Logs.</h3>
            <div className="space-y-3">
                {leaves.map(l => (
                    <div key={l.id} className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                            <h4 className="text-base font-bold text-white italic">{l.studentName}</h4>
                            <p className="text-[9px] text-white/30 uppercase mt-1">{l.reason}</p>
                            <p className="text-[7px] text-white/20 mt-2 font-mono">{l.startDate} » {l.endDate}</p>
                        </div>
                        {l.status === 'Pending' ? (
                            <div className="flex gap-2">
                                <button onClick={()=>handleAction(l.id, 'Approved')} className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Check size={16}/></button>
                                <button onClick={()=>handleAction(l.id, 'Rejected')} className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20"><X size={16}/></button>
                            </div>
                        ) : <span className="text-[8px] font-black uppercase text-white/20 tracking-widest border border-white/5 px-3 py-1 rounded-full">{l.status}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- INTEL (QUERIES) ---
const IntelModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-light serif-font italic luxury-text-gradient">Intel Hub.</h3>
            <div className="space-y-4">
                {queries.map(q => (
                    <div key={q.id} className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">{q.studentName} // {q.subject}</h4>
                            <span className="text-[7px] font-bold text-white/20">{q.status}</span>
                        </div>
                        <p className="text-sm italic text-white/80">"{q.queryText}"</p>
                        {q.status === 'Unanswered' ? (
                            <div className="flex gap-2">
                                <input className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" placeholder="Transmission reply..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} />
                                <button onClick={async()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black p-2 rounded-xl transition-transform active:scale-90"><Send size={14}/></button>
                            </div>
                        ) : <p className="text-[10px] text-emerald-400 font-medium border-t border-white/5 pt-3">Resp: {q.replyText}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SETTINGS ---
const CoreSettings = ({ user }: { user: User }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Hash mismatch.');
        setLoading(true);
        try { 
            await db.changePassword(user.id, 'teacher', form.current, form.new); 
            alert('Security keys updated.'); 
            setForm({current:'',new:'',confirm:''}); 
        } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-xs mx-auto py-10 space-y-6 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 text-indigo-400"><Lock size={24} /></div>
            <h3 className="text-xl font-bold">Terminal Core.</h3>
            <form onSubmit={update} className="space-y-4">
                <input required type="password" placeholder="CURRENT KEY" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white font-mono tracking-widest text-center" />
                <input required type="password" placeholder="NEW KEY" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white font-mono tracking-widest text-center" />
                <input required type="password" placeholder="VERIFY KEY" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white font-mono tracking-widest text-center" />
                <button disabled={loading} className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl">{loading ? 'SYNCING...' : 'REFRESH CREDENTIALS'}</button>
            </form>
        </div>
    );
};

export default TeacherDashboard;
