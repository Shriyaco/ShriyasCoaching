
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
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
        y: 0, 
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 200, damping: 18 }
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
        { id: 'grading', label: 'Review Queue', icon: Award },
        { id: 'student-exams', label: 'Student Exams', icon: Calendar },
        { id: 'leaves', label: 'Absence Req.', icon: Clock },
        { id: 'queries', label: 'Inquiries', icon: MessageSquare },
        { id: 'settings', label: 'Control', icon: Settings }
    ];

    const selectedDivision = availableSubdivisions.find(s => s.id === selectedDivisionId);

    return (
        <div className="min-h-screen bg-[#020204] text-white flex font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            
            {/* --- Ambient Background Layers --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-900/10 rounded-full blur-[150px]" 
                />
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* --- Cyber Sidebar --- */}
            <aside className={`w-72 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed inset-y-0 z-50 transition-all duration-700 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,1)]' : '-translate-x-full'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center gap-3">
                            <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-10 w-auto invert brightness-200" />
                            <div className="w-[1px] h-6 bg-white/10" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Faculty</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white/40 hover:text-white p-2 bg-white/5 rounded-xl transition-all"><X size={20}/></button>
                    </div>
                    
                    <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] translate-x-2' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
                            >
                                <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2} className={activeTab === item.id ? 'text-white' : 'text-white/10 group-hover:text-white/40'} />
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div layoutId="sidebar-active" className="absolute -left-1 w-1 h-6 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="bg-white/5 p-5 rounded-[28px] border border-white/5 mb-6 group hover:border-indigo-500/30 transition-all flex items-center gap-4 cursor-default">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-sm shadow-2xl group-hover:scale-105 transition-transform">{user?.username.charAt(0)}</div>
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-black uppercase tracking-widest truncate text-white/90">{user?.username}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
                                    <p className="text-[8px] text-white/20 uppercase font-bold tracking-tighter">Encrypted Link Active</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-[0.4em] transition-all border border-transparent hover:border-rose-500/20 active:scale-95"><LogOut size={16}/> Terminate Session</button>
                    </div>
                </div>
            </aside>

            {/* --- Main Cockpit View --- */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
                <header className="h-32 bg-[#020204]/60 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-8">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all shadow-xl">
                            <Menu size={24}/>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10">Transmission Terminal</h2>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-light serif-font tracking-tight capitalize text-white/90 italic">{activeTab.replace('-', ' ')}<span className="text-indigo-500">.</span></h1>
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-[32px] shadow-2xl">
                         <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest opacity-50">Class</span>
                            <select className="bg-transparent text-xs font-black uppercase tracking-[0.2em] outline-none text-white cursor-pointer" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                                {grades.map(g => <option key={g.id} value={g.id} className="bg-[#020204]">Grade {g.gradeName}</option>)}
                            </select>
                         </div>
                         <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest opacity-50">Section</span>
                            <select className="bg-transparent text-xs font-black uppercase tracking-[0.2em] outline-none text-white cursor-pointer" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                                {availableSubdivisions.map(s => <option key={s.id} value={s.id} className="bg-[#020204]">Div {s.divisionName}</option>)}
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

// --- REDESIGNED MODULES ---

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
        alert('Class Registry Updated.');
    };

    return (
        <div className="space-y-12">
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-white/5">
                <div>
                    <h3 className="text-5xl font-light serif-font mb-4 italic luxury-text-gradient">Daily Registry.</h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.5em] ml-1">Class Attendance Protocol v4.1</p>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-[32px] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="relative">
                        <Calendar size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black tracking-widest uppercase outline-none focus:border-indigo-500/50 transition-all text-white w-48" />
                    </div>
                    <button onClick={save} className="bg-white text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">Commit Updates</button>
                </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {students.map(s => (
                    <motion.div variants={itemVariants} key={s.id} className="bg-white/[0.01] p-8 rounded-[40px] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-6 relative z-10">
                             <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-black text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">{s.name.charAt(0)}</div>
                             <div>
                                <p className="text-lg font-bold text-white/90 tracking-tight group-hover:text-white transition-colors">{s.name}</p>
                                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1.5">{s.studentCustomId}</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})}
                            className={`px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all duration-500 active:scale-90 ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]'}`}
                        >
                            {attendanceMap[s.id]}
                        </button>
                    </motion.div>
                ))}
            </div>
            {students.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[1.5em] text-xs">Registry Node Standby</motion.div>}
        </div>
    );
};

const LiveManagementModule = ({ division, userName }: { division?: Subdivision, userName: string }) => {
    const [isInMeeting, setIsInMeeting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [tempMeetingId, setTempMeetingId] = useState<string | null>(null);
    
    if (!division) return <div className="py-60 text-center text-white/10 font-black uppercase text-[10px] tracking-[1em] border border-dashed border-white/5 rounded-[60px]">Select Division Target</div>;

    const startLive = async () => {
        const meetingId = `SG_${division.id.replace(/-/g, '')}`;
        setIsInitializing(true);
        setTempMeetingId(meetingId);
        try {
            setIsInMeeting(true);
            await db.setLiveStatus(division.id, true, meetingId);
        } catch (e) { console.error(e); }
        finally { setIsInitializing(false); }
    };

    const stopLive = async () => {
        try {
            await db.setLiveStatus(division.id, false);
            setIsInMeeting(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-xl mx-auto py-32 text-center">
            <motion.div 
                animate={division.isLive || isInMeeting ? { 
                    scale: [1, 1.05, 1],
                    boxShadow: ["0 0 40px rgba(79,70,229,0.1)", "0 0 100px rgba(79,70,229,0.4)", "0 0 40px rgba(79,70,229,0.1)"]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-48 h-48 rounded-[60px] mx-auto mb-16 flex items-center justify-center border-2 transition-all duration-1000 ${division.isLive || isInMeeting ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl' : 'bg-white/[0.02] border-white/5 shadow-inner'}`}
            >
                {isInitializing ? (
                    <Loader2 size={80} className="text-indigo-400 animate-spin" strokeWidth={1} />
                ) : (
                    <Radio size={80} className={division.isLive || isInMeeting ? 'text-indigo-400' : 'text-white/5'} strokeWidth={1} />
                )}
            </motion.div>
            <h3 className="text-6xl font-light serif-font mb-6 italic luxury-text-gradient">Hub Terminal.</h3>
            <p className="text-white/20 uppercase text-[10px] font-black tracking-[1em] mb-20 ml-2">Portal Status: {division.isLive ? 'Active Uplink' : 'Awaiting Connection'}</p>
            
            <div className="space-y-10">
                {!division.isLive ? (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startLive} 
                        disabled={isInitializing}
                        className="w-full bg-white text-black py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.6em] hover:bg-indigo-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] disabled:opacity-50"
                    >
                        {isInitializing ? 'Establishing Sync...' : 'Launch Portal'}
                    </motion.button>
                ) : (
                    <div className="space-y-8">
                        <button onClick={() => setIsInMeeting(true)} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.6em] hover:bg-indigo-500 transition-all shadow-[0_20px_60px_rgba(79,70,229,0.3)]">Enter Classroom</button>
                        <button onClick={stopLive} className="text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-3 mx-auto group"><Power size={14} className="group-hover:rotate-90 transition-transform" /> Terminate Stream</button>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <motion.div variants={itemVariants} className="lg:col-span-5 lg:sticky lg:top-40">
                <div className="bg-white/[0.02] p-12 rounded-[60px] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-transparent opacity-50" />
                    <h3 className="text-4xl font-light serif-font mb-16 italic">New Directive.</h3>
                    <form onSubmit={async (e)=>{e.preventDefault(); await db.addHomework({gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId}); setForm({subject:'',task:'',dueDate:''}); load();}} className="space-y-10">
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Target Department</label><input required className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-white/5" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="e.g. Science" /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Operation Payload</label><textarea required className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 h-48 resize-none transition-all font-medium placeholder:text-white/5" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Input mission details..." /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Deadline Protocol</label><input required type="date" className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-mono" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /></div>
                        <button className="w-full bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.5em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95">Deploy Assignment</button>
                    </form>
                </div>
            </motion.div>
            <div className="lg:col-span-7 space-y-8">
                <h4 className="text-[11px] font-black uppercase tracking-[1em] text-white/10 mb-12 ml-6">Deployment Archive</h4>
                {homeworkList.map(hw => (
                    <motion.div variants={itemVariants} key={hw.id} className="bg-white/[0.01] p-12 rounded-[56px] border border-white/5 flex justify-between items-start group hover:border-indigo-500/20 transition-all shadow-xl hover:shadow-indigo-500/5 relative">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-10">
                                <span className="text-indigo-400 font-black text-[9px] uppercase tracking-[0.4em] bg-indigo-500/10 px-6 py-2.5 rounded-2xl border border-indigo-500/20 shadow-inner">{hw.subject}</span>
                                <div className="flex items-center gap-3 text-white/20">
                                    <Clock size={14} strokeWidth={2.5}/>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">DUE: {hw.dueDate}</span>
                                </div>
                            </div>
                            <p className="text-3xl text-white/70 font-serif italic leading-[1.4] tracking-tight">"{hw.task}"</p>
                        </div>
                        <button onClick={async ()=>{if(confirm('Erase Assignment Data?')){await db.deleteHomework(hw.id); load();}}} className="p-5 text-white/5 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 active:scale-90"><Trash2 size={24} strokeWidth={1.5}/></button>
                    </motion.div>
                ))}
                {homeworkList.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center border border-dashed border-white/5 rounded-[80px] text-white/5 font-black uppercase text-[11px] tracking-[1.5em]">Log Terminal Clean</motion.div>}
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
        <div className="space-y-20">
            <motion.div variants={itemVariants} className="flex justify-between items-center pb-12 border-b border-white/5">
                 <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">Vault Resources.</h3>
                 <button onClick={()=>setIsAdding(true)} className="bg-white text-black px-14 py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95">+ Archive Entry</button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {notes.map(n => (
                    <motion.div variants={itemVariants} key={n.id} className="bg-white/[0.01] p-14 rounded-[70px] border border-white/5 group hover:border-emerald-500/20 flex flex-col h-full relative transition-all shadow-2xl hover:shadow-emerald-500/5">
                        <div className="absolute top-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={async ()=>{if(confirm('Purge Entry?')){await db.deleteNote(n.id); load();}}} className="text-white/10 hover:text-rose-500 active:scale-90"><Trash2 size={24} strokeWidth={1.5}/></button>
                        </div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-12 block">{n.subject}</span>
                        <h4 className="text-3xl font-bold mb-10 flex-1 leading-[1.2] text-white/90 italic tracking-tighter">{n.title}</h4>
                        <p className="text-sm text-white/30 mb-14 line-clamp-4 leading-loose font-medium">{n.content}</p>
                        {n.fileUrl && (
                            <div className="space-y-6">
                                {n.fileUrl.startsWith('data:image') && (
                                    <div className="w-full aspect-video rounded-[32px] overflow-hidden mb-6 border border-white/5 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                                        <img src={n.fileUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                    </div>
                                )}
                                <a href={n.fileUrl} target="_blank" className="w-full py-6 bg-white/5 border border-white/5 rounded-[32px] text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-white/10 transition-all hover:text-emerald-400 group-hover:shadow-emerald-500/10 shadow-lg">
                                    <ExternalLink size={16}/> Access Archive
                                </a>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
            {notes.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[1.5em] text-xs">Archive Node Dormant</motion.div>}
            
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-[#0A0A0A] border border-white/10 rounded-[80px] w-full max-w-2xl p-20 relative shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col max-h-[95vh] overflow-hidden">
                            <button onClick={()=>setIsAdding(false)} className="absolute top-14 right-14 text-white/20 hover:text-white transition-all p-3 hover:bg-white/5 rounded-full"><X size={32}/></button>
                            <h3 className="text-4xl font-light serif-font mb-14 text-center uppercase tracking-[0.5em] luxury-text-gradient italic">Registry Input.</h3>
                            
                            <form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-8 overflow-y-auto pr-4 scrollbar-hide">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Origin Sector</label>
                                    <input required placeholder="DEPARTMENT" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-6 text-[10px] font-black tracking-[0.5em] uppercase outline-none focus:border-emerald-500/50 transition-all" onChange={e=>setForm({...form, subject:e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Label</label>
                                    <input required placeholder="RESOURCE NAME" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-6 text-[10px] font-black tracking-[0.5em] uppercase outline-none focus:border-emerald-500/50 transition-all" onChange={e=>setForm({...form, title:e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Data Payload</label>
                                    <textarea required placeholder="SUMMARY ANALYSIS" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-6 text-sm outline-none focus:border-emerald-500/50 h-40 resize-none transition-all font-medium" onChange={e=>setForm({...form, content:e.target.value})} />
                                </div>
                                
                                <div className="space-y-4 pt-4">
                                    <label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Visual Asset Relay</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center relative hover:bg-white/10 transition-all group cursor-pointer shadow-inner">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="mx-auto text-emerald-500 mb-3 group-hover:scale-110 transition-transform" size={32} strokeWidth={1.5} />
                                            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Library Uplink</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center relative hover:bg-white/10 transition-all group cursor-pointer shadow-inner">
                                            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Camera className="mx-auto text-indigo-500 mb-3 group-hover:scale-110 transition-transform" size={32} strokeWidth={1.5} />
                                            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Direct Capture</p>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-8 pointer-events-none text-white/10 group-focus-within:text-emerald-500 transition-colors"><ExternalLink size={18}/></div>
                                        <input placeholder="...OR COORDINATE URL" className="w-full bg-white/[0.02] border border-white/10 rounded-3xl pl-20 pr-10 py-6 text-[10px] font-black tracking-[0.5em] outline-none focus:border-emerald-500/50 transition-all" value={form.fileUrl} onChange={e=>setForm({...form, fileUrl:e.target.value})} />
                                    </div>
                                </div>
                                
                                {form.fileUrl && form.fileUrl.startsWith('data:image') && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full aspect-video rounded-[40px] overflow-hidden border-2 border-emerald-500/20 bg-black mt-4 shadow-2xl">
                                        <img src={form.fileUrl} className="w-full h-full object-contain" />
                                        <button onClick={() => setForm({ ...form, fileUrl: '' })} className="absolute top-4 right-4 p-3 bg-black/60 rounded-full text-white/80 hover:text-rose-400 transition-all backdrop-blur-md"><X size={20}/></button>
                                    </motion.div>
                                )}

                                <button className="w-full bg-white text-black py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.8em] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_30px_60px_rgba(255,255,255,0.1)] mt-10 active:scale-[0.98] shrink-0">Authorize Data Sync</button>
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
        <div className="space-y-20">
            <motion.div variants={itemVariants} className="flex justify-between items-center pb-12 border-b border-white/5">
                <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">Assessments Matrix.</h3>
                <button onClick={()=>setIsCreating(true)} className="bg-white text-black px-14 py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-95">Construct Protocol</button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {exams.map(e => (
                    <motion.div variants={itemVariants} key={e.id} className="bg-white/[0.01] p-14 rounded-[80px] border border-white/5 group hover:border-rose-500/30 flex flex-col h-full transition-all shadow-2xl hover:shadow-rose-500/5 overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/5 blur-[80px] pointer-events-none group-hover:bg-rose-500/10 transition-all" />
                        <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.5em] mb-12 block">{e.subject}</span>
                        <h4 className="text-3xl font-bold mb-12 flex-1 text-white/90 leading-[1.3] tracking-tighter italic">{e.title}</h4>
                        <div className="flex flex-wrap gap-4 text-white/20 text-[10px] font-black uppercase mb-16 border-t border-white/5 pt-12">
                             <span className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5"><Calendar size={14} className="text-rose-500" /> {e.examDate}</span>
                             <span className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5"><Clock size={14} className="text-rose-500" /> {e.startTime}</span>
                        </div>
                        <button onClick={async ()=>{if(confirm('Withdraw Assessment Module?')){await db.deleteExam(e.id); load();}}} className="text-[9px] font-black uppercase tracking-[0.5em] text-rose-500/30 hover:text-rose-500 transition-colors self-start border-b border-rose-500/10 pb-1.5 active:scale-95">Decommission Unit</button>
                    </motion.div>
                ))}
            </div>
            {exams.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[1.5em] text-xs">Battle Net Offline</motion.div>}
            
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-[50px]">
                        <motion.div initial={{ scale: 0.98, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 50 }} className="bg-[#0A0A0A] rounded-[100px] w-full max-w-6xl max-h-[92vh] overflow-y-auto p-16 md:p-24 border border-white/10 relative shadow-[0_50px_200px_rgba(0,0,0,1)] custom-scrollbar">
                            <button onClick={()=>setIsCreating(false)} className="absolute top-16 right-16 text-white/20 hover:text-white transition-all p-4 hover:bg-white/5 rounded-full"><X size={40}/></button>
                            <h3 className="text-5xl font-light serif-font mb-20 text-center uppercase tracking-[0.8em] luxury-text-gradient italic">Construct.</h3>
                            <form onSubmit={handleSubmit} className="space-y-24">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Assessment Label</label><input required placeholder="NAME UNIT" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-10 py-7 text-[11px] font-black uppercase tracking-[0.4em] outline-none focus:border-rose-500/50 transition-all shadow-inner" onChange={e=>setForm({...form, title:e.target.value})}/></div>
                                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Department</label><input required placeholder="SUBJECT" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-10 py-7 text-[11px] font-black uppercase tracking-[0.4em] outline-none focus:border-rose-500/50 transition-all shadow-inner" onChange={e=>setForm({...form, subject:e.target.value})}/></div>
                                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em] ml-2">Sync Date</label><input required type="date" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-10 py-7 text-[11px] font-black outline-none focus:border-rose-500/50 uppercase transition-all font-mono shadow-inner" onChange={e=>setForm({...form, examDate:e.target.value})}/></div>
                                </div>
                                <div className="space-y-16">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-10">
                                        <h4 className="text-[12px] font-black uppercase tracking-[1em] text-white/10 ml-2">Inventory Blocks</h4>
                                        <button type="button" onClick={()=>setForm({...form, questions: [...form.questions, { id: Math.random().toString(), text: '', type: 'mcq', marks: 1 }]})} className="bg-white/5 border border-white/10 px-12 py-5 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-2xl">+ New Data Unit</button>
                                    </div>
                                    <div className="space-y-12">
                                        {form.questions.map((q: any, idx: number) => (
                                            <div key={q.id} className="bg-white/[0.01] p-16 rounded-[60px] flex gap-16 items-start border border-white/5 transition-all hover:bg-white/[0.02] shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500/10 group-hover:bg-rose-500 transition-all duration-700" />
                                                <span className="font-serif italic text-7xl text-white/5 font-black shrink-0">0{idx+1}</span>
                                                <div className="flex-1 space-y-12">
                                                    <input required placeholder="Define inquiry vector..." className="w-full bg-transparent border-b-2 border-white/10 py-6 outline-none focus:border-rose-500 text-3xl font-light tracking-tighter italic transition-all" onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} />
                                                    <div className="flex gap-20">
                                                        <div className="flex items-center gap-8 group/select">
                                                            <span className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em] group-focus-within/select:text-rose-500 transition-colors">MODE:</span>
                                                            <select className="bg-transparent text-white/40 text-[12px] font-black uppercase tracking-[0.4em] outline-none cursor-pointer hover:text-white transition-colors" onChange={e=>{const qs=[...form.questions]; qs[idx].type=e.target.value; setForm({...form, questions:qs})}}>
                                                                <option value="mcq" className="bg-[#0A0A0A]">Objective</option>
                                                                <option value="short" className="bg-[#0A0A0A]">Subjective</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center gap-8 group/input">
                                                            <span className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em] group-focus-within/input:text-rose-500 transition-colors">PTS:</span>
                                                            <input type="number" placeholder="0" className="bg-transparent text-white/40 text-[14px] font-black uppercase tracking-[0.4em] outline-none w-24 border-b border-white/5 focus:border-rose-500 transition-all" onChange={e=>{const qs=[...form.questions]; qs[idx].marks=parseInt(e.target.value); setForm({...form, questions:qs})}} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={()=>setForm({...form, questions: form.questions.filter((item:any)=>item.id!==q.id)})} className="p-5 text-white/5 hover:text-rose-500 transition-all active:scale-90"><X size={32}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-10 pt-16 border-t border-white/5">
                                    <button type="button" onClick={()=>setIsCreating(false)} className="flex-1 py-8 border border-white/10 rounded-[40px] font-black text-[12px] uppercase tracking-[1em] hover:bg-white/5 transition-all text-white/20 active:scale-95">Discard Plan</button>
                                    <button className="flex-1 py-8 bg-white text-black rounded-[40px] font-black text-[12px] uppercase tracking-[1em] hover:bg-rose-500 hover:text-white transition-all shadow-[0_30px_100px_rgba(255,255,255,0.1)] active:scale-95">Deploy Protocol</button>
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
        <div className="max-w-4xl mx-auto space-y-20">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">Validation Deck.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-5 ml-1">Pending Sync Requests Queue</p>
            </motion.div>
            <div className="space-y-12">
                {subs.map(sub => (
                    <motion.div variants={itemVariants} key={sub.id} className="bg-white/[0.01] p-16 rounded-[80px] border border-white/5 flex flex-col items-start gap-12 hover:border-indigo-500/30 transition-all shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />
                        <div className="flex justify-between w-full border-b border-white/5 pb-10">
                            <p className="text-[11px] text-white/10 font-black uppercase tracking-[0.8em]">Unit ID: {sub.studentId.slice(0,8)}</p>
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] font-mono">{sub.submittedAt}</p>
                        </div>
                        <p className="text-4xl italic text-white/70 leading-[1.3] font-serif tracking-tighter">"{sub.submissionText}"</p>
                        {sub.imageUrl && (
                            <div className="w-full bg-white/[0.03] border border-white/5 rounded-[50px] p-10 shadow-inner group-hover:bg-white/[0.04] transition-colors">
                                <p className="text-[10px] font-black uppercase text-white/20 mb-8 tracking-[0.5em] ml-2">Visual Transmission Capture</p>
                                <div className="relative group/img overflow-hidden rounded-[40px] w-fit shadow-2xl">
                                    <img src={sub.imageUrl} className="max-w-full md:max-w-2xl rounded-[40px] border border-white/10 transition-transform duration-1000 group-hover/img:scale-105" alt="Submission" />
                                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )}
                        <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="w-full bg-white text-black py-8 rounded-[40px] font-black text-[13px] uppercase tracking-[1em] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_30px_80px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-6">
                            <Check size={24} strokeWidth={3}/> Confirm Data Sync
                        </button>
                    </motion.div>
                ))}
                {subs.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[2em] text-xs">Validation Terminal Idle</motion.div>}
            </div>
        </div>
    );
};

const StudentExamsView = ({ gradeId, divisionId }: { gradeId: string, divisionId: string }) => {
    const [exams, setExams] = useState<StudentOwnExam[]>([]);
    useEffect(() => { if(gradeId && divisionId) db.getStudentExams(undefined, gradeId, divisionId).then(setExams); }, [gradeId, divisionId]);
    return (
        <div className="max-w-4xl mx-auto space-y-20">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">External Syncs.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-5 ml-1">Student Declared Engagement Vectors</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-10">
                {exams.map(ex => (
                    <motion.div variants={itemVariants} key={ex.id} className="bg-white/[0.01] p-12 rounded-[60px] border border-white/5 flex items-center justify-between hover:border-indigo-500/20 shadow-2xl transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-10 relative z-10">
                            <div className="w-24 h-24 rounded-[40px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-indigo-400 text-3xl font-black italic shadow-inner group-hover:scale-105 group-hover:bg-indigo-500/10 transition-all duration-700">{ex.studentName.charAt(0)}</div>
                            <div>
                                <div className="flex gap-6 items-center mb-4">
                                    <h4 className="text-3xl font-bold text-white italic tracking-tighter">{ex.subject}</h4>
                                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-indigo-500/20 shadow-xl">{ex.studentName}</span>
                                </div>
                                <p className="text-base text-white/30 font-medium tracking-tight leading-relaxed max-w-lg">Mission Focus: {ex.description}</p>
                            </div>
                        </div>
                        <div className="text-right bg-white/[0.03] p-10 rounded-[48px] border border-white/5 min-w-[200px] shadow-inner group-hover:bg-white/[0.05] transition-all">
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.6em] mb-4">Sync Date</p>
                            <p className="text-4xl font-mono text-white font-black tracking-tighter italic">{ex.examDate}</p>
                        </div>
                    </motion.div>
                ))}
                {exams.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[1.5em] text-xs">No External Engagement Detected</motion.div>}
            </div>
        </div>
    );
};

const LeaveRequestsView = ({ gradeId, divisionId }: { gradeId: string, divisionId: string }) => {
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const load = useCallback(() => { if(gradeId && divisionId) db.getLeaveApplications(undefined, gradeId, divisionId).then(setLeaves); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);
    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => { await db.updateLeaveStatus(id, status); load(); };
    return (
        <div className="max-w-4xl mx-auto space-y-20">
            <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">Permission Logs.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-5 ml-1">Personnel Absence Vectors Control</p>
            </motion.div>
            <div className="space-y-10">
                {leaves.map(l => (
                    <motion.div variants={itemVariants} key={l.id} className="bg-white/[0.01] p-16 rounded-[80px] border border-white/5 flex flex-col md:flex-row justify-between gap-12 hover:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-60 h-60 bg-white/[0.02] rounded-bl-[150px] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 flex-1">
                            <div className="flex gap-8 items-center mb-10">
                                <h4 className="text-4xl font-bold text-white italic tracking-tighter">{l.studentName}</h4>
                                <span className={`text-[10px] font-black px-8 py-3 rounded-[24px] uppercase tracking-[0.4em] border transition-all duration-1000 shadow-xl ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' : l.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10'}`}>{l.status}</span>
                            </div>
                            <p className="text-2xl text-white/50 mb-12 font-serif leading-[1.4] italic max-w-xl">"{l.reason}"</p>
                            <div className="flex items-center gap-4 text-white/20 bg-white/5 w-fit px-8 py-3.5 rounded-3xl border border-white/5 shadow-inner">
                                <Calendar size={16} className="text-indigo-400" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] font-mono">{l.startDate} <span className="mx-4 text-indigo-500">>>></span> {l.endDate}</p>
                            </div>
                        </div>
                        {l.status === 'Pending' && (
                            <div className="flex gap-6 self-start md:self-center relative z-10">
                                <button onClick={() => handleAction(l.id, 'Approved')} className="w-24 h-24 rounded-[40px] bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center justify-center active:scale-90 group/btn"><Check size={40} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /></button>
                                <button onClick={() => handleAction(l.id, 'Rejected')} className="w-24 h-24 rounded-[40px] bg-rose-500/10 text-rose-500 border-2 border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(244,63,94,0.2)] flex items-center justify-center active:scale-90 group/btn"><X size={40} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /></button>
                            </div>
                        )}
                    </motion.div>
                ))}
                {leaves.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[2em] text-xs">Personnel Deployment Nominal</motion.div>}
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
        <div className="max-w-4xl mx-auto space-y-20">
             <motion.div variants={itemVariants} className="pb-12 border-b border-white/5">
                <h3 className="text-5xl font-light serif-font italic luxury-text-gradient">Intelligence Relay.</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-5 ml-1">Secure Relayed Inquiries Response Unit</p>
             </motion.div>
             <div className="space-y-12">
                 {queries.map(q => (
                    <motion.div variants={itemVariants} key={q.id} className="bg-white/[0.01] p-16 rounded-[100px] border border-white/5 space-y-16 transition-all hover:border-indigo-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-white/5 pb-12">
                            <div className="flex items-center gap-10">
                                <div className="w-20 h-20 rounded-[32px] bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-2xl font-black shadow-inner group-hover:scale-105 transition-transform">{q.studentName.charAt(0)}</div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/10 mb-2">{q.subject}</h4>
                                    <p className="text-3xl font-bold text-white italic tracking-tighter">{q.studentName}</p>
                                </div>
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-3xl border transition-all duration-1000 shadow-xl ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}>{q.status}</span>
                        </div>
                        <p className="font-serif italic text-5xl text-white/40 leading-[1.2] tracking-tighter">"{q.queryText}"</p>
                        {q.status === 'Answered' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 border-t border-white/5 relative">
                                <div className="absolute -top-4 left-10 bg-indigo-600 text-white text-[9px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.4em] shadow-2xl">Secure Relay Response</div>
                                <p className="text-2xl leading-relaxed text-white/80 font-medium italic tracking-tight">"{q.replyText}"</p>
                            </motion.div>
                        ) : (
                            <div className="flex gap-8 pt-8">
                                <input className="flex-1 bg-black/40 border border-white/10 rounded-[40px] px-10 py-7 text-sm text-white outline-none focus:border-indigo-500/50 transition-all italic placeholder:text-white/5" placeholder="Formulate response protocol..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} />
                                <button onClick={async ()=>{if(!replyText[q.id])return; await db.answerQuery(q.id, replyText[q.id]); load();}} className="bg-white text-black px-16 rounded-[40px] font-black text-[12px] uppercase tracking-[0.8em] hover:bg-indigo-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-4">
                                    <Send size={18}/> Transmit
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
                {queries.length === 0 && <motion.div variants={itemVariants} className="py-60 text-center opacity-10 font-black uppercase tracking-[2em] text-xs"> Intelligence Nodes Silent</motion.div>}
             </div>
        </div>
    );
};

const SettingsSection = ({ user }: any) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const update = async (e: any) => {
        e.preventDefault();
        if(form.new !== form.confirm) return alert('Data Validation Error: Mismatch');
        setLoading(true);
        try { await db.changePassword(user.id, 'teacher', form.current, form.new); alert('Security Credentials Updated.'); setForm({current:'',new:'',confirm:''}); } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-32">
            <motion.div variants={itemVariants} className="bg-black/40 p-16 rounded-[100px] border border-white/10 text-center shadow-[0_50px_150px_rgba(0,0,0,1)] backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                 <div className="w-28 h-28 bg-white/[0.03] border border-white/5 rounded-[45px] flex items-center justify-center mx-auto mb-16 text-indigo-400 shadow-inner hover:scale-105 transition-transform duration-700"><Lock size={48} strokeWidth={1} /></div>
                 <h3 className="text-4xl font-light serif-font mb-16 uppercase tracking-[0.5em] italic luxury-text-gradient">Control.</h3>
                 <form onSubmit={update} className="space-y-8">
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-white/20 ml-6 tracking-[0.4em]">Current Hash</label>
                        <input required type="password" placeholder="••••••••" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-3xl px-10 py-6 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                     </div>
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-white/20 ml-6 tracking-[0.4em]">New Hash</label>
                        <input required type="password" placeholder="••••••••" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-3xl px-10 py-6 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                     </div>
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-white/20 ml-6 tracking-[0.4em]">Verify Hash</label>
                        <input required type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-3xl px-10 py-6 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all shadow-inner" />
                     </div>
                     <button disabled={loading} className="w-full py-8 bg-white text-black font-black text-[13px] uppercase tracking-[0.8em] rounded-[40px] hover:bg-indigo-500 hover:text-white transition-all mt-12 shadow-[0_30px_60px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50">
                        {loading ? 'Encrypting...' : 'Confirm Identity'}
                     </button>
                 </form>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
