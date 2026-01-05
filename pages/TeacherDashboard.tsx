import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, StudentQuery, AttendanceRecord, StudyNote, HomeworkSubmission } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, Plus, Trash2, Award, ClipboardCheck, X, MessageSquare, Clock, Settings, Lock, Radio, Power, ChevronRight, LayoutDashboard, FileText, UserCheck, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'live' | 'homework' | 'notes' | 'exams' | 'grading' | 'queries' | 'settings'>('attendance');
    
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
                if (subs.length > 0) {
                    const current = subs.find(s => s.id === selectedDivisionId) || subs[0];
                    setSelectedDivisionId(current.id);
                }
            }
        }
        loadSubs();
        const sub = db.subscribe('subdivisions', loadSubs);
        return () => db.unsubscribe(sub);
    }, [selectedGradeId, selectedDivisionId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'live', label: 'Virtual Hub', icon: Radio },
        { id: 'homework', label: 'Assignments', icon: BookOpen },
        { id: 'notes', label: 'Resources', icon: FileText },
        { id: 'exams', label: 'Assessments', icon: PenTool },
        { id: 'grading', label: 'Review', icon: Award },
        { id: 'queries', label: 'Queries', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const selectedDivision = availableSubdivisions.find(s => s.id === selectedDivisionId);

    return (
        <div className="min-h-screen bg-[#020202] text-white flex font-sans selection:bg-white/10">
            {/* Sidebar */}
            <aside className="w-64 bg-[#080808] border-r border-white/5 flex flex-col fixed inset-y-0 z-50 transition-transform lg:translate-x-0 lg:static">
                <div className="p-8 pb-12">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-8 w-auto invert opacity-90 mb-10" />
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={16} strokeWidth={2.5} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px]">{user?.username.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold uppercase tracking-tight truncate text-white/80">{user?.username}</p>
                            <p className="text-[8px] text-white/30 uppercase font-black tracking-tighter">Academic Faculty</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-white/20 hover:text-rose-500 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><LogOut size={12}/> Sign Out</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
                <header className="h-20 border-b border-white/5 bg-black px-6 md:px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-white/60"><LayoutDashboard size={20}/></button>
                        <div>
                            <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-0.5">Faculty Terminal</h2>
                            <h1 className="text-lg font-light serif-font tracking-tight capitalize opacity-90">{activeTab.replace('-', ' ')}</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                         <select className="bg-transparent px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none border-r border-white/10" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                             {grades.map(g => <option key={g.id} value={g.id} className="bg-black">Grade {g.gradeName}</option>)}
                         </select>
                         <select className="bg-transparent px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                             {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-black">Div {s.divisionName}</option>)}
                         </select>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl w-full mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                            {activeTab === 'live' && <LiveManagementModule division={selectedDivision} userName={user?.username || ''} />}
                            {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'notes' && <NotesModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'exams' && <ExamBuilderModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                            {activeTab === 'grading' && <GradingModule />}
                            {activeTab === 'queries' && <QueriesModule />}
                            {activeTab === 'settings' && <SettingsSection user={user!} />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

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
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
                <div>
                    <h3 className="text-3xl font-light serif-font mb-2">Class Registry</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Authorized log for {students.length} students</p>
                </div>
                <div className="flex items-center gap-4">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-white/30" />
                    <button onClick={save} className="bg-white text-black px-10 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">Commit Changes</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {students.map(s => (
                    <div key={s.id} className="bg-[#0A0A0A] p-5 rounded-xl border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                             <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black">{s.name.charAt(0)}</div>
                             <div>
                                <p className="text-sm font-bold text-white/90">{s.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-bold tracking-tight">{s.studentCustomId}</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}`}
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
    if (!division) return <div className="py-40 text-center text-white/10 font-black uppercase text-[10px] tracking-[0.5em]">Context Required</div>;

    const startLive = async () => {
        const meetingId = `SG_${division.id.replace(/-/g, '')}`;
        await db.setLiveStatus(division.id, true, meetingId);
        setIsInMeeting(true);
    };

    return (
        <div className="max-w-xl mx-auto py-24 text-center">
            <div className={`w-28 h-28 rounded-full mx-auto mb-10 flex items-center justify-center border transition-all duration-1000 ${division.isLive ? 'bg-rose-500/5 border-rose-500/30' : 'bg-white/5 border-white/10'}`}>
                <Radio size={40} className={division.isLive ? 'text-rose-500 animate-pulse' : 'text-white/10'} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-light serif-font mb-4">Classroom Broadcast</h3>
            <p className="text-white/20 uppercase text-[9px] font-black tracking-[0.4em] mb-12">Portal Protocol: {division.isLive ? 'Online' : 'Dormant'}</p>
            
            {!division.isLive ? (
                <button onClick={startLive} className="w-full bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all">Initialize Stream</button>
            ) : (
                <div className="space-y-4">
                    <button onClick={() => setIsInMeeting(true)} className="w-full bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all">Enter Session</button>
                    <button onClick={() => db.setLiveStatus(division.id!, false)} className="text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"><Power size={12}/> Terminate Broadcast</button>
                </div>
            )}

            {isInMeeting && division.liveMeetingId && <JitsiMeeting roomName={division.liveMeetingId} userName={userName} onClose={() => setIsInMeeting(false)} />}
        </div>
    );
};

const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setHomeworkList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
                <div className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 sticky top-32">
                    <h3 className="text-xl font-light serif-font mb-8">Draft Assignment</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-6">
                        <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-white/20 tracking-widest ml-1">Subject</label><input required className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-white/30" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="e.g. Mathematics" /></div>
                        <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-white/20 tracking-widest ml-1">Details</label><textarea required className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-white/30 h-32 resize-none" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Task description..." /></div>
                        <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-white/20 tracking-widest ml-1">Target Date</label><input required type="date" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-white/30" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button className="w-full bg-white text-black py-4 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">Publish To Portal</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
                {homeworkList.map(hw => (
                    <div key={hw.id} className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 flex justify-between items-start group hover:border-white/10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-white font-black text-[9px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded border border-white/5">{hw.subject}</span>
                                <span className="text-[9px] text-white/20 font-bold uppercase">Deadline: {hw.dueDate}</span>
                            </div>
                            <p className="text-lg text-white/70 font-serif italic">"{hw.task}"</p>
                        </div>
                        <button className="p-2 text-white/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                    </div>
                ))}
                {homeworkList.length === 0 && <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/10 font-black uppercase text-[10px] tracking-widest">No active assignments</div>}
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
        <div className="space-y-12">
            <div className="flex justify-between items-center pb-8 border-b border-white/5">
                 <h3 className="text-3xl font-light serif-font">Knowledge Base</h3>
                 <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">+ Add Resource</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 group hover:border-white/10 flex flex-col h-full relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={async ()=>{if(confirm('Delete?')){await db.deleteNote(n.id); load();}}} className="text-white/20 hover:text-rose-500"><Trash2 size={16}/></button>
                        </div>
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-4 block">{n.subject}</span>
                        <h4 className="text-xl font-bold mb-4 flex-1 leading-tight text-white/90">{n.title}</h4>
                        <p className="text-sm text-white/40 mb-10 line-clamp-3 leading-relaxed">{n.content}</p>
                        {n.fileUrl && <a href={n.fileUrl} target="_blank" className="w-full py-3.5 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">Cloud Link</a>}
                    </div>
                ))}
            </div>
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg p-12 relative">
                        <button onClick={()=>setIsAdding(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={20}/></button>
                        <h3 className="text-2xl font-light serif-font mb-10">Archive New Resource</h3>
                        <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-6">
                            <input required placeholder="SUBJECT" className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30" onChange={e=>setForm({...form, subject:e.target.value})} />
                            <input required placeholder="TITLE" className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30" onChange={e=>setForm({...form, title:e.target.value})} />
                            <textarea required placeholder="DESCRIPTION" className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-xs outline-none focus:border-white/30 h-32 resize-none" onChange={e=>setForm({...form, content:e.target.value})} />
                            <input placeholder="RESOURCE URL (OPTIONAL)" className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30" onChange={e=>setForm({...form, fileUrl:e.target.value})} />
                            <button className="w-full bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all mt-4">Save To Archive</button>
                        </form>
                    </motion.div>
                </div>
            )}
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
        <div className="space-y-12">
            <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <h3 className="text-3xl font-light serif-font">Assessment Console</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">Construct Exam</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(e => (
                    <div key={e.id} className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 group hover:border-white/10 flex flex-col h-full">
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-4 block">{e.subject}</span>
                        <h4 className="text-xl font-bold mb-6 flex-1 text-white/90">{e.title}</h4>
                        <div className="flex items-center gap-4 text-white/20 text-[10px] font-bold uppercase mb-8 border-t border-white/5 pt-6">
                             <span className="flex items-center gap-2"><Calendar size={12}/> {e.examDate}</span>
                             <span className="flex items-center gap-2"><Clock size={12}/> {e.startTime}</span>
                        </div>
                        <button onClick={async ()=>{if(confirm('Withdraw?')){await db.deleteExam(e.id); load();}}} className="text-[9px] font-black uppercase tracking-widest text-rose-500/30 hover:text-rose-500 transition-colors">Withdraw Paper</button>
                    </div>
                ))}
            </div>
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12 border border-white/10 relative">
                        <button onClick={()=>setIsCreating(false)} className="absolute top-10 right-10 text-white/20 hover:text-white"><X size={24}/></button>
                        <h3 className="text-3xl font-light serif-font mb-12 text-center uppercase tracking-widest">Protocol Creation</h3>
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input required placeholder="TITLE" className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30" onChange={e=>setForm({...form, title:e.target.value})}/>
                                <input required placeholder="SUBJECT" className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30" onChange={e=>setForm({...form, subject:e.target.value})}/>
                                <input required type="date" className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-[10px] font-black outline-none focus:border-white/30 uppercase" onChange={e=>setForm({...form, examDate:e.target.value})}/>
                            </div>
                            <div className="space-y-8">
                                <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">Inventory</h4><button type="button" onClick={()=>setForm({...form, questions: [...form.questions, { id: Math.random().toString(), text: '', type: 'mcq', marks: 1 }]})} className="bg-white/5 border border-white/10 px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white/10">+ Add Row</button></div>
                                <div className="space-y-4">
                                    {form.questions.map((q: any, idx: number) => (
                                        <div key={q.id} className="bg-white/[0.01] p-8 rounded-xl flex gap-8 items-start border border-white/5">
                                            <span className="font-serif italic text-3xl text-white/5">0{idx+1}</span>
                                            <div className="flex-1 space-y-6">
                                                <input required placeholder="Define query content..." className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/40 text-lg font-light" onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} />
                                                <div className="flex gap-10">
                                                    <select className="bg-transparent text-white/30 text-[9px] font-black uppercase tracking-widest outline-none" onChange={e=>{const qs=[...form.questions]; qs[idx].type=e.target.value; setForm({...form, questions:qs})}}><option value="mcq">Objective</option><option value="short">Subjective</option></select>
                                                    <input type="number" placeholder="POINTS" className="bg-transparent text-white/30 text-[9px] font-black uppercase tracking-widest outline-none w-20" onChange={e=>{const qs=[...form.questions]; qs[idx].marks=parseInt(e.target.value); setForm({...form, questions:qs})}} />
                                                </div>
                                            </div>
                                            <button onClick={()=>setForm({...form, questions: form.questions.filter((item:any)=>item.id!==q.id)})} className="text-rose-500/20 hover:text-rose-500 transition-colors"><X size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-10 border-t border-white/5">
                                <button type="button" onClick={()=>setIsCreating(false)} className="flex-1 py-5 border border-white/5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/5 transition-all text-white/20">Cancel</button>
                                <button className="flex-1 py-5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all">Authorize Deployment</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const GradingModule = () => {
    const [subs, setSubs] = useState<HomeworkSubmission[]>([]);
    const load = useCallback(() => db.getAllHomeworkSubmissions().then(all => setSubs(all.filter(s => s.status === 'Submitted'))), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h3 className="text-3xl font-light serif-font pb-8 border-b border-white/5">Pending Review</h3>
            <div className="space-y-4">
                {subs.map(sub => (
                    <div key={sub.id} className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-white/10 transition-all">
                        <div className="flex-1">
                            <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em] mb-4">Submission Entry #{sub.studentId.slice(0,6)}</p>
                            <p className="text-lg italic text-white/70 leading-relaxed font-serif">"{sub.submissionText}"</p>
                        </div>
                        <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="bg-white/5 border border-white/10 px-8 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-400/30 transition-all">Authorize Validation</button>
                    </div>
                ))}
                {subs.length === 0 && <div className="py-24 text-center text-white/10 font-black uppercase text-[10px] tracking-[0.5em] border border-dashed border-white/5 rounded-3xl">Clean Queue</div>}
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
        <div className="max-w-4xl mx-auto space-y-12">
             <h3 className="text-3xl font-light serif-font pb-8 border-b border-white/5">Mentorship Desk</h3>
             {queries.map(q => (
                <div key={q.id} className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5 space-y-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-bold text-white/90">{q.studentName}</h4>
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">{q.subject}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-md border ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400' : 'border-white/10 text-white/20'}`}>{q.status}</span>
                    </div>
                    <p className="font-serif italic text-2xl text-white/50 leading-relaxed">"{q.queryText}"</p>
                    {q.status === 'Answered' ? <div className="pt-10 border-t border-white/5"><p className="text-[9px] font-black text-white/20 uppercase mb-4 tracking-widest">Protocol Response</p><p className="text-sm leading-relaxed text-white/60">{q.replyText}</p></div> : 
                    <div className="flex gap-4 pt-4"><input className="flex-1 bg-black border border-white/10 rounded-lg px-6 py-4 text-xs outline-none focus:border-white/30" placeholder="Formulate feedback..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} /><button onClick={async ()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black px-10 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">Send</button></div>}
                </div>
            ))}
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
        try { await db.changePassword(user.id, 'teacher', form.current, form.new); alert('Credentials Encrypted.'); setForm({current:'',new:'',confirm:''}); } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-24">
            <div className="bg-[#0A0A0A] p-12 rounded-2xl border border-white/5 text-center">
                 <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-10 text-white/20"><Lock size={24} strokeWidth={1} /></div>
                 <h3 className="text-2xl font-light serif-font mb-12 uppercase tracking-widest">Security</h3>
                 <form onSubmit={update} className="space-y-4">
                     <input required type="password" placeholder="CURRENT" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-white/30 transition-all" />
                     <input required type="password" placeholder="NEW" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-white/30 transition-all" />
                     <input required type="password" placeholder="VERIFY" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-5 py-4 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-white/30 transition-all" />
                     <button disabled={loading} className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] rounded-lg hover:brightness-90 transition-all mt-6 shadow-xl">{loading ? 'Processing...' : 'Authorize Update'}</button>
                 </form>
            </div>
        </div>
    );
};

export default TeacherDashboard;