
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, Question, StudentQuery, ExamSubmission, AttendanceRecord, StudyNote } from '../types';
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
                    <div><h1 className="text-lg font-bold text-gray-800">Faculty Portal</h1><p className="text-xs text-gray-500">{user?.username}</p></div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-auto md:hidden"><LogOut size={20} /></button>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>{grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}</select>
                     <select className="flex-1 md:flex-none bg-gray-100 border-none rounded-lg px-3 py-2 text-sm w-full md:w-40" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>{availableSubdivisions.map(s => <option key={s.id} value={s.id}>{s.divisionName}</option>)}</select>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 hidden md:block"><LogOut size={20} /></button>
                </div>
            </header>

            {/* Navigation Tabs */}
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
                        {activeTab === 'grading' && <GradingModule teacherId={user?.id || ''} />}
                        {activeTab === 'queries' && <QueriesModule />}
                        {activeTab === 'settings' && <SettingsSection user={user!} />}
                    </motion.div>
                </AnimatePresence>
                <div className="mt-10 py-6 border-t border-gray-100 flex justify-center"><a href="https://www.advedasolutions.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity group"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-purple-600 transition-colors">Powered by</span><img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" /></a></div>
            </main>
        </div>
    );
};

// --- NOTES MODULE ---
const NotesModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState({ subject: '', title: '', content: '', fileUrl: '' });
    const [loading, setLoading] = useState(false);

    const loadNotes = useCallback(async () => {
        if (!gradeId || !divisionId) return;
        setLoading(true);
        const list = await db.getNotes(gradeId, divisionId);
        setNotes(list);
        setLoading(false);
    }, [gradeId, divisionId]);

    useEffect(() => { loadNotes(); }, [loadNotes]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addNote({
            gradeId,
            divisionId,
            teacherId,
            ...newNote
        });
        setIsAdding(false);
        setNewNote({ subject: '', title: '', content: '', fileUrl: '' });
        loadNotes();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this note?")) return;
        await db.deleteNote(id);
        loadNotes();
    };

    if (!gradeId) return <div className="text-center text-gray-400 p-10">Select a Class to manage notes.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-purple-600"/> Study Material</h3>
                <button onClick={() => setIsAdding(true)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg"><Plus size={20}/> Add Note</button>
            </div>

            {loading ? <div className="p-10 text-center text-gray-400">Loading notes...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
                            <button onClick={() => handleDelete(note.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-full mb-3 inline-block">{note.subject}</span>
                            <h4 className="font-bold text-gray-800 mb-2">{note.title}</h4>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-3">{note.content}</p>
                            {note.fileUrl && (
                                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                                    <Download size={14}/> View Attachment (PDF/Link)
                                </a>
                            )}
                        </div>
                    ))}
                    {notes.length === 0 && <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">No notes shared for this division yet.</div>}
                </div>
            )}

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative">
                            <div className="p-6 border-b flex justify-between items-center bg-purple-600 text-white">
                                <h3 className="text-xl font-bold">New Study Note</h3>
                                <button onClick={() => setIsAdding(false)}><X size={24}/></button>
                            </div>
                            <form onSubmit={handleAdd} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Subject</label>
                                        <input required className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" placeholder="e.g. Science" value={newNote.subject} onChange={e => setNewNote({...newNote, subject: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Title</label>
                                        <input required className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" placeholder="Chapter 1 Basics" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Content/Description</label>
                                    <textarea required className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 h-32 outline-none resize-none focus:ring-2 focus:ring-purple-600" placeholder="Write summary or key points..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block flex items-center gap-1"><Upload size={12}/> Attachment Link (PDF/URL)</label>
                                    <input className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" placeholder="https://link-to-your-pdf.com" value={newNote.fileUrl} onChange={e => setNewNote({...newNote, fileUrl: e.target.value})} />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Note: Use Google Drive or any public link for PDFs.</p>
                                </div>
                                <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:bg-purple-700 transition-all">Save and Share</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ... AttendanceModule, HomeworkModule, ExamBuilderModule, GradingModule, QueriesModule code same as original ...
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
    const toggleStatus = (studentId: string) => { setAttendanceMap(prev => ({ ...prev, [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present' })); };
    const saveAttendance = async () => { try { const records = students.map(s => ({ studentId: s.id, divisionId, date, status: attendanceMap[s.id] })); await db.markAttendance(records); alert('Attendance Saved'); } catch (error) { alert('Failed to save'); } };
    if (!gradeId) return <div className="text-center text-gray-400 p-10">Please select a Class.</div>;
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3"><div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={24}/></div><div><h3 className="font-bold text-gray-800 text-lg">Mark Attendance</h3><p className="text-sm text-gray-500">{date}</p></div></div>
                <div className="flex items-center gap-4"><input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /><button onClick={saveAttendance} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">Save</button></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
                    <table className="w-full text-left"><thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-100"><tr><th className="p-4">Student</th><th className="p-4 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-50">{students.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{s.name}<br/><span className="text-xs text-gray-400">{s.studentCustomId}</span></td><td className="p-4 flex justify-center"><button onClick={() => toggleStatus(s.id)} className={`px-4 py-1.5 rounded-full text-sm font-bold w-32 ${attendanceMap[s.id] === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{attendanceMap[s.id]}</button></td></tr>))}</tbody></table>
                )}
            </div>
        </div>
    );
};
const HomeworkModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [newHomework, setNewHomework] = useState({ subject: '', task: '', dueDate: '' });
    const loadHomework = useCallback(async () => { if(!gradeId || !divisionId) return; const hw = await db.getHomeworkForStudent(gradeId, divisionId); setHomeworkList(hw); }, [gradeId, divisionId]);
    useEffect(() => { loadHomework(); }, [loadHomework]);
    const handleAssign = async (e: React.FormEvent) => { e.preventDefault(); await db.addHomework({ gradeId, subdivisionId: divisionId, subject: newHomework.subject, task: newHomework.task, dueDate: newHomework.dueDate, assignedBy: teacherId }); alert('Assigned'); setNewHomework({ subject: '', task: '', dueDate: '' }); loadHomework(); };
    if (!gradeId) return <div className="text-center text-gray-400 p-10">Select a Class.</div>;
    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1"><div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100"><h3 className="font-bold text-xl text-gray-800 mb-6">New Task</h3><form onSubmit={handleAssign} className="space-y-4"><input required placeholder="Subject" className="w-full border rounded-lg px-4 py-2" value={newHomework.subject} onChange={e => setNewHomework({...newHomework, subject: e.target.value})} /><textarea required placeholder="Description" className="w-full border rounded-lg px-4 py-2 h-32" value={newHomework.task} onChange={e => setNewHomework({...newHomework, task: e.target.value})} /><input required type="date" className="w-full border rounded-lg px-4 py-2" value={newHomework.dueDate} onChange={e => setNewHomework({...newHomework, dueDate: e.target.value})} /><button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Assign</button></form></div></div>
            <div className="lg:col-span-2 space-y-4">{homeworkList.map(hw => (<div key={hw.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"><h4>{hw.subject}</h4><p className="text-gray-500 text-sm">{hw.task}</p></div>))}</div>
        </div>
    );
};
const ExamBuilderModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => { return <div className="p-20 text-center text-gray-400">Exam Builder module loaded for Grade {gradeId}</div>; };
const GradingModule = ({ teacherId }: { teacherId: string }) => { return <div className="p-20 text-center text-gray-400">Grading module loaded.</div>; };
const QueriesModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const load = useCallback(() => db.getQueries().then(setQueries), []);
    useEffect(() => { load(); }, [load]);
    const sendReply = async (id: string) => { await db.answerQuery(id, replyText[id]); alert('Sent'); load(); };
    return <div className="max-w-4xl mx-auto space-y-4">{queries.map(q => <div key={q.id} className="bg-white p-6 rounded-xl border"><h4 className="font-bold">{q.studentName}</h4><p className="italic my-2">"{q.queryText}"</p>{q.status === 'Answered' ? <p className="text-purple-600 font-bold">Reply: {q.replyText}</p> : <div className="flex gap-2"><input className="flex-1 border p-2 rounded" placeholder="Reply..." onChange={e => setReplyText({...replyText, [q.id]: e.target.value})} /><button onClick={() => sendReply(q.id)} className="bg-purple-600 text-white px-4 py-2 rounded">Reply</button></div>}</div>)}</div>;
};

const SettingsSection = ({ user }: { user: User }) => {
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.new !== form.confirm) { alert("Passwords don't match"); return; }
        setLoading(true);
        try {
            await db.changePassword(user.id, 'teacher', form.current, form.new);
            setSuccess(true);
            setForm({ current: '', new: '', confirm: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };
    return (
        <div className="max-w-md mx-auto py-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
                 <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600"><Lock size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Change Password</h3>
                 {success && <div className="mb-4 text-emerald-600 text-sm font-bold">Password updated successfully!</div>}
                 <form onSubmit={handleUpdate} className="space-y-4">
                     <input required type="password" placeholder="Current Password" value={form.current} onChange={e => setForm({...form, current: e.target.value})} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600" />
                     <input required type="password" placeholder="New Password" value={form.new} onChange={e => setForm({...form, new: e.target.value})} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600" />
                     <input required type="password" placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600" />
                     <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">{loading ? 'Updating...' : 'Update Password'}</button>
                 </form>
            </div>
        </div>
    );
};

export default TeacherDashboard;
