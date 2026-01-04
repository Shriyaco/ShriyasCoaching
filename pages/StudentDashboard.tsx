import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, LiveClass, AttendanceRecord, Student, Homework, Exam, StudentQuery } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import { LogOut, Video, Calendar, CheckSquare, Clock, BookOpen, PenTool, HelpCircle, Send, CheckCircle, AlertCircle, X, Timer } from 'lucide-react';

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
      <ThreeOrb className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[500px] md:h-[500px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" color="#6366f1" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {studentDetails.imageUrl ? <img src={studentDetails.imageUrl} alt="Profile" className="w-full h-full object-cover" /> : user.username.charAt(0)}
            </div>
            <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800">Hi, {user.username}</h1>
                <p className="text-xs text-gray-500">ID: {studentDetails.studentCustomId}</p>
            </div>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100">
            <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 flex space-x-6 overflow-x-auto relative z-10 sticky top-[73px]">
           {[
               { id: 'dashboard', label: 'Dashboard', icon: Calendar },
               { id: 'homework', label: 'Homework', icon: BookOpen },
               { id: 'exams', label: 'Exams', icon: PenTool },
               { id: 'queries', label: 'My Queries', icon: HelpCircle }
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

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10 space-y-8 pb-20">
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

// --- TAB 1: DASHBOARD ---
const DashboardOverview = ({ student }: { student: Student }) => {
    return <div className="text-center py-10 text-gray-500">Dashboard Loaded</div>;
};

// --- TAB 2: HOMEWORK ---
const HomeworkSection = ({ student }: { student: Student }) => {
    return <div className="text-center py-10 text-gray-500">Homework Loaded</div>;
};

// --- TAB 3: EXAMS ---
const ExamSection = ({ student }: { student: Student }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [takenStatus, setTakenStatus] = useState<Record<string, boolean>>({});
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState<number>(0); 

    const refresh = useCallback(async () => {
        const ex = await db.getExamsForStudent(student.gradeId, student.subdivisionId);
        setExams(ex);
        const statusMap: Record<string, boolean> = {};
        for(const e of ex) {
            // Check submission table directly
            const sub = await db.getExamSubmissionStatus(e.id, student.id);
            statusMap[e.id] = !!sub && sub.isLocked;
        }
        setTakenStatus(statusMap);
    }, [student]);

    useEffect(() => {
        refresh();
        const sub = db.subscribe('exam_submissions', refresh);
        return () => db.unsubscribe(sub);
    }, [refresh]);

    // Timer Logic
    useEffect(() => {
        if (!activeExam) return;
        
        if (timeLeft <= 0) {
            submitExam(true); // Auto submit
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [activeExam, timeLeft]);

    const startExam = (exam: Exam) => {
        const now = new Date();
        const examStart = new Date(`${exam.examDate}T${exam.startTime}`);
        
        // Access Control
        if (now < examStart) {
            alert(`Exam starts at ${exam.startTime} on ${exam.examDate}`);
            return;
        }
        
        setActiveExam(exam);
        setTimeLeft(exam.duration * 60); // Set timer in seconds
        setAnswers({});
    };

    const submitExam = async (auto = false) => {
        if(!activeExam) return;
        
        if (!auto && Object.keys(answers).length < activeExam.questions.length) {
            if(!window.confirm("You haven't answered all questions. Submit anyway?")) return;
        }
        
        await db.submitExamAnswers(activeExam.id, student.id, answers);
        if (auto) alert("Time's up! Exam submitted automatically.");
        else alert("Exam Submitted!");
        
        setTakenStatus(prev => ({...prev, [activeExam.id]: true}));
        setActiveExam(null);
    };

    // Format Seconds to MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (activeExam) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-purple-100 relative">
                {/* Logo on Question Paper */}
                <div className="absolute top-6 left-6 opacity-80">
                    <img src="https://advedasolutions.in/sc.png" alt="Logo" className="h-12 w-auto" />
                </div>

                <div className="text-center mb-8 border-b pb-6 mt-4">
                     <h2 className="text-3xl font-bold text-gray-900 font-[Poppins] uppercase tracking-wide">{activeExam.title}</h2>
                     <p className="text-gray-500 font-bold mt-1">{activeExam.subject}</p>
                     
                     <div className="flex justify-center items-center gap-6 mt-4 text-sm text-gray-600">
                         <span>Class: {activeExam.gradeId} (Div: {activeExam.subdivisionId})</span>
                         <span>Total Marks: {activeExam.totalMarks}</span>
                     </div>
                </div>

                {/* Sticky Timer */}
                <div className={`sticky top-4 z-50 flex justify-end mb-6`}>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-900 text-white'}`}>
                        <Timer size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                
                <div className="space-y-10">
                    {activeExam.questions.map((q, idx) => (
                        <div key={q.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                            <p className="font-bold text-lg text-slate-800 mb-4 flex items-start gap-2">
                                <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-sm mt-1">Q{idx+1}</span> 
                                {q.text} 
                                <span className="text-sm font-normal text-gray-500 ml-auto whitespace-nowrap">({q.marks} Marks)</span>
                            </p>
                            
                            {q.type === 'short' && (
                                <input className="w-full border-b-2 border-slate-300 bg-transparent px-2 py-3 focus:border-purple-600 outline-none text-slate-700 transition-colors" placeholder="Your Answer here..." onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'paragraph' && (
                                <textarea className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none bg-white" placeholder="Type detailed answer..." onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />
                            )}
                            
                            {q.type === 'mcq' && (
                                <select className="w-full md:w-1/2 border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none bg-white" onChange={e => setAnswers({...answers, [q.id]: e.target.value})}>
                                    <option value="">Select correct option</option>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </select>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-12 flex justify-end gap-4 border-t pt-6">
                    <button onClick={() => submitExam(false)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-lg flex items-center gap-2">
                        <CheckCircle size={20}/> Submit Final Answers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(ex => {
                const taken = takenStatus[ex.id];
                const startDateTime = new Date(`${ex.examDate}T${ex.startTime}`);
                const isUpcoming = new Date() < startDateTime;

                return (
                    <div key={ex.id} className={`p-6 rounded-xl border transition-all relative overflow-hidden ${taken ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-purple-100 shadow-sm hover:shadow-md'}`}>
                        {isUpcoming && <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">Upcoming</div>}
                        
                        <div className="flex flex-col gap-1 mb-4">
                            <span className="font-bold text-lg text-gray-800 leading-tight">{ex.title}</span>
                            <span className="text-sm text-purple-600 font-medium">{ex.subject}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1 mb-6">
                            <div className="flex items-center gap-2"><Calendar size={14}/> {ex.examDate}</div>
                            <div className="flex items-center gap-2"><Clock size={14}/> {ex.startTime} ({ex.duration} mins)</div>
                            <div className="flex items-center gap-2"><CheckCircle size={14}/> {ex.totalMarks} Marks</div>
                        </div>

                        {taken ? (
                            <button disabled className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                <CheckCircle size={18}/> Submitted
                            </button>
                        ) : isUpcoming ? (
                            <button disabled className="w-full py-3 bg-orange-100 text-orange-600 rounded-lg font-bold cursor-not-allowed opacity-70">
                                Starts Soon
                            </button>
                        ) : (
                            <button onClick={() => startExam(ex)} className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                                Start Exam
                            </button>
                        )}
                    </div>
                )
            })}
             {exams.length === 0 && <p className="text-gray-400 col-span-3 text-center py-10">No exams scheduled.</p>}
        </div>
    );
};

// --- TAB 4: QUERIES ---
const QuerySection = ({ student }: { student: Student }) => {
    return <div className="text-center py-10 text-gray-500">Queries Loaded</div>;
};

export default StudentDashboard;