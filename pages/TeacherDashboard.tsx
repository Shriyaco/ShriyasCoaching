import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, Question, StudentQuery, ExamSubmission, AttendanceRecord } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Calendar, BookOpen, PenTool, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Award, ClipboardCheck, X, Save, MessageSquare, Clock, Unlock, UserCheck, UserX, AlertCircle, Send, Settings, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'exams' | 'grading' | 'queries' | 'settings'>('attendance');
    
    // Core Data
    const [grades, setGrades] = useState<Grade[]>([]);
    const [availableSubdivisions, setAvailableSubdivisions] = useState<Subdivision[]>([]);
    
    // Filters (Global for tabs)
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

        // Realtime
        const sub = db.subscribe('grades', refreshGrades);
        return () => db.unsubscribe(sub);
    }, [navigate, refreshGrades]);

    useEffect(() => {
        const loadSubs = async () => {
            if (selectedGradeId) {
                const subs = await db.getSubdivisions(selectedGradeId);
                setAvailableSubdivisions(subs);
                if (subs.length > 0 && !selectedDivisionId) setSelectedDivisionId(subs[0].id);
            } else {
                setAvailableSubdivisions([]);
                setSelectedDivisionId('');
            }
        }
        loadSubs();
    }, [selectedGradeId, selectedDivisionId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans flex flex-col">
            <ThreeOrb className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] opacity-10 pointer-events-none" color="#f472b6" />

            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">{user?.username.charAt(0)}</div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Faculty Portal</h1>
                        <p className="text-xs text-gray-500">Logged in as {user?.username}</p>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-auto md:hidden"><LogOut size={20} /></button>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 w-full md:w-auto">
                     {/* Global Filters */}
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                         {grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                     </select>
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                         {availableSubdivisions.map(s => <option key={s.id} value={s.id}>{s.divisionName}</option>)}
                     </select>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 hidden md:block"><LogOut size={20} /></button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 flex space-x-6 overflow-x-auto relative z-10 scrollbar-hide">
                {[
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'homework', label: 'Homework', icon: BookOpen },
                    { id: 'exams', label: 'Exam Builder', icon: PenTool },
                    { id: 'grading', label: 'Grading', icon: Award },
                    { id: 'queries', label: 'Queries', icon: MessageSquare },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${activeTab === tab.id ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-6 relative z-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                        {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                        {activeTab === 'exams' && <ExamBuilderModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                        {activeTab === 'grading' && <GradingModule teacherId={user?.id || ''} />}
                        {activeTab === 'queries' && <QueriesModule />}
                        {activeTab === 'settings' && <SettingsSection user={user!} />}
                    </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-10 py-6 border-t border-gray-100 flex justify-center">
                   <a href="https://www.advedasolutions.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity group">
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-purple-600 transition-colors">Powered by</span>
                       <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
                   </a>
                </div>
            </main>
        </div>
    );
};

// ... Existing AttendanceModule, HomeworkModule, ExamBuilderModule, GradingModule, QueriesModule ...
// --- MODULE 1: ATTENDANCE ---
const AttendanceModule = ({ gradeId, divisionId }: { gradeId: string, divisionId: string }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!gradeId || !divisionId) return;
        const load = async () => {
            setLoading(true);
            try {
                const st = await db.getStudents(gradeId, divisionId);
                setStudents(st);
                const records = await db.getAttendance(undefined, date);
                const map: Record<string, 'Present' | 'Absent'> = {};
                st.forEach(s => map[s.id] = 'Present');
                records.forEach(r => { if (r.divisionId === divisionId) map[r.studentId] = r.status; });
                setAttendanceMap(map);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        load();
    }, [gradeId, divisionId, date]);

    const toggleStatus = (studentId: string) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present' }));
    };

    const saveAttendance = async () => {
        try {
            const records = students.map(s => ({ studentId: s.id, divisionId, date, status: attendanceMap[s.id] }));
            await db.markAttendance(records);
            alert('Attendance Saved');
        } catch (error) { alert('Failed to save'); }
    };

    const stats = { total: students.length, present: Object.values(attendanceMap).filter(s => s === 'Present').length, absent: Object.values(attendanceMap).filter(s => s === 'Absent').length };

    if (!gradeId) return <div className="text-center text-gray-400 p-10">Please select a Class.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={24}/></div>
                    <div><h3 className="font-bold text-gray-800 text-lg">Mark Attendance</h3><p className="text-sm text-gray-500">For {date}</p></div>
                </div>
                <div className="flex items-center gap-4">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                    <button onClick={saveAttendance} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-purple-700 flex items-center gap-2"><Save size={18}/> Save</button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center"><p className="text-xs text-blue-500 font-bold uppercase">Total</p><p className="text-2xl font-black text-blue-700">{stats.total}</p></div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center"><p className="text-xs text-emerald-500 font-bold uppercase">Present</p><p className="text-2xl font-black text-emerald-700">{stats.present}</p></div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center"><p className="text-xs text-rose-500 font-bold uppercase">Absent</p><p className="text-2xl font-black text-rose-700">{stats.absent}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : students.length === 0 ? <div className="p-10 text-center text-gray-400">No students.</div> : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-100"><tr><th className="p-4">Student</th><th className="p-4">Roll ID</th><th className="p-4 text-center">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-50">{students.map(s => (
                            <tr key={s.id} className={`hover:bg-gray-50 ${attendanceMap[s.id] === 'Absent' ? 'bg-rose-50/30' : ''}`}>
                                <td className="p-4 font-medium text-gray-800">{s.name}</td>
                                <td className="p-4 text-sm text-gray-500 font-mono">{s.studentCustomId}</td>
                                <td className="p-4 flex justify-center"><button onClick={() => toggleStatus(s.id)} className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all w-32 justify-center ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{attendanceMap[s.id] === 'Present' ? <><UserCheck size={16}/> Present</> : <><UserX size={16}/> Absent</>}</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// --- MODULE 2: HOMEWORK ---
const HomeworkModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [newHomework, setNewHomework] = useState({ subject: '', task: '', dueDate: '' });
    const [loading, setLoading] = useState(false);

    const loadHomework = useCallback(async () => {
        if(!gradeId || !divisionId) return;
        setLoading(true);
        try { const hw = await db.getHomeworkForStudent(gradeId, divisionId); setHomeworkList(hw); } catch (e) { } finally { setLoading(false); }
    }, [gradeId, divisionId]);

    useEffect(() => { loadHomework(); }, [loadHomework]);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.addHomework({ gradeId, subdivisionId: divisionId, subject: newHomework.subject, task: newHomework.task, dueDate: newHomework.dueDate, assignedBy: teacherId });
            alert('Assigned'); setNewHomework({ subject: '', task: '', dueDate: '' }); loadHomework();
        } catch (error) { alert('Failed'); }
    };

    if (!gradeId) return <div className="text-center text-gray-400 p-10">Select a Class.</div>;

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100"><h3 className="font-bold text-xl text-gray-800 mb-6">Assign Homework</h3>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <input required placeholder="Subject" className="w-full border rounded-lg px-4 py-2" value={newHomework.subject} onChange={e => setNewHomework({...newHomework, subject: e.target.value})} />
                        <textarea required placeholder="Description" className="w-full border rounded-lg px-4 py-2 h-32" value={newHomework.task} onChange={e => setNewHomework({...newHomework, task: e.target.value})} />
                        <input required type="date" className="w-full border rounded-lg px-4 py-2" value={newHomework.dueDate} onChange={e => setNewHomework({...newHomework, dueDate: e.target.value})} />
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Assign</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
                {loading ? "Loading..." : homeworkList.map(hw => (
                    <div key={hw.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between">
                        <div><h4 className="font-bold text-gray-800">{hw.subject}</h4><p className="text-gray-600 text-sm">{hw.task}</p></div>
                        <span className="text-xs font-bold text-purple-600">Due: {hw.dueDate}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE 3: EXAM BUILDER ---
const ExamBuilderModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [examMeta, setExamMeta] = useState({ title: '', subject: '', totalMarks: 100, examDate: '', startTime: '09:00', duration: 60 });
    const [questions, setQuestions] = useState<Question[]>([]);
    const addQuestion = () => setQuestions([...questions, { id: `q${Date.now()}`, text: '', type: 'short', marks: 5 }]);
    const currentTotal = questions.reduce((sum, q) => sum + parseInt(q.marks.toString() || '0'), 0);
    const saveExam = async () => {
        await db.addExam({ title: examMeta.title, gradeId, subdivisionId: divisionId, subject: examMeta.subject, examDate: examMeta.examDate, startTime: examMeta.startTime, duration: examMeta.duration, totalMarks: examMeta.totalMarks, questions, createdBy: teacherId });
        alert('Created!'); setQuestions([]);
    };
    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Exam Builder</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <input placeholder="Title" className="border rounded px-4 py-2" value={examMeta.title} onChange={e => setExamMeta({...examMeta, title: e.target.value})} />
                <input placeholder="Subject" className="border rounded px-4 py-2" value={examMeta.subject} onChange={e => setExamMeta({...examMeta, subject: e.target.value})} />
                <input type="date" className="border rounded px-4 py-2" value={examMeta.examDate} onChange={e => setExamMeta({...examMeta, examDate: e.target.value})} />
                <input type="time" className="border rounded px-4 py-2" value={examMeta.startTime} onChange={e => setExamMeta({...examMeta, startTime: e.target.value})} />
            </div>
            <button onClick={addQuestion} className="bg-purple-50 text-purple-600 font-bold px-4 py-2 rounded mb-4">+ Add Question</button>
            <div className="space-y-4 mb-6">{questions.map((q, i) => <input key={q.id} className="w-full border-b p-2" placeholder={`Question ${i+1}`} value={q.text} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, text: e.target.value} : qu))} />)}</div>
            <button onClick={saveExam} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Save Exam</button>
        </div>
    );
};

// --- MODULE 4: GRADING ---
const GradingModule = ({ teacherId }: { teacherId: string }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => { db.getExams(teacherId).then(setExams); }, [teacherId]);
    return <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">{exams.map(ex => <div key={ex.id} className="bg-white p-6 rounded-xl shadow-sm border"><h3>{ex.title}</h3><p>{ex.subject}</p></div>)}</div>;
};

// --- MODULE 5: QUERIES ---
const QueriesModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load]);
    const sendReply = async (id: string) => { await db.answerQuery(id, replyText[id]); alert('Sent'); load(); };
    return <div className="max-w-4xl mx-auto space-y-4">{queries.map(q => <div key={q.id} className="bg-white p-6 rounded-xl border"><h4 className="font-bold">{q.studentName}</h4><p className="bg-gray-50 p-3 rounded my-2">{q.queryText}</p>{q.status === 'Answered' ? <p className="text-purple-600">{q.replyText}</p> : <div className="flex gap-2"><input className="flex-1 border p-2 rounded" placeholder="Reply..." onChange={e => setReplyText({...replyText, [q.id]: e.target.value})} /><button onClick={() => sendReply(q.id)} className="bg-purple-600 text-white px-4 py-2 rounded">Reply</button></div>}</div>)}</div>;
};

// --- MODULE 6: SETTINGS (CHANGE PASSWORD) ---
const SettingsSection = ({ user }: { user: User }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.new !== form.confirm) { alert("Passwords do not match!"); return; }
        if (form.new.length < 4) { alert("Password too short!"); return; }
        
        setLoading(true);
        try {
            await db.changePassword(user.id, 'teacher', form.current, form.new);
            setSuccess(true);
            setForm({ current: '', new: '', confirm: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            alert(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
                 <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                     <Lock size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-800 mb-2">Security Settings</h3>
                 <p className="text-sm text-gray-500 mb-8">Update your portal access password.</p>
                 
                 <AnimatePresence>
                     {success && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-600 text-sm font-bold flex items-center gap-2 justify-center">
                             <ShieldCheck size={18}/> Password changed successfully!
                         </motion.div>
                     )}
                 </AnimatePresence>

                 <form onSubmit={handleUpdate} className="space-y-4">
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="Current Password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.current} onChange={e => setForm({...form, current: e.target.value})}
                         />
                     </div>
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="New Password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.new} onChange={e => setForm({...form, new: e.target.value})}
                         />
                     </div>
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="Confirm New Password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500"
                            value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                         />
                     </div>
                     
                     <div className="text-left">
                         <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-gray-400 hover:text-purple-500 font-bold uppercase tracking-wider flex items-center gap-1 ml-1">
                             {showPass ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
                         </button>
                     </div>

                     <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">
                         {loading ? "Saving..." : "Update Password"}
                     </button>
                 </form>
            </div>
        </div>
    );
};

export default TeacherDashboard;