import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, Question, StudentQuery, ExamSubmission, AttendanceRecord } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Calendar, BookOpen, PenTool, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Award, ClipboardCheck, X, Save, MessageSquare, Clock, Unlock, UserCheck, UserX, AlertCircle } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'exams' | 'grading' | 'queries'>('attendance');
    
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
                    { id: 'queries', label: 'Queries', icon: MessageSquare }
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
                {activeTab === 'attendance' && <AttendanceModule gradeId={selectedGradeId} divisionId={selectedDivisionId} />}
                {activeTab === 'homework' && <HomeworkModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                {activeTab === 'exams' && <ExamBuilderModule gradeId={selectedGradeId} divisionId={selectedDivisionId} teacherId={user?.id || ''} />}
                {activeTab === 'grading' && <GradingModule teacherId={user?.id || ''} />}
                {activeTab === 'queries' && <QueriesModule />}

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

// --- MODULE 1: ATTENDANCE (CALENDAR) ---
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
                // 1. Get Students
                const st = await db.getStudents(gradeId, divisionId);
                setStudents(st);

                // 2. Get Existing Attendance
                const records = await db.getAttendance(undefined, date);
                const map: Record<string, 'Present' | 'Absent'> = {};
                
                // Initialize all as Present by default if no record exists
                st.forEach(s => map[s.id] = 'Present');
                
                // Overwrite with existing records
                records.forEach(r => {
                    if (r.divisionId === divisionId) { // extra safety check
                        map[r.studentId] = r.status;
                    }
                });
                
                setAttendanceMap(map);
            } catch (error) {
                console.error("Error loading attendance:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [gradeId, divisionId, date]);

    const toggleStatus = (studentId: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const saveAttendance = async () => {
        try {
            const records = students.map(s => ({
                studentId: s.id,
                divisionId,
                date,
                status: attendanceMap[s.id]
            }));
            await db.markAttendance(records);
            alert('Attendance Saved Successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to save attendance');
        }
    };

    const stats = {
        total: students.length,
        present: Object.values(attendanceMap).filter(s => s === 'Present').length,
        absent: Object.values(attendanceMap).filter(s => s === 'Absent').length
    };

    if (!gradeId) return <div className="text-center text-gray-400 p-10">Please select a Grade and Division first.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header & Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={24}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Mark Attendance</h3>
                        <p className="text-sm text-gray-500">For {date === new Date().toISOString().split('T')[0] ? 'Today' : date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    <button onClick={saveAttendance} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                        <Save size={18}/> Save
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-500 font-bold uppercase">Total Students</p>
                    <p className="text-2xl font-black text-blue-700">{stats.total}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-500 font-bold uppercase">Present</p>
                    <p className="text-2xl font-black text-emerald-700">{stats.present}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                    <p className="text-xs text-rose-500 font-bold uppercase">Absent</p>
                    <p className="text-2xl font-black text-rose-700">{stats.absent}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-400">Loading students...</div>
                ) : students.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">No students found in this class.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-100">
                            <tr>
                                <th className="p-4">Student Name</th>
                                <th className="p-4">Roll ID</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map(s => (
                                <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${attendanceMap[s.id] === 'Absent' ? 'bg-rose-50/30' : ''}`}>
                                    <td className="p-4 font-medium text-gray-800">{s.name}</td>
                                    <td className="p-4 text-sm text-gray-500 font-mono">{s.studentCustomId}</td>
                                    <td className="p-4 flex justify-center">
                                        <button 
                                            onClick={() => toggleStatus(s.id)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all w-32 justify-center ${
                                                attendanceMap[s.id] === 'Present' 
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                            }`}
                                        >
                                            {attendanceMap[s.id] === 'Present' ? <><UserCheck size={16}/> Present</> : <><UserX size={16}/> Absent</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
        try {
            const hw = await db.getHomeworkForStudent(gradeId, divisionId);
            // Sort by due date desc
            hw.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
            setHomeworkList(hw);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [gradeId, divisionId]);

    useEffect(() => {
        loadHomework();
    }, [loadHomework]);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!gradeId || !divisionId) {
            alert('Please select a Grade and Division');
            return;
        }
        try {
            await db.addHomework({
                gradeId,
                subdivisionId: divisionId,
                subject: newHomework.subject,
                task: newHomework.task,
                dueDate: newHomework.dueDate,
                assignedBy: teacherId
            });
            alert('Homework Assigned');
            setNewHomework({ subject: '', task: '', dueDate: '' });
            loadHomework();
        } catch (error) {
            console.error(error);
            alert('Failed to assign homework');
        }
    };

    if (!gradeId) return <div className="text-center text-gray-400 p-10">Please select a Grade and Division first.</div>;

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 sticky top-4">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                        <Plus className="bg-purple-100 text-purple-600 rounded p-1" size={28}/> Assign Homework
                    </h3>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                            <input 
                                required
                                placeholder="e.g. Mathematics"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newHomework.subject}
                                onChange={e => setNewHomework({...newHomework, subject: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Task</label>
                            <textarea 
                                required
                                placeholder="Details about the assignment..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                                value={newHomework.task}
                                onChange={e => setNewHomework({...newHomework, task: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newHomework.dueDate}
                                onChange={e => setNewHomework({...newHomework, dueDate: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md">
                            Assign to Class
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                    <BookOpen size={20} className="text-gray-400"/> Class Homework History
                </h3>
                
                {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : homeworkList.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
                        No homework assigned yet for this class.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {homeworkList.map(hw => (
                            <div key={hw.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800 text-lg">{hw.subject}</h4>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${new Date(hw.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            Due: {hw.dueDate}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{hw.task}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 md:w-48 shrink-0">
                                    <div className="flex flex-col gap-1 w-full">
                                        <button className="text-purple-600 font-bold hover:bg-purple-50 px-3 py-2 rounded text-left transition-colors flex items-center gap-2">
                                            <ClipboardCheck size={16}/> View Submissions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MODULE 3: EXAM BUILDER ---
const ExamBuilderModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [examMeta, setExamMeta] = useState({ 
        title: '', 
        subject: '', 
        totalMarks: 100, 
        examDate: '', 
        startTime: '09:00', 
        duration: 60 
    });
    const [questions, setQuestions] = useState<Question[]>([]);
    
    const addQuestion = () => {
        setQuestions([...questions, {
            id: `q${Date.now()}`,
            text: '',
            type: 'short',
            marks: 5
        }]);
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const currentTotal = questions.reduce((sum, q) => sum + parseInt(q.marks.toString() || '0'), 0);

    const saveExam = async () => {
        if (currentTotal !== parseInt(examMeta.totalMarks.toString())) {
            alert(`Error: Question marks total (${currentTotal}) does not match Total Marks (${examMeta.totalMarks}).`);
            return;
        }
        if (!examMeta.subject || !examMeta.examDate || !examMeta.title) {
            alert('Please fill all exam details.');
            return;
        }
        
        await db.addExam({
            title: examMeta.title,
            gradeId, subdivisionId: divisionId,
            subject: examMeta.subject,
            examDate: examMeta.examDate,
            startTime: examMeta.startTime,
            duration: examMeta.duration,
            totalMarks: examMeta.totalMarks,
            questions,
            createdBy: teacherId
        });
        alert('Exam Created Successfully!');
        setQuestions([]);
        setExamMeta({ title: '', subject: '', totalMarks: 100, examDate: '', startTime: '09:00', duration: 60 });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><PenTool className="text-purple-600"/> Create New Exam</h3>
                
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Name / Title</label>
                        <input className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Mid-Term Assessment" value={examMeta.title} onChange={e => setExamMeta({...examMeta, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                        <input className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Science" value={examMeta.subject} onChange={e => setExamMeta({...examMeta, subject: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                        <input className="w-full border rounded-lg px-4 py-2" type="date" value={examMeta.examDate} onChange={e => setExamMeta({...examMeta, examDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                        <input className="w-full border rounded-lg px-4 py-2" type="time" value={examMeta.startTime} onChange={e => setExamMeta({...examMeta, startTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Mins)</label>
                        <input className="w-full border rounded-lg px-4 py-2" type="number" value={examMeta.duration} onChange={e => setExamMeta({...examMeta, duration: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
                        <input className="w-full border rounded-lg px-4 py-2" type="number" placeholder="Total Marks" value={examMeta.totalMarks} onChange={e => setExamMeta({...examMeta, totalMarks: parseInt(e.target.value)})} />
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4 mb-8">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                            <div className="absolute top-2 left-2 text-xs font-bold text-gray-400">Q{idx + 1}</div>
                            <button onClick={() => removeQuestion(q.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            
                            <div className="mt-4 flex flex-col md:flex-row gap-4">
                                <select 
                                    className="border rounded px-2 py-1 bg-white text-sm w-full md:w-32"
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                >
                                    <option value="short">Short Answer</option>
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="paragraph">Paragraph</option>
                                </select>
                                <input 
                                    className="flex-1 border-b border-gray-300 bg-transparent px-2 focus:border-purple-500 outline-none" 
                                    placeholder="Enter Question Text..." 
                                    value={q.text}
                                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    className="w-full md:w-20 border rounded px-2 py-1 text-center" 
                                    placeholder="Marks"
                                    value={q.marks}
                                    onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6 gap-4">
                    <button onClick={addQuestion} className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors">
                        <Plus size={20}/> Add Question
                    </button>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className={`text-sm font-bold ${currentTotal === examMeta.totalMarks ? 'text-green-600' : 'text-red-500'}`}>
                            Total: {currentTotal} / {examMeta.totalMarks}
                        </div>
                        <button 
                            onClick={saveExam}
                            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentTotal !== examMeta.totalMarks}
                        >
                            Save Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODULE 4: GRADING ---
const GradingModule = ({ teacherId }: { teacherId: string }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<string, number>>({}); // studentId -> marks
    
    // Grading Detail Modal
    const [gradingStudent, setGradingStudent] = useState<Student | null>(null);
    const [studentSubmission, setStudentSubmission] = useState<ExamSubmission | null>(null);

    useEffect(() => {
        const load = async () => setExams(await db.getExams(teacherId));
        load();
    }, [teacherId]);

    const handleSelectExam = async (exam: Exam) => {
        setSelectedExam(exam);
        const st = await db.getStudents(exam.gradeId, exam.subdivisionId);
        setStudents(st);
        
        const results = await db.getExamResults(exam.id);
        const gradeMap: Record<string, number> = {};
        results.forEach(r => gradeMap[r.studentId] = r.marksObtained);
        setGrades(gradeMap);
    };

    const openGradingModal = async (student: Student) => {
        if (!selectedExam) return;
        const sub = await db.getExamSubmissionStatus(selectedExam.id, student.id);
        setStudentSubmission(sub);
        setGradingStudent(student);
    };

    const reopenExam = async () => {
        if (!selectedExam || !gradingStudent) return;
        if (window.confirm(`Allow ${gradingStudent.name} to retake this exam? This will delete their previous submission.`)) {
            await db.unlockExamForStudent(selectedExam.id, gradingStudent.id);
            alert("Exam unlocked.");
            setStudentSubmission(null); // Refresh local view
        }
    };

    const submitGrade = async (studentId: string) => {
        if (!selectedExam) return;
        const marks = grades[studentId] || 0;
        const percentage = (marks / selectedExam.totalMarks) * 100;
        
        await db.addExamResult({
            examId: selectedExam.id,
            studentId,
            marksObtained: marks,
            percentage,
            status: percentage >= 35 ? 'Pass' : 'Fail'
        });
        alert('Grade Saved');
    };

    if (selectedExam) {
        return (
            <div className="max-w-5xl mx-auto relative">
                 <button onClick={() => setSelectedExam(null)} className="mb-4 text-gray-500 hover:text-purple-600 flex items-center gap-1"><ChevronLeft size={16}/> Back to Exams</button>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                     <h3 className="text-xl font-bold">{selectedExam.title} ({selectedExam.subject})</h3>
                     <p className="text-gray-500">Total Marks: {selectedExam.totalMarks} | Date: {selectedExam.examDate} {selectedExam.startTime}</p>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 overflow-x-auto">
                     <table className="w-full text-left min-w-[700px]">
                         <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                             <tr>
                                 <th className="p-4">Student Name</th>
                                 <th className="p-4">Submission</th>
                                 <th className="p-4">Marks Obtained</th>
                                 <th className="p-4">Percentage</th>
                                 <th className="p-4">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {students.map(s => {
                                 const currentMarks = grades[s.id] || 0;
                                 const pct = ((currentMarks / selectedExam.totalMarks) * 100).toFixed(1);
                                 return (
                                     <tr key={s.id} className="hover:bg-gray-50">
                                         <td className="p-4 font-medium">{s.name}</td>
                                         <td className="p-4">
                                             <button 
                                                onClick={() => openGradingModal(s)}
                                                className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1"
                                             >
                                                 <ClipboardCheck size={14} /> Review Answers
                                             </button>
                                         </td>
                                         <td className="p-4">
                                             <input 
                                                type="number" 
                                                className="border rounded px-2 py-1 w-24 text-center"
                                                max={selectedExam.totalMarks}
                                                value={grades[s.id] || ''}
                                                onChange={(e) => setGrades({...grades, [s.id]: parseInt(e.target.value)})}
                                             />
                                             <span className="text-gray-400 text-sm"> / {selectedExam.totalMarks}</span>
                                         </td>
                                         <td className="p-4 font-bold text-gray-600">{pct}%</td>
                                         <td className="p-4">
                                             <button onClick={() => submitGrade(s.id)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 text-sm font-bold">
                                                 Save
                                             </button>
                                         </td>
                                     </tr>
                                 );
                             })}
                         </tbody>
                     </table>
                 </div>

                 {/* Grading Modal */}
                 {gradingStudent && (
                     <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                         <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                             <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                 <div>
                                     <h3 className="font-bold text-lg">{gradingStudent.name} - Answers</h3>
                                     {studentSubmission ? (
                                         <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Submitted</span>
                                     ) : (
                                         <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Not Attempted</span>
                                     )}
                                 </div>
                                 <button onClick={() => { setGradingStudent(null); setStudentSubmission(null); }}><X size={20} className="text-gray-400"/></button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                 {studentSubmission ? (
                                     <>
                                        {selectedExam.questions.map((q, idx) => (
                                            <div key={q.id} className="border-b pb-4 last:border-0">
                                                <p className="font-bold text-gray-800 mb-2">Q{idx+1}. {q.text} <span className="text-gray-400 text-xs">({q.marks} Marks)</span></p>
                                                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 font-mono whitespace-pre-wrap">
                                                    {studentSubmission.answers[q.id] || <span className="text-red-400 italic">No Answer</span>}
                                                </div>
                                            </div>
                                        ))}
                                     </>
                                 ) : (
                                     <div className="text-center py-10 text-gray-400">Student has not attempted this exam yet.</div>
                                 )}
                             </div>
                             <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between">
                                 <button 
                                    onClick={reopenExam}
                                    disabled={!studentSubmission} 
                                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-sm disabled:opacity-50"
                                 >
                                     <Unlock size={16}/> Allow Retry (Re-open)
                                 </button>
                                 <div className="flex items-center gap-2">
                                     <span className="text-sm font-bold text-gray-600">Total Marks:</span>
                                     <input 
                                        type="number" 
                                        className="border rounded px-2 py-1 w-20 text-center"
                                        value={grades[gradingStudent.id] || ''}
                                        onChange={(e) => setGrades({...grades, [gradingStudent.id]: parseInt(e.target.value)})}
                                     />
                                     <button onClick={() => submitGrade(gradingStudent.id)} className="bg-purple-600 text-white px-4 py-1 rounded text-sm font-bold">Save</button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(ex => (
                <div key={ex.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-400 transition-all cursor-pointer group" onClick={() => handleSelectExam(ex)}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ClipboardCheck size={24}/>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{ex.examDate}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{ex.title}</h3>
                    <p className="text-sm text-purple-600 font-medium mb-1">{ex.subject}</p>
                    <p className="text-xs text-gray-400">Total Marks: {ex.totalMarks} • {ex.duration} Mins</p>
                    <div className="mt-4 text-purple-600 font-bold text-sm flex items-center gap-1">Enter Grades <ChevronRight size={16}/></div>
                </div>
            ))}
            {exams.length === 0 && <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">No exams created yet. Go to Exam Builder to create one.</div>}
        </div>
    );
};

// --- MODULE 5: QUERIES ---
const QueriesModule = () => {
    return <div className="text-center text-gray-500 p-10">Queries Module Loaded</div>;
};

export default TeacherDashboard;