import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, AttendanceRecord, Student, Homework, Exam, StudentQuery, HomeworkSubmission, StudyNote, StudentNotification, Subdivision } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { LogOut, Calendar, BookOpen, PenTool, HelpCircle, Send, CheckCircle, X, Timer, GraduationCap, ChevronRight, MessageSquare, Plus, UserCheck, ShoppingBag, CreditCard, Clock, Settings, Lock, Eye, EyeOff, ShieldCheck, FileText, Download, Bell, Info, AlertCircle, Megaphone, Radio, LayoutDashboard } from 'lucide-react';
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

  if (!user || !studentDetails) return <div className="min-h-screen flex items-center justify-center bg-black text-white/5 font-black uppercase text-[10px] tracking-[1em]">Synchronizing...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white/10">
      <header className="h-28 border-b border-white/5 flex items-center justify-between px-6 md:px-16 sticky top-0 bg-black/90 backdrop-blur-3xl z-50">
          <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl border border-white/5 bg-white/[0.02] p-1.5 overflow-hidden shrink-0">
                  <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center font-black text-lg text-white/30">
                      {studentDetails.imageUrl ? <img src={studentDetails.imageUrl} className="w-full h-full object-cover" /> : user.username.charAt(0)}
                  </div>
              </div>
              <div>
                  <h1 className="text-xl md:text-2xl font-light serif-font tracking-tight text-white/90">Student Terminal</h1>
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">{user.username} • {studentDetails.studentCustomId}</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
              {divisionDetails?.isLive && (
                  <button onClick={() => setIsInMeeting(true)} className="bg-rose-600 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <Radio size={12} /> Class Live
                  </button>
              )}
              <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-rose-500 transition-all border border-white/5 hover:bg-rose-500/5"><LogOut size={18}/></button>
          </div>
      </header>

      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-3xl sticky top-28 z-40">
           <div className="max-w-7xl mx-auto px-6 md:px-16 overflow-x-auto scrollbar-hide flex gap-12">
               {[
                   { id: 'dashboard', label: 'Overview' },
                   { id: 'homework', label: 'Assignments' },
                   { id: 'notes', label: 'Repository' },
                   { id: 'exams', label: 'Tests' },
                   { id: 'queries', label: 'Doubt Hub' },
                   { id: 'settings', label: 'Account' }
               ].map(tab => (
                   <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-8 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white/40'}`}>
                       {tab.label}
                       {activeTab === tab.id && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                   </button>
               ))}
           </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24">
         <AnimatePresence mode="wait">
             <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
                {liveDivision?.isLive && (
                    <div className="bg-[#0A0A0A] p-12 rounded-[40px] border border-rose-500/10 flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] group-hover:bg-rose-500/10 transition-all duration-1000" />
                        <div className="relative z-10 text-center md:text-left">
                            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500">Live Stream Active</p>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-light serif-font text-white/90">Join Academic Session</h3>
                        </div>
                        <button onClick={onJoinLive} className="bg-white text-black px-14 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all relative z-10 shadow-2xl">Initialize Connect</button>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 mb-8 flex items-center gap-3">
                           <Bell size={14}/> Bulletin Updates
                        </h3>
                        {notifications.map(n => (
                            <div key={n.id} className="bg-[#0A0A0A] p-10 rounded-[32px] border border-white/5 flex gap-8 group hover:border-white/10 transition-colors">
                                <div className="p-4 bg-white/5 rounded-2xl text-white/30 shrink-0"><Megaphone size={20}/></div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2 text-white/80 tracking-tight">{n.title}</h4>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 mb-6">Attendance Consistency</p>
                        <h4 className="text-7xl font-light serif-font text-white/90 mb-8">{attRate}%</h4>
                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-white/40" style={{ width: `${attRate}%` }} /></div>
                    </div>
                    <div className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 mb-6">Course Timeline</p>
                        <h4 className="text-7xl font-light serif-font text-white/90 mb-4">{todaySchedule.length}</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Sessions programmed for {today}</p>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-[48px] border border-white/5 overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Operational Schedule • {today}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {todaySchedule.length > 0 ? todaySchedule.map((item, i) => (
                            <div key={i} className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-16">
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 border border-white/10 px-5 py-2 rounded-xl">
                                        {item.startTime}
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white/80">{item.subject}</p>
                                        <p className="text-[9px] text-white/10 uppercase font-black tracking-[0.4em] mt-1">{item.teacherName || 'Academy Faculty'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-white/5" />
                            </div>
                        )) : <div className="p-28 text-center text-white/5 font-black uppercase text-[12px] tracking-[1em] italic opacity-50">Timeline Vacant</div>}
                    </div>
                </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
                <div className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5">
                    <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                        <div className="p-4 bg-white/5 rounded-2xl text-white/20 shrink-0"><GraduationCap size={24}/></div>
                        <div>
                            <h3 className="font-bold text-lg tracking-tight text-white/90 leading-none mb-1">Academy Context</h3>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Grade {student.gradeId}</p>
                        </div>
                    </div>
                     <div className="space-y-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                         <div className="flex justify-between items-center"><span>Registry Date</span><span className="text-white/60">{student.joiningDate}</span></div>
                         <div className="flex justify-between items-center"><span>Institution</span><span className="text-white/60 truncate max-w-[160px] text-right">{student.schoolName}</span></div>
                         <div className="flex justify-between items-center pt-8 border-t border-white/5"><span>Term Fee</span><span className="text-white/90 text-sm">₹{student.monthlyFees}</span></div>
                     </div>
                </div>
                
                <button onClick={() => navigate('/shop')} className="w-full bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5 text-center group hover:border-white/20 transition-all flex flex-col items-center">
                    <ShoppingBag size={40} className="text-white/10 group-hover:text-white/30 mb-6 transition-all" strokeWidth={1} />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.5em] text-white/60">Official Merchandise</h3>
                </button>

                <button onClick={() => navigate('/pay-fees')} className="w-full bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5 text-center group hover:border-white/20 transition-all flex flex-col items-center">
                    <CreditCard size={40} className="text-white/10 group-hover:text-white/30 mb-6 transition-all" strokeWidth={1} />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.5em] text-white/60">Financial Portal</h3>
                </button>
            </aside>
        </div>
    );
};

// ... keep HomeworkSection, NotesSection, ExamSection, QuerySection, SettingsSection with similar card logic ...

const HomeworkSection = ({ student }: any) => {
    const [hw, setHw] = useState<Homework[]>([]);
    const [sel, setSel] = useState<Homework | null>(null);
    useEffect(() => { db.getHomeworkForStudent(student.gradeId, student.subdivisionId).then(setHw); }, [student]);
    return (
        <div className="space-y-20">
            <h2 className="text-5xl font-light serif-font pb-12 border-b border-white/5">Assigned Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hw.map(item => (
                    <div key={item.id} className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5 group hover:border-white/10 flex flex-col h-full transition-all">
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">{item.subject}</span>
                        <h4 className="text-2xl font-bold mb-10 flex-1 leading-relaxed text-white/80 font-serif italic">"{item.task}"</h4>
                        <div className="flex items-center justify-between pt-10 border-t border-white/5">
                            <span className="text-[11px] font-black text-white/10 uppercase tracking-[0.2em]">Target: {item.dueDate}</span>
                            <button onClick={() => setSel(item)} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all border-b border-white/10 pb-1">Register Entry</button>
                        </div>
                    </div>
                ))}
                {hw.length === 0 && <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[60px] text-white/5 font-black uppercase text-[14px] tracking-[1.5em]">Clear Inventory</div>}
            </div>
            {sel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-2xl">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[48px] w-full max-w-3xl p-16 relative">
                        <button onClick={() => setSel(null)} className="absolute top-12 right-12 text-white/20 hover:text-white transition-colors"><X size={28}/></button>
                        <h3 className="text-3xl font-light serif-font mb-12 text-center uppercase tracking-[0.3em] opacity-80">Protocol Submission</h3>
                        <textarea className="w-full bg-black border border-white/10 rounded-[32px] p-10 outline-none focus:border-white/30 h-80 text-lg font-light leading-relaxed tracking-tight" placeholder="Formulate response protocol..." />
                        <button className="w-full bg-white text-black py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.6em] hover:brightness-90 transition-all mt-10 shadow-2xl" onClick={()=>{alert('Registry Updated.'); setSel(null);}}>Authorize Deployment</button>
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
        <div className="space-y-20">
            <h2 className="text-5xl font-light serif-font pb-12 border-b border-white/5">Knowledge Archive</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map(n => (
                    <div key={n.id} className="bg-[#0A0A0A] p-12 rounded-[48px] border border-white/5 group hover:border-white/10 transition-all">
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">{n.subject}</span>
                        <h4 className="text-2xl font-bold mb-6 leading-tight text-white/90">{n.title}</h4>
                        <p className="text-sm text-white/30 mb-12 leading-relaxed line-clamp-5 font-medium">{n.content}</p>
                        {n.fileUrl && <a href={n.fileUrl} target="_blank" className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">Access Coordinates</a>}
                    </div>
                ))}
                {notes.length === 0 && <div className="col-span-full py-40 text-center text-white/5 font-black uppercase text-[12px] tracking-[1em]">Archive Dormant</div>}
            </div>
        </div>
    );
};

const ExamSection = ({ student }: any) => {
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => { db.getExamsForStudent(student.gradeId, student.subdivisionId).then(setExams); }, [student]);
    return (
        <div className="space-y-20">
            <h2 className="text-5xl font-light serif-font pb-12 border-b border-white/5">Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-[#0A0A0A] p-12 rounded-[60px] border border-white/5 flex flex-col group hover:border-white/10 transition-all">
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">{ex.subject}</span>
                        <h4 className="text-3xl font-light serif-font mb-10 leading-tight text-white/90">{ex.title}</h4>
                        <div className="space-y-3 text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mb-14 mt-auto">
                            <div className="flex items-center gap-3"><Calendar size={14} strokeWidth={2}/> Window: {ex.examDate}</div>
                            <div className="flex items-center gap-3"><Timer size={14} strokeWidth={2}/> Span: {ex.duration} Mins</div>
                        </div>
                        <button className="w-full py-6 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] hover:brightness-90 transition-all shadow-2xl">Initialize Terminal</button>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-40 text-center text-white/5 font-black uppercase text-[12px] tracking-[1em]">Terminal Offline</div>}
            </div>
        </div>
    );
};

const QuerySection = ({ student }: any) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    useEffect(() => { db.getQueries(student.id).then(setQueries); }, [student.id]);
    return (
        <div className="space-y-20">
            <div className="flex justify-between items-center pb-12 border-b border-white/5">
                <h2 className="text-5xl font-light serif-font">Inquiry Hub</h2>
                <button onClick={() => setIsAsking(true)} className="bg-white text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:brightness-90 transition-all shadow-xl">+ New Protocol</button>
            </div>
            <div className="grid grid-cols-1 gap-8">
                {queries.map(q => (
                    <div key={q.id} className="bg-[#0A0A0A] p-16 rounded-[60px] border border-white/5 space-y-16 transition-all hover:border-white/10">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black uppercase tracking-[0.4em] text-white/20">{q.subject}</h4>
                            <span className={`text-[10px] font-black uppercase px-6 py-2 rounded-xl border ${q.status === 'Answered' ? 'border-emerald-500/20 text-emerald-400' : 'border-white/10 text-white/10'}`}>{q.status}</span>
                        </div>
                        <p className="font-serif italic text-4xl text-white/50 leading-relaxed tracking-tight">"{q.queryText}"</p>
                        {q.replyText && <div className="pt-16 border-t border-white/5 animate-fade-in"><p className="text-[10px] font-black text-white/10 uppercase mb-6 tracking-[0.6em]">Faculty Protocol Response</p><p className="text-xl leading-relaxed text-white/80 font-medium">{q.replyText}</p></div>}
                    </div>
                ))}
                {queries.length === 0 && <div className="py-40 text-center text-white/5 font-black uppercase text-[12px] tracking-[1.5em]">Hub Dormant</div>}
            </div>
            {isAsking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-2xl">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[60px] w-full max-w-2xl p-16 relative">
                        <button onClick={() => setIsAsking(false)} className="absolute top-12 right-12 text-white/20 hover:text-white transition-colors"><X size={32}/></button>
                        <h3 className="text-3xl font-light serif-font mb-12 text-center uppercase tracking-[0.4em] opacity-80">New Inquiry Protocol</h3>
                        <form onSubmit={async (e)=>{e.preventDefault(); alert('Protocol Sent.'); setIsAsking(false);}} className="space-y-8">
                            <select className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-[11px] font-black uppercase tracking-[0.5em] outline-none focus:border-white/30 transition-all appearance-none" required><option value="">Select Category</option><option value="general">Academic Query</option><option value="exam">Assessment Query</option></select>
                            <textarea className="w-full bg-black border border-white/10 rounded-[32px] p-10 outline-none focus:border-white/30 h-64 text-lg font-light leading-relaxed tracking-tight" placeholder="Formulate inquiry protocol..." required />
                            <button type="submit" className="w-full bg-white text-black py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.6em] hover:brightness-90 transition-all mt-10 shadow-2xl">Authorize Deployment</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const SettingsSection = ({ user }: any) => {
    return (
        <div className="max-w-md mx-auto py-32">
            <div className="bg-[#0A0A0A] p-16 rounded-[60px] border border-white/5 text-center shadow-2xl group transition-all hover:border-white/10">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-14 text-white/10 group-hover:text-white/30 transition-colors duration-700">
                     <Lock size={28} strokeWidth={1} />
                 </div>
                 <h3 className="text-4xl font-light serif-font mb-4 tracking-tight">Security</h3>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-16">Credential Hub</p>
                 <form className="space-y-5">
                     <input required type="password" placeholder="CURRENT" className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-[11px] font-black tracking-[0.6em] uppercase outline-none focus:border-white/30 transition-all" />
                     <input required type="password" placeholder="NEW" className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-[11px] font-black tracking-[0.6em] uppercase outline-none focus:border-white/30 transition-all" />
                     <button className="w-full py-6 bg-white text-black font-black text-[12px] uppercase tracking-[0.8em] rounded-2xl hover:brightness-90 transition-all mt-10 shadow-2xl shadow-white/5">Confirm Change</button>
                 </form>
            </div>
        </div>
    );
};

export default StudentDashboard;