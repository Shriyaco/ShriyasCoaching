import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Subdivision, Student, User, Grade, Homework, Exam, Question, StudentQuery } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Calendar, BookOpen, PenTool, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Award, ClipboardCheck, X, Save, MessageSquare } from 'lucide-react';

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
            <ThreeOrb className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 pointer-events-none" color="#f472b6" />

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({}); 
    const [existingDates, setExistingDates] = useState<Set<string>>(new Set());

    const refresh = useCallback(async () => {
        if(!divisionId) return;
        const all = await db.getAttendance(undefined, undefined); 
        const dates = new Set(all.filter(a => a.divisionId === divisionId).map(a => a.date));
        setExistingDates(dates);
    }, [divisionId]);

    useEffect(() => {
        refresh();
        const sub = db.subscribe('attendance', refresh);
        return () => db.unsubscribe(sub);
    }, [refresh]);

    useEffect(() => {
        const loadStudents = async () => {
            if (selectedDate && gradeId && divisionId) {
                const list = await db.getStudents(gradeId, divisionId);
                setStudents(list);
                
                // Load existing
                const existing = await db.getAttendance(undefined, selectedDate);
                const statusMap: Record<string, boolean> = {};
                list.forEach(s => {
                    const record = existing.find(r => r.studentId === s.id);
                    // Default to true if no record, or load existing status
                    statusMap[s.id] = record ? record.status === 'Present' : true;
                });
                setAttendanceData(statusMap);
            }
        };
        loadStudents();
    }, [selectedDate, gradeId, divisionId]);

    const handleSave = async () => {
        if (!selectedDate) return;
        const records = students.map(s => ({
            studentId: s.id,
            divisionId: divisionId,
            date: selectedDate,
            status: attendanceData[s.id] ? 'Present' as const : 'Absent' as const
        }));
        await db.markAttendance(records);
        setSelectedDate(null); // Close modal
        alert('Attendance Saved!');
    };

    // Calendar Helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sun
    
    const days = getDaysInMonth(currentDate);
    const startOffset = getFirstDayOfMonth(currentDate); // 0 (Sun) to 6 (Sat)
    
    const renderCalendar = () => {
        const grid = [];
        // Empty cells
        for (let i = 0; i < startOffset; i++) grid.push(<div key={`empty-${i}`} className="h-16 md:h-24 bg-gray-50/50" />);
        // Days
        for (let d = 1; d <= days; d++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const hasRecord = existingDates.has(dateStr);

            grid.push(
                <div 
                    key={d} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-16 md:h-24 border border-gray-100 p-1 md:p-2 cursor-pointer hover:bg-purple-50 transition-colors relative group rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                >
                    <span className={`font-bold text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{d}</span>
                    {hasRecord && (
                        <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Attendance Taken"></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Take Roll</span>
                    </div>
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Attendance Calendar</h2>
                <div className="flex items-center gap-4 bg-white rounded-full shadow-sm border border-gray-100 p-1">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20}/></button>
                    <span className="text-sm md:text-lg font-bold w-32 text-center select-none">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 text-center font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-wider">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d.slice(0,3)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {renderCalendar()}
            </div>

            {/* Attendance Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
                            <h3 className="font-bold">Roll Call: {selectedDate}</h3>
                            <button onClick={() => setSelectedDate(null)}><X size={20}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {students.length === 0 ? <p className="text-gray-500 text-center">No students in this class.</p> : students.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                    <span className="font-medium text-gray-800">{s.name}</span>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-emerald-500"
                                            checked={attendanceData[s.id] || false}
                                            onChange={() => setAttendanceData(prev => ({...prev, [s.id]: !prev[s.id]}))}
                                        />
                                        <span className={`text-sm font-bold ${attendanceData[s.id] ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {attendanceData[s.id] ? 'Present' : 'Absent'}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <button onClick={handleSave} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700">Save Attendance</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MODULE 2: HOMEWORK ---
const HomeworkModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [view, setView] = useState<'create' | 'check'>('create');
    const [task, setTask] = useState('');
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [hwStatus, setHwStatus] = useState<Record<string, string>>({});

    const refreshList = useCallback(async () => {
         setHomeworkList(await db.getHomework(teacherId));
    }, [teacherId]);

    useEffect(() => {
        refreshList();
        const sub = db.subscribe('homework', refreshList);
        return () => db.unsubscribe(sub);
    }, [refreshList]);

    const assignHomework = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addHomework({
            gradeId, subdivisionId: divisionId,
            subject, task, dueDate, assignedBy: teacherId
        });
        alert('Homework Assigned!');
        setTask(''); setSubject('');
        // List update handled by realtime
    };

    const openCheckPage = async (hw: Homework) => {
        setSelectedHomework(hw);
        const st = await db.getStudents(hw.gradeId, hw.subdivisionId);
        setStudents(st);
        
        const refreshStatus = async () => {
            const statusMap: Record<string, string> = {};
            await Promise.all(st.map(async (s) => {
                const sub = await db.getHomeworkSubmission(hw.id, s.id);
                statusMap[s.id] = sub ? 'Submitted' : 'Pending';
            }));
            setHwStatus(statusMap);
        };
        refreshStatus();
        setView('check');
    };

    if (view === 'check' && selectedHomework) {
        return (
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setView('create')} className="mb-4 text-gray-500 hover:text-purple-600 flex items-center gap-1"><ChevronLeft size={16}/> Back to List</button>
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <h3 className="text-xl font-bold mb-2">{selectedHomework.subject}: {selectedHomework.task}</h3>
                    <p className="text-sm text-gray-500">Due: {selectedHomework.dueDate}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 font-bold border-b text-gray-700">Student Submission Status</div>
                    {students.map(s => {
                        const status = hwStatus[s.id] || 'Pending';
                        return (
                            <div key={s.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                     <span className="font-bold text-gray-800">{s.name}</span>
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {status}
                                     </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700"><Plus size={20}/> Assign Homework</h3>
                <form onSubmit={assignHomework} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Subject</label>
                        <input required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Maths, Science..." value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Due Date</label>
                        <input required type="date" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Task Description</label>
                        <textarea required className="w-full border rounded-lg px-3 py-2 h-32 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Read Chapter 4 and solve Exercise 2.1..." value={task} onChange={e => setTask(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">Assign to Class</button>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700">Recent Assignments</h3>
                {homeworkList.map(hw => (
                    <div key={hw.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => openCheckPage(hw)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">{hw.subject}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Due: {hw.dueDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{hw.task}</p>
                        <div className="mt-3 text-purple-600 text-sm font-bold flex items-center gap-1">Check Status <ChevronRight size={14}/></div>
                    </div>
                ))}
                {homeworkList.length === 0 && <p className="text-center text-gray-400 py-8">No homework assigned yet.</p>}
            </div>
        </div>
    );
};

// --- MODULE 3: EXAM BUILDER ---
const ExamBuilderModule = ({ gradeId, divisionId, teacherId }: { gradeId: string, divisionId: string, teacherId: string }) => {
    const [examMeta, setExamMeta] = useState({ subject: '', totalMarks: 100, examDate: '' });
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
        if (!examMeta.subject || !examMeta.examDate) {
            alert('Please fill exam details.');
            return;
        }
        
        await db.addExam({
            gradeId, subdivisionId: divisionId,
            subject: examMeta.subject,
            examDate: examMeta.examDate,
            totalMarks: examMeta.totalMarks,
            questions,
            createdBy: teacherId
        });
        alert('Exam Created Successfully!');
        setQuestions([]);
        setExamMeta({ subject: '', totalMarks: 100, examDate: '' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Same UI ... */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><PenTool className="text-purple-600"/> Create New Exam</h3>
                
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input className="border rounded-lg px-4 py-2" placeholder="Subject (e.g. Science)" value={examMeta.subject} onChange={e => setExamMeta({...examMeta, subject: e.target.value})} />
                    <input className="border rounded-lg px-4 py-2" type="date" value={examMeta.examDate} onChange={e => setExamMeta({...examMeta, examDate: e.target.value})} />
                    <input className="border rounded-lg px-4 py-2" type="number" placeholder="Total Marks" value={examMeta.totalMarks} onChange={e => setExamMeta({...examMeta, totalMarks: parseInt(e.target.value)})} />
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

    useEffect(() => {
        const load = async () => setExams(await db.getExams(teacherId));
        load();
    }, [teacherId]);

    const handleSelectExam = async (exam: Exam) => {
        setSelectedExam(exam);
        const st = await db.getStudents(exam.gradeId, exam.subdivisionId);
        setStudents(st);
        // Load existing results
        const results = await db.getExamResults(exam.id);
        const gradeMap: Record<string, number> = {};
        results.forEach(r => gradeMap[r.studentId] = r.marksObtained);
        setGrades(gradeMap);
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
            <div className="max-w-4xl mx-auto">
                 <button onClick={() => setSelectedExam(null)} className="mb-4 text-gray-500 hover:text-purple-600 flex items-center gap-1"><ChevronLeft size={16}/> Back to Exams</button>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                     <h3 className="text-xl font-bold">{selectedExam.subject} Exam</h3>
                     <p className="text-gray-500">Total Marks: {selectedExam.totalMarks} | Date: {selectedExam.examDate}</p>
                 </div>
                 
                 <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 overflow-x-auto">
                     <table className="w-full text-left min-w-[600px]">
                         <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                             <tr>
                                 <th className="p-4">Student Name</th>
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
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{ex.subject}</h3>
                    <p className="text-sm text-gray-500">Total Marks: {ex.totalMarks}</p>
                    <div className="mt-4 text-purple-600 font-bold text-sm flex items-center gap-1">Enter Grades <ChevronRight size={16}/></div>
                </div>
            ))}
            {exams.length === 0 && <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-10">No exams created yet. Go to Exam Builder to create one.</div>}
        </div>
    );
};

// --- MODULE 5: QUERIES ---
const QueriesModule = () => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [replyText, setReplyText] = useState('');
    const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setQueries(await db.getQueries()); // Get all for teacher
    }, []);

    useEffect(() => {
        refresh();
        const sub = db.subscribe('queries', refresh);
        return () => db.unsubscribe(sub);
    }, [refresh]);

    const submitReply = async (queryId: string) => {
        await db.answerQuery(queryId, replyText);
        setReplyText('');
        setSelectedQueryId(null);
        alert('Reply Sent');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Queries</h2>
            {queries.map(q => (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-bold text-gray-800 mr-2">{q.studentName}</span>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full uppercase font-bold">{q.subject}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${q.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {q.status}
                        </span>
                    </div>
                    <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">"{q.queryText}"</p>
                    
                    {q.status === 'Answered' ? (
                        <div className="border-t pt-2 mt-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Your Reply:</p>
                            <p className="text-gray-800">{q.replyText}</p>
                        </div>
                    ) : (
                        <div>
                            {selectedQueryId === q.id ? (
                                <div className="mt-2">
                                    <textarea 
                                        className="w-full border rounded-lg p-2 text-sm mb-2"
                                        placeholder="Type your answer here..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => submitReply(q.id)} className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold">Send Reply</button>
                                        <button onClick={() => setSelectedQueryId(null)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setSelectedQueryId(q.id)} className="text-purple-600 font-bold text-sm hover:underline">Reply to Student</button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            {queries.length === 0 && <p className="text-center text-gray-400">No active queries.</p>}
        </div>
    );
};

export default TeacherDashboard;