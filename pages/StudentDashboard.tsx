import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, AttendanceRecord, Student, Homework, Exam, StudentQuery, HomeworkSubmission, StudyNote, StudentNotification, Subdivision } from '../types';
import ThreeOrb from '../components/ThreeOrb';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, HelpCircle, Send, CheckCircle, X, Timer, GraduationCap, ChevronRight, MessageSquare, Plus, UserCheck, ShoppingBag, CreditCard, Clock, Settings, Lock, Eye, EyeOff, ShieldCheck, FileText, Download, Bell, Info, AlertCircle, Megaphone, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [divisionDetails, setDivisionDetails] = useState<Subdivision | null>(null);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'homework' | 'notes' | 'exams' | 'queries' | 'settings'>('dashboard');
  const [isInMeeting, setIsInMeeting] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('sc_user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    if(parsedUser.role !== 'student') { navigate('/'); return; }
    
    setUser(parsedUser);
    
    const init = async () => {
        const students = await db.getStudents();
        const me = students.find(s => s.id === parsedUser.id);
        if (me) {
            setStudentDetails(me);
            const notifs = await db.getStudentNotifications(me);
            setNotifications(notifs);
            
            // Get division for live status
            const subs = await db.getSubdivisions(me.gradeId);
            const myDiv = subs.find(s => s.id === me.subdivisionId);
            if (myDiv) setDivisionDetails(myDiv);
        }
    };
    init();

    // Subscribe to subdivision changes for real-time live status
    const channel = db.subscribe('subdivisions', init);
    return () => db.unsubscribe(channel);
  }, [navigate]);

  const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

  if (!user || !studentDetails) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] relative overflow-hidden font-sans transition-colors duration-300">
      <ThreeOrb className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[500px] md:h-[500px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" color="#6366f1" />
      
      <header className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-white/10 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                {studentDetails.imageUrl ? <img src={studentDetails.imageUrl} alt="Profile" className="w-full h-full object-cover" /> : user.username.charAt(0)}
            </div>
            <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">Hi, {user.username}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {studentDetails.studentCustomId}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {divisionDetails?.isLive && (
                <button 
                  onClick={() => setIsInMeeting(true)}
                  className="bg-premium-accent text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 pulse-gold"
                >
                  <Radio size={14} className="animate-pulse" /> Live Now
                </button>
            )}
            <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      <div className="bg-white dark:bg-[#0B1120] border-b border-gray-200 dark:border-white/10 px-4 md:px-6 flex space-x-6 overflow-x-auto relative z-10 sticky top-[73px] scrollbar-hide">
           {[
               { id: 'dashboard', label: 'Dashboard', icon: Calendar },
               { id: 'homework', label: 'Homework', icon: BookOpen },
               { id: 'notes', label: 'Notes', icon: FileText },
               { id: 'exams', label: 'Exams', icon: PenTool },
               { id: 'queries', label: 'My Queries', icon: HelpCircle },
               { id: 'settings', label: 'Settings', icon: Settings }
           ].map(tab => (
               <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${activeTab === tab.id ? 'border-purple-600 text-purple-600 font-bold dark:text-purple-400 dark:border-purple-400' : 'border-transparent text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'}`}
               >
                   <tab.icon size={18} /> {tab.label}
               </button>
           ))}
       </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10 space-y-8 pb-20">
         <AnimatePresence mode="wait">
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
             >
                {activeTab === 'dashboard' && <DashboardOverview student={studentDetails} notifications={notifications} liveDivision={divisionDetails || undefined} onJoinLive={() => setIsInMeeting(true)} />}
                {activeTab === 'homework' && <HomeworkSection student={studentDetails} />}
                {activeTab === 'notes' && <NotesSection student={studentDetails} />}
                {activeTab === 'exams' && <ExamSection student={studentDetails} />}
                {activeTab === 'queries' && <QuerySection student={studentDetails} />}
                {activeTab === 'settings' && <SettingsSection user={user} />}
             </motion.div>
         </AnimatePresence>

         <div className="mt-auto py-6 flex justify-center items-center">
            <a href="https://www.advedasolutions.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity group">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Powered by</span>
                <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
            </a>
         </div>
      </main>

      {isInMeeting && divisionDetails?.liveMeetingId && (
          <JitsiMeeting 
            roomName={divisionDetails.liveMeetingId} 
            userName={user.username} 
            onClose={() => setIsInMeeting(false)} 
          />
      )}
    </div>
  );
};

// --- TAB 1: DASHBOARD ---
const DashboardOverview = ({ student, notifications, liveDivision, onJoinLive }: { student: Student, notifications: StudentNotification[], liveDivision?: Subdivision, onJoinLive: () => void }) => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    
    useEffect(() => {
        const load = async () => {
            const [tt, att] = await Promise.all([
                db.getTimetable(student.subdivisionId),
                db.getAttendance(student.id)
            ]);
            setTimetable(tt);
            setAttendance(att);
        };
        load();
    }, [student]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todaySchedule = timetable.filter(t => t.day === today);
    
    const attendancePercentage = attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100) 
        : 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Live Indicator */}
                {liveDivision?.isLive && (
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-red-500/20 overflow-hidden relative">
                         <Radio size={120} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                         <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-1">
                                 <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Classroom</span>
                             </div>
                             <h3 className="text-2xl font-black serif-font">Lecture in Progress</h3>
                             <p className="text-rose-100 text-xs mt-1 font-bold uppercase tracking-wider">Join your faculty for a live session now.</p>
                         </div>
                         <button onClick={onJoinLive} className="relative z-10 bg-white text-rose-600 px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all">Join Class</button>
                    </motion.div>
                )}

                {/* Visual Notifications Area */}
                {notifications.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Bell size={14}/> Important Alerts</h3>
                        {notifications.map(notif => (
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }} 
                                animate={{ x: 0, opacity: 1 }}
                                key={notif.id} 
                                className={`p-4 rounded-2xl border flex items-start gap-4 shadow-sm ${
                                    notif.type === 'fee' ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-500/20' : 
                                    notif.type === 'announcement' ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/20' : 
                                    'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-500/20'
                                }`}
                            >
                                <div className={`p-2 rounded-xl shrink-0 ${
                                    notif.type === 'fee' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 
                                    notif.type === 'announcement' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 
                                    'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                }`}>
                                    {notif.type === 'fee' ? <AlertCircle size={18}/> : notif.type === 'announcement' ? <Megaphone size={18}/> : <Info size={18}/>}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm ${notif.type === 'fee' ? 'text-rose-800 dark:text-rose-200' : notif.type === 'announcement' ? 'text-indigo-800 dark:text-indigo-200' : 'text-amber-800 dark:text-amber-200'}`}>{notif.title}</h4>
                                    <p className="text-xs opacity-70 mt-1 leading-relaxed dark:text-gray-300">{notif.message}</p>
                                    <p className="text-[9px] uppercase font-black opacity-40 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                </div>
                                {notif.type === 'fee' && (
                                    <Link to="/pay-fees" className="shrink-0 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-rose-700 transition-colors">Pay Now</Link>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/shop" className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-purple-500/20 transition-all group overflow-hidden relative">
                        <ShoppingBag size={64} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingBag size={24}/> Visit Shop</h3>
                        <p className="text-pink-100 text-sm mt-1">Order customized resin art and more.</p>
                    </Link>
                    <Link to="/pay-fees" className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-indigo-500/20 transition-all group overflow-hidden relative">
                        <CreditCard size={64} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard size={24}/> Pay Fees</h3>
                        <p className="text-blue-100 text-sm mt-1">Quick and secure online fee submission.</p>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <UserCheck size={80} className="absolute top-0 right-0 p-4 opacity-5 text-purple-600 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Attendance Rate</p>
                        <h4 className="text-4xl font-black text-purple-600 dark:text-purple-400 font-[Poppins]">{attendancePercentage}%</h4>
                        <div className="mt-4 w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600" style={{ width: `${attendancePercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Today's Lectures</p>
                        <h4 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-[Poppins]">{todaySchedule.length}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scheduled for {today}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 dark:text-white"><Clock size={18}/> Today's Timetable</h3>
                        <span className="text-xs font-bold text-indigo-500 uppercase">{today}</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {todaySchedule.length > 0 ? todaySchedule.map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg text-xs font-bold min-w-[110px] text-center">
                                        {item.startTime} - {item.endTime}
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white">{item.subject}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.teacherName || 'Faculty'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        )) : (
                            <div className="p-16 text-center">
                                <Calendar size={40} className="mx-auto text-gray-200 mb-3"/>
                                <p className="text-gray-400 text-sm font-medium">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold dark:text-white">Academic Class</h3>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Grade {student.gradeId}</p>
                        </div>
                    </div>
                     <div className="space-y-4 text-sm">
                         <div className="flex justify-between border-b border-gray-50 dark:border-white/5 pb-2">
                             <span className="text-gray-500 dark:text-gray-400">Joining Date</span>
                             <span className="font-medium dark:text-gray-200">{student.joiningDate}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 dark:border-white/5 pb-2">
                             <span className="text-gray-500 dark:text-gray-400">School</span>
                             <span className="font-medium dark:text-gray-200 truncate ml-4 text-right">{student.schoolName}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-500 dark:text-gray-400">Monthly Fee</span>
                             <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{student.monthlyFees}</span>
                         </div>
                     </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
                    <h3 className="font-bold text-lg mb-2 relative z-10">Notice Board</h3>
                    <p className="text-slate-400 text-sm mb-4 relative z-10">Check your alerts for specific division announcements.</p>
                    <button className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors flex items-center gap-1">Public Notices <ChevronRight size={14}/></button>
                </div>
            </div>
        </div>
    );
};

// --- TABS (Homework, Notes, etc) ---
const HomeworkSection = ({ student }: { student: Student }) => {
    const [homework, setHomework] = useState<Homework[]>([]);
    const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmission>>({});
    const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
    const [submissionText, setSubmissionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const load = useCallback(async () => {
        const list = await db.getHomeworkForStudent(student.gradeId, student.subdivisionId);
        setHomework(list);
        const subMap: Record<string, HomeworkSubmission> = {};
        for(const hw of list) {
            const sub = await db.getHomeworkSubmission(hw.id, student.id);
            if(sub) subMap[hw.id] = sub;
        }
        setSubmissions(subMap);
    }, [student]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedHw) return;
        setIsSubmitting(true);
        try {
            await db.submitHomework(selectedHw.id, student.id, submissionText);
            alert("Submitted Successfully!");
            setSelectedHw(null); setSubmissionText('');
            load();
        } catch (e) { alert("Submission failed."); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><BookOpen className="text-purple-600"/> Class Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {homework.map(hw => {
                    const isDone = !!submissions[hw.id];
                    return (
                        <div key={hw.id} className={`bg-white dark:bg-[#0B1120] p-6 rounded-2xl border ${isDone ? 'border-emerald-100 dark:border-emerald-500/20' : 'border-gray-100 dark:border-white/5'} shadow-sm`}>
                            <div className="flex justify-between items-start mb-4">
                                <div><h4 className="font-bold text-lg dark:text-white">{hw.subject}</h4><p className="text-xs text-gray-400 font-bold">Assignment</p></div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{isDone ? 'Done' : 'Pending'}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-black/20 p-3 rounded-lg">{hw.task}</p>
                            <div className="flex items-center justify-between border-t dark:border-white/5 pt-4">
                                <div className="text-xs text-gray-400 font-medium">Due: {hw.dueDate}</div>
                                {isDone ? <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Sent</span> : 
                                <button onClick={() => setSelectedHw(hw)} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Submit Now</button>}
                            </div>
                        </div>
                    );
                })}
                {homework.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400">No homework assigned yet.</div>}
            </div>
            {selectedHw && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-xl shadow-2xl relative">
                        <div className="p-6 border-b dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold dark:text-white">Submit: {selectedHw.subject}</h3>
                            <button onClick={() => setSelectedHw(null)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <textarea required className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none h-40 dark:text-white" placeholder="Type your answer here..." value={submissionText} onChange={e => setSubmissionText(e.target.value)} />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-lg shadow-lg">{isSubmitting ? 'Sending...' : 'Submit Assignment'}</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
const NotesSection = ({ student }: { student: Student }) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            const list = await db.getNotes(student.gradeId, student.subdivisionId);
            setNotes(list);
            setLoading(false);
        };
        load();
    }, [student]);
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2"><FileText className="text-indigo-600"/> Study Material</h2>
            {loading ? <div className="text-center py-20 text-gray-400">Loading notes...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full mb-3 inline-block">{note.subject}</span>
                            <h4 className="font-bold text-gray-800 dark:text-white mb-2">{note.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{note.content}</p>
                            {note.fileUrl && (
                                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 border border-slate-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                    <Download size={14}/> Download Resources
                                </a>
                            )}
                        </div>
                    ))}
                    {notes.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">No study notes available for your class.</div>}
                </div>
            )}
        </div>
    );
};
const ExamSection = ({ student }: { student: Student }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [takenStatus, setTakenStatus] = useState<Record<string, boolean>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0); 
    const refresh = useCallback(async () => {
        const ex = await db.getExamsForStudent(student.gradeId, student.subdivisionId);
        setExams(ex);
        const statusMap: Record<string, boolean> = {};
        for(const e of ex) {
            const sub = await db.getExamSubmissionStatus(e.id, student.id);
            statusMap[e.id] = !!sub && sub.isLocked;
        }
        setTakenStatus(statusMap);
    }, [student]);
    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => {
        if (!activeExam || timeLeft <= 0) { if(activeExam && timeLeft <= 0) submitExam(true); return; }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [activeExam, timeLeft]);
    const submitExam = async (auto = false) => {
        if(!activeExam) return;
        await db.submitExamAnswers(activeExam.id, student.id, answers);
        alert(auto ? "Time's up! Submitted." : "Exam Submitted!");
        setTakenStatus(prev => ({...prev, [activeExam.id]: true}));
        setActiveExam(null);
    };
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    if (activeExam) return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#0B1120] p-6 rounded-2xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-8 border-b dark:border-white/5 pb-4">
                <h2 className="text-2xl font-bold dark:text-white uppercase">{activeExam.title}</h2>
                <div className={`px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-600' : 'bg-gray-900'} text-white flex items-center gap-2`}><Timer size={18}/>{formatTime(timeLeft)}</div>
            </div>
            <div className="space-y-8">
                {activeExam.questions.map((q, idx) => (
                    <div key={q.id} className="p-6 bg-slate-50 dark:bg-black/20 rounded-xl border dark:border-white/5">
                        <p className="font-bold text-lg dark:text-gray-200 mb-4">Q{idx+1}. {q.text} <span className="text-xs text-gray-500">({q.marks} Marks)</span></p>
                        {q.type === 'short' || q.type === 'paragraph' ? 
                            <textarea className="w-full border rounded-lg p-3 dark:bg-black/20 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" onChange={e => setAnswers({...answers, [q.id]: e.target.value})} /> :
                            <select className="w-full border rounded-lg p-3 dark:bg-black/20 dark:text-white" onChange={e => setAnswers({...answers, [q.id]: e.target.value})}><option value="">Select Option</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select>
                        }
                    </div>
                ))}
            </div>
            <button onClick={() => submitExam()} className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Finish and Submit</button>
        </div>
    );
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(ex => (
                <div key={ex.id} className="p-6 bg-white dark:bg-[#0B1120] rounded-2xl border dark:border-white/5 shadow-sm">
                    <h4 className="font-bold text-lg dark:text-white leading-tight">{ex.title}</h4>
                    <p className="text-sm text-purple-600 font-bold mb-4">{ex.subject}</p>
                    <div className="text-xs text-gray-500 space-y-1 mb-6"><div className="flex items-center gap-2"><Calendar size={14}/> {ex.examDate}</div><div className="flex items-center gap-2"><Timer size={14}/> {ex.duration} mins</div></div>
                    {takenStatus[ex.id] ? <button disabled className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-lg font-bold cursor-not-allowed flex items-center justify-center gap-2"><CheckCircle size={18}/> Submitted</button> : 
                    <button onClick={() => { setActiveExam(ex); setTimeLeft(ex.duration*60); }} className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold shadow-lg shadow-purple-500/20">Start Now</button>}
                </div>
            ))}
            {exams.length === 0 && <p className="text-gray-400 col-span-3 text-center py-10">No exams scheduled.</p>}
        </div>
    );
};
const QuerySection = ({ student }: { student: Student }) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const [newQuery, setNewQuery] = useState({ subject: '', text: '' });
    const [loading, setLoading] = useState(true);
    const load = useCallback(async () => {
        setLoading(true);
        const q = await db.getQueries(student.id);
        setQueries(q);
        setLoading(false);
    }, [student.id]);
    useEffect(() => { load(); }, [load]);
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addQuery({ studentId: student.id, studentName: student.name, subject: newQuery.subject, queryText: newQuery.text });
        alert("Sent to faculty!");
        setNewQuery({ subject: '', text: '' }); setIsAsking(false); load();
    };
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl shadow-sm flex justify-between items-center">
                <div><h3 className="text-xl font-bold dark:text-white">Help Desk</h3><p className="text-xs text-gray-500">Messaging portal for doubts.</p></div>
                <button onClick={() => setIsAsking(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-gap-2"><Plus size={20}/> New Doubt</button>
            </div>
            {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : 
            <div className="space-y-4">
                {queries.map(q => (
                    <div key={q.id} className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl shadow-sm border dark:border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-gray-800 dark:text-white">{q.subject}</h4>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${q.status === 'Answered' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>{q.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{q.queryText}"</p>
                        {q.replyText && <div className="mt-4 pt-4 border-t dark:border-white/5"><p className="text-xs font-black text-indigo-600 uppercase mb-1">Reply:</p><p className="text-sm dark:text-gray-200">{q.replyText}</p></div>}
                    </div>
                ))}
            </div>}
            {isAsking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#0B1120] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b dark:border-white/5 flex justify-between"><h3>Ask Teacher</h3><button onClick={() => setIsAsking(false)}><X/></button></div>
                        <form onSubmit={handleSend} className="p-6 space-y-4">
                            <select required className="w-full p-3 bg-slate-50 dark:bg-black/20 border dark:border-white/5 rounded-xl dark:text-white" value={newQuery.subject} onChange={e => setNewQuery({...newQuery, subject: e.target.value})}><option value="">Choose Subject...</option><option value="Mathematics">Mathematics</option><option value="Science">Science</option><option value="General">General</option></select>
                            <textarea required className="w-full p-3 bg-slate-50 dark:bg-black/20 border dark:border-white/5 rounded-xl h-32 dark:text-white" placeholder="Type your doubt..." value={newQuery.text} onChange={e => setNewQuery({...newQuery, text: e.target.value})} />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Send Doubt</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
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
            await db.changePassword(user.id, 'student', form.current, form.new);
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
        <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white dark:bg-[#0B1120] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl text-center">
                 <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                     <Lock size={32} />
                 </div>
                 <h3 className="text-2xl font-black dark:text-white mb-2">Change Password</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Secure your account by using a strong password.</p>
                 <AnimatePresence>
                     {success && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2 justify-center">
                             <ShieldCheck size={18}/> Updated Successfully!
                         </motion.div>
                     )}
                 </AnimatePresence>
                 <form onSubmit={handleUpdate} className="space-y-4">
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="Current Password"
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            value={form.current} onChange={e => setForm({...form, current: e.target.value})}
                         />
                     </div>
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="New Password"
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            value={form.new} onChange={e => setForm({...form, new: e.target.value})}
                         />
                     </div>
                     <div className="relative group">
                         <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                         <input required type={showPass ? "text" : "password"} placeholder="Confirm New Password"
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                         />
                     </div>
                     <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-gray-400 hover:text-indigo-500 font-bold uppercase block text-left ml-1 mb-2">{showPass ? 'Hide' : 'Show'} Passwords</button>
                     <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl">{loading ? "Updating..." : "Save New Password"}</button>
                 </form>
            </div>
        </div>
    );
}

export default StudentDashboard;