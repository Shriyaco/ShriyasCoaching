import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { Student, TabView, Grade, Subdivision, Teacher, FeeSubmission, SystemSettings } from '../types';
import { Users, Settings, LogOut, Plus, Edit2, Search, Briefcase, CreditCard, Save, Layers, UserPlus, Lock, ShieldAlert, Key, Power, X, Trash2, GraduationCap, TrendingUp, DollarSign, RefreshCw, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<FeeSubmission[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({});
  const [subdivisionInput, setSubdivisionInput] = useState(''); // comma separated
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');

  // Dependent Dropdown State
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [availableSubdivisions, setAvailableSubdivisions] = useState<Subdivision[]>([]);

  const refreshData = useCallback(async () => {
    try {
        const [s, g, sd, t, f, set] = await Promise.all([
            db.getStudents(),
            db.getGrades(),
            db.getSubdivisions(),
            db.getTeachers(),
            db.getFeeSubmissions(),
            db.getSettings()
        ]);
        setStudents(s);
        setGrades(g);
        setSubdivisions(sd);
        setTeachers(t);
        setFees(f);
        setSettings(set);
    } catch(e) {
        console.error(e);
    }
  }, []);

  useEffect(() => {
    const user = sessionStorage.getItem('sc_user');
    if (!user) { navigate('/login'); return; }
    
    setLoading(true);
    refreshData().then(() => setLoading(false));

    const channels = [
        db.subscribe('students', refreshData),
        db.subscribe('teachers', refreshData),
        db.subscribe('grades', refreshData),
        db.subscribe('subdivisions', refreshData),
        db.subscribe('fee_submissions', refreshData)
    ];

    return () => {
        channels.forEach(c => db.unsubscribe(c));
    };
  }, [navigate, refreshData]);

  useEffect(() => {
      const loadSubs = async () => {
          if (selectedGradeId) {
              const subs = await db.getSubdivisions(selectedGradeId);
              setAvailableSubdivisions(subs);
          } else {
              setAvailableSubdivisions([]);
          }
      };
      loadSubs();
  }, [selectedGradeId]);

  const handleLogout = () => {
    sessionStorage.removeItem('sc_user');
    navigate('/');
  };

  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(''), 3000);
  };

  // --- Handlers (Keep existing handlers same) ---
  const openStudentModal = (student?: Student) => {
      if (student) {
          setEditingId(student.id);
          setFormData({
              name: student.name,
              mobile: student.mobile,
              parentName: student.parentName,
              subdivisionId: student.subdivisionId
          });
          setSelectedGradeId(student.gradeId);
      } else {
          setEditingId(null);
          setFormData({});
          setSelectedGradeId('');
      }
      setIsStudentModalOpen(true);
  };

  const openTeacherModal = (teacher?: Teacher) => {
      if (teacher) {
          setEditingId(teacher.id);
          setFormData({
              name: teacher.name,
              mobile: teacher.mobile,
              specialization: teacher.specialization,
              subdivisionId: teacher.subdivisionId
          });
          setSelectedGradeId(teacher.gradeId);
      } else {
          setEditingId(null);
          setFormData({});
          setSelectedGradeId('');
      }
      setIsTeacherModalOpen(true);
  };

  const openGradeModal = async (grade?: Grade) => {
      if (grade) {
          setEditingId(grade.id);
          const subs = await db.getSubdivisions(grade.id);
          const subNames = subs.map(s => s.divisionName).join(', ');
          setFormData({
              gradeName: grade.gradeName,
              hasSubdivision: grade.hasSubdivision
          });
          setSubdivisionInput(subNames);
      } else {
          setEditingId(null);
          setFormData({ hasSubdivision: false });
          setSubdivisionInput('');
      }
      setIsGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const subNames = formData.hasSubdivision ? subdivisionInput.split(',').map(s => s.trim()).filter(s => s) : [];
      try {
          if (editingId) {
              await db.updateGrade(editingId, formData.gradeName, subNames);
              showNotification('Grade updated successfully');
          } else {
              await db.addGrade(formData.gradeName, subNames);
              showNotification('Grade added successfully');
          }
          setIsGradeModalOpen(false);
          setFormData({});
          setSubdivisionInput('');
      } catch (err) {
          console.error(err);
          showNotification("Error saving grade.");
      }
  };

  const deleteGrade = async (id: string) => {
      if (!window.confirm("Are you sure? This will delete the grade and all its subdivisions!")) return;
      await db.deleteGrade(id);
      showNotification("Grade deleted.");
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingId) {
              await db.updateStudent(editingId, {
                  name: formData.name,
                  mobile: formData.mobile,
                  parentName: formData.parentName,
                  gradeId: selectedGradeId,
                  subdivisionId: formData.subdivisionId
              });
              showNotification('Student record updated.');
          } else {
              await db.addStudent({
                  name: formData.name,
                  mobile: formData.mobile,
                  parentName: formData.parentName,
                  gradeId: selectedGradeId,
                  subdivisionId: formData.subdivisionId
              });
              showNotification('Student registered.');
          }
          setIsStudentModalOpen(false);
      } catch (err: any) {
          console.error(err);
          showNotification(err.message || 'Error saving student');
      }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingId) {
               await db.updateTeacher(editingId, {
                  name: formData.name,
                  mobile: formData.mobile,
                  gradeId: selectedGradeId,
                  subdivisionId: formData.subdivisionId,
                  specialization: formData.specialization
               });
               showNotification('Teacher record updated.');
          } else {
              await db.addTeacher({
                  name: formData.name,
                  mobile: formData.mobile,
                  gradeId: selectedGradeId,
                  subdivisionId: formData.subdivisionId,
                  specialization: formData.specialization
               });
               showNotification('Teacher registered.');
          }
          setIsTeacherModalOpen(false);
      } catch (e) {
          console.error(e);
          showNotification("Error saving teacher");
      }
  };

  const toggleStatus = async (type: 'student' | 'teacher', id: string, currentStatus: string) => {
      if(!window.confirm(`Are you sure you want to ${currentStatus === 'Active' ? 'suspend' : 'activate'} this user?`)) return;
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      if (type === 'student') await db.updateStudentStatus(id, newStatus);
      if (type === 'teacher') await db.updateTeacherStatus(id, newStatus);
      showNotification(`User ${newStatus}`);
  };

  const resetPassword = async (type: 'student' | 'teacher', id: string) => {
      if(!window.confirm("Reset password to user's mobile number?")) return;
      await db.resetUserPassword(type, id);
      showNotification('Password reset to Mobile Number.');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      if(settings) {
          await db.updateSettings(settings);
          showNotification('System settings updated');
      }
  };

  const SidebarItem = ({ tab, icon: Icon, label }: { tab: TabView; icon: any; label: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-200 group relative overflow-hidden ${
        activeTab === tab
          ? 'text-white bg-gradient-to-r from-indigo-600/20 to-transparent border-r-4 border-indigo-500'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} className={`transition-colors ${activeTab === tab ? 'text-indigo-400' : 'group-hover:text-indigo-400'}`} />
      <span className="font-medium tracking-wide">{label}</span>
      {activeTab === tab && (
          <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
      )}
    </button>
  );

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group min-w-[200px]"
      >
          <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`}></div>
          <div className="flex justify-between items-start relative z-10">
              <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-2 font-[Poppins]">{value}</h3>
                  <p className="text-xs text-slate-400 mt-1">{subtext}</p>
              </div>
              <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                 <Icon size={24} className={color.replace('bg-', 'text-').replace('/10', '')} />
              </div>
          </div>
      </motion.div>
  );
  
  const LoadingOverlay = () => (
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      <AnimatePresence>
        {notification && (
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 right-4 md:top-6 md:right-6 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl z-[70] flex items-center gap-3 border border-slate-700"
            >
                <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                    <ShieldAlert size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-sm">System Notification</h4>
                    <p className="text-xs text-slate-400">{notification}</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
            />
          )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0B1120] flex flex-col shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-indigo-500/30">
              S
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-wide block">SMS ENGINE</span>
            <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Admin Panel</span>
          </div>
          <button className="ml-auto lg:hidden text-gray-400" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
          <SidebarItem tab="dashboard" icon={TrendingUp} label="Overview" />
          <SidebarItem tab="students" icon={Users} label="Students" />
          <SidebarItem tab="teachers" icon={Briefcase} label="Faculty" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Academic</div>
          <SidebarItem tab="grades" icon={Layers} label="Classes & Divs" />
          <SidebarItem tab="fees" icon={CreditCard} label="Transactions" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Configuration</div>
          <SidebarItem tab="settings" icon={Settings} label="System Settings" />
        </div>

        <div className="p-6 border-t border-white/5 bg-[#080c17]">
          <button onClick={handleLogout} className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/> <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {loading && <LoadingOverlay />}
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-200 px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Menu size={24} />
              </button>
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 capitalize tracking-tight font-[Poppins] truncate max-w-[200px] md:max-w-none">{activeTab.replace('_', ' ')}</h2>
                  <p className="text-xs text-slate-500 hidden md:block">Manage your institute efficiently</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center px-4 py-2 bg-slate-100 rounded-full text-slate-500 text-sm font-medium">
                  <ShieldAlert size={14} className="mr-2 text-emerald-500"/> System Status: Operational
              </div>
              <div className="h-9 w-9 md:h-10 md:w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                  A
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
          
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Students" 
                        value={students.length} 
                        icon={GraduationCap} 
                        color="bg-indigo-500" 
                        subtext="+12% from last month"
                    />
                    <StatCard 
                        title="Faculty Members" 
                        value={teachers.length} 
                        icon={Briefcase} 
                        color="bg-purple-500" 
                        subtext="Active teaching staff"
                    />
                    <StatCard 
                        title="Total Classes" 
                        value={grades.length} 
                        icon={Layers} 
                        color="bg-pink-500" 
                        subtext="Across all divisions"
                    />
                    <StatCard 
                        title="Revenue (Est)" 
                        value={`₹${fees.reduce((acc, curr) => acc + parseInt(curr.amount || '0'), 0).toLocaleString()}`} 
                        icon={DollarSign} 
                        color="bg-emerald-500" 
                        subtext="Pending Approvals: 2"
                    />
                </div>
            </motion.div>
          )}

          {activeTab === 'grades' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="flex justify-end">
                     <button onClick={() => openGradeModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold transform hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                         <Plus size={18} /> Add New Class
                     </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {grades.map(g => (
                         <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                             <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openGradeModal(g)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16}/></button>
                                 <button onClick={() => deleteGrade(g.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                             </div>
                             <div className="flex items-center gap-4 mb-6">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                     <Layers size={24} />
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-800 font-[Poppins]">{g.gradeName}</h3>
                                     <p className="text-xs text-slate-400">ID: {g.id}</p>
                                 </div>
                             </div>
                             
                             <div className="bg-slate-50 rounded-xl p-4">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Divisions / Sections</p>
                                 <div className="flex flex-wrap gap-2">
                                     {subdivisions.filter(s => s.gradeId === g.id).length > 0 ? subdivisions.filter(s => s.gradeId === g.id).map(sd => (
                                         <span key={sd.id} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm">
                                             {sd.divisionName}
                                         </span>
                                     )) : <span className="text-xs text-slate-400 italic pl-1">Standard Class</span>}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
               <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        value={searchTerm} 
                        onChange={e=>setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm" 
                    />
                  </div>
                  <button onClick={() => openStudentModal()} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <UserPlus size={18} /><span>Register Student</span>
                  </button>
               </div>
               <div className="overflow-x-auto flex-1">
                   <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-5">Student Info</th>
                              <th className="px-6 py-5">Contact</th>
                              <th className="px-6 py-5">Class</th>
                              <th className="px-6 py-5">Status</th>
                              <th className="px-6 py-5 text-center">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentCustomId.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
                            const grade = grades.find(g => g.id === s.gradeId);
                            const sub = subdivisions.find(sd => sd.id === s.subdivisionId);
                            return (
                                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{s.name}</div>
                                                <div className="text-xs font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded w-fit mt-0.5">{s.studentCustomId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1"><span className="font-bold text-slate-700">P:</span> {s.parentName}</div>
                                        <div className="flex items-center gap-1 mt-1"><span className="font-bold text-slate-700">M:</span> {s.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 font-medium text-xs shadow-sm whitespace-nowrap">
                                            {grade?.gradeName} {sub?.divisionName ? `• ${sub.divisionName}` : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openStudentModal(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modify Record">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => resetPassword('student', s.id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                                                <Key size={18} />
                                            </button>
                                            <button onClick={() => toggleStatus('student', s.id, s.status)} className={`p-2 rounded-lg transition-colors ${s.status === 'Active' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={s.status === 'Active' ? 'Suspend' : 'Activate'}>
                                                <Power size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                      </tbody>
                   </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'teachers' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-lg">Faculty Directory</h3>
                    <button onClick={() => openTeacherModal()} className="bg-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2 text-sm md:text-base">
                        <UserPlus size={18} /><span>Add Faculty</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-5">Teacher</th>
                              <th className="px-6 py-5">Contact</th>
                              <th className="px-6 py-5">Primary Assignment</th>
                              <th className="px-6 py-5">Specialization</th>
                              <th className="px-6 py-5">Status</th>
                              <th className="px-6 py-5 text-center">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teachers.map(t => {
                            const grade = grades.find(g => g.id === t.gradeId);
                            const sub = subdivisions.find(sd => sd.id === t.subdivisionId);
                            return (
                                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{t.name}</div>
                                                <div className="text-xs font-mono text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded w-fit mt-0.5">{t.teacherCustomId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.mobile}</td>
                                    <td className="px-6 py-4 text-sm">
                                         <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 font-medium text-xs shadow-sm whitespace-nowrap">
                                            {grade?.gradeName} {sub?.divisionName}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{t.specialization}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openTeacherModal(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => resetPassword('teacher', t.id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                                <Key size={18} />
                                            </button>
                                            <button onClick={() => toggleStatus('teacher', t.id, t.status)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Power size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                      </tbody>
                    </table>
                </div>
             </motion.div>
          )}
          
          {activeTab === 'fees' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Transaction History</h3>
                 </div>
                 <div className="p-4 md:p-8 text-center text-slate-400">
                     {fees.length === 0 ? (
                         <div className="py-12">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                 <CreditCard size={40} />
                             </div>
                             <p>No transactions recorded yet.</p>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {fees.map(f => (
                                 <div key={f.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-2">
                                     <div className="text-left">
                                         <p className="font-bold text-slate-800">{f.studentName}</p>
                                         <p className="text-xs text-slate-500 font-mono">Ref: {f.transactionRef}</p>
                                     </div>
                                     <div className="text-left md:text-right w-full md:w-auto flex justify-between md:block items-center">
                                         <p className="font-bold text-emerald-600">₹{f.amount}</p>
                                         <p className="text-xs text-slate-400">{f.date}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             </motion.div>
          )}

          {activeTab === 'settings' && settings && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-6 md:p-8 text-white relative overflow-hidden">
                         <div className="relative z-10">
                            <h3 className="text-2xl font-bold font-[Poppins] flex items-center gap-3">
                                <ShieldAlert className="text-emerald-400"/> Security & API
                            </h3>
                            <p className="text-slate-400 mt-2 text-sm md:text-base">Manage your gateway keys and admin access credentials.</p>
                         </div>
                         <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                             <Lock size={200} />
                         </div>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSaveSettings} className="space-y-6 md:space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Google Site Key</label>
                                    <input 
                                        type="text" 
                                        value={settings.googleSiteKey}
                                        onChange={(e) => setSettings({...settings, googleSiteKey: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="reCAPTCHA Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">PhonePe Salt Key</label>
                                    <input 
                                        type="password" 
                                        value={settings.phonePeSaltKey}
                                        onChange={(e) => setSettings({...settings, phonePeSaltKey: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Gateway Secret"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Manual Payment UPI ID</label>
                                <input 
                                    type="text" 
                                    value={settings.adminUpiId}
                                    onChange={(e) => setSettings({...settings, adminUpiId: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-indigo-900"
                                />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                <Save size={18} /> Save Configuration
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
          )}

          </div>
        </div>
      </main>
      
      {/* Existing Modals logic is used here via isStudentModalOpen etc. */}
      {/* Keep standard modal rendering logic, just ensure mobile sizing */}
      <AnimatePresence>
      {isGradeModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Class' : 'New Class'}</h3>
                      <button onClick={() => setIsGradeModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleGradeSubmit} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Class Name</label>
                        <input 
                            required 
                            placeholder="e.g. Grade 10" 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.gradeName || ''}
                            onChange={e => setFormData({...formData, gradeName: e.target.value})}
                        />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-indigo-600 rounded"
                                checked={formData.hasSubdivision || false}
                                onChange={e => setFormData({...formData, hasSubdivision: e.target.checked})}
                              />
                              <span className="text-sm font-bold text-slate-700">Has Sections/Divisions?</span>
                          </label>
                          {formData.hasSubdivision && (
                              <div className="mt-4 animate-fade-in">
                                  <input 
                                    placeholder="A, B, Science, Commerce (Comma Separated)"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                    value={subdivisionInput}
                                    onChange={e => setSubdivisionInput(e.target.value)}
                                  />
                              </div>
                          )}
                      </div>
                      <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                          {editingId ? 'Save Changes' : 'Create Class'}
                      </button>
                  </form>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
      <AnimatePresence>
      {isStudentModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                          <UserPlus className="text-indigo-500" size={24}/> {editingId ? 'Edit Student' : 'Register Student'}
                      </h3>
                      <button onClick={() => setIsStudentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input required placeholder="Student Name" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <input required placeholder="Mobile Number" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                      </div>
                      <input required placeholder="Parent Name" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.parentName || ''} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                              <option value="">Select Grade</option>
                              {grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                          </select>
                          <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formData.subdivisionId || ''} onChange={e => setFormData({...formData, subdivisionId: e.target.value})} disabled={availableSubdivisions.length === 0}>
                              <option value="">Select Division</option>
                              {availableSubdivisions.map(sd => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}
                          </select>
                      </div>
                      <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all mt-2">
                          {editingId ? 'Update Record' : 'Complete Registration'}
                      </button>
                  </form>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
      <AnimatePresence>
      {isTeacherModalOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-purple-500" />
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                          <Briefcase className="text-purple-500" size={24} /> {editingId ? 'Edit Faculty' : 'Add Faculty'}
                      </h3>
                      <button onClick={() => setIsTeacherModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleTeacherSubmit} className="space-y-4">
                      <input required placeholder="Teacher Name" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input required placeholder="Mobile Number" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                      <input required placeholder="Specialization (e.g. Maths)" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={formData.specialization || ''} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Primary Responsibility</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)}>
                                  <option value="">Select Grade</option>
                                  {grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                              </select>
                              <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={formData.subdivisionId || ''} onChange={e => setFormData({...formData, subdivisionId: e.target.value})} disabled={availableSubdivisions.length === 0}>
                                  <option value="">Select Division</option>
                                  {availableSubdivisions.map(sd => <option key={sd.id} value={sd.id}>{sd.divisionName}</option>)}
                              </select>
                          </div>
                      </div>
                      <button type="submit" className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all mt-2">
                          {editingId ? 'Update Faculty' : 'Register Faculty'}
                      </button>
                  </form>
              </motion.div>
           </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}