
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, StudentQuery, AttendanceRecord, StudyNote, HomeworkSubmission, StudentOwnExam, LeaveApplication, Question, ExamSubmission } from '../types';
import { LogOut, Calendar as CalendarIcon, BookOpen, PenTool, Plus, Trash2, Award, ClipboardCheck, X, MessageSquare, Clock, Settings, Lock, Radio, Power, ChevronRight, LayoutDashboard, FileText, UserCheck, Menu, Loader2, Check, ExternalLink, Sparkles, AlertCircle, Send, Upload, Camera, Database, ShieldCheck, ChevronDown, Rocket, Waves, Globe, ListChecks, HelpCircle, Eye, ArrowRight, ChevronLeft, Users, User as UserIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ... (SpatialBackground and pageTransition constants remain the same)
const SpatialBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020204]">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20" />
    </div>
);

const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const TeacherDashboard: React.FC = () => {
    // ... (Main dashboard state and layout remain the same)
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'live' | 'homework' | 'notes' | 'exams' | 'grading' | 'leaves' | 'student-exams' | 'queries' | 'settings'>('attendance');
    
    const [grades, setGrades] = useState<Grade[]>([]);
    const [availableSubdivisions, setAvailableSubdivisions] = useState<Subdivision[]>([]);
    const [selectedGradeId, setSelectedGradeId] = useState('');
    const [selectedDivisionId, setSelectedDivisionId] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshGrades = useCallback(async () => {
        const g = await db.getGrades();
        setGrades(g);
    }, []);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (!storedUser) { navigate('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') { navigate('/'); return; }
        setUser(parsedUser);
        refreshGrades();

        const channels = [
            db.subscribe('students', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('exams', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('queries', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('leave_applications', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('homework', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('homework_submissions', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('study_notes', () => setRefreshTrigger(t => t + 1)),
            db.subscribe('attendance', () => setRefreshTrigger(t => t + 1))
        ];
        
        return () => { channels.forEach(c => db.unsubscribe(c)); };
    }, [navigate, refreshGrades]);

    useEffect(() => {
        const loadSubs = async () => {
            if (selectedGradeId) {
                const subs = await db.getSubdivisions(selectedGradeId);
                setAvailableSubdivisions(subs);
                if (subs.length > 0) {
                    const currentStillValid = subs.find(s => s.id === selectedDivisionId);
                    if (!selectedDivisionId || !currentStillValid) setSelectedDivisionId(subs[0].id);
                } else {
                    setSelectedDivisionId('');
                }
            } else {
                setAvailableSubdivisions([]);
                setSelectedDivisionId('');
            }
        }
        loadSubs();
    }, [selectedGradeId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    const navItems = [
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'live', label: 'Live Classes', icon: Radio },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'notes', label: 'Notes', icon: Database },
        { id: 'exams', label: 'Conduct Exam', icon: PenTool },
        { id: 'grading', label: 'Check Exam', icon: ListChecks },
        { id: 'leaves', label: 'Leave Management', icon: Clock },
        { id: 'student-exams', label: 'Upcoming Exams', icon: Award },
        { id: 'queries', label: 'Doubts', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const selectedDivision = availableSubdivisions.find(s => s.id === selectedDivisionId);

    return (
        <div className="min-h-screen bg-[#020204] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <SpatialBackground />
            
            <header className="relative z-50 px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-6 md:h-8 w-auto invert opacity-80 cursor-pointer" onClick={() => navigate('/')} />
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 truncate max-w-[100px]">{user?.username}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {['attendance', 'live', 'grading', 'leaves', 'student-exams'].includes(activeTab) && (
                        <div className="grid grid-cols-2 gap-1 flex-1 sm:flex-none p-1 bg-white/5 rounded-xl border border-white/5">
                            <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-1.5 outline-none cursor-pointer border-r border-white/10" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                                <option value="" className="bg-[#050508]">All Grades</option>
                                {grades.map(g => <option key={g.id} value={g.id} className="bg-[#050508]">Grade {g.gradeName}</option>)}
                            </select>
                            <select className="bg-transparent text-[8px] font-black uppercase tracking-tighter px-2 py-1.5 outline-none cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                                <option value="" className="bg-[#050508]">All Divs</option>
                                {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#050508]">Div {s.divisionName}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={handleLogout} className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20 active:scale-95 transition-all"><Power size={12}/></button>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-12 py-6 relative z-10 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={`${activeTab}-${refreshTrigger}`} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pb-40">
                            {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'live' && <LiveManagementModule division={selectedDivision} />}
                            {activeTab === 'homework' && <HomeworkManagementModule teacherId={user?.id || ''} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'notes' && <NotesModule teacherId={user?.id || ''} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'exams' && <ExamBuilderModule teacherId={user?.id || ''} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'grading' && <CheckExamsModule refreshTrigger={refreshTrigger} />}
                            {activeTab === 'leaves' && <LeaveRequestsModule gradeId={selectedGradeId} divisionId={selectedDivisionId} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'student-exams' && <StudentExamsView gradeId={selectedGradeId} divisionId={selectedDivisionId} refreshTrigger={refreshTrigger} />}
                            {activeTab === 'queries' && <DoubtSolveModule refreshTrigger={refreshTrigger} />}
                            {activeTab === 'settings' && <CoreSettings user={user!} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
                <nav className="bg-[#0A0A0E]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[24px] flex items-center gap-1 shadow-2xl overflow-x-auto scrollbar-hide max-w-[95vw]">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group relative flex flex-col items-center justify-center min-w-[44px] md:min-w-[60px] h-[44px] md:h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:bg-white/5'}`}
                        >
                            <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className={`text-[6px] font-black uppercase tracking-widest mt-1 hidden md:block ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

const AttendanceModule = ({ gradeId, divisionId, refreshTrigger }: any) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!gradeId || !divisionId) return;
        setLoading(true);
        const [sts, atts] = await Promise.all([
            db.getStudents(gradeId, divisionId),
            db.getAttendance(undefined, date)
        ]);
        setStudents(sts);
        
        const currentAtt: Record<string, any> = {};
        const relevantAtts = atts.filter(a => sts.some(s => s.id === a.studentId));
        
        relevantAtts.forEach(a => {
            currentAtt[a.studentId] = a.status;
        });
        
        sts.forEach(s => {
            if (!currentAtt[s.id]) currentAtt[s.id] = 'Present';
        });

        setAttendance(currentAtt);
        setLoading(false);
    }, [gradeId, divisionId, date]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const mark = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const save = async () => {
        const records = Object.entries(attendance).map(([sid, status]) => ({
            studentId: sid,
            divisionId,
            date,
            status
        }));
        await db.markAttendance(records);
        alert("Attendance Register Updated.");
    };

    if (!gradeId || !divisionId) return <div className="p-20 text-center text-white/20 font-black uppercase tracking-widest">Select Grade & Division</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-3xl font-light serif-font italic luxury-text-gradient">Attendance.</h3>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Daily Roll Call</p>
                </div>
                <div className="flex gap-4">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white [color-scheme:dark]" />
                    <button onClick={save} className="bg-white text-black px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-400 hover:text-black transition-all">Save Register</button>
                </div>
            </div>
            
            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-white/20"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(s => (
                        <div key={s.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${attendance[s.id] === 'Absent' ? 'bg-rose-500/10 border-rose-500/20' : attendance[s.id] === 'Leave' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.03] border-white/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white/40">{s.name.charAt(0)}</div>
                                <div><p className="text-sm font-bold text-white">{s.name}</p><p className="text-[8px] font-mono text-white/30">{s.studentCustomId}</p></div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => mark(s.id, 'Present')} className={`p-2 rounded-lg transition-colors ${attendance[s.id] === 'Present' ? 'bg-emerald-500 text-black' : 'text-white/20 hover:bg-white/10'}`}><Check size={14}/></button>
                                <button onClick={() => mark(s.id, 'Absent')} className={`p-2 rounded-lg transition-colors ${attendance[s.id] === 'Absent' ? 'bg-rose-500 text-white' : 'text-white/20 hover:bg-white/10'}`}><X size={14}/></button>
                                <button onClick={() => mark(s.id, 'Leave')} className={`p-2 rounded-lg transition-colors ${attendance[s.id] === 'Leave' ? 'bg-amber-500 text-black' : 'text-white/20 hover:bg-white/10'}`}><Clock size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LiveManagementModule = ({ division }: { division?: Subdivision }) => {
    const [isLive, setIsLive] = useState(false);
    const [meetingId, setMeetingId] = useState('');

    useEffect(() => {
        if (division) {
            setIsLive(division.isLive || false);
            setMeetingId(division.liveMeetingId || '');
        }
    }, [division]);

    const toggleLive = async () => {
        if (!division) return;
        if (!isLive && !meetingId) {
            const generated = `CLASS-${division.gradeId}-${division.divisionName}-${Date.now()}`;
            setMeetingId(generated);
            await db.setLiveStatus(division.id, true, generated);
            setIsLive(true);
        } else if (isLive) {
            await db.setLiveStatus(division.id, false);
            setIsLive(false);
            setMeetingId('');
        } else {
             const idToUse = meetingId || `CLASS-${division.gradeId}-${division.divisionName}-${Date.now()}`;
             await db.setLiveStatus(division.id, true, idToUse);
             setIsLive(true);
        }
    };

    if (!division) return <div className="p-20 text-center text-white/20 font-black uppercase tracking-widest">Select Division to Manage Live Class</div>;

    return (
        <div className="max-w-2xl mx-auto py-20 text-center space-y-12">
            <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center border-[6px] transition-all shadow-[0_0_100px_rgba(0,0,0,0.5)] ${isLive ? 'border-rose-500 bg-rose-500/10 shadow-rose-500/20' : 'border-white/10 bg-white/5'}`}>
                <Radio size={64} className={isLive ? 'text-rose-500 animate-pulse' : 'text-white/20'} />
            </div>
            
            <div>
                <h3 className="text-4xl font-light serif-font mb-4">{isLive ? 'Session Active' : 'Classroom Offline'}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{division.divisionName} • Grade {division.gradeId}</p>
            </div>

            {isLive && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 inline-block">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Secure Meeting Protocol</p>
                    <p className="font-mono text-xl text-indigo-400">{meetingId}</p>
                </div>
            )}

            <button onClick={toggleLive} className={`px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${isLive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                {isLive ? 'Terminate Feed' : 'Go Live Now'}
            </button>
        </div>
    );
};

const HomeworkManagementModule = ({ teacherId, refreshTrigger }: any) => {
    // ... Same robust implementation from previous turn ...
    const [list, setList] = useState<Homework[]>([]);
    const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
    const [targetScope, setTargetScope] = useState<'Global' | 'Grade' | 'Division' | 'Individual'>('Global');
    const [selGrade, setSelGrade] = useState('');
    const [selDiv, setSelDiv] = useState('');
    const [selStudent, setSelStudent] = useState('');
    
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });

    const load = useCallback(() => { 
        db.getAllHomework().then(setList);
        db.getAllHomeworkSubmissions().then(setSubmissions);
        db.getGrades().then(setGrades);
    }, []);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    useEffect(() => {
        if (targetScope === 'Global') return;
        if (selGrade) {
            db.getSubdivisions(selGrade).then(setSubdivisions);
            if (targetScope === 'Individual') {
                db.getStudents(selGrade, selDiv || undefined).then(setStudents);
            }
        }
    }, [targetScope, selGrade, selDiv]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (targetScope === 'Grade' && !selGrade) return alert("Select a Grade.");
        if (targetScope === 'Division' && (!selGrade || !selDiv)) return alert("Select Grade & Division.");
        if (targetScope === 'Individual' && !selStudent) return alert("Select a Student.");

        await db.addHomework({ 
            targetType: targetScope, 
            gradeId: selGrade, 
            subdivisionId: selDiv, 
            targetStudentId: selStudent,
            assignedBy: teacherId,
            ...form 
        });
        setForm({ subject:'', task:'', dueDate:'' });
        setSelGrade(''); setSelDiv(''); setSelStudent(''); setTargetScope('Global');
        load();
        alert("Homework Protocol Deployed.");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl h-fit">
                    <h3 className="text-2xl font-light serif-font italic mb-8">Deploy Homework.</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase text-white/30 ml-1 tracking-widest">Target Scope</label>
                            <div className="grid grid-cols-4 gap-2 bg-black rounded-xl p-1 border border-white/10">
                                {['Global', 'Grade', 'Division', 'Individual'].map(scope => (
                                    <button type="button" key={scope} onClick={() => { setTargetScope(scope as any); setSelGrade(''); setSelDiv(''); setSelStudent(''); }} className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${targetScope === scope ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>{scope === 'Individual' ? 'Student' : scope}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(targetScope !== 'Global') && (
                                <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-1">Grade</label><select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white" value={selGrade} onChange={e => setSelGrade(e.target.value)}><option value="">Select Grade</option>{grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}</select></div>
                            )}
                            {(targetScope === 'Division' || (targetScope === 'Individual' && selGrade)) && (
                                <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-1">Division</label><select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white" value={selDiv} onChange={e => setSelDiv(e.target.value)}><option value="">Select Div</option>{subdivisions.map(s => <option key={s.id} value={s.id}>{s.divisionName}</option>)}</select></div>
                            )}
                        </div>
                        {targetScope === 'Individual' && selGrade && (
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-1">Student</label><select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white" value={selStudent} onChange={e => setSelStudent(e.target.value)}><option value="">Select Cadet</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentCustomId})</option>)}</select></div>
                        )}
                        <input required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="Subject Domain" />
                        <textarea required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white h-24 resize-none outline-none focus:border-indigo-500" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Mission Objectives..." />
                        <div className="space-y-1"><label className="text-[8px] font-black uppercase text-white/30 ml-1 tracking-widest">Deadline</label><input required type="date" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white [color-scheme:dark]" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-[0.98]">Authorize Deployment</button>
                    </form>
                </div>
            </div>
            <div className="space-y-8">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Active Log</h4>
                    {list.map(hw => (
                        <div key={hw.id} className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5 flex justify-between items-start group hover:bg-white/[0.04] transition-all shadow-lg">
                            <div className="flex-1 overflow-hidden">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${hw.targetType === 'Global' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : hw.targetType === 'Individual' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>{hw.targetType}</span>
                                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">{hw.subject}</span>
                                </div>
                                <p className="text-base font-serif italic text-white/80 leading-snug truncate">"{hw.task}"</p>
                                <div className="mt-4 flex items-center gap-2 text-white/20"><Clock size={10} /><p className="text-[8px] font-black uppercase tracking-widest">Due: {hw.dueDate}</p></div>
                            </div>
                            <button onClick={async (e)=>{e.stopPropagation(); if(confirm('Delete?')){await db.deleteHomework(hw.id); load();}}} className="p-2 text-white/5 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {list.length === 0 && <div className="py-20 text-center text-white/5 uppercase font-black text-[10px] tracking-widest border-2 border-dashed border-white/5 rounded-[32px]">No Active Assignments</div>}
                </div>
            </div>
        </div>
    );
};

const NotesModule = ({ teacherId, refreshTrigger }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    
    // Scoping Logic for Notes
    const [targetScope, setTargetScope] = useState<'Global' | 'Grade' | 'Division' | 'Individual'>('Global');
    const [selGrade, setSelGrade] = useState('');
    const [selDiv, setSelDiv] = useState('');
    const [selStudent, setSelStudent] = useState('');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [form, setForm] = useState({ subject: '', title: '', content: '' });
    
    const load = useCallback(() => { 
        db.getNotes().then(setNotes); 
        db.getGrades().then(setGrades);
    }, []);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    // Dynamic filtering for students
    useEffect(() => {
        if (targetScope === 'Global') return;
        if (selGrade) {
            db.getSubdivisions(selGrade).then(setSubdivisions);
            if (targetScope === 'Individual') db.getStudents(selGrade, selDiv || undefined).then(setStudents);
        }
    }, [targetScope, selGrade, selDiv]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addNote({
            targetType: targetScope,
            gradeId: selGrade,
            divisionId: selDiv,
            targetStudentId: selStudent,
            teacherId,
            ...form
        });
        setForm({ subject: '', title: '', content: '' });
        setSelGrade(''); setSelDiv(''); setSelStudent(''); setTargetScope('Global');
        setIsAdding(false);
        load();
        alert("Study Note Archived.");
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient">Notes.</h3>
                <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">+ Upload Note</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(n => (
                    <div key={n.id} className="bg-white/[0.03] p-6 rounded-[40px] border border-white/5 flex flex-col group relative hover:border-indigo-500/20 transition-all shadow-xl h-64">
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${n.targetType === 'Global' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>{n.targetType || 'Grade'}</span>
                            <button onClick={async (e)=>{e.stopPropagation(); if(confirm('Purge Note?')){await db.deleteNote(n.id); load();}}} className="text-white/5 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                        </div>
                        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest mb-2 block">{n.subject}</span>
                        <h4 className="text-xl font-bold mb-3 text-white/90 truncate italic">{n.title}</h4>
                        <p className="text-[10px] text-white/30 line-clamp-4 leading-relaxed font-medium flex-1">{n.content}</p>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[7px] font-black uppercase text-white/10">{n.createdAt?.split('T')[0]}</span>
                            <div className="flex gap-2"><Database size={12} className="text-white/10" /></div>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && <div className="col-span-full py-20 text-center text-white/5 uppercase font-black text-[10px] tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">Shared Archives Clear</div>}
            </div>
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                        <div className="bg-[#0A0A0E] border border-white/10 rounded-[48px] w-full max-w-md p-10 relative shadow-2xl">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
                            <h3 className="text-3xl font-light serif-font mb-8 text-center italic luxury-text-gradient tracking-tight">Intel Input.</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase text-white/30 ml-1 tracking-widest">Scope</label>
                                    <div className="grid grid-cols-4 gap-2 bg-black rounded-xl p-1 border border-white/10">
                                        {['Global', 'Grade', 'Division', 'Individual'].map(scope => (
                                            <button type="button" key={scope} onClick={() => { setTargetScope(scope as any); setSelGrade(''); setSelDiv(''); setSelStudent(''); }} className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${targetScope === scope ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>{scope === 'Individual' ? 'Student' : scope}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {(targetScope !== 'Global') && (
                                        <select className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" value={selGrade} onChange={e=>setSelGrade(e.target.value)}><option value="">Select Grade</option>{grades.map(g=><option key={g.id} value={g.id}>{g.gradeName}</option>)}</select>
                                    )}
                                    {(targetScope === 'Division' || (targetScope === 'Individual' && selGrade)) && (
                                        <select className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" value={selDiv} onChange={e=>setSelDiv(e.target.value)}><option value="">Select Div</option>{subdivisions.map(s=><option key={s.id} value={s.id}>{s.divisionName}</option>)}</select>
                                    )}
                                </div>
                                {targetScope === 'Individual' && selGrade && (
                                    <select className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" value={selStudent} onChange={e=>setSelStudent(e.target.value)}><option value="">Select Cadet</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                )}
                                <input required placeholder="Subject Domain" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white outline-none focus:border-indigo-500" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} />
                                <input required placeholder="Document Title" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white outline-none focus:border-indigo-500" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
                                <textarea required placeholder="Intel Intel Summary..." className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs text-white h-24 resize-none outline-none focus:border-indigo-500" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} />
                                <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white transition-all">Authorize Archival</button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ExamBuilderModule = ({ teacherId, refreshTrigger }: any) => {
    // ... (Existing code with added Scope Selector Logic)
    const [exams, setExams] = useState<Exam[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    
    // Scope Logic
    const [targetScope, setTargetScope] = useState<'Global' | 'Grade' | 'Division' | 'Individual'>('Global');
    const [selGrade, setSelGrade] = useState('');
    const [selDiv, setSelDiv] = useState('');
    const [selStudent, setSelStudent] = useState('');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [form, setForm] = useState<any>({ 
        title: '', subject: '', duration: 30, examDate: '', startTime: '', 
        totalMarks: 0, questions: [], reopenable: false 
    });

    const load = useCallback(() => {
        db.getExams().then(setExams);
        db.getGrades().then(setGrades);
    }, []);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    useEffect(() => {
        if (targetScope === 'Global') return;
        if (selGrade) {
            db.getSubdivisions(selGrade).then(setSubdivisions);
            if (targetScope === 'Individual') db.getStudents(selGrade, selDiv || undefined).then(setStudents);
        }
    }, [targetScope, selGrade, selDiv]);

    const addQuestion = (type: 'mcq' | 'short' | 'paragraph') => {
        const newQ: Question = {
            id: Math.random().toString(),
            text: '',
            type,
            marks: 1,
            options: type === 'mcq' ? ['', '', '', ''] : undefined
        };
        setForm({ ...form, questions: [...form.questions, newQ] });
    };

    const validateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation Scope
        if (targetScope === 'Grade' && !selGrade) return alert("Select a Grade.");
        if (targetScope === 'Division' && (!selGrade || !selDiv)) return alert("Select Grade & Division.");
        if (targetScope === 'Individual' && !selStudent) return alert("Select a Student.");

        const currentSum = (form.questions as any[]).reduce((a: number, b: any) => a + (parseInt(b.marks) || 0), 0);
        if (currentSum !== parseInt(form.totalMarks)) return alert(`Inconsistent Marks. Questions total: ${currentSum}`);
        
        await db.addExam({ 
            targetType: targetScope,
            gradeId: selGrade, 
            subdivisionId: selDiv, 
            targetStudentId: selStudent,
            ...form, 
            createdBy: teacherId 
        });
        setIsCreating(false);
        setForm({ title: '', subject: '', duration: 30, examDate: '', startTime: '', totalMarks: 0, questions: [], reopenable: false });
        setSelGrade(''); setSelDiv(''); setSelStudent(''); setTargetScope('Global');
        load();
        alert("Assessment Module Finalized.");
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient">Conduct Exam.</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">+ Build Exam</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map(e => (
                    <div key={e.id} className="bg-white/[0.03] p-6 rounded-[40px] border border-white/5 flex flex-col group relative shadow-xl hover:border-rose-500/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${e.targetType === 'Global' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{e.targetType}</span>
                            <button onClick={async (exEv)=>{exEv.stopPropagation(); if(confirm('Purge Exam?')){await db.deleteExam(e.id); load();}}} className="text-white/5 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                        </div>
                        <h4 className="text-xl font-bold mb-4 text-white/90 italic truncate">{e.title}</h4>
                        <div className="text-[8px] font-bold text-white/30 space-y-2 mt-auto bg-black/40 p-4 rounded-3xl border border-white/5">
                            <p className="flex items-center gap-2"><CalendarIcon size={10} className="text-rose-500/50"/> {e.examDate}</p>
                            <p className="flex items-center gap-2"><Clock size={10} className="text-indigo-500/50"/> {e.startTime} ({e.duration} min)</p>
                            <p className="flex items-center gap-2"><Award size={10} className="text-amber-500/50"/> {e.totalMarks} Marks Potential</p>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-20 text-center text-white/5 uppercase font-black text-[10px] tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">Evaluation Buffer Clear</div>}
            </div>

            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0E] border border-white/10 rounded-[48px] w-full max-w-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-2xl pb-24 md:pb-12">
                            <button onClick={()=>setIsCreating(false)} className="absolute top-8 right-8 text-white/20 hover:text-white z-20"><X size={28}/></button>
                            <h3 className="text-3xl font-light serif-font mb-10 text-center italic luxury-text-gradient tracking-tighter">Exam Builder.</h3>
                            
                            <form onSubmit={validateAndSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase text-white/30 ml-2 tracking-widest">Context Scope</label>
                                    <div className="grid grid-cols-4 gap-2 bg-black rounded-xl p-1 border border-white/10">
                                        {['Global', 'Grade', 'Division', 'Individual'].map(scope => (
                                            <button type="button" key={scope} onClick={() => { setTargetScope(scope as any); setSelGrade(''); setSelDiv(''); setSelStudent(''); }} className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${targetScope === scope ? 'bg-rose-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>{scope === 'Individual' ? 'Student' : scope}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {(targetScope !== 'Global') && (
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-indigo-500" value={selGrade} onChange={e=>setSelGrade(e.target.value)}><option value="">Select Grade</option>{grades.map(g=><option key={g.id} value={g.id}>{g.gradeName}</option>)}</select>
                                        )}
                                        {(targetScope === 'Division' || (targetScope === 'Individual' && selGrade)) && (
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-indigo-500" value={selDiv} onChange={e=>setSelDiv(e.target.value)}><option value="">Select Div</option>{subdivisions.map(s=><option key={s.id} value={s.id}>{s.divisionName}</option>)}</select>
                                        )}
                                    </div>
                                    {targetScope === 'Individual' && selGrade && (
                                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-indigo-500 mt-2" value={selStudent} onChange={e=>setSelStudent(e.target.value)}><option value="">Select Cadet</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-white/30 ml-2">General Metadata</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input required placeholder="Module Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:text-white/5" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
                                        <input required placeholder="Subject Domain" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:text-white/5" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white/30 ml-2">Battle Coordinate (Date)</label>
                                        <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all [color-scheme:dark]" value={form.examDate} onChange={e=>setForm({...form, examDate:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white/30 ml-2">Timeline Configuration</label>
                                        <div className="flex gap-2">
                                            <input required type="time" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all [color-scheme:dark]" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
                                            <div className="relative w-28">
                                                <input required type="number" placeholder="Min" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all" value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})} />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white/20 uppercase">Min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white/30 ml-2">Marking Capacity</label>
                                        <input required type="number" placeholder="Total Points" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500 transition-all font-mono" value={form.totalMarks} onChange={e=>setForm({...form, totalMarks:e.target.value})} />
                                    </div>
                                    <label className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors h-[54px]">
                                        <input type="checkbox" checked={form.reopenable} onChange={e=>setForm({...form, reopenable: e.target.checked})} className="w-4 h-4 rounded-md border-white/20 bg-black text-indigo-600 focus:ring-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Persistence Allowed</span>
                                    </label>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Structural Nodes (Questions)</h4>
                                        <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                            <button type="button" onClick={()=>addQuestion('mcq')} className="bg-indigo-500/10 text-indigo-400 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">+ OMR</button>
                                            <button type="button" onClick={()=>addQuestion('short')} className="bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">+ Short</button>
                                            <button type="button" onClick={()=>addQuestion('paragraph')} className="bg-purple-500/10 text-purple-400 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all">+ Para</button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {form.questions.map((q: any, idx: number) => (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={q.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] space-y-4 relative group">
                                                <button type="button" onClick={()=>{const qs=[...form.questions]; qs.splice(idx,1); setForm({...form, questions:qs})}} className="absolute top-4 right-4 text-white/10 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white/20 font-black italic text-xl">#0{idx+1}</span>
                                                        <span className="text-[7px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-400/5 px-2 py-1 rounded-lg border border-indigo-400/10">{q.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[8px] font-black uppercase text-white/20">Marks:</label>
                                                        <input type="number" className="w-16 bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-center text-white outline-none focus:border-indigo-500 font-mono" value={q.marks} onChange={e=>{const qs=[...form.questions]; qs[idx].marks=e.target.value; setForm({...form, questions:qs})}} />
                                                    </div>
                                                </div>
                                                <input required placeholder="Module Instruction/Question..." className="w-full bg-transparent border-b border-white/10 py-3 outline-none focus:border-indigo-500 text-sm font-medium text-white placeholder:text-white/10" value={q.text} onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} />
                                                
                                                {q.type === 'mcq' && q.options && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                        {q.options.map((opt: string, oIdx: number) => (
                                                            <div key={oIdx} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 group/opt">
                                                                <span className="text-[10px] font-black text-indigo-400 group-focus-within/opt:scale-110 transition-transform">{String.fromCharCode(65+oIdx)}</span>
                                                                <input required placeholder={`Opt ${oIdx+1}`} className="bg-transparent outline-none text-xs w-full text-white placeholder:text-white/5" value={opt} onChange={e=>{const qs=[...form.questions]; qs[idx].options![oIdx]=e.target.value; setForm({...form, questions:qs})}} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {form.questions.length === 0 && <div className="py-20 text-center text-white/5 font-black uppercase tracking-[0.5em] text-[10px] border-2 border-dashed border-white/5 rounded-[40px]">No Neural Nodes Integrated</div>}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-black/40 -mx-8 -mb-12 p-8 md:-mx-12 md:p-12 sticky bottom-0 z-20">
                                    <div className="text-center sm:text-left">
                                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">structural Integrity Check</p>
                                        <p className={`text-2xl font-black italic tracking-tighter transition-colors ${(form.questions as any[]).reduce((a:number,b:any)=>a+(parseInt(b.marks)||0),0) === parseInt(form.totalMarks) ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {(form.questions as any[]).reduce((a:number,b:any)=>a+(parseInt(b.marks)||0),0)} / {form.totalMarks || 0}
                                        </p>
                                    </div>
                                    <button type="submit" className="w-full sm:w-auto bg-white text-black px-16 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-indigo-500 hover:text-white transition-all active:scale-95">Authorize Initialization</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CheckExamsModule = ({ refreshTrigger }: any) => {
    // ... (Existing code)
    const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
    const [selectedSub, setSelectedSub] = useState<ExamSubmission | null>(null);
    const [marks, setMarks] = useState<Record<string, number>>({});
    const [exams, setExams] = useState<Exam[]>([]);

    const load = useCallback(async () => {
        const [subs, exList] = await Promise.all([db.getAllExamSubmissions(), db.getExams()]);
        setSubmissions(subs);
        setExams(exList);
    }, []);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const activeExam = selectedSub ? exams.find(e => e.id === selectedSub.examId) : null;

    const handleGrade = async () => {
        if (!selectedSub) return;
        const total = (Object.values(marks) as number[]).reduce((a: number, b: number) => a + b, 0);
        await db.updateExamSubmissionGrading(selectedSub.id, marks, total);
        setSelectedSub(null);
        setMarks({});
        load();
        alert(`Evaluation Complete. Points: ${total}`);
    };

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Check Exam.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Personnel Response Validation</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.filter(s => s.status !== 'Graded').map(s => (
                    <div key={s.id} onClick={() => setSelectedSub(s)} className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 flex flex-col group relative hover:border-indigo-500/20 transition-all cursor-pointer shadow-xl min-h-[160px]">
                        <div className="flex items-center gap-4 mb-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center font-black text-indigo-400 italic shadow-inner border border-indigo-500/5">#</div>
                            <div className="overflow-hidden">
                                <h4 className="text-lg font-bold text-white leading-tight truncate">{s.studentName || 'Unknown Cadet'}</h4>
                                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mt-1">Protocol: {s.examId.slice(0, 8)}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase text-indigo-400 mt-auto flex items-center gap-2 group-hover:gap-4 transition-all duration-300"><ArrowRight size={10}/> Open Answer Packet</p>
                    </div>
                ))}
                {submissions.filter(s => s.status !== 'Graded').length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/10 font-black uppercase tracking-widest border border-dashed border-white/10 rounded-[40px]">Validation Queue Empty</div>
                )}
            </div>

            <AnimatePresence>
                {selectedSub && activeExam && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/98 p-4 backdrop-blur-xl">
                        <motion.div initial={{ scale:0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0E] border border-white/10 rounded-[48px] w-full max-w-3xl p-10 relative flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                            <button onClick={()=>setSelectedSub(null)} className="absolute top-10 right-10 text-white/20 hover:text-white z-50 transition-colors"><X size={28}/></button>
                            <div className="mb-10 border-b border-white/5 pb-6">
                                <h3 className="text-3xl font-light serif-font italic luxury-text-gradient mb-2">{selectedSub.studentName}</h3>
                                <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Evaluation Protocol: {activeExam.title}</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-10 pb-10">
                                {activeExam.questions.map((q, idx) => (
                                    <div key={q.id} className="space-y-4 border-l-2 border-white/5 pl-8 relative group/q">
                                        <span className="absolute -left-3 top-0 w-6 h-6 bg-[#0A0A0E] border border-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-white/20 group-hover/q:text-indigo-400 transition-colors">{idx+1}</span>
                                        <h4 className="text-lg font-bold text-white/80 leading-relaxed">{q.text}</h4>
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 italic text-indigo-200 shadow-inner">
                                            {selectedSub.answers[q.id] || '(Null Transmission)'}
                                        </div>
                                        <div className="flex items-center gap-4 pt-2">
                                            <label className="text-[9px] font-black uppercase text-white/20 tracking-widest">Awarded Weight:</label>
                                            <input 
                                                type="number" 
                                                max={q.marks} 
                                                className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs w-20 text-white outline-none focus:border-emerald-500 font-mono text-center" 
                                                value={marks[q.id] || 0} 
                                                onChange={e=>setMarks({...marks, [q.id]: parseInt(e.target.value)||0})} 
                                            />
                                            <span className="text-[9px] font-black uppercase text-white/10 tracking-tighter">/ {q.marks} PTS</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-6 border-t border-white/5 flex justify-between items-center bg-black/40 -mx-10 -mb-10 p-10 mt-auto">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em]">Cumulative Points</p>
                                    <p className="text-3xl font-black text-emerald-400 italic">{(Object.values(marks) as number[]).reduce((a,b)=>a+b,0)} / {activeExam.totalMarks}</p>
                                </div>
                                <button onClick={handleGrade} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95">Commit Evaluation</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LeaveRequestsModule = ({ gradeId, divisionId, refreshTrigger }: any) => {
    // ... (Existing code)
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    
    // Fixed: Now allows fetching without strict filtering to support "All Grades"
    const load = useCallback(() => { 
        db.getLeaveApplications(undefined, gradeId || undefined, divisionId || undefined).then(setLeaves); 
    }, [gradeId, divisionId]);

    useEffect(() => { load(); }, [load, refreshTrigger]);
    
    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => { 
        await db.updateLeaveStatus(id, status); 
        load(); 
        alert(`Absence Protocol marked: ${status}.`);
    };
    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Leave Management.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Personnel Absence Log</p>
            </div>
            <div className="space-y-4">
                {leaves.map(l => (
                    <div key={l.id} className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5 flex flex-col md:flex-row items-center justify-between group hover:bg-white/[0.04] transition-all gap-6 shadow-xl">
                        <div className="flex items-center gap-6 text-center md:text-left overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 font-black italic text-indigo-400 group-hover:text-white transition-colors shadow-inner shrink-0">{l.studentName.charAt(0)}</div>
                            <div className="overflow-hidden">
                                <h4 className="text-lg font-bold text-white italic truncate">{l.studentName}</h4>
                                <p className="text-[9px] text-white/30 uppercase mt-1 leading-relaxed line-clamp-1">Rationale: {l.reason}</p>
                                <p className="text-[8px] text-white/20 mt-2 font-mono tracking-widest">{l.startDate} » {l.endDate}</p>
                            </div>
                        </div>
                        {l.status === 'Pending' ? (
                            <div className="flex gap-3">
                                <button onClick={()=>handleAction(l.id, 'Approved')} className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90" title="Authorize Absence"><Check size={20}/></button>
                                <button onClick={()=>handleAction(l.id, 'Rejected')} className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-90" title="Deny Request"><X size={20}/></button>
                            </div>
                        ) : (
                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] border px-6 py-2.5 rounded-full ${l.status === 'Approved' ? 'border-emerald-500/20 text-emerald-400' : 'border-rose-500/20 text-rose-400'}`}>{l.status} Protocol</span>
                        )}
                    </div>
                ))}
                {leaves.length === 0 && <div className="py-20 text-center text-white/5 font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">Absence Logs Nominal</div>}
            </div>
        </div>
    );
};

const StudentExamsView = ({ gradeId, divisionId, refreshTrigger }: any) => {
    // ... (Existing code)
    const [exams, setExams] = useState<StudentOwnExam[]>([]);
    
    // Fixed: Now allows fetching without strict filtering to support "All Grades"
    useEffect(() => { 
        db.getStudentExams(undefined, gradeId || undefined, divisionId || undefined).then(setExams); 
    }, [gradeId, divisionId, refreshTrigger]);

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Upcoming Exams.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">External Institutional Modules</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-white/[0.02] p-6 rounded-[32px] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all shadow-xl group">
                        <div className="flex items-center gap-5 overflow-hidden">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/10 font-black italic shadow-inner shrink-0">{ex.studentName.charAt(0)}</div>
                            <div className="overflow-hidden">
                                <h4 className="text-base font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">{ex.subject}</h4>
                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest truncate">{ex.studentName}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[7px] font-black uppercase text-indigo-400 mb-1 tracking-widest">Temporal Coordinate</p>
                            <p className="text-sm font-mono font-bold text-indigo-300">{ex.examDate}</p>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-20 text-center text-white/5 font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">No External Cycles Detected</div>}
            </div>
        </div>
    );
};

const DoubtSolveModule = ({ refreshTrigger }: any) => {
    // ... (Existing code)
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load, refreshTrigger]);
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="pb-4 border-b border-white/5">
                <h3 className="text-3xl md:text-5xl font-light serif-font italic luxury-text-gradient tracking-tighter">Doubts.</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mt-1">Faculty Communication Node</p>
            </div>
            <div className="space-y-6">
                {queries.map(q => (
                    <div key={q.id} className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 space-y-8 transition-all hover:border-indigo-500/20 shadow-2xl relative group overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/5 pb-8 gap-4">
                            <div className="flex items-center gap-6 overflow-hidden">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600/5 text-indigo-400 flex items-center justify-center text-xl font-black shadow-inner border border-indigo-500/5 group-hover:text-white transition-all shrink-0">{q.studentName.charAt(0)}</div>
                                <div className="overflow-hidden">
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2 truncate">{q.subject}</h4>
                                    <p className="text-2xl font-bold text-white italic tracking-tighter truncate">{q.studentName}</p>
                                </div>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.4em] px-6 py-2.5 rounded-full border transition-all shrink-0 ${q.status === 'Answered' ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/10 bg-amber-500/5 text-amber-400 animate-pulse'}`}>{q.status} Status</span>
                        </div>
                        <p className="font-serif italic text-2xl md:text-3xl text-white/30 leading-snug tracking-tighter group-hover:text-white/60 transition-colors">"{q.queryText}"</p>
                        {q.status === 'Answered' ? (
                            <div className="pt-8 border-t border-white/5 p-4">
                                <p className="text-lg leading-relaxed text-indigo-200/60 font-medium italic tracking-tight border-l-2 border-indigo-500/20 pl-6">Transmission Response: "{q.replyText}"</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <input className="flex-1 bg-black border border-white/10 rounded-[28px] px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/5" placeholder="Formulate Faculty Response..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} />
                                <button onClick={async ()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black px-10 py-5 rounded-[28px] font-black text-[9px] uppercase tracking-[0.5em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"><Send size={14}/> Transmit</button>
                            </div>
                        )}
                    </div>
                ))}
                {queries.length === 0 && <div className="py-20 text-center text-white/5 uppercase font-black text-[10px] tracking-widest border-2 border-dashed border-white/5 rounded-[50px]">Transmission Hub Idle</div>}
            </div>
        </div>
    );
};

const CoreSettings = ({ user }: { user: User }) => {
    // ... (Existing code)
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Hash Mismatch: Keys do not align.');
        setLoading(true);
        try { 
            await db.changePassword(user.id, 'teacher', form.current, form.new); 
            alert('Personnel Security Keys Re-indexed.'); 
            setForm({current:'',new:'',confirm:''}); 
        } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-20 space-y-12 text-center">
            <div className="bg-[#0A0A0E] p-12 rounded-[60px] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-10 text-indigo-400 border border-white/10 shadow-inner">
                    <Lock size={32} className="group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-3xl font-light serif-font mb-10 luxury-text-gradient italic">Encryption Keys.</h3>
                <form onSubmit={update} className="space-y-4">
                    <input required type="password" placeholder="CURRENT KEY" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-[10px] text-white font-mono tracking-[0.4em] text