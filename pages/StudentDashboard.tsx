import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, AttendanceRecord, Student, Homework, Exam, StudentQuery, HomeworkSubmission, StudyNote, StudentNotification, Subdivision } from '../types';
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
            const subs = await db.getSubdivisions(me.gradeId);
            const myDiv = subs.find(s => s.id === me.subdivisionId);
            if (myDiv) setDivisionDetails(myDiv);
        }
    };
    init();
    const channel = db.subscribe('subdivisions', init);
    return () => db.unsubscribe(channel);
  }, [navigate]);

  const handleLogout = () => { sessionStorage.removeItem('sc_user'); navigate('/'); };

  if (!user || !studentDetails) return <div className="min-h-screen flex items-center justify-center bg-black text-white/10 font-black uppercase text-[10px] tracking-[0.5em]">Establishing Connection...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white/10">
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-6 md:px-20 sticky top-0 bg-black/80 backdrop-blur-3xl z-50">
          <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full border border-white/10 p-0.5">
                  <div className="w-full h-full rounded-full bg-white/5 overflow-hidden flex items-center justify-center font-black text-lg text-white/40">
                      {studentDetails.imageUrl ? <img src={studentDetails.imageUrl} className="w-full h-full object-cover" /> : user.username.charAt(0)}
                  </div>
              </div>
              <div>
                  <h1 className="text-xl md:text-2xl font-light serif-font tracking-tight text-white/90">Academy Portal</h1>
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">{user.username} • {studentDetails.studentCustomId}</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
              {divisionDetails?.isLive && (
                  <button onClick={() => setIsInMeeting(true)} className="bg-rose-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <Radio size={12} /> Class Live
                  </button>
              )}
              <button onClick={handleLogout} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all border border-white/5"><LogOut size={16}/></button>
          </div>
      </header>

      <nav className="border-b border-white/5 bg-black sticky top-24 z-40">
           <div className="max-w-6xl mx-auto px-6 overflow-x-auto scrollbar-hide flex gap-12">
               {[
                   { id: 'dashboard', label: 'Overview' },
                   { id: 'homework', label: 'Tasks' },
                   { id: 'notes', label: 'Resources' },
                   { id: 'exams', label: 'Assessments' },
                   { id: 'queries', label: 'Mentorship' },
                   { id: 'settings', label: 'Account' }
               ].map(tab => (
                   <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white/40'}`}>
                       {tab.label}
                       {activeTab === tab.id && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                   </button>
               ))}
           </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
         <AnimatePresence mode="wait">
             <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'dashboard' && <DashboardOverview student={studentDetails} notifications={notifications} liveDivision={divisionDetails || undefined} onJoinLive={() => setIsInMeeting(true)} />}
                {activeTab === 'homework' && <HomeworkSection student={studentDetails} />}
                {activeTab === 'notes' && <NotesSection student={studentDetails} />}
                {activeTab === 'exams' && <ExamSection student={studentDetails} />}
                {activeTab === 'queries' && <QuerySection student={studentDetails} />}
                {activeTab === 'settings' && <SettingsSection user={user} />}
             </motion.div>
         </AnimatePresence>
      </main>

      {isInMeeting && divisionDetails?.liveMeetingId && <JitsiMeeting roomName={divisionDetails.liveMeetingId} userName={user.username} onClose={() => setIsInMeeting(false)} />}
    </div>
  );
};

const DashboardOverview = ({ student, notifications, liveDivision, onJoinLive }: any) => {
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    useEffect(() => {
        db.getTimetable(student.subdivisionId).then(setTimetable);
        db.getAttendance(student.id).then(setAttendance);
    }, [student]);
    
    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todaySchedule = timetable.filter(t => t.day === today);
    const attRate = attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100) : 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-16">
                {liveDivision?.isLive && (
                    <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-rose-500/20 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group">
                        <div className="relative z-10 text-center md:text-left">
                            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500">Live Session Active</p>
                            </div>
                            <h3 className="text-3xl font-light serif-font text-white/90">Enter Virtual Classroom</h3>
                        </div>
                        <button onClick={onJoinLive} className="bg-white text-black px-12 py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all relative z-10 shadow-2xl">Connect Now</button>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 mb-8">Academic Alerts</h3>
                        {notifications.map(n => (
                            <div key={n.id} className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 flex gap-6 group">
                                <div className="p-3 bg-white/5 rounded-xl text-white/40 shrink-0"><Bell size={18}/></div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-white/80 tracking-tight">{n.title}</h4>
                                    <p className="text-sm text-white/30 leading-relaxed font-medium">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/10 mb-4">Attendance Consistency</p>
                        <h4 className="text-6xl font-light serif-font text-white/90 mb-6">{attRate}%</h4>
                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-white/40" style={{ width: `${attRate}%` }} /></div>
                    </div>
                    <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/10 mb-4">Lectures Today</p>
                        <h4 className="text-6xl font-light serif-font text-white/90 mb-2">{todaySchedule.length}</h4>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">Scheduled for {today}</p>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Course Agenda • {today}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {todaySchedule.length > 0 ? todaySchedule.map((item, i) => (
                            <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-12">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-4 py-1.5 rounded-md">
                                        {item.startTime}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white/80">{item.subject}</p>
                                        <p className="text-[9px] text-white/10 uppercase font-black tracking-[0.2em]">{item.teacherName || 'Faculty Member'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-white/5" />
                            </div>
                        )) : <div className="p-24 text-center text-white/5 font-black uppercase text-[10px] tracking-[0.4em] italic">Agenda Clear</div>}
                    </div>
                </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
                <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="p-3 bg-white/5 rounded-xl text-white/20"><GraduationCap size={20}/></div>
                        <div><h3 className="font-bold text-sm tracking-tight text-white/90">Academy Status</h3><p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Grade {student.gradeId}</p></div>
                    </div>
                     <div className="space-y-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                         <div className="flex justify-between"><span>Enrolled</span><span className="text-white/60">{student.joiningDate}</span></div>
                         <div className="flex justify-between"><span>Institute</span><span className="text-white/60 truncate max-w-[140px] text-right">{student.schoolName}</span></div>
                         <div className="flex justify-between pt-6 border-t border-white/5"><span>Current Term</span><span className="text-white/90">₹{student.monthlyFees}</span></div>
                     </div>
                </div>
                
                <button onClick={() => navigate('/shop')} className="w-full bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 text-center group hover:border-white/20 transition-all">
                    <ShoppingBag size={32} className="mx-auto text-white/10 group-hover:text-white/40 mb-6 transition-all" strokeWidth={1} />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-white/80">Merchandise Store</h3>
                </button>

                <button onClick={() => navigate('/pay-fees')} className="w-full bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 text-center group hover:border-white/20 transition-all">
                    <CreditCard size={32} className="mx-auto text-white/10 group-hover:text-white/40 mb-6 transition-all" strokeWidth={1} />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-white/80">Financial Center</h3>
                </button>
            </aside>
        </div>
    );
};

const HomeworkSection = ({ student }: any) => {
    const [hw, setHw] = useState<Homework[]>([]);
    const [sel, setSel] = useState<Homework | null>(null);
    useEffect(() => { db.getHomeworkForStudent(student.gradeId, student.subdivisionId).then(setHw); }, [student]);
    return (
        <div className="space-y-16">
            <h2 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hw.map(item => (
                    <div key={item.id} className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5 group hover:border-white/10 flex flex-col h-full">
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-4 block">{item.subject}</span>
                        <h4 className="text-xl font-bold mb-8 flex-1 leading-relaxed text-white/80 font-serif italic">"{item.task}"</h4>
                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Due: {item.dueDate}</span>
                            <button onClick={() => setSel(item)} className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all border-b border-white/5 pb-1">Register Entry</button>
                        </div>
                    </div>
                ))}
            </div>
            {sel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl p-12 relative">
                        <button onClick={() => setSel(null)} className="absolute top-10 right-10 text-white/20 hover:text-white"><X size={20}/></button>
                        <h3 className="text-2xl font-light serif-font mb-10 text-center uppercase tracking-widest">Submission Protocol</h3>
                        <textarea className="w-full bg-black border border-white/10 rounded-xl p-6 outline-none focus:border-white/30 h-64 text-sm font-medium leading-relaxed" placeholder="Formulate your response here..." />
                        <button className="w-full bg-white text-black py-5 rounded-lg font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all mt-8" onClick={()=>{alert('Synchronized.'); setSel(null);}}>Authorize Entry</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const NotesSection = ({ student }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    useEffect(() => { db.getNotes(student.gradeId, student.subdivisionId).then(setNotes); }, [student]);
    return (
        <div className="space-y-16">
            <h2 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Resource Archive</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5 group hover:border-white/10">
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-4 block">{n.subject}</span>
                        <h4 className="text-xl font-bold mb-4 leading-tight text-white/90">{n.title}</h4>
                        <p className="text-sm text-white/30 mb-10 leading-relaxed line-clamp-4 font-medium">{n.content}</p>
                        {n.fileUrl && <a href={n.fileUrl} target="_blank" className="w-full py-4 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">Retrieve Resource</a>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExamSection = ({ student }: any) => {
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => { db.getExamsForStudent(student.gradeId, student.subdivisionId).then(setExams); }, [student]);
    return (
        <div className="space-y-16">
            <h2 className="text-4xl font-light serif-font pb-8 border-b border-white/5">Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-[#0A0A0A] p-10 rounded-2xl border border-white/5">
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-4 block">{ex.subject}</span>
                        <h4 className="text-2xl font-light serif-font mb-8 leading-tight text-white/90">{ex.title}</h4>
                        <div className="space-y-2 text-[9px] font-black text-white/10 uppercase tracking-widest mb-12">
                            <div className="flex items-center gap-2"><Calendar size={12}/> Window: {ex.examDate}</div>
                            <div className="flex items-center gap-2"><Timer size={12}/> Span: {ex.duration} mins</div>
                        </div>
                        <button className="w-full py-5 bg-white text-black rounded-lg font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-90 transition-all">Initialize Paper</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuerySection = ({ student }: any) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    useEffect(() => { db.getQueries(student.id).then(setQueries); }, [student]);
    return (
        <div className="space-y-16">
            <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <h2 className="text-4xl font-light serif-font">Mentorship</h2>
                <button onClick={() => setIsAsking(true)} className="bg-white text-black px-10 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all">+ New Inquiry</button>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {queries.map(q => (
                    <div key={q.id} className="bg-[#0A0A0A] p-12 rounded-2xl border border-white/5 space-y-12">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white/30">{q.subject}</h4>
                            <span className={`text-[9px] font-black uppercase px-4 py-1 rounded-md border ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400' : 'border-white/10 text-white/20'}`}>{q.status}</span>
                        </div>
                        <p className="font-serif italic text-3xl text-white/60 leading-relaxed">"{q.queryText}"</p>
                        {q.replyText && <div className="pt-12 border-t border-white/5"><p className="text-[9px] font-black text-white/20 uppercase mb-4 tracking-[0.4em]">Faculty Response</p><p className="text-lg leading-relaxed text-white/80 font-medium">{q.replyText}</p></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsSection = ({ user }: any) => {
    return (
        <div className="max-w-md mx-auto py-24">
            <div className="bg-[#0A0A0A] p-12 rounded-2xl border border-white/5 text-center">
                 <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-10 text-white/20">
                     <Lock size={24} strokeWidth={1} />
                 </div>
                 <h3 className="text-3xl font-light serif-font mb-4">Security</h3>
                 <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-12">Credentials Authorization</p>
                 <form className="space-y-4">
                     <input required type="password" placeholder="CURRENT" className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-white/30 transition-all" />
                     <input required type="password" placeholder="NEW" className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-[10px] font-black tracking-[0.4em] uppercase outline-none focus:border-white/30 transition-all" />
                     <button className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] rounded-lg hover:brightness-90 transition-all mt-6 shadow-xl">Confirm Protocol</button>
                 </form>
            </div>
        </div>
    );
};

export default StudentDashboard;