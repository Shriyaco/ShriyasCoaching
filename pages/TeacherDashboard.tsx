
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, StudentQuery, AttendanceRecord, StudyNote, HomeworkSubmission, StudentOwnExam, LeaveApplication } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, Plus, Trash2, Award, ClipboardCheck, X, MessageSquare, Clock, Settings, Lock, Radio, Power, ChevronRight, LayoutDashboard, FileText, UserCheck, Menu, Loader2, Check, ExternalLink, Sparkles, AlertCircle, Send, Upload, Camera } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
};

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'live' | 'homework' | 'notes' | 'exams' | 'grading' | 'queries' | 'student-exams' | 'leaves' | 'settings'>('attendance');
    
    const [grades, setGrades] = useState<Grade[]>([]);
    const [availableSubdivisions, setAvailableSubdivisions] = useState<Subdivision[]>([]);
    const [selectedGradeId, setSelectedGradeId] = useState('');
    const [selectedDivisionId, setSelectedDivisionId] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        const sub = db.subscribe('subdivisions', loadSubs);
        return () => db.unsubscribe(sub);
    }, [selectedGradeId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'live', label: 'Virtual Hub', icon: Radio },
        { id: 'homework', label: 'Assignments', icon: BookOpen },
        { id: 'notes', label: 'Resources', icon: FileText },
        { id: 'exams', label: 'Assessments', icon: PenTool },
        { id: 'grading', label: 'Review', icon: Award },
        { id: 'student-exams', label: 'Student Exams', icon: Calendar },
        { id: 'leaves', label: 'Leave Req.', icon: Clock },
        { id: 'queries', label: 'Queries', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const selectedDivision = availableSubdivisions.find(s => s.id === selectedDivisionId);

    return (
        <div className="min-h-screen bg-[#020204] text-white flex font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`w-72 bg-[#080808]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed inset-y-0 z-50 transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                        <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-10 w-auto invert opacity-90 brightness-200" />
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white/40"><X size={20}/></button>
                    </div>
                    
                    <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={16} strokeWidth={activeTab === item.id ? 3 : 2} className={activeTab === item.id ? 'text-white' : 'text-white/20 group-hover:text-white/60'} />
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="bg-white/5 p-4 rounded-[24px] border border-white/5 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xs shadow-lg">{user?.username.charAt(0)}</div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest truncate text-white">{user?.username}</p>
                                <p className="text-[8px] text-white/30 uppercase font-bold tracking-tighter">Verified Faculty</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-transparent hover:border-rose-500/20"><LogOut size={14}/> Sign Out</button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
                <header className="h-28 bg-[#020204]/60 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white/40 hover:text-white transition-colors p-3 bg-white/5 rounded-2xl border border-white/10">
                            <Menu size={20}/>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={10} className="text-indigo-400" />
                                <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">Control Center</h2>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-light serif-font tracking-tight capitalize text-white italic">{activeTab.replace('-', ' ')}</h1>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-3 p-2 bg-[#0A0A0A] border border-white/5 rounded-[24px]">
                         <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Class</span>
                            <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white cursor-pointer" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                                {grades.map(g => <option key={g.id} value={g.id} className="bg-[#0A0A0A]">Grade {g.gradeName}</option>)}
                            </select>
                         </div>
                         <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Section</span>
                            <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                                {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#0A0A0A]">Div {s.divisionName}</option>)}
                            </select>
                         </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-12 overflow-y-auto scrollbar-hide">
                    <div className="max-w-6xl w-full mx-auto pb-40">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                                {activeTab === 'live' && <LiveManagementModule division={selectedDivision} userName={user?.username || ''} />}
                                {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                                {activeTab === 'notes' && <NotesModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                                {activeTab === 'exams' && <ExamBuilderModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                                {activeTab === 'grading' && <GradingModule />}
                                {activeTab === 'student-exams' && <StudentExamsView gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                                {activeTab === 'leaves' && <LeaveRequestsView gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                                {activeTab === 'queries' && <QueriesModule />}
                                {activeTab === 'settings' && <SettingsSection user={user!} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

// --- Sub-Modules (Enhanced Design) ---

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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6 pb-12 border-b border-white/5">
                <div>
                    <h3 className="text-4xl font-light serif-font mb-3 italic">Class Registry.</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Daily Attendance Protocol</p>
                </div>
                <div className="flex items-center gap-4 bg-[#0A0A0A] p-2 rounded-[24px] border border-white/5 shadow-2xl">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest uppercase outline-none focus:border-indigo-500/50 transition-all text-white" />
                    <button onClick={save} className="bg-white text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">Commit Updates</button>
                </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {students.map(s => (
                    <motion.div variants={itemVariants} key={s.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/5">
                        <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">{s.name.charAt(0)}</div>
                             <div>
                                <p className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">{s.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-1">{s.studentCustomId}</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}
                        >
                            {attendanceMap[s.id]}
                        </button>
                    </motion.div>
                ))}
            </div>
            {students.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">No Students Registered</motion.div>}
        </div>
    );
};

const LiveManagementModule = ({ division, userName }: { division?: Subdivision, userName: string }) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [tempMeetingId, setTempMeetingId] = useState<string | null>(null);
    
    if (!division) return <div className="py-40 text-center text-white/10 font-black uppercase text-[10px] tracking-[0.5em] border border-dashed border-white/5 rounded-[48px]">Context Required</div>;

    const startLive = async () => {
        const meetingId = `SG_${division.id.replace(/-/g, '')}`;
        setIsInitializing(true);
        setTempMeetingId(meetingId);
        
        try {
            setIsInMeeting(true);
            await db.setLiveStatus(division.id, true, meetingId);
        } catch (e) {
            console.error(e);
        } finally {
            setIsInitializing(false);
        }
    };

    const stopLive = async () => {
        try {
            await db.setLiveStatus(division.id, false);
            setIsInMeeting(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-xl mx-auto py-24 text-center">
            <motion.div 
                animate={division.isLive || isInMeeting ? { scale: [1, 1.05, 1], borderColor: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.6)', 'rgba(99,102,241,0.2)'] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                className={`w-40 h-40 rounded-full mx-auto mb-16 flex items-center justify-center border-4 transition-all duration-1000 ${division.isLive || isInMeeting ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.2)]' : 'bg-white/5 border-white/5'}`}
            >
                {isInitializing ? (
                    <Loader2 size={64} className="text-indigo-400 animate-spin" strokeWidth={1} />
                ) : (
                    <Radio size={64} className={division.isLive || isInMeeting ? 'text-indigo-400' : 'text-white/5'} strokeWidth={1} />
                )}
            </motion.div>
            <h3 className="text-5xl font-light serif-font mb-4 italic">Virtual Hub.</h3>
            <p className="text-white/30 uppercase text-[10px] font-black tracking-[0.8em] mb-16">Transmission status: {division.isLive ? 'Online' : 'Standby'}</p>
            
            <div className="space-y-8">
                {!division.isLive ? (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startLive} 
                        disabled={isInitializing}
                        className="w-full bg-white text-black py-7 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl disabled:opacity-50"
                    >
                        {isInitializing ? 'Establishing Connection...' : 'Initialize Portal'}
                    </motion.button>
                ) : (
                    <div className="space-y-6">
                        <button onClick={() => setIsInMeeting(true)} className="w-full bg-indigo-600 text-white py-7 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20">Re-enter Classroom</button>
                        <button onClick={stopLive} className="text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 mx-auto mt-4"><Power size={14}/> Terminate Stream</button>
                    </div>
                )}
            </div>

            {isInMeeting && (division.liveMeetingId || tempMeetingId) && (
                <JitsiMeeting 
                    roomName={division.liveMeetingId || tempMeetingId || ''} 
                    userName={userName} 
                    onClose={() => setIsInMeeting(false)} 
                />
            )}
        </div>
    );
};

const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setHomeworkList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.div variants={itemVariants} className="lg:col-span-5">
                <div className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 sticky top-32 shadow-2xl">
                    <h3 className="text-3xl font-light serif-font mb-12 italic">Draft Assignment.</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-8">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Department</label><input required className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="e.g. Mathematics" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Task Protocol</label><textarea required className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500/50 h-40 resize-none transition-all" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Input requirements..." /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Completion Date</label><input required type="date" className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-mono" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-500 hover:text-white transition-all mt-4 shadow-xl active:scale-95">Publish Protocol</button>
                    </form>
                </div>
            </motion.div>
            <div className="lg:col-span-7 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/10 mb-8 ml-4">Deployment Log</h4>
                {homeworkList.map(hw => (
                    <motion.div variants={itemVariants} key={hw.id} className="bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5 flex justify-between items-start group hover:border-indigo-500/20 transition-all shadow-lg hover:shadow-indigo-500/5">
                        <div className="flex-1">
                            <div className="flex items-center gap-5 mb-8">
                                <span className="text-indigo-400 font-black text-[9px] uppercase tracking-[0.4em] bg-indigo-500/10 px-5 py-2 rounded-xl border border-indigo-500/20">{hw.subject}</span>
                                <div className="flex items-center gap-2 text-white/20">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Due: {hw.dueDate}</span>
                                </div>
                            </div>
                            <p className="text-2xl text-white/70 font-serif italic leading-relaxed tracking-tight">"{hw.task}"</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Delete assignment?')){await db.deleteHomework(hw.id); load();}}} className="p-4 text-white/5 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} strokeWidth={1.5}/></button>
                    </motion.div>
                ))}
                {homeworkList.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center border-2 border-dashed border-white/5 rounded-[60px] text-white/5 font-black uppercase text-[11px] tracking-[0.8em]">Archive Clear</motion.div>}
            </div>
        </div>
    );
};

const NotesModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ subject: '', title: '', content: '', fileUrl: '' });
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, fileUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const load = useCallback(() => { if(gradeId && divisionId) db.getNotes(gradeId, divisionId).then(setNotes); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-16">
            <motion.div variants={itemVariants} className="flex justify-between items-center pb-12 border-b border-white/5">
                 <h3 className="text-4xl font-light serif-font italic">Resource Vault.</h3>
                 <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-12 py-4 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95">+ New Entry</button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map(n => (
                    <motion.div variants={itemVariants} key={n.id} className="bg-[#0A0A0A] p-12 rounded-[56px] border border-white/5 group hover:border-emerald-500/20 flex flex-col h-full relative transition-all shadow-lg hover:shadow-emerald-500/5">
                        <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={async ()=>{if(confirm('Erase Entry?')){await db.deleteNote(n.id); load();}}} className="text-white/10 hover:text-rose-500"><Trash2 size={20} strokeWidth={1.5}/></button>
                        </div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-10 block">{n.subject}</span>
                        <h4 className="text-2xl font-bold mb-8 flex-1 leading-tight text-white/90 italic tracking-tight">{n.title}</h4>
                        <p className="text-sm text-white/30 mb-12 line-clamp-4 leading-relaxed font-medium">{n.content}</p>
                        {n.fileUrl && (
                            <div className="space-y-4">
                                {n.fileUrl.startsWith('data:image') && (
                                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                                        <img src={n.fileUrl} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <a href={n.fileUrl} target="_blank" className="w-full py-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white/10 transition-all hover:text-emerald-400">
                                    <ExternalLink size={14}/> Access Media
                                </a>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
            {notes.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">Knowledge Base Dormant</motion.div>}
            
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#0A0A0A] border border-white/10 rounded-[60px] w-full max-w-xl p-16 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-12 right-12 text-white/20 hover:text-white transition-colors p-2"><X size={28}/></button>
                            <h3 className="text-3xl font-light serif-font mb-8 text-center uppercase tracking-[0.4em] luxury-text-gradient">Vault Submission</h3>
                            
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                <input required placeholder="DEPARTMENT" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-emerald-500/50 transition-all" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="RESOURCE LABEL" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-emerald-500/50 transition-all" onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="SUMMARY DATA" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-emerald-500/50 h-32 resize-none transition-all" onChange={e=>setForm({...form, content:e.target.value})} />
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Visual Resource (Optional)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center relative hover:bg-white/10 transition-all group">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                            <p className="text-[9px] font-bold uppercase text-white/40">From Gallery</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center relative hover:bg-white/10 transition-all group">
                                            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Camera className="mx-auto text-indigo-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                            <p className="text-[9px] font-bold uppercase text-white/40">Use Camera</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none text-white/20"><ExternalLink size={14}/></div>
                                        <input placeholder="...OR PASTE RESOURCE URL" className="w-full bg-black/50 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-[10px] font-black tracking-[0.4em] outline-none focus:border-emerald-500/50 transition-all" value={form.fileUrl} onChange={e=>setForm({...form, fileUrl:e.target.value})} />
                                    </div>
                                </div>
                                
                                {form.fileUrl && form.fileUrl.startsWith('data:image') && (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <img src={form.fileUrl} className="w-full h-full object-contain" />
                                        <button onClick={() => setForm({ ...form, fileUrl: '' })} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/80 hover:text-white transition-all"><X size={14}/></button>
                                    </div>
                                )}

                                <button className="w-full bg-white text-black py-7 rounded-[32px] font-black text-[12px] uppercase tracking-[0.6em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95 shrink-0">Encrypt & Store</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ExamBuilderModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<any>({ title: '', subject: '', duration: 30, examDate: '', startTime: '', questions: [] });
    const load = useCallback(() => db.getExams(gradeId).then(setExams), [gradeId]);
    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await db.addExam({ gradeId, subdivisionId: divisionId, ...form, totalMarks: form.questions.reduce((a:number,b:any)=>a+b.marks, 0), createdBy: teacherId });
        setIsCreating(false); setForm({ title: '', subject: '', duration: 30, examDate: '', startTime: '', questions: [] }); load();
    };

    return (
        <div className="space-y-16">
            <motion.div variants={itemVariants} className="flex justify-between items-center pb-12 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font italic">Assessment Matrix.</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-12 py-4 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-95">Construct Assessment</button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exams.map(e => (
                    <motion.div variants={itemVariants} key={e.id} className="bg-[#0A0A0A] p-12 rounded-[56px] border border-white/5 group hover:border-rose-500/20 flex flex-col h-full transition-all shadow-lg hover:shadow-rose-500/5">
                        <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.5em] mb-10 block">{e.subject}</span>
                        <h4 className="text-2xl font-bold mb-10 flex-1 text-white/90 leading-tight tracking-tight italic">{e.title}</h4>
                        <div className="flex items-center gap-6 text-white/20 text-[10px] font-black uppercase mb-12 border-t border-white/5 pt-10">
                             <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Calendar size={12}/> {e.examDate}</span>
                             <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Clock size={12}/> {e.startTime}</span>
                        </div>
                        <button onClick={async ()=>{if(confirm('Withdraw Paper?')){await db.deleteExam(e.id); load();}}} className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500/30 hover:text-rose-400 transition-colors self-start border-b border-rose-500/10 pb-1">Decommission Module</button>
                    </motion.div>
                ))}
            </div>
            {exams.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">Assessments Offline</motion.div>}
            
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl">
                        <motion.div initial={{ scale: 0.98, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#0A0A0A] rounded-[60px] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-16 md:p-20 border border-white/10 relative shadow-2xl custom-scrollbar">
                            <button onClick={()=>setIsCreating(false)} className="absolute top-12 right-12 text-white/20 hover:text-white transition-colors p-2"><X size={32}/></button>
                            <h3 className="text-4xl font-light serif-font mb-16 text-center uppercase tracking-[0.6em] luxury-text-gradient">Protocol Construction</h3>
                            <form onSubmit={handleSubmit} className="space-y-16">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Label</label><input required placeholder="ASSESSMENT TITLE" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-rose-500/50 transition-all" onChange={e=>setForm({...form, title:e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Department</label><input required placeholder="SUBJECT" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-rose-500/50 transition-all" onChange={e=>setForm({...form, subject:e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Target Date</label><input required type="date" className="w-full bg-black/50 border border-white/10 rounded-2xl px-8 py-6 text-[10px] font-black outline-none focus:border-rose-500/50 uppercase transition-all font-mono" onChange={e=>setForm({...form, examDate:e.target.value})}/></div>
                                </div>
                                <div className="space-y-10">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-8"><h4 className="text-[11px] font-black uppercase tracking-[0.8em] text-white/10">Inventory Blocks</h4><button type="button" onClick={()=>setForm({...form, questions: [...form.questions, { id: Math.random().toString(), text: '', type: 'mcq', marks: 1 }]})} className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg">+ Add Block</button></div>
                                    <div className="space-y-8">
                                        {form.questions.map((q: any, idx: number) => (
                                            <div key={q.id} className="bg-white/[0.02] p-12 rounded-[40px] flex gap-12 items-start border border-white/5 transition-all hover:bg-white/[0.03] shadow-inner relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/20 group-hover:bg-rose-500 transition-colors" />
                                                <span className="font-serif italic text-5xl text-white/5 font-black">0{idx+1}</span>
                                                <div className="flex-1 space-y-10">
                                                    <input required placeholder="Define query content..." className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-rose-500 text-2xl font-light tracking-tight italic" onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} />
                                                    <div className="flex gap-16">
                                                        <div className="flex items-center gap-6"><span className="text-[10px] font-black text-white/10 uppercase tracking-widest">MODE:</span><select className="bg-transparent text-white/40 text-[11px] font-black uppercase tracking-[0.3em] outline-none cursor-pointer" onChange={e=>{const qs=[...form.questions]; qs[idx].type=e.target.value; setForm({...form, questions:qs})}}><option value="mcq" className="bg-[#0A0A0A]">Objective</option><option value="short" className="bg-[#0A0A0A]">Subjective</option></select></div>
                                                        <div className="flex items-center gap-6"><span className="text-[10px] font-black text-white/10 uppercase tracking-widest">PTS:</span><input type="number" placeholder="0" className="bg-transparent text-white/40 text-[11px] font-black uppercase tracking-[0.3em] outline-none w-20 border-b border-white/5 focus:border-rose-500 transition-all" onChange={e=>{const qs=[...form.questions]; qs[idx].marks=parseInt(e.target.value); setForm({...form, questions:qs})}} /></div>
                                                    </div>
                                                </div>
                                                <button onClick={()=>setForm({...form, questions: form.questions.filter((item:any)=>item.id!==q.id)})} className="p-4 text-white/5 hover:text-rose-500 transition-colors"><X size={24}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-8 pt-12 border-t border-white/5">
                                    <button type="button" onClick={()=>setIsCreating(false)} className="flex-1 py-7 border border-white/10 rounded-[32px] font-black text-[12px] uppercase tracking-[0.6em] hover:bg-white/5 transition-all text-white/20">Cancel Project</button>
                                    <button className="flex-1 py-7 bg-white text-black rounded-[32px] font-black text-[12px] uppercase tracking-[0.6em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-95">Deploy Protocol</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GradingModule = () => {
    const [subs, setSubs] = useState<HomeworkSubmission[]>([]);
    const load = useCallback(() => db.getAllHomeworkSubmissions().then(all => setSubs(all.filter(s => s.status === 'Submitted'))), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="max-w-4xl mx-auto space-y-16">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font italic">Validation Deck.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mt-3">Pending Verification Queue</p>
            </motion.div>
            <div className="space-y-8">
                {subs.map(sub => (
                    <motion.div variants={itemVariants} key={sub.id} className="bg-[#0A0A0A] p-12 rounded-[56px] border border-white/5 flex flex-col items-start gap-8 hover:border-indigo-500/30 transition-all shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl pointer-events-none" />
                        <div className="flex justify-between w-full border-b border-white/5 pb-6">
                            <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">Transmission ID: {sub.studentId.slice(0,8)}</p>
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{sub.submittedAt}</p>
                        </div>
                        <p className="text-3xl italic text-white/70 leading-relaxed font-serif tracking-tight">"{sub.submissionText}"</p>
                        {sub.imageUrl && (
                            <div className="w-full bg-white/5 border border-white/5 rounded-[32px] p-8">
                                <p className="text-[10px] font-black uppercase text-white/20 mb-6 tracking-[0.4em]">Static Capture</p>
                                <div className="relative group/img overflow-hidden rounded-2xl w-fit">
                                    <img src={sub.imageUrl} className="max-w-md rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover/img:scale-105" alt="Submission" />
                                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )}
                        <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="w-full bg-white text-black py-6 rounded-[32px] font-black text-[12px] uppercase tracking-[0.6em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                            <Check size={18} strokeWidth={3}/> Validate Transmission
                        </button>
                    </motion.div>
                ))}
                {subs.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">Queue Terminal Clean</motion.div>}
            </div>
        </div>
    );
};

const StudentExamsView = ({ gradeId, divisionId }: { gradeId: string, divisionId: string }) => {
    const [exams, setExams] = useState<StudentOwnExam[]>([]);
    
    useEffect(() => {
        if(gradeId && divisionId) {
            db.getStudentExams(undefined, gradeId, divisionId).then(setExams);
        }
    }, [gradeId, divisionId]);

    return (
        <div className="max-w-4xl mx-auto space-y-16">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font italic">Upcoming Syncs.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mt-3">Student Identified Assessments</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-6">
                {exams.map(ex => (
                    <motion.div variants={itemVariants} key={ex.id} className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 flex items-center justify-between hover:border-indigo-500/20 shadow-lg transition-all group">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 font-black italic shadow-inner group-hover:scale-110 transition-transform">{ex.studentName.charAt(0)}</div>
                            <div>
                                <div className="flex gap-4 items-center mb-3">
                                    <h4 className="text-xl font-bold text-white italic">{ex.subject}</h4>
                                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-indigo-500/20">{ex.studentName}</span>
                                </div>
                                <p className="text-sm text-white/30 font-medium tracking-tight">Focus: {ex.description}</p>
                            </div>
                        </div>
                        <div className="text-right bg-white/5 p-6 rounded-[32px] border border-white/5 min-w-[140px]">
                            <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em] mb-2">Sync Date</p>
                            <p className="text-xl font-mono text-white font-bold tracking-tighter">{ex.examDate}</p>
                        </div>
                    </motion.div>
                ))}
                {exams.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">No External Records Found</motion.div>}
            </div>
        </div>
    );
};

const LeaveRequestsView = ({ gradeId, divisionId }: { gradeId: string, divisionId: string }) => {
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const load = useCallback(() => {
        if(gradeId && divisionId) db.getLeaveApplications(undefined, gradeId, divisionId).then(setLeaves);
    }, [gradeId, divisionId]);

    useEffect(() => { load(); }, [load]);

    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
        await db.updateLeaveStatus(id, status);
        load();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-16">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font italic">Permission Logs.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mt-3">Personnel Absence Authorization</p>
            </motion.div>
            <div className="space-y-8">
                {leaves.map(l => (
                    <motion.div variants={itemVariants} key={l.id} className="bg-[#0A0A0A] p-12 rounded-[56px] border border-white/5 flex flex-col md:flex-row justify-between gap-10 hover:border-white/10 shadow-xl transition-all relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none opacity-20" />
                        <div className="relative z-10 flex-1">
                            <div className="flex gap-5 items-center mb-6">
                                <h4 className="text-2xl font-bold text-white italic tracking-tight">{l.studentName}</h4>
                                <span className={`text-[9px] font-black px-5 py-2 rounded-2xl uppercase tracking-[0.3em] border transition-all duration-700 ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : l.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]'}`}>{l.status}</span>
                            </div>
                            <p className="text-lg text-white/50 mb-8 font-serif leading-relaxed italic">"{l.reason}"</p>
                            <div className="flex items-center gap-3 text-white/20 bg-white/5 w-fit px-5 py-2 rounded-xl border border-white/5">
                                <Calendar size={12} className="text-indigo-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest font-mono">{l.startDate} <span className="mx-2 text-indigo-500">>></span> {l.endDate}</p>
                            </div>
                        </div>
                        {l.status === 'Pending' && (
                            <div className="flex gap-4 self-start md:self-center">
                                <button onClick={() => handleAction(l.id, 'Approved')} className="w-16 h-16 rounded-[24px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90"><Check size={28} strokeWidth={3}/></button>
                                <button onClick={() => handleAction(l.id, 'Rejected')} className="w-16 h-16 rounded-[24px] bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90"><X size={28} strokeWidth={3}/></button>
                            </div>
                        )}
                    </motion.div>
                ))}
                {leaves.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs">Duty Cycle Uninterrupted</motion.div>}
            </div>
        </div>
    );
};

const QueriesModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="max-w-4xl mx-auto space-y-16">
             <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font italic">Intelligence Relay.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mt-3">Relayed Inquiries & Secure Responses</p>
             </motion.div>
             <div className="space-y-8">
                 {queries.map(q => (
                    <motion.div variants={itemVariants} key={q.id} className="bg-[#0A0A0A] p-12 rounded-[60px] border border-white/5 space-y-12 transition-all hover:border-indigo-500/20 shadow-xl group">
                        <div className="flex justify-between items-center border-b border-white/5 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-black shadow-inner">{q.studentName.charAt(0)}</div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-with-[0.5em] text-white/20 mb-1">{q.subject}</h4>
                                    <p className="text-xl font-bold text-white italic tracking-tight">{q.studentName}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-2xl border transition-all duration-700 ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'border-amber-500/20 text-amber-400 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]'}`}>{q.status}</span>
                        </div>
                        <p className="font-serif italic text-4xl text-white/40 leading-relaxed tracking-tighter">"{q.queryText}"</p>
                        {q.status === 'Answered' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12 border-t border-white/5 relative">
                                <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Secure Reply</div>
                                <p className="text-xl leading-relaxed text-white/80 font-medium italic">"{q.replyText}"</p>
                            </motion.div>
                        ) : (
                            <div className="flex gap-6 pt-6">
                                <input className="flex-1 bg-black/50 border border-white/10 rounded-[28px] px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 transition-all italic" placeholder="Formulate response protocol..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} />
                                <button onClick={async ()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black px-12 rounded-[28px] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3">
                                    <span className="hidden sm:inline"><Send size={16}/></span> Send
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
                {queries.length === 0 && <motion.div variants={itemVariants} className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-xs"> Relays Silent</motion.div>}
             </div>
        </div>
    );
};

const SettingsSection = ({ user }: any) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Protocol Mismatch');
        setLoading(true);
        try { await db.changePassword(user.id, 'teacher', form.current, form.new); alert('Security Credentials Updated.'); setForm({current:'',new:'',confirm:''}); } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-24">
            <motion.div variants={itemVariants} className="bg-[#0A0A0A] p-16 rounded-[64px] border border-white/10 text-center shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                 <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-12 text-indigo-400 shadow-inner group hover:scale-105 transition-transform duration-500"><Lock size={36} strokeWidth={1} /></div>
                 <h3 className="text-3xl font-light serif-font mb-14 uppercase tracking-[0.4em] italic luxury-text-gradient">Credential Hub.</h3>
                 <form onSubmit={update} className="space-y-6">
                     <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Current Signature</label>
                        <input required type="password" placeholder="••••••••" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all" />
                     </div>
                     <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">New Signature</label>
                        <input required type="password" placeholder="••••••••" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all" />
                     </div>
                     <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Verify Signature</label>
                        <input required type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl px-8 py-5 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all" />
                     </div>
                     <button disabled={loading} className="w-full py-6 bg-white text-black font-black text-[12px] uppercase tracking-[0.6em] rounded-2xl hover:bg-indigo-500 hover:text-white transition-all mt-10 shadow-2xl active:scale-95 disabled:opacity-50">
                        {loading ? 'Encrypting...' : 'Authorize Authority'}
                     </button>
                 </form>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
