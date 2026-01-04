
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, Question, StudentQuery, ExamSubmission, AttendanceRecord, StudyNote, HomeworkSubmission } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Calendar, BookOpen, PenTool, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Award, ClipboardCheck, X, Save, MessageSquare, Clock, Unlock, UserCheck, UserX, AlertCircle, Send, Settings, Lock, Eye, EyeOff, ShieldCheck, FileText, Upload, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'notes' | 'exams' | 'grading' | 'queries' | 'settings'>('attendance');
    
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
        const sub = db.subscribe('grades', refreshGrades);
        return () => db.unsubscribe(sub);
    }, [navigate, refreshGrades]);

    useEffect(() => {
        const loadSubs = async () => {
            if (selectedGradeId) {
                const subs = await db.getSubdivisions(selectedGradeId);
                setAvailableSubdivisions(subs);
                if (subs.length > 0) setSelectedDivisionId(subs[0].id);
            }
        }
        loadSubs();
    }, [selectedGradeId]);

    const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans flex flex-col">
            <ThreeOrb className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] opacity-10 pointer-events-none" color="#f472b6" />

            <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">{user?.username.charAt(0)}</div>
                    <div><h1 className="text-lg font-bold text-gray-800">Faculty Portal</h1><p className="text-xs text-gray-500">{user?.username}</p></div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-auto md:hidden"><LogOut size={20} /></button>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>{grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}</select>
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>{availableSubdivisions.map(s => <option key={s.id} value={s.id}>{s.divisionName}</option>)}</select>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 hidden md:block"><LogOut size={20} /></button>
                </div>
            </header>

            <div className="bg-white border-b border-gray-200 px-4 md:px-6 flex space-x-6 overflow-x-auto relative z-10 scrollbar-hide">
                {[
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'homework', label: 'Homework', icon: BookOpen },
                    { id: 'notes', label: 'Study Notes', icon: FileText },
                    { id: 'exams', label: 'Exam Builder', icon: PenTool },
                    { id: 'grading', label: 'Grading', icon: Award },
                    { id: 'queries', label: 'Queries', icon: MessageSquare },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${activeTab === tab.id ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-gray-500 hover:text-purple-600'}`}><tab.icon size={18} /> {tab.label}</button>
                ))}
            </div>

            <main className="flex-1 p-4 md:p-6 relative z-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                        {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                        {activeTab === 'notes' && <NotesModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                        {activeTab === 'exams' && <ExamBuilderModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                        {activeTab === 'grading' && <GradingModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                        {activeTab === 'queries' && <QueriesModule />}
                        {activeTab === 'settings' && <SettingsSection user={user!} />}
                    </motion.div>
                </AnimatePresence>
            </main>
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
    }, [gradeId, divisionId, date]);
    const save = async () => {
        const records = students.map(s => ({ studentId: s.id, division_id: divisionId, date, status: attendanceMap[s.id] }));
        await db.markAttendance(records);
        alert('Attendance Saved');
    };
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded" />
                <button onClick={save} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">Save Attendance</button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                {students.map(s => (
                    <div key={s.id} className="p-4 flex justify-between border-b last:border-0 items-center">
                        <span>{s.name}</span>
                        <button onClick={() => setAttendanceMap({...attendanceMap, [s.id]: attendanceMap[s.id] === 'Present' ? 'Absent' : 'Present'})} className={`px-4 py-1 rounded-full text-xs font-bold ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{attendanceMap[s.id]}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HomeworkModule = ({ gradeId, divisionId, teacherId }: any) => {
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [form, setForm] = useState({ subject: '', task: '', dueDate: '' });
    const load = useCallback(() => { if(gradeId && divisionId) db.getHomeworkForStudent(gradeId, divisionId).then(setHomeworkList); }, [gradeId, divisionId]);
    useEffect(() => { load(); }, [load]);
    const submit = async (e: any) => {
        e.preventDefault();
        await db.addHomework({ gradeId, subdivisionId: divisionId, ...form, assignedBy: teacherId });
        alert('Assigned'); setForm({ subject: '', task: '', dueDate: '' }); load();
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border h-fit"><h3 className="font-bold mb-4">New Task</h3><form onSubmit={submit} className="space-y-4"><input required placeholder="Subject" className="w-full p-3 border rounded-xl" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} /><textarea required placeholder="Description" className="w-full p-3 border rounded-xl h-32" value={form.task} onChange={e=>setForm({...form, task:e.target.value})} /><input required type="date" className="w-full p-3 border rounded-xl" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} /><button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Post Homework</button></form></div>
            <div className="lg:col-span-2 space-y-4">{homeworkList.map(hw => <div key={hw.id} className="bg-white p-5 rounded-2xl border shadow-sm"><h4>{hw.subject}</h4><p className="text-gray-500 text-sm mt-2">{hw.task}</p><p className="text-[10px] font-bold text-purple-600 mt-4 uppercase">Due: {hw.dueDate}</p></div>)}</div>
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Study Notes</h3><button onClick={()=>setIsAdding(true)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">+ New Note</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => <div key={n.id} className="bg-white p-6 rounded-2xl border shadow-sm relative group"><button onClick={async ()=>{if(confirm('Delete?')){await db.deleteNote(n.id); load();}}} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button><span className="text-[10px] font-black uppercase text-purple-600 mb-2 block">{n.subject}</span><h4 className="font-bold">{n.title}</h4><p className="text-sm text-gray-500 mt-4 line-clamp-3">{n.content}</p></div>)}
            </div>
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="bg-white rounded-3xl w-full max-w-lg p-8"><h3 className="text-xl font-bold mb-6">Create Note</h3><form onSubmit={async (e)=>{e.preventDefault(); await db.addNote({gradeId, divisionId, teacherId, ...form}); setIsAdding(false); load();}} className="space-y-4"><input required placeholder="Subject" className="w-full p-3 border rounded-xl" onChange={e=>setForm({...form, subject:e.target.value})} /><input required placeholder="Title" className="w-full p-3 border rounded-xl" onChange={e=>setForm({...form, title:e.target.value})} /><textarea required placeholder="Content" className="w-full p-3 border rounded-xl h-32" onChange={e=>setForm({...form, content:e.target.value})} /><input placeholder="File Link (Optional)" className="w-full p-3 border rounded-xl" onChange={e=>setForm({...form, fileUrl:e.target.value})} /><div className="flex gap-2 pt-4"><button type="button" onClick={()=>setIsAdding(false)} className="flex-1 py-3 bg-gray-100 rounded-xl">Cancel</button><button className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg">Save</button></div></form></div></div>
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

    const addQuestion = () => setForm({...form, questions: [...form.questions, { id: Math.random().toString(), text: '', type: 'mcq', marks: 1 }]});
    const removeQuestion = (id: string) => setForm({...form, questions: form.questions.filter((q: any) => q.id !== id)});

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await db.addExam({ gradeId, subdivisionId: divisionId, ...form, totalMarks: form.questions.reduce((a:number,b:any)=>a+b.marks, 0), createdBy: teacherId });
        setIsCreating(false); setForm({ title: '', subject: '', duration: 30, examDate: '', startTime: '', questions: [] }); load();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Exam Builder</h3><button onClick={()=>setIsCreating(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Create Exam</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(e => <div key={e.id} className="bg-white p-6 rounded-2xl border shadow-sm"><h4 className="font-bold">{e.title}</h4><p className="text-xs text-indigo-600 font-bold uppercase">{e.subject}</p><p className="text-xs text-gray-400 mt-2">{e.examDate} at {e.startTime}</p><button onClick={async ()=>{await db.deleteExam(e.id); load();}} className="text-red-500 mt-4 text-xs font-bold">Delete</button></div>)}
            </div>
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10"><h3 className="text-2xl font-black mb-8">Launch New Examination</h3><form onSubmit={handleSubmit} className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input required placeholder="Exam Title" className="p-3 border rounded-xl" onChange={e=>setForm({...form, title:e.target.value})}/><input required placeholder="Subject" className="p-3 border rounded-xl" onChange={e=>setForm({...form, subject:e.target.value})}/><input required type="date" className="p-3 border rounded-xl" onChange={e=>setForm({...form, examDate:e.target.value})}/><input required type="time" className="p-3 border rounded-xl" onChange={e=>setForm({...form, startTime:e.target.value})}/><input required type="number" placeholder="Duration (mins)" className="p-3 border rounded-xl" onChange={e=>setForm({...form, duration:parseInt(e.target.value)})}/></div><div className="border-t pt-8 space-y-4"><div className="flex justify-between items-center"><h4 className="font-bold">Questions List</h4><button type="button" onClick={addQuestion} className="text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold">Add Question</button></div>{form.questions.map((q: any, idx: number) => (<div key={q.id} className="bg-slate-50 p-4 rounded-2xl flex gap-4 items-start"><span className="font-black text-slate-300">#{idx+1}</span><div className="flex-1 space-y-4"><input required placeholder="Question content..." className="w-full p-2 border rounded-lg" onChange={e=>{const qs=[...form.questions]; qs[idx].text=e.target.value; setForm({...form, questions:qs})}} /><div className="flex gap-4"><select className="p-2 border rounded-lg text-xs" onChange={e=>{const qs=[...form.questions]; qs[idx].type=e.target.value; setForm({...form, questions:qs})}}><option value="mcq">Multiple Choice</option><option value="short">Short Answer</option></select><input type="number" placeholder="Marks" className="w-20 p-2 border rounded-lg text-xs" onChange={e=>{const qs=[...form.questions]; qs[idx].marks=parseInt(e.target.value); setForm({...form, questions:qs})}} /></div></div><button onClick={()=>removeQuestion(q.id)} className="text-red-400 p-2"><X size={16}/></button></div>))}</div><div className="flex gap-2 pt-8"><button type="button" onClick={()=>setIsCreating(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Close</button><button className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">Deploy Exam</button></div></form></div></div>
            )}
        </div>
    );
};

const GradingModule = ({ gradeId, divisionId }: any) => {
    const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        const all = await db.getAllHomeworkSubmissions();
        // Filtering is done in memory for prototype speed
        setHomeworkSubmissions(all.filter(s => s.status === 'Submitted'));
        setLoading(false);
    }, []);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck className="text-emerald-500"/> Submissions Review</h3>
            {loading ? <p className="text-center py-20 text-gray-400">Loading submissions...</p> : (
                <div className="space-y-4">
                    {homeworkSubmissions.map(sub => (
                        <div key={sub.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Homework Submission</p><h4 className="font-bold text-gray-800">Student ID: {sub.studentId}</h4><p className="text-sm text-gray-500 mt-2 italic">"{sub.submissionText}"</p></div>
                            <button onClick={async ()=>{await db.updateHomeworkStatus(sub.id, 'Reviewed'); load();}} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20">Mark Reviewed</button>
                        </div>
                    ))}
                    {homeworkSubmissions.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 font-bold">No new submissions to review.</div>}
                </div>
            )}
        </div>
    );
};

const QueriesModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load]);
    const sendReply = async (id: string) => { 
        if(!replyText[id]) return;
        await db.answerQuery(id, replyText[id]); 
        alert('Reply Sent'); load(); 
    };
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-purple-600"/> Student Queries</h3>
            {queries.map(q => (
                <div key={q.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4"><h4 className="font-bold">{q.studentName}</h4><span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${q.status === 'Answered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{q.status}</span></div>
                    <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-4 rounded-xl italic">"{q.queryText}"</p>
                    {q.status === 'Answered' ? <div className="pt-4 border-t"><p className="text-xs font-black text-purple-600 uppercase mb-1">Your Reply:</p><p className="text-sm">{q.replyText}</p></div> : 
                    <div className="flex gap-2"><input className="flex-1 p-3 border rounded-xl" placeholder="Write your answer..." onChange={e=>setReplyText({...replyText, [q.id]:e.target.value})} /><button onClick={()=>sendReply(q.id)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">Send</button></div>}
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
        if(form.new !== form.confirm) return alert('Passwords mismatch');
        setLoading(true);
        try { await db.changePassword(user.id, 'teacher', form.current, form.new); alert('Updated!'); setForm({current:'',new:'',confirm:''}); } catch(e:any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-10"><div className="bg-white p-8 rounded-3xl border shadow-xl text-center"><div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={24}/></div><h3 className="text-xl font-bold mb-6">Security Settings</h3><form onSubmit={update} className="space-y-4"><input required type="password" placeholder="Current Password" value={form.current} onChange={e=>setForm({...form, current:e.target.value})} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-600" /><input required type="password" placeholder="New Password" value={form.new} onChange={e=>setForm({...form, new:e.target.value})} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-600" /><input required type="password" placeholder="Confirm Password" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-600" /><button disabled={loading} className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-lg">{loading ? 'Saving...' : 'Update Password'}</button></form></div></div>
    );
};

export default TeacherDashboard;
