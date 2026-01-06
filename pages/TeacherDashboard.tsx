
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, StudentQuery, AttendanceRecord, StudyNote, HomeworkSubmission, StudentOwnExam, LeaveApplication } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, Plus, Trash2, Award, ClipboardCheck, X, MessageSquare, Clock, Settings, Lock, Radio, Power, ChevronRight, LayoutDashboard, FileText, UserCheck, Menu, Loader2, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen bg-[#020202] text-white flex font-sans selection:bg-white/10 overflow-hidden">
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`w-72 bg-[#080808] border-r border-white/5 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 transform lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-8 w-auto invert opacity-90" />
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white/40"><X size={20}/></button>
                    </div>
                    
                    <nav className="space-y-1 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${activeTab === item.id ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={16} strokeWidth={2.5} className={activeTab === item.id ? 'text-black' : 'text-white/20 group-hover:text-white/60'} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-white/40">{user?.username.charAt(0)}</div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold uppercase tracking-tight truncate text-white/80">{user?.username}</p>
                                <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter">Academic Faculty</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 text-[9px] font-black uppercase tracking-widest transition-all"><LogOut size={14}/> Sign Out</button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-24 border-b border-white/5 bg-[#020202] px-6 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white/60 hover:text-white transition-colors p-2 bg-white/5 rounded-lg">
                            <Menu size={20}/>
                        </button>
                        <div>
                            <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10 mb-1">Command Terminal</h2>
                            <h1 className="text-xl md:text-2xl font-light serif-font tracking-tight capitalize text-white/90">{activeTab.replace('-', ' ')}</h1>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                         <select className="bg-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none border-r border-white/10 hover:text-white transition-colors" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                             {grades.map(g => <option key={g.id} value={g.id} className="bg-[#080808]">Grade {g.gradeName}</option>)}
                         </select>
                         <select className="bg-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none hover:text-white transition-colors" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                             {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#080808]">Div {s.divisionName}</option>)}
                         </select>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-12 overflow-y-auto scrollbar-hide bg-[#020202]">
                    <div className="max-w-6xl w-full mx-auto pb-20">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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

// --- Sub-Modules ---

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
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-10 border-b border-white/5">
                <div>
                    <h3 className="text-4xl font-light serif-font mb-2">Class Registry</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Daily Attendance Protocol</p>
                </div>
                <div className="flex items-center gap-4">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-white/30" />
                    <button onClick={save} className="bg-white text-black px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-premium-accent transition-all">Commit Updates</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {students.map(s => (
                    <div key={s.id} className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30">{s.name.charAt(0)}</div>
                             <div>
                                <p className="text-sm font-bold text-white/80">{s.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-black tracking-tight">{s.studentCustomId}</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}`}
                        >
                            {attendanceMap[s.id]}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LiveManagementModule = ({ division, userName }: { division?: Subdivision, userName: string }) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [tempMeetingId, setTempMeetingId] = useState<string | null>(null);
    
    if (!division) return <div className="py-40 text-center text-white/10 font-black uppercase text-[10px] tracking-[0.5em] border border-dashed border-white/5 rounded-3xl">Context Required</div>;

    const startLive = async () => {
        const meetingId = `SG_${division.id.replace(/-/g, '')}`;
        setIsInitializing(true);
        setTempMeetingId(meetingId);
        
        try {
            // Immediate UI feedback by showing meeting
            setIsInMeeting(true);
            // Async background update
            await db.setLiveStatus(division.id, true, meetingId);
        } catch (e) {
            console.error("Initialization Protocol Error:", e);
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
            <div className={`w-32 h-32 rounded-full mx-auto mb-12 flex items-center justify-center border transition-all duration-1000 ${division.isLive || isInMeeting ? 'bg-premium-accent/10 border-premium-accent/40 shadow-[0_0_50px_rgba(197,160,89,0.1)]' : 'bg-white/5 border-white/10'}`}>
                {isInitializing ? (
                    <Loader2 size={48} className="text-premium-accent animate-spin" />
                ) : (
                    <Radio size={48} className={division.isLive || isInMeeting ? 'text-premium-accent animate-pulse' : 'text-white/10'} strokeWidth={1} />
                )}
            </div>
            <h3 className="text-4xl font-light serif-font mb-4">Classroom Hub</h3>
            <p className="text-white/20 uppercase text-[9px] font-black tracking-[0.5em] mb-12">Portal Protocol: {division.isLive ? 'Active Session' : 'Offline'}</p>
            
            {!division.isLive ? (
                <button 
                    onClick={startLive} 
                    disabled={isInitializing}
                    className="w-full bg-white text-black py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-premium-accent transition-all shadow-2xl disabled:opacity-50"
                >
                    {isInitializing ? 'Establishing Stream...' : 'Initialize Connection'}
                </button>
            ) : (
                <div className="space-y-6">
                    <button onClick={() => setIsInMeeting(true)} className="w-full bg-white text-black py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-premium-accent transition-all shadow-2xl">Enter Classroom</button>
                    <button onClick={stopLive} className="text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 mx-auto"><Power size={14}/> Terminate Stream</button>
                </div>
            )}

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
            <div className="lg:col-span-5">
                <div className="bg-[#0A0A0A] p-10 rounded-[32px] border border-white/5 sticky top-32">
                    <h3 className="text-2xl font-light serif-font mb-10">Define Assignment</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-8">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Subject Title</label><input required className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs outline-none focus:border-premium-accent transition-all" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="e.g. Science" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Task Protocol</label><textarea required className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs outline-none focus:border-premium-accent h-40 resize-none transition-all" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Input details..." /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Target Date</label><input required type="date" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs outline-none focus:border-premium-accent transition-all" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button className="w-full bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-premium-accent transition-all mt-4">Publish Assignment</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
                {homeworkList.map(hw => (
                    <div key={hw.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex justify-between items-start group hover:border-white/10 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-premium-accent font-black text-[9px] uppercase tracking-[0.3em] bg-premium-accent/5 px-4 py-1.5 rounded-lg border border-premium-accent/10">{hw.subject}</span>
                                <span className="text-[9px] text-white/10 font-black uppercase tracking-widest">Protocol Date: {hw.dueDate}</span>
                            </div>
                            <p className="text-xl text-white/60 font-serif italic leading-relaxed">"{hw.task}"</p>
                        </div>
                        <button className="p-3 text-white/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} strokeWidth={1.5}/></button>
                    </div>
                ))}
                {homeworkList.length === 0 && <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px] text-white/10 font-black uppercase text-[11px] tracking-[0.5em]">Vault Empty</div>}
            </div>
        </div>
    );
};

const NotesModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ subject: '', title: '', content: '', fileUrl: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getNotes(gradeId, divisionId).then(setNotes); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-16">
            <div className="flex justify-between items-center pb-10 border-b border-white/5">
                 <h3 className="text-4xl font-light serif-font">Knowledge Base</h3>
                 <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-premium-accent transition-all">+ Archive Entry</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 group hover:border-white/10 flex flex-col h-full relative transition-colors">
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={async ()=>{if(confirm('Erase Entry?')){await db.deleteNote(n.id); load();}}} className="text-white/20 hover:text-rose-500"><Trash2 size={18} strokeWidth={1.5}/></button>
                        </div>
                        <span className="text-premium-accent text-[9px] font-black uppercase tracking-[0.4em] mb-6 block">{n.subject}</span>
                        <h4 className="text-2xl font-bold mb-6 flex-1 leading-tight text-white/80">{n.title}</h4>
                        <p className="text-sm text-white/30 mb-12 line-clamp-4 leading-relaxed font-medium">{n.content}</p>
                        {n.fileUrl && <a href={n.fileUrl} target="_blank" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">Retrieve Coordinate</a>}
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[48px] w-full max-w-xl p-14 relative shadow-2xl">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
                            <h3 className="text-3xl font-light serif-font mb-12 text-center uppercase tracking-widest luxury-text-gradient">Protocol Entry</h3>
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-6">
                                <input required placeholder="DEPARTMENT" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-widest uppercase outline-none focus:border-premium-accent transition-all" onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="RESOURCE LABEL" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-widest uppercase outline-none focus:border-premium-accent transition-all" onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="SUMMARY DATA" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-xs outline-none focus:border-premium-accent h-40 resize-none transition-all" onChange={e=>setForm({...form, content:e.target.value})} />
                                <input placeholder="CLOUD COORDINATES (URL)" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-widest outline-none focus:border-premium-accent transition-all" onChange={e=>setForm({...form, fileUrl:e.target.value})} />
                                <button className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-premium-accent transition-all mt-6 shadow-xl shadow-white/5">Store Archive</button>
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
            <div className="flex justify-between items-center pb-10 border-b border-white/5">
                <h3 className="text-4xl font-light serif-font">Assessments</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-premium-accent transition-all">Construct Exam</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(e => (
                    <div key={e.id} className="bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5 group hover:border-white/10 flex flex-col h-full transition-colors">
                        <span className="text-premium-accent text-[9px] font-black uppercase tracking-widest mb-6 block">{e.subject}</span>
                        <h4 className="text-2xl font-bold mb-8 flex-1 text-white/80 leading-tight tracking-tight">{e.title}</h4>
                        <div className="flex items-center gap-6 text-white/20 text-[10px] font-black uppercase mb-10 border-t border-white/5 pt-8">
                             <span className="flex items-center gap-2"><Calendar size={12} strokeWidth={2.5}/> {e.examDate}</span>
                             <span className="flex items-center gap-2"><Clock size={12} strokeWidth={2.5}/> {e.startTime}</span>
                        </div>
                        <button onClick={async ()=>{if(confirm('Withdraw Paper?')){await db.deleteExam(e.id); load();}}} className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/20 hover:text-rose-500 transition-colors self-start border-b border-rose-500/10 pb-1">Withdraw paper</button>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-2xl">
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] rounded-[48px] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-12 md:p-16 border border-white/10 relative shadow-2xl">
                            <button onClick={()=>setIsCreating(false)} className="absolute top-12 right-12 text-white/20 hover:text-white transition-colors"><X size={32}/></button>
                            <h3 className="text-4xl font-light serif-font mb-16 text-center uppercase tracking-[0.4em] luxury-text-gradient">Protocol Construction</h3>
                            <form onSubmit={handleSubmit} className="space-y-16">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Label</label><input required placeholder="TITLE" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-premium-accent transition-all" onChange={e=>setForm({...form, title:e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Department</label><input required placeholder="SUBJECT" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-premium-accent transition-all" onChange={e=>setForm({...form, subject:e.target.value})}/></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Target Date</label><input required type="date" className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black outline-none focus:border-premium-accent uppercase transition-all" onChange={e=>setForm({...form, examDate:e.target.value})}/></div>
                                </div>
                                <div className="space-y-10">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-6"><h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/10">Inventory Blocks</h4><button type="button" onClick={()=>setForm({...form, questions: [...form.questions, { id: Math.random().toString(), text: '', type: 'mcq', marks: 1 }]})} className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">+ Add Block</button></div>
                                    <div className="space-y-6">
                                        {form.questions.map((q: any, idx: number) => (
                                            <div key={q.id} className="bg-white/[0.01] p-10 rounded-[32px] flex gap-10 items-start border border-white/5 transition-all hover:bg-white/[0.02]">
                                                <span className="font-serif italic text-4xl text-white/5">0{idx+1}</span>
                                                <div className="flex-1 space-y-8">
                                                    <input required placeholder="Define query content..." className="w-full bg-transparent border-b border-white/10 py-3 outline-none focus:border-premium-accent text-xl font-light tracking-tight" onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} />
                                                    <div className="flex gap-12">
                                                        <div className="flex items-center gap-4"><span className="text-[9px] font-black text-white/10 uppercase">MODE:</span><select className="bg-transparent text-white/40 text-[10px] font-black uppercase tracking-[0.2em] outline-none" onChange={e=>{const qs=[...form.questions]; qs[idx].type=e.target.value; setForm({...form, questions:qs})}}><option value="mcq">Objective</option><option value="short">Subjective</option></select></div>
                                                        <div className="flex items-center gap-4"><span className="text-[9px] font-black text-white/10 uppercase">PTS:</span><input type="number" placeholder="0" className="bg-transparent text-white/40 text-[10px] font-black uppercase tracking-[0.2em] outline-none w-16" onChange={e=>{const qs=[...form.questions]; qs[idx].marks=parseInt(e.target.value); setForm({...form, questions:qs})}} /></div>
                                                    </div>
                                                </div>
                                                <button onClick={()=>setForm({...form, questions: form.questions.filter((item:any)=>item.id!==q.id)})} className="p-3 text-rose-500/20 hover:text-rose-500 transition-colors"><X size={20}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-white/5">
                                    <button type="button" onClick={()=>setIsCreating(false)} className="flex-1 py-6 border border-white/5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-white/5 transition-all text-white/20">Cancel</button>
                                    <button className="flex-1 py-6 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-premium-accent transition-all shadow-2xl">Deploy Protocol</button>
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
        <div className="max-w-4xl mx-auto space-y-12">
            <h3 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Submissions Queue</h3>
            <div className="space-y-4">
                {subs.map(sub => (
                    <div key={sub.id} className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 flex flex-col items-start gap-6 hover:border-white/10 transition-all">
                        <div className="flex justify-between w-full">
                            <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.5em]">Entry ID: {sub.studentId.slice(0,8)}</p>
                            <p className="text-[9px] text-white/20 font-black uppercase">{sub.submittedAt}</p>
                        </div>
                        <p className="text-2xl italic text-white/70 leading-relaxed font-serif tracking-tight">"{sub.submissionText}"</p>
                        {sub.imageUrl && (
                            <div className="w-full mt-2 bg-black border border-white/5 rounded-2xl p-4">
                                <p className="text-[9px] font-black uppercase text-white/20 mb-4 tracking-widest">Attachment</p>
                                <img src={sub.imageUrl} className="max-w-xs rounded-lg border border-white/10" alt="Submission" />
                            </div>
                        )}
                        <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="w-full mt-4 bg-white/5 border border-white/10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-emerald-400 hover:border-emerald-400/30 transition-all">Validate Entry</button>
                    </div>
                ))}
                {subs.length === 0 && <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[48px] text-white/10 font-black uppercase text-[11px] tracking-[0.5em] opacity-40">Queue Clear</div>}
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
        <div className="max-w-4xl mx-auto space-y-12">
            <h3 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Upcoming Student Exams</h3>
            <div className="grid grid-cols-1 gap-4">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex items-center justify-between hover:border-white/10">
                        <div>
                            <div className="flex gap-4 items-center mb-2">
                                <h4 className="text-xl font-bold text-white">{ex.subject}</h4>
                                <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">{ex.studentName}</span>
                            </div>
                            <p className="text-sm text-white/40">{ex.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Date</p>
                            <p className="text-lg font-mono text-white/90">{ex.examDate}</p>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <div className="py-20 text-center text-white/10 font-black uppercase text-[10px] tracking-widest">No Student Exams Found</div>}
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
        <div className="max-w-4xl mx-auto space-y-12">
            <h3 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Leave Requests</h3>
            <div className="space-y-6">
                {leaves.map(l => (
                    <div key={l.id} className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row justify-between gap-6 hover:border-white/10">
                        <div>
                            <div className="flex gap-4 items-center mb-3">
                                <h4 className="text-lg font-bold text-white">{l.studentName}</h4>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : l.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{l.status}</span>
                            </div>
                            <p className="text-sm text-white/60 mb-2">"{l.reason}"</p>
                            <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">{l.startDate} <span className="mx-2">to</span> {l.endDate}</p>
                        </div>
                        {l.status === 'Pending' && (
                            <div className="flex gap-2 self-start md:self-center">
                                <button onClick={() => handleAction(l.id, 'Approved')} className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"><Check size={18}/></button>
                                <button onClick={() => handleAction(l.id, 'Rejected')} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><X size={18}/></button>
                            </div>
                        )}
                    </div>
                ))}
                {leaves.length === 0 && <div className="py-20 text-center text-white/10 font-black uppercase text-[10px] tracking-widest">No Active Requests</div>}
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
             <h3 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Doubts Resolved</h3>
             <div className="space-y-8">
                 {queries.map(q => (
                    <div key={q.id} className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5 space-y-12 transition-all hover:border-white/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">{q.subject}</h4>
                                <p className="text-lg font-bold text-white/90">{q.studentName}</p>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-5 py-2 rounded-xl border ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400' : 'border-amber-500/20 text-amber-400'}`}>{q.status}</span>
                        </div>
                        <p className="font-serif italic text-3xl text-white/50 leading-relaxed tracking-tight">"{q.queryText}"</p>
                        {q.status === 'Answered' ? <div className="pt-12 border-t border-white/5"><p className="text-[9px] font-black text-white/20 uppercase mb-6 tracking-[0.5em]">Command Response</p><p className="text-lg leading-relaxed text-white/70 font-medium">{q.replyText}</p></div> : 
                        <div className="flex gap-6 pt-6"><input className="flex-1 bg-black border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-premium-accent transition-all" placeholder="Formulate response..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} /><button onClick={async ()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black px-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-premium-accent transition-all">Send</button></div>}
                    </div>
                ))}
                {queries.length === 0 && <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[48px] text-white/10 font-black uppercase text-[11px] tracking-[0.5em] opacity-40">Desk Dormant</div>}
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
            <div className="bg-[#0A0A0A] p-14 rounded-[48px] border border-white/5 text-center shadow-2xl">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-12 text-premium-accent"><Lock size={28} strokeWidth={1} /></div>
                 <h3 className="text-3xl font-light serif-font mb-16 uppercase tracking-[0.2em] opacity-90">Security Hub</h3>
                 <form onSubmit={update} className="space-y-4">
                     <input required type="password" placeholder="CURRENT CREDENTIAL" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-[0.5em] uppercase outline-none focus:border-premium-accent transition-all" />
                     <input required type="password" placeholder="NEW CREDENTIAL" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-[0.5em] uppercase outline-none focus:border-premium-accent transition-all" />
                     <input required type="password" placeholder="VERIFY PROTOCOL" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-[0.5em] uppercase outline-none focus:border-premium-accent transition-all" />
                     <button disabled={loading} className="w-full py-6 bg-white text-black font-black text-[11px] uppercase tracking-[0.6em] rounded-2xl hover:bg-premium-accent transition-all mt-8 shadow-xl">{loading ? 'Encrypting...' : 'Authorize Authority'}</button>
                 </form>
            </div>
        </div>
    );
};

export default TeacherDashboard;
