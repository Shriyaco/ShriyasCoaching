
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { User, TimetableEntry, AttendanceRecord, Student, Homework, Exam, StudentQuery, StudyNote, StudentNotification, Subdivision } from '../types';
import JitsiMeeting from '../components/JitsiMeeting';
import { 
  LogOut, Calendar, BookOpen, PenTool, HelpCircle, Send, CheckCircle, X, Timer, 
  GraduationCap, ChevronRight, MessageSquare, Plus, ShoppingBag, 
  CreditCard, Clock, Settings, Lock, Bell, Megaphone, Radio, 
  Rocket, Gamepad2, Zap, Star, Trophy, Brain, Sparkles, Sword, Map, Compass, Download
} from 'lucide-react';
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

  if (!user || !studentDetails) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-cyan-400 font-black uppercase text-[12px] tracking-[0.5em] flex-col gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span className="animate-pulse">Loading Academy...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 relative">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '7s' }} />
         <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="h-24 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
              <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/20">
                      <div className="w-full h-full rounded-[14px] bg-[#0f172a] overflow-hidden">
                          {studentDetails.imageUrl ? <img src={studentDetails.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xl text-cyan-400">{user.username.charAt(0)}</div>}
                      </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0f172a]" />
              </div>
              <div className="hidden md:block">
                  <h1 className="text-lg font-black tracking-tight text-white">Cadet {user.username.split(' ')[0]}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-md w-fit">Level {studentDetails.gradeId} • Squad {divisionDetails?.divisionName || 'A'}</p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              {divisionDetails?.isLive && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsInMeeting(true)} 
                    className="bg-gradient-to-r from-rose-600 to-orange-500 text-white pl-4 pr-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 flex items-center gap-2 animate-pulse"
                  >
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" /> Live Class
                  </motion.button>
              )}
              <button onClick={handleLogout} className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/40 transition-all border border-white/5">
                  <LogOut size={20}/>
              </button>
          </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 pb-32">
         
         {/* Floating Navigation Dock */}
         <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e293b]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] scrollbar-hide">
             {[
                 { id: 'dashboard', label: 'HQ', icon: Rocket, color: 'text-blue-400' },
                 { id: 'homework', label: 'Missions', icon: TargetIcon, color: 'text-amber-400' },
                 { id: 'notes', label: 'Vault', icon: BookOpen, color: 'text-emerald-400' },
                 { id: 'exams', label: 'Battles', icon: Sword, color: 'text-rose-400' },
                 { id: 'queries', label: 'Oracle', icon: HelpCircle, color: 'text-purple-400' },
                 { id: 'settings', label: 'Gear', icon: Settings, color: 'text-slate-400' }
             ].map(tab => (
                 <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`relative px-4 md:px-6 py-3 rounded-full flex flex-col md:flex-row items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                 >
                     <tab.icon size={20} className={activeTab === tab.id ? tab.color : 'text-slate-500'} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                     <span className={`text-[10px] font-black uppercase tracking-wider hidden md:block ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.label}</span>
                     {activeTab === tab.id && (
                         <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                     )}
                 </button>
             ))}
         </nav>

         <AnimatePresence mode="wait">
             <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.3 }}
             >
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

// --- Sub-Components with Fun Themes ---

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-blue-500/20 group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Ready for takeoff, {student.name.split(' ')[0]}? 🚀</h2>
                        <p className="text-blue-100 font-medium text-lg max-w-lg">Your academic journey continues. Check your active missions below!</p>
                    </div>
                </div>

                {/* Notifications */}
                {notifications.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Bell size={16} className="text-yellow-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Incoming Transmissions</h3>
                        </div>
                        {notifications.map(n => (
                            <div key={n.id} className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex gap-5 hover:bg-[#1e293b] transition-all cursor-default">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400 shrink-0"><Megaphone size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{n.title}</h4>
                                    <p className="text-slate-400 text-sm mt-1">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Live Class Card */}
                {liveDivision?.isLive && (
                    <div className="bg-[#0f172a] p-8 md:p-10 rounded-[3rem] border-2 border-rose-500/30 relative overflow-hidden group shadow-2xl shadow-rose-900/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/40">
                                    <Radio size={32} className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Live Transmission</p>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white">Class is in Session!</h3>
                                    <p className="text-slate-400 text-sm">Join your squad in the virtual room.</p>
                                </div>
                            </div>
                            <button onClick={onJoinLive} className="bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl">Join Now</button>
                        </div>
                    </div>
                )}

                {/* Schedule & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Power Level (Attendance) */}
                    <div className="bg-[#1e293b]/50 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                        <div className="absolute -right-4 -bottom-4 text-green-500/10 group-hover:text-green-500/20 transition-colors"><Zap size={120} /></div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Power Level (Attendance)</p>
                        <h4 className="text-6xl font-black text-white mb-6">{attRate}%</h4>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${attRate}%` }} 
                                transition={{ duration: 1, delay: 0.5 }} 
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" 
                            />
                        </div>
                    </div>

                    {/* Active Missions (Homework Count) */}
                    <div className="bg-[#1e293b]/50 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors"><TargetIcon size={120} /></div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Daily Missions</p>
                        <h4 className="text-6xl font-black text-white mb-2">{todaySchedule.length}</h4>
                        <p className="text-slate-400 font-bold text-sm">Classes Scheduled Today</p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-[#1e293b]/30 rounded-[3rem] border border-white/5 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Calendar className="text-blue-400" size={20} />
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Today's Timeline ({today})</h3>
                    </div>
                    
                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent md:left-[27px]" />
                        
                        {todaySchedule.length > 0 ? todaySchedule.map((item, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="relative flex items-center gap-6 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center shrink-0 z-10 shadow-lg group-hover:border-blue-500/50 transition-colors">
                                    <span className="text-[10px] font-black text-blue-400 text-center leading-tight">{item.startTime}<br/><span className="text-slate-500 text-[8px]">START</span></span>
                                </div>
                                <div className="flex-1 bg-[#1e293b] p-5 rounded-2xl border border-white/5 group-hover:bg-[#1e293b]/80 transition-all flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{item.subject}</h4>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.teacherName || 'Master Instructor'}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600" />
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No missions scheduled for today. Rest up, cadet!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                {/* Profile Stats Card */}
                <div className="bg-[#1e293b]/50 p-8 rounded-[3rem] border border-white/5 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6 text-white">
                        <GraduationCap size={40} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">Cadet Profile</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">ID: {student.studentCustomId}</p>
                    
                    <div className="space-y-4 text-left">
                        <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Registered</span>
                            <span className="text-white font-bold font-mono">{student.joiningDate}</span>
                        </div>
                        <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Base</span>
                            <span className="text-white font-bold text-right text-xs truncate max-w-[120px]">{student.schoolName}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <button onClick={() => navigate('/shop')} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 p-1 rounded-[2.5rem] group hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/20">
                    <div className="bg-[#1e293b] rounded-[2.3rem] p-6 flex items-center gap-5 h-full relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-orange-500/10 to-transparent" />
                        <ShoppingBag size={32} className="text-orange-500 shrink-0" />
                        <div className="text-left">
                            <h4 className="font-bold text-white text-lg">Supply Depot</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Get Gear</p>
                        </div>
                    </div>
                </button>

                <button onClick={() => navigate('/pay-fees')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 p-1 rounded-[2.5rem] group hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20">
                    <div className="bg-[#1e293b] rounded-[2.3rem] p-6 flex items-center gap-5 h-full relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-emerald-500/10 to-transparent" />
                        <CreditCard size={32} className="text-emerald-500 shrink-0" />
                        <div className="text-left">
                            <h4 className="font-bold text-white text-lg">Finance Hub</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">View Fees</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

const HomeworkSection = ({ student }: any) => {
    const [hw, setHw] = useState<Homework[]>([]);
    const [sel, setSel] = useState<Homework | null>(null);
    useEffect(() => { db.getHomeworkForStudent(student.gradeId, student.subdivisionId).then(setHw); }, [student]);
    
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Active Missions</h2>
                <p className="text-amber-400 font-bold uppercase tracking-widest text-xs">Complete tasks to level up your knowledge</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hw.map(item => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id} 
                        className="bg-[#1e293b]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/50 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TargetIcon size={80} className="text-white" />
                        </div>
                        
                        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-500/20">
                            {item.subject}
                        </span>
                        
                        <h4 className="text-2xl font-bold text-white mb-4 leading-tight">"{item.task}"</h4>
                        
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Due: {item.dueDate}</span>
                            </div>
                            <button 
                                onClick={() => setSel(item)} 
                                className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg"
                            >
                                Submit Work
                            </button>
                        </div>
                    </motion.div>
                ))}
                {hw.length === 0 && (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                        <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-500 font-black uppercase text-xs tracking-widest">All Missions Completed!</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {sel && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1e293b] border border-white/10 rounded-[3rem] w-full max-w-2xl p-8 md:p-12 relative shadow-2xl">
                            <button onClick={() => setSel(null)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={24}/></button>
                            <h3 className="text-2xl font-black text-white mb-2">Submit Mission Data</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium">Subject: <span className="text-amber-400">{sel.subject}</span></p>
                            
                            <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-3xl p-6 outline-none focus:border-amber-500 text-white font-medium h-64 resize-none mb-8" placeholder="Type your answer or paste link here..." />
                            
                            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.01] transition-all shadow-xl" onClick={()=>{alert('Mission Accomplished! Data Sent.'); setSel(null);}}>
                                Complete Mission
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NotesSection = ({ student }: any) => {
    const [notes, setNotes] = useState<StudyNote[]>([]);
    useEffect(() => { db.getNotes(student.gradeId, student.subdivisionId).then(setNotes); }, [student]);
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Data Vault</h2>
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Access classified learning materials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(n => (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        key={n.id} 
                        className="bg-[#1e293b]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/50 transition-all group flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/5 px-3 py-1 rounded-lg">{n.subject}</span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-white mb-4 line-clamp-2">{n.title}</h4>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-4 flex-1">{n.content}</p>
                        
                        {n.fileUrl && (
                            <a href={n.fileUrl} target="_blank" className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
                                <Download size={14} /> Download Data
                            </a>
                        )}
                    </motion.div>
                ))}
                {notes.length === 0 && <div className="col-span-full py-40 text-center text-slate-600 font-black uppercase text-xs tracking-widest">Vault is Empty</div>}
            </div>
        </div>
    );
};

const ExamSection = ({ student }: any) => {
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => { db.getExamsForStudent(student.gradeId, student.subdivisionId).then(setExams); }, [student]);
    
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Boss Battles</h2>
                <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">Prove your skills in these challenges</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {exams.map(ex => (
                    <div key={ex.id} className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sword size={120} />
                        </div>
                        
                        <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 block">{ex.subject} Challenge</span>
                        <h4 className="text-3xl font-black text-white mb-8 leading-tight">{ex.title}</h4>
                        
                        <div className="flex gap-4 mb-10">
                            <div className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300 text-xs font-bold">
                                <Calendar size={14} className="text-rose-500" /> {ex.examDate}
                            </div>
                            <div className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300 text-xs font-bold">
                                <Timer size={14} className="text-rose-500" /> {ex.duration} min
                            </div>
                        </div>
                        
                        <button className="w-full py-5 bg-white text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all shadow-xl">
                            Start Battle
                        </button>
                    </div>
                ))}
                {exams.length === 0 && <div className="col-span-full py-40 text-center text-slate-600 font-black uppercase text-xs tracking-widest">No Active Battles</div>}
            </div>
        </div>
    );
};

const QuerySection = ({ student }: any) => {
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    useEffect(() => { db.getQueries(student.id).then(setQueries); }, [student.id]);
    
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Ask the Oracle</h2>
                <p className="text-purple-400 font-bold uppercase tracking-widest text-xs">Stuck? Get help from your mentors.</p>
            </div>

            <button onClick={() => setIsAsking(true)} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/20 mb-12 flex items-center justify-center gap-3">
                <Plus size={20} /> Open New Channel
            </button>

            <div className="space-y-6">
                {queries.map(q => (
                    <div key={q.id} className="bg-[#1e293b]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-lg">{q.subject}</span>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${q.status === 'Answered' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{q.status}</span>
                        </div>
                        <p className="text-xl font-medium text-white/90">"{q.queryText}"</p>
                        {q.replyText && (
                            <div className="bg-[#0f172a] p-6 rounded-2xl border border-purple-500/20 relative">
                                <div className="absolute -top-3 left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#0f172a]" />
                                <p className="text-[10px] font-black text-purple-400 uppercase mb-2 tracking-widest">Mentor Response</p>
                                <p className="text-slate-300 leading-relaxed text-sm">{q.replyText}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAsking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1e293b] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 relative shadow-2xl">
                            <button onClick={() => setIsAsking(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={24}/></button>
                            <h3 className="text-2xl font-black text-white mb-8 text-center">New Inquiry</h3>
                            <form onSubmit={(e)=>{e.preventDefault(); alert('Message Transmitted!'); setIsAsking(false);}} className="space-y-6">
                                <select className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-purple-500" required>
                                    <option value="">Select Subject Channel</option>
                                    <option value="math">Mathematics</option>
                                    <option value="science">Science</option>
                                    <option value="english">English</option>
                                </select>
                                <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-3xl p-6 outline-none focus:border-purple-500 text-white h-48 resize-none text-base" placeholder="What is your question, cadet?" required />
                                <button type="submit" className="w-full bg-white text-purple-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-purple-50 transition-all shadow-xl">Transmit</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingsSection = ({ user }: any) => {
    return (
        <div className="max-w-md mx-auto text-center">
            <h2 className="text-4xl font-black text-white mb-12 tracking-tight">Security Gear</h2>
            <div className="bg-[#1e293b]/60 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-500 to-slate-700" />
                 <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-8 text-white">
                     <Lock size={32} />
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Update Access Codes</p>
                 <form className="space-y-4">
                     <input required type="password" placeholder="CURRENT CODE" className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest text-center outline-none focus:border-slate-500 transition-all text-white placeholder:text-slate-600" />
                     <input required type="password" placeholder="NEW CODE" className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest text-center outline-none focus:border-slate-500 transition-all text-white placeholder:text-slate-600" />
                     <button className="w-full py-5 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-200 transition-all mt-6 shadow-xl">Update Security</button>
                 </form>
            </div>
        </div>
    );
};

// Lucide icon replacement for 'Target' to avoid conflict with framer-motion target
const TargetIcon = ({ size, className, ...props }: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
);

export default StudentDashboard;
