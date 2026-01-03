import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, LiveClass, AttendanceRecord, Student, Homework, Exam, StudentQuery } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Video, Calendar, CheckSquare, Clock, BookOpen, PenTool, HelpCircle, Send, CheckCircle, AlertCircle, X } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'homework' | 'exams' | 'queries'>('dashboard');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('sc_user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    if(parsedUser.role !== 'student') { navigate('/'); return; }
    
    setUser(parsedUser);
    
    // Fetch details
    const init = async () => {
        const students = await db.getStudents();
        const me = students.find(s => s.id === parsedUser.id);
        if (me) setStudentDetails(me);
    };
    init();
  }, [navigate]);

  const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

  if (!user || !studentDetails) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <ThreeOrb className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" color="#6366f1" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0)}
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800">Hi, {user.username}</h1>
                <p className="text-xs text-gray-500">ID: {studentDetails.studentCustomId}</p>
            </div>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex space-x-6 overflow-x-auto relative z-10 sticky top-[73px]">
           {[
               { id: 'dashboard', label: 'Dashboard', icon: Calendar },
               { id: 'homework', label: 'Homework', icon: BookOpen },
               { id: 'exams', label: 'Exams', icon: PenTool },
               { id: 'queries', label: 'My Queries', icon: HelpCircle }
           ].map(tab => (
               <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
               >
                   <tab.icon size={18} /> {tab.label}
               </button>
           ))}
       </div>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10 space-y-8 pb-20">
         {activeTab === 'dashboard' && <DashboardOverview student={studentDetails} />}
         {activeTab === 'homework' && <HomeworkSection student={studentDetails} />}
         {activeTab === 'exams' && <ExamSection student={studentDetails} />}
         {activeTab === 'queries' && <QuerySection student={studentDetails} />}

         {/* Footer */}
         <div className="mt-auto py-6 flex justify-center items-center">
            <a href="https://www.advedasolutions.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity group">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Powered by</span>
                <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
            </a>
         </div>
      </main>
    </div>
  );
};

// --- TAB 1: DASHBOARD (Attendance + Timetable) ---
const DashboardOverview = ({ student }: { student: Student }) => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        const load = async () => {
            setTimetable(await db.getTimetable(student.subdivisionId));
            const live = await db.getLiveClasses(student.subdivisionId);
            if(live.length > 0) setLiveClass(live[0]);
            setAttendance(await db.getAttendance(student.id));
        }
        load();
    }, [student]);

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const totalDays = attendance.length;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
             {/* Live Class Alert */}
             {liveClass && (
                <div className="lg:col-span-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between animate-pulse-slow">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><Video size={32} /></div>
                        <div>
                            <h2 className="text-2xl font-bold">Live Class in Progress</h2>
                            <p className="opacity-90">{liveClass.title} • Started just now</p>
                        </div>
                    </div>
                    <a href={liveClass.meetingLink} target="_blank" rel="noreferrer" className="mt-4 sm:mt-0 px-8 py-3 bg-white text-rose-600 font-bold rounded-full shadow-md hover:scale-105 transition-transform">Join Now</a>
                </div>
            )}

            {/* Attendance Stats */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Attendance Tracker</h3>
                        <CheckSquare className="text-emerald-500" />
                    </div>
                    <div className="flex items-end space-x-2 mb-2">
                        <span className="text-5xl font-extrabold text-gray-900">{percentage}%</span>
                        <span className="text-sm text-gray-500 mb-2">Overall</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                        <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xl font-bold">{totalDays}</p><p className="text-xs text-gray-500">Total Days</p></div>
                        <div className="bg-emerald-50 p-3 rounded-lg text-emerald-700"><p className="text-xl font-bold">{presentCount}</p><p className="text-xs opacity-70">Present</p></div>
                    </div>
                 </div>

                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recent History</h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto">
                        {attendance.slice().reverse().map(record => (
                            <div key={record.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <span className="font-medium text-gray-700">{record.date}</span>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {record.status}
                                </span>
                            </div>
                        ))}
                        {attendance.length === 0 && <p className="text-gray-400 text-center text-sm">No records yet.</p>}
                     </div>
                 </div>
            </div>

            {/* Timetable */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-700"><Calendar size={20}/> Weekly Timetable</h2>
                    <div className="min-w-[600px]">
                        <div className="grid grid-cols-6 gap-4 mb-4 font-bold text-gray-500 border-b pb-2 text-sm">
                            <div className="col-span-1">Time</div>
                            {days.map(d => <div key={d} className="col-span-1">{d.slice(0,3)}</div>)}
                        </div>
                        {['09:00', '10:00', '11:00', '12:00'].map(time => (
                            <div key={time} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
                                <div className="text-xs font-medium text-gray-400 flex items-center"><Clock size={12} className="mr-1"/> {time}</div>
                                {days.map(day => {
                                    const entry = timetable.find(t => t.day === day && t.startTime.startsWith(time.slice(0,2)));
                                    return (
                                        <div key={day} className="text-sm">
                                            {entry ? (
                                                <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg border border-indigo-100 text-xs">
                                                    <div className="font-bold">{entry.subject}</div>
                                                </div>
                                            ) : <span className="text-gray-200">-</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TAB 2: HOMEWORK ---
const HomeworkSection = ({ student }: { student: Student }) => {
    const [homework, setHomework] = useState<Homework[]>([]);
    const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const load = async () => {
             const hw = await db.getHomeworkForStudent(student.gradeId, student.subdivisionId);
             setHomework(hw);
             
             const statusMap: Record<string, boolean> = {};
             for(const h of hw) {
                 const sub = await db.getHomeworkSubmission(h.id, student.id);
                 statusMap[h.id] = !!sub;
             }
             setSubmissionStatus(statusMap);
        }
        load();
    }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedHw) return;
        await db.submitHomework(selectedHw.id, student.id, submissionText);
        alert("Homework Submitted Successfully!");
        
        // Refresh status
        setSubmissionStatus(prev => ({...prev, [selectedHw.id]: true}));
        setSelectedHw(null);
        setSubmissionText('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700">Assignments</h3>
                {homework.map(hw => (
                    <div key={hw.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">{hw.subject}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Due: {hw.dueDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{hw.task}</p>
                        {submissionStatus[hw.id] ? (
                            <button disabled className="w-full py-2 bg-green-100 text-green-700 font-bold rounded-lg flex items-center justify-center gap-2"><CheckCircle size={16}/> Submitted</button>
                        ) : (
                            <button onClick={() => setSelectedHw(hw)} className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Submit Homework</button>
                        )}
                    </div>
                ))}
                {homework.length === 0 && <p className="text-gray-400">No pending homework.</p>}
            </div>

            {/* Submission Form */}
            {selectedHw && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 h-fit sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Submit: {selectedHw.subject}</h3>
                        <button onClick={() => setSelectedHw(null)}><X size={20} className="text-gray-400"/></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm text-gray-600 mb-2">Your Answer / Response</label>
                        <textarea 
                            required
                            className="w-full h-48 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Type your homework answer here..."
                            value={submissionText}
                            onChange={e => setSubmissionText(e.target.value)}
                        />
                        <button type="submit" className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700">Send to Teacher</button>
                    </form>
                </div>
            )}
        </div>
    );
};

// --- TAB 3: EXAMS ---
const ExamSection = ({ student }: { student: Student }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [takenStatus, setTakenStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const load = async () => {
            const ex = await db.getExamsForStudent(student.gradeId, student.subdivisionId);
            setExams(ex);
            
            const statusMap: Record<string, boolean> = {};
            for(const e of ex) {
                statusMap[e.id] = await db.isExamSubmitted(e.id, student.id);
            }
            setTakenStatus(statusMap);
        };
        load();
    }, [student]);

    const startExam = (exam: Exam) => {
        setActiveExam(exam);
        setAnswers({});
    };

    const submitExam = async () => {
        if(!activeExam) return;
        if(Object.keys(answers).length < activeExam.questions.length) {
            if(!window.confirm("You haven't answered all questions. Submit anyway?")) return;
        }
        await db.submitExamAnswers(activeExam.id, student.id, answers);
        alert("Exam Submitted!");
        setTakenStatus(prev => ({...prev, [activeExam.id]: true}));
        setActiveExam(null);
    };

    if (activeExam) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-purple-100">
                <div className="border-b pb-4 mb-6 flex justify-between items-center">
                     <div>
                         <h2 className="text-2xl font-bold text-gray-800">{activeExam.subject} Exam</h2>
                         <p className="text-gray-500">Total Marks: {activeExam.totalMarks}</p>
                     </div>
                     <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Live Exam</div>
                </div>
                
                <div className="space-y-8">
                    {activeExam.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-bold text-gray-800 mb-3"><span className="text-purple-600 mr-2">Q{idx+1}.</span> {q.text} <span className="text-xs text-gray-400 ml-2">({q.marks} Marks)</span></p>
                            
                            {q.type === 'short' && (
                                <input className="w-full border p-2 rounded" placeholder="Your Answer" onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'paragraph' && (
                                <textarea className="w-full border p-2 rounded h-24" placeholder="Detailed Answer" onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'mcq' && (
                                <select className="w-full border p-2 rounded" onChange={e => setAnswers({...answers, [q.id]: e.target.value})}>
                                    <option value="">Select Option</option>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </select>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={() => setActiveExam(null)} className="text-gray-500">Cancel</button>
                    <button onClick={submitExam} className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700">Submit Exam</button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(ex => {
                const taken = takenStatus[ex.id];
                return (
                    <div key={ex.id} className={`p-6 rounded-xl border transition-all ${taken ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-purple-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between mb-4">
                            <span className="font-bold text-lg">{ex.subject}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{ex.examDate}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Total Marks: {ex.totalMarks}</p>
                        {taken ? (
                            <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-bold cursor-not-allowed">Completed</button>
                        ) : (
                            <button onClick={() => startExam(ex)} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Start Exam</button>
                        )}
                    </div>
                )
            })}
             {exams.length === 0 && <p className="text-gray-400 col-span-3 text-center">No exams scheduled.</p>}
        </div>
    );
};

// --- TAB 4: QUERIES ---
const QuerySection = ({ student }: { student: Student }) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [subject, setSubject] = useState('Maths');
    const [queryText, setQueryText] = useState('');

    useEffect(() => {
        const load = async () => setQueries(await db.getQueries(student.id));
        load();
    }, [student]);

    const handleRaiseQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addQuery({ studentId: student.id, studentName: student.name, subject, queryText });
        setQueries(await db.getQueries(student.id));
        setQueryText('');
        alert("Query Sent to Teachers");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><HelpCircle size={20}/> Raise a Query</h3>
                <form onSubmit={handleRaiseQuery} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Subject</label>
                        <select className="w-full border rounded-lg px-3 py-2" value={subject} onChange={e => setSubject(e.target.value)}>
                            {['Maths', 'Science', 'English', 'Social Studies', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Your Question</label>
                        <textarea 
                            required 
                            className="w-full border rounded-lg px-3 py-2 h-32" 
                            placeholder="Describe your doubt..."
                            value={queryText}
                            onChange={e => setQueryText(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"><Send size={16}/> Send Query</button>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700">My Queries</h3>
                {queries.map(q => (
                    <div key={q.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-indigo-700">{q.subject}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${q.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.status}</span>
                        </div>
                        <p className="text-gray-800 text-sm mb-3">"{q.queryText}"</p>
                        {q.replyText && (
                            <div className="bg-gray-50 p-3 rounded-lg text-sm border-l-4 border-green-400">
                                <p className="font-bold text-gray-600 text-xs uppercase mb-1">Teacher Reply:</p>
                                <p className="text-gray-700">{q.replyText}</p>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2 text-right">{q.createdAt}</p>
                    </div>
                ))}
                {queries.length === 0 && <p className="text-gray-400">No queries raised yet.</p>}
            </div>
        </div>
    );
};

export default StudentDashboard;