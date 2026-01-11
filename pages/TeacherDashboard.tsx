
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { TabView, StudentProfile, AttendanceStatus, Homework, HomeworkSubmission, Exam, Doubt, LeaveRequest, Grade } from '../types';
import { 
    LayoutDashboard, ClipboardCheck, BookOpen, PenTool, 
    MessageSquare, LogOut, CheckCircle, XCircle, Clock, 
    Calendar, Plus, User, Send, ChevronRight, FileText,
    Star, GraduationCap, AlertCircle, Search, Trash2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabView>('dashboard');
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = sessionStorage.getItem('sc_user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'teacher') { navigate('/login'); return; }
        setTeacher(user);
        setLoading(false);
    }, [navigate]);

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'attendance', icon: ClipboardCheck, label: 'Attendance' },
        { id: 'homework', icon: BookOpen, label: 'Homework' },
        { id: 'exams', icon: PenTool, label: 'Exams' },
        { id: 'doubts', icon: MessageSquare, label: 'Doubts' },
        { id: 'leave', icon: Calendar, label: 'Leaves' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-slate-100 mb-6">
                    <img src="https://advedasolutions.in/sc.png" className="h-10 mb-2" alt="Logo" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Portal</p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <tab.icon size={18} />
                            <span className="text-sm font-semibold">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-100">
                    <button onClick={() => { sessionStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-6 py-3 text-rose-600 font-bold text-sm">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-3 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <tab.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Faculty Hub</h1>
                            <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">{teacher.username} • Academic Session 2024</p>
                        </div>
                        <div className="hidden md:flex p-4 bg-white border border-slate-200 rounded-3xl gap-4 items-center">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><User size={20}/></div>
                            <div className="text-xs font-bold uppercase">Online</div>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {activeTab === 'dashboard' && <Overview teacher={teacher} />}
                            {activeTab === 'attendance' && <Attendance teacher={teacher} />}
                            {activeTab === 'homework' && <HomeworkHub teacher={teacher} />}
                            {activeTab === 'exams' && <ExamMaster teacher={teacher} />}
                            {activeTab === 'doubts' && <DoubtsHub />}
                            {activeTab === 'leave' && <LeavesManager />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const Overview = ({ teacher }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Students Managed" value="142" icon={GraduationCap} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Pending Homework" value="28" icon={BookOpen} color="bg-amber-50 text-amber-600" />
        <StatCard label="Leaves to Review" value="03" icon={Calendar} color="bg-rose-50 text-rose-600" />
        <div className="md:col-span-3 bg-white border border-slate-200 p-10 rounded-[40px]">
            <h3 className="text-xl font-bold mb-4">Academic Calendar</h3>
            <div className="space-y-4">
                {[
                    { title: 'Math Unit Test 2', time: 'Tomorrow, 10:00 AM', tag: 'Exam' },
                    { title: 'Parent Teacher Meeting', time: 'Friday, 04:00 PM', tag: 'Meeting' }
                ].map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex gap-4 items-center">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                            <div><p className="font-bold text-sm">{ev.title}</p><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{ev.time}</p></div>
                        </div>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase">{ev.tag}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white border border-slate-200 p-8 rounded-[40px] hover:shadow-xl transition-all group">
        <div className={`w-14 h-14 rounded-3xl mb-6 flex items-center justify-center ${color}`}><Icon size={28}/></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-bold">{value}</p>
    </div>
);

const Attendance = ({ teacher }: any) => {
    const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [g, s] = await Promise.all([db.getGrades(), db.getAllStudents()]);
                setGrades(g);
                setAllStudents(s);
                // Initialize default attendance
                const initial: Record<string, AttendanceStatus> = {};
                s.forEach(student => initial[student.id] = 'Present');
                setAttendance(initial);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const records = allStudents.map(s => ({
                studentId: s.id, 
                date: selectedDate,
                status: attendance[s.id] || 'Present', 
                markedBy: teacher.id
            }));
            await db.markAttendance(records);
            alert(`Master Registry Sync: Attendance for ${selectedDate} finalized.`);
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Calendar size={20}/></div>
                   <div>
                       <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Select Attendance Date</label>
                       <input 
                         type="date" 
                         value={selectedDate} 
                         onChange={e => setSelectedDate(e.target.value)} 
                         className="bg-transparent text-sm font-bold outline-none" 
                       />
                   </div>
                </div>
                <button 
                  disabled={loading} 
                  onClick={handleSave} 
                  className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-lg"
                >
                    {loading ? 'Commiting...' : 'Submit Records'}
                </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                        <tr><th className="px-8 py-6">Identity</th><th className="px-8 py-6">Grade Scope</th><th className="px-8 py-6 text-center">Protocol</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {allStudents.map(s => {
                            const grade = grades.find(g => g.id === s.gradeId);
                            return (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-bold text-slate-800">{s.name}</td>
                                    <td className="px-8 py-6 text-xs font-black uppercase text-indigo-500 tracking-widest">{grade?.gradeName || 'System'}</td>
                                    <td className="px-8 py-6 flex justify-center gap-3">
                                        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                            {[
                                                { label: 'P', value: 'Present', color: 'bg-emerald-500' },
                                                { label: 'A', value: 'Absent', color: 'bg-rose-500' },
                                                { label: 'L', value: 'Leave', color: 'bg-amber-500' }
                                            ].map(st => (
                                                <button 
                                                  key={st.value} 
                                                  onClick={() => setAttendance({...attendance, [s.id]: st.value as any})} 
                                                  className={`w-10 h-10 rounded-lg font-black transition-all text-xs ${attendance[s.id] === st.value ? `${st.color} text-white shadow-md scale-110` : 'text-slate-300 hover:text-slate-500 hover:bg-white'}`}
                                                >
                                                    {st.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {allStudents.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">No Students Found</div>}
            </div>
        </div>
    );
};

const HomeworkHub = ({ teacher }: any) => {
    const [view, setView] = useState<'list' | 'create' | 'grading'>('list');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [form, setForm] = useState({ 
        subject: '', 
        topic: '', 
        description: '', 
        dueDate: '', 
        targetType: 'Grade' as 'Grade' | 'Individual',
        targetGradeId: '',
        targetStudentId: ''
    });

    useEffect(() => { 
        db.getGrades().then(setGrades); 
        db.getAllStudents().then(setStudents);
    }, []);

    const handleCreate = async (e: any) => {
        e.preventDefault();
        try {
            await db.createHomework({
                teacherId: teacher.id, 
                subject: form.subject, 
                topic: form.topic,
                description: form.description, 
                dueDate: form.dueDate,
                targetType: form.targetType,
                targetGradeId: form.targetType === 'Grade' ? form.targetGradeId : undefined,
                targetStudentId: form.targetType === 'Individual' ? form.targetStudentId : undefined
            });
            alert("Assignment Published Successfully.");
            setView('list');
            setForm({ subject: '', topic: '', description: '', dueDate: '', targetType: 'Grade', targetGradeId: '', targetStudentId: '' });
        } catch (e) {
            alert("Broadcast Failure.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold uppercase tracking-tight">Assignment Engine</h3>
                <button onClick={() => setView(view === 'list' ? 'create' : 'list')} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                    {view === 'list' ? <><Plus size={16}/> New Task</> : 'Close Panel'}
                </button>
            </div>

            {view === 'create' ? (
                <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-10 rounded-[40px] space-y-6 max-w-2xl shadow-xl">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assign To</label>
                            <select 
                               className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" 
                               value={form.targetType} 
                               onChange={e => setForm({...form, targetType: e.target.value as any})}
                            >
                                <option value="Grade">Whole Grade</option>
                                <option value="Individual">Specific Student</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Entity</label>
                            <input required placeholder="Mathematics" className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {form.targetType === 'Grade' ? (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Grade</label>
                                <select required className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" value={form.targetGradeId} onChange={e => setForm({...form, targetGradeId: e.target.value})}>
                                    <option value="">Choose Grade</option>
                                    {grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                                </select>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Student</label>
                                <select required className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" value={form.targetStudentId} onChange={e => setForm({...form, targetStudentId: e.target.value})}>
                                    <option value="">Search Student Identity</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (Grade {grades.find(g => g.id === s.gradeId)?.gradeName})</option>)}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Topic Title</label>
                        <input required placeholder="Algebra Mastery" className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Detailed Directive</label>
                        <textarea required placeholder="Instructions for student..." className="w-full h-32 bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Submission Deadline</label>
                        <input required type="date" className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-600" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                    </div>

                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">Broadcast Assignment</button>
                </form>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center opacity-30">
                    <BookOpen className="mx-auto mb-6" size={64} />
                    <p className="text-sm font-bold uppercase tracking-[0.4em]">No Active Tasks in Registry</p>
                </div>
            )}
        </div>
    );
};

const ExamMaster = ({ teacher }: any) => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [form, setForm] = useState({ title: '', subject: '', gradeId: '', duration: 60, totalMarks: 100 });

    useEffect(() => { db.getGrades().then(setGrades); }, []);

    const handleCreate = async (e: any) => {
        e.preventDefault();
        try {
            await db.createExam({
                teacherId: teacher.id,
                title: form.title,
                subject: form.subject,
                gradeId: form.gradeId,
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 86400000).toISOString(),
                durationMinutes: form.duration,
                totalMarks: form.totalMarks,
                questions: [],
                isPublished: true
            });
            alert("Evaluation Paper Generated and Dispatched.");
            setView('list');
            setForm({ title: '', subject: '', gradeId: '', duration: 60, totalMarks: 100 });
        } catch (err) {
            alert("Evaluation Generation Failed.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Paper Builder</h3>
                <button onClick={() => setView(view === 'list' ? 'create' : 'list')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    {view === 'list' ? <><Plus size={16}/> Create Paper</> : 'View Registry'}
                </button>
            </div>

            {view === 'create' ? (
                <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-10 rounded-[40px] space-y-6 max-w-2xl shadow-xl">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Examination Title</label>
                        <input required placeholder="e.g. Mid-Term Phase 1" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Authority</label>
                            <input required placeholder="Physics / Bio" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Academic Grade</label>
                            <select required className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600" value={form.gradeId} onChange={e => setForm({...form, gradeId: e.target.value})}>
                                <option value="">Select Grade Node</option>
                                {grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duration (Mins)</label>
                            <input required type="number" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Weightage (Marks)</label>
                            <input required type="number" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs active:scale-[0.98] transition-all">Initialize Evaluation Protocol</button>
                </form>
            ) : (
                <div className="bg-white border border-slate-200 p-10 rounded-[40px] text-center">
                    <PenTool className="mx-auto mb-6 text-slate-200" size={80} />
                    <h4 className="text-2xl font-bold mb-2">Automated Evaluation Engine</h4>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 uppercase font-bold tracking-widest leading-relaxed">Design MCQ and Theory papers with instant feedback for students.</p>
                    <div className="flex gap-4 justify-center">
                       <div className="p-6 bg-slate-50 rounded-3xl w-40"><p className="text-3xl font-black mb-1">00</p><p className="text-[10px] text-slate-400 uppercase font-black">Live Tests</p></div>
                       <div className="p-6 bg-slate-50 rounded-3xl w-40"><p className="text-3xl font-black mb-1">00</p><p className="text-[10px] text-slate-400 uppercase font-black">Evaluated</p></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DoubtsHub = () => {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [reply, setReply] = useState('');
    const [activeDoubt, setActiveDoubt] = useState<Doubt | null>(null);

    useEffect(() => { db.getDoubts().then(setDoubts); }, []);

    const handleResolve = async () => {
        if (!activeDoubt || !reply) return;
        await db.resolveDoubt(activeDoubt.id, reply);
        alert("Solution Sent to Student.");
        setActiveDoubt(null);
        setReply('');
        db.getDoubts().then(setDoubts);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter">Student Queries Hub</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doubts.map(d => (
                    <div key={d.id} className="bg-white border border-slate-200 p-8 rounded-[40px] flex flex-col justify-between group hover:border-indigo-600 transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${d.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>{d.status}</span>
                                <span className="text-[10px] font-black text-slate-300">{d.subject}</span>
                            </div>
                            <h4 className="text-lg font-bold mb-4">"{d.question}"</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Raised by: {d.studentName}</p>
                        </div>
                        {d.status === 'Open' ? (
                            <button onClick={() => setActiveDoubt(d)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all">Resolve Doubt</button>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs font-bold uppercase text-slate-400 mb-2">My Solution:</p><p className="text-sm italic text-slate-600">{d.answer}</p></div>
                        )}
                    </div>
                ))}
                {doubts.length === 0 && <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-[1em] text-xs">Queries Inbox Empty</div>}
            </div>

            <AnimatePresence>
                {activeDoubt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[50px] p-10">
                            <h3 className="text-2xl font-bold mb-2">Resolve Query</h3>
                            <p className="text-slate-400 text-xs mb-8 uppercase tracking-[0.2em] font-bold">{activeDoubt.studentName} • {activeDoubt.subject}</p>
                            <p className="bg-indigo-50 p-6 rounded-3xl text-sm italic text-indigo-900 mb-8">"{activeDoubt.question}"</p>
                            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your expert explanation here..." className="w-full h-40 bg-slate-50 p-6 rounded-3xl text-sm outline-none ring-1 ring-slate-100 focus:ring-indigo-600 resize-none mb-6" />
                            <div className="flex gap-4">
                                <button onClick={handleResolve} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">Send Response</button>
                                <button onClick={() => setActiveDoubt(null)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LeavesManager = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    useEffect(() => { db.getLeaveRequests().then(setRequests); }, []);

    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
        await db.updateLeaveStatus(id, status);
        db.getLeaveRequests().then(setRequests);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight">Leave Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map(l => (
                    <div key={l.id} className="bg-white border border-slate-200 p-10 rounded-[40px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between mb-6">
                                <h4 className="font-bold text-lg">{l.studentName}</h4>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : l.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>{l.status}</span>
                            </div>
                            <p className="text-sm text-slate-500 italic mb-8">"{l.reason}"</p>
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{l.startDate} – {l.endDate}</p>
                        </div>
                        {l.status === 'Pending' && (
                            <div className="flex gap-4 mt-10">
                                <button onClick={() => handleAction(l.id, 'Approved')} className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">Approve</button>
                                <button onClick={() => handleAction(l.id, 'Rejected')} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
