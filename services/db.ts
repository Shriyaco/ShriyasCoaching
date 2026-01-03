import { Student, Grade, Subdivision, Notice, User, Teacher, TimetableEntry, LiveClass, FeeSubmission, SystemSettings, AttendanceRecord, Homework, Exam, ExamResult, HomeworkSubmission, ExamSubmission, StudentQuery } from '../types';

// --- Helper for Custom ID Logic ---
const generateCustomId = (name: string, mobile: string): string => {
    // Logic: First 3 letters of Name + First 3 digits of Mobile
    const p1 = name.replace(/\s/g, '').substring(0, 3).toUpperCase();
    const p2 = mobile.substring(0, 3);
    return `${p1}${p2}`;
};

// --- Initial Mock Data ---

const INITIAL_GRADES: Grade[] = [
    { id: 'g1', gradeName: 'Grade 1', hasSubdivision: true },
    { id: 'g2', gradeName: 'Grade 8', hasSubdivision: true },
];

const INITIAL_SUBDIVISIONS: Subdivision[] = [
    { id: 'sd1', gradeId: 'g1', divisionName: 'A' },
    { id: 'sd2', gradeId: 'g1', divisionName: 'B' },
    { id: 'sd3', gradeId: 'g2', divisionName: 'Science' },
];

const INITIAL_TEACHERS: Teacher[] = [
    { 
        id: 't1', 
        teacherCustomId: 'JEN987', 
        name: 'Jennifer Honey', 
        mobile: '9876543210', 
        gradeId: 'g1', 
        subdivisionId: 'sd1', 
        joiningDate: '2023-01-01', 
        status: 'Active', 
        specialization: 'Maths' 
    },
    // Demo Teacher
    {
        id: 't_demo',
        teacherCustomId: 'Demot',
        name: 'Demo Teacher',
        mobile: '0000000000',
        gradeId: 'g1',
        subdivisionId: 'sd1',
        joiningDate: '2023-01-01',
        status: 'Active',
        specialization: 'General Science',
        password: 'Demot'
    }
];

const INITIAL_STUDENTS: Student[] = [
    { 
        id: 's1', 
        studentCustomId: 'ROH998', 
        name: 'Rohan Gupta', 
        mobile: '9988776655', 
        parentName: 'Mr. Gupta', 
        gradeId: 'g1', 
        subdivisionId: 'sd1', 
        joiningDate: '2023-06-01', 
        totalFees: '15000', 
        feesStatus: 'Paid', 
        status: 'Active', 
        email: 'rohan@student.com' // Legacy support
    },
    // Demo Student
    {
        id: 's_demo',
        studentCustomId: 'Demos',
        name: 'Demo Student',
        mobile: '0000000000',
        parentName: 'Demo Parent',
        gradeId: 'g1',
        subdivisionId: 'sd1',
        joiningDate: '2023-01-01',
        totalFees: '0',
        feesStatus: 'Paid',
        status: 'Active',
        email: 'demo@student.com',
        password: 'Demos'
    }
];

const INITIAL_SETTINGS: SystemSettings = {
    paymentMode: 'manual',
    adminUpiId: 'tejanishriya64-3@okaxis',
    googleSiteKey: '',
    phonePeSaltKey: '',
    phonePeMerchantId: ''
};

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('sc_grades')) localStorage.setItem('sc_grades', JSON.stringify(INITIAL_GRADES));
    if (!localStorage.getItem('sc_subdivisions')) localStorage.setItem('sc_subdivisions', JSON.stringify(INITIAL_SUBDIVISIONS));
    if (!localStorage.getItem('sc_students')) localStorage.setItem('sc_students', JSON.stringify(INITIAL_STUDENTS));
    if (!localStorage.getItem('sc_teachers')) localStorage.setItem('sc_teachers', JSON.stringify(INITIAL_TEACHERS));
    if (!localStorage.getItem('sc_settings')) localStorage.setItem('sc_settings', JSON.stringify(INITIAL_SETTINGS));
    
    // Legacy/Other initialization
    if (!localStorage.getItem('sc_notices')) localStorage.setItem('sc_notices', JSON.stringify([]));
    if (!localStorage.getItem('sc_timetable')) localStorage.setItem('sc_timetable', JSON.stringify([]));
    if (!localStorage.getItem('sc_attendance')) localStorage.setItem('sc_attendance', JSON.stringify([]));
    if (!localStorage.getItem('sc_live_classes')) localStorage.setItem('sc_live_classes', JSON.stringify([]));
    if (!localStorage.getItem('sc_fee_submissions')) localStorage.setItem('sc_fee_submissions', JSON.stringify([]));
    
    // New Modules
    if (!localStorage.getItem('sc_homework')) localStorage.setItem('sc_homework', JSON.stringify([]));
    if (!localStorage.getItem('sc_homework_submissions')) localStorage.setItem('sc_homework_submissions', JSON.stringify([]));
    if (!localStorage.getItem('sc_exams')) localStorage.setItem('sc_exams', JSON.stringify([]));
    if (!localStorage.getItem('sc_exam_submissions')) localStorage.setItem('sc_exam_submissions', JSON.stringify([]));
    if (!localStorage.getItem('sc_exam_results')) localStorage.setItem('sc_exam_results', JSON.stringify([]));
    if (!localStorage.getItem('sc_queries')) localStorage.setItem('sc_queries', JSON.stringify([]));
  }

  private get<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  private set(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Auth Logic ---
  login(username: string, password: string): User | null {
    // Admin (Case Sensitive as requested)
    if (username === 'Admin' && password === 'Reset@852') {
      return { id: 'admin1', username: 'Shriya Admin', role: 'admin', status: 'Active' };
    }
    
    // Teacher Check (Custom ID or Name)
    const teachers = this.getTeachers();
    const teacher = teachers.find(t => t.teacherCustomId === username || t.name === username);
    if (teacher && teacher.status === 'Active') {
        // Password check (In real PHP: password_verify)
        const correctPass = teacher.password || teacher.mobile; 
        if (password === correctPass) {
             return { id: teacher.id, username: teacher.name, role: 'teacher', status: 'Active' };
        }
    }

    // Student Check
    const students = this.getStudents();
    const student = students.find(s => s.studentCustomId === username || s.name === username);
    if (student && student.status === 'Active') {
         // Default password is mobile number
         const correctPass = student.password || student.mobile;
         if (password === correctPass) {
             return { id: student.id, username: student.name, role: 'student', divisionId: student.subdivisionId, status: 'Active' };
         }
    }
    
    return null;
  }

  // --- Grades & Subdivisions ---
  getGrades() { return this.get<Grade>('sc_grades'); }
  
  addGrade(gradeName: string, subdivisionNames: string[]) {
      const grades = this.getGrades();
      const newGradeId = `g${Date.now()}`;
      const newGrade: Grade = { id: newGradeId, gradeName, hasSubdivision: subdivisionNames.length > 0 };
      this.set('sc_grades', [...grades, newGrade]);

      if (subdivisionNames.length > 0) {
          const subs = this.getSubdivisions();
          const newSubs = subdivisionNames.map(name => ({
              id: `sd${Math.random().toString(36).substr(2, 9)}`,
              gradeId: newGradeId,
              divisionName: name
          }));
          this.set('sc_subdivisions', [...subs, ...newSubs]);
      }
  }

  updateGrade(id: string, gradeName: string, subdivisionNames: string[]) {
      const grades = this.getGrades();
      const updatedGrades = grades.map(g => g.id === id ? { ...g, gradeName, hasSubdivision: subdivisionNames.length > 0 } : g);
      this.set('sc_grades', updatedGrades);

      const currentSubs = this.getSubdivisions(id);
      let allOtherSubs = this.get<Subdivision>('sc_subdivisions').filter(s => s.gradeId !== id);
      const newGradeSubs: Subdivision[] = [];

      subdivisionNames.forEach(name => {
          const existing = currentSubs.find(s => s.divisionName.toLowerCase() === name.toLowerCase().trim());
          if (existing) {
              newGradeSubs.push(existing); 
          } else {
              newGradeSubs.push({
                  id: `sd${Math.random().toString(36).substr(2, 9)}`,
                  gradeId: id,
                  divisionName: name.trim()
              });
          }
      });
      this.set('sc_subdivisions', [...allOtherSubs, ...newGradeSubs]);
  }

  deleteGrade(id: string) {
      const grades = this.getGrades().filter(g => g.id !== id);
      this.set('sc_grades', grades);
      const subs = this.get<Subdivision>('sc_subdivisions').filter(s => s.gradeId !== id);
      this.set('sc_subdivisions', subs);
  }

  getSubdivisions(gradeId?: string) { 
      const all = this.get<Subdivision>('sc_subdivisions'); 
      if (gradeId) return all.filter(s => s.gradeId === gradeId);
      return all;
  }

  // --- Student Management ---
  getStudents(gradeId?: string, subdivisionId?: string) { 
      let all = this.get<Student>('sc_students');
      if (gradeId) all = all.filter(s => s.gradeId === gradeId);
      if (subdivisionId) all = all.filter(s => s.subdivisionId === subdivisionId);
      return all;
  }

  addStudent(data: { name: string, mobile: string, parentName: string, gradeId: string, subdivisionId: string }) {
      const list = this.getStudents();
      const customId = generateCustomId(data.name, data.mobile);
      
      if (list.find(s => s.studentCustomId === customId)) {
          throw new Error('Duplicate ID Generated. Student might already exist.');
      }

      const newStudent: Student = {
          id: `s${Date.now()}`,
          studentCustomId: customId,
          name: data.name,
          mobile: data.mobile,
          parentName: data.parentName,
          gradeId: data.gradeId,
          subdivisionId: data.subdivisionId,
          joiningDate: new Date().toISOString().split('T')[0],
          totalFees: '0',
          feesStatus: 'Pending',
          status: 'Active',
          password: data.mobile, 
          email: `${customId.toLowerCase()}@sc.com`
      };
      
      this.set('sc_students', [newStudent, ...list]);
      return newStudent;
  }

  updateStudent(id: string, data: Partial<Student>) {
      const list = this.getStudents();
      const updatedList = list.map(s => s.id === id ? { ...s, ...data } : s);
      this.set('sc_students', updatedList);
  }

  updateStudentStatus(id: string, status: 'Active' | 'Suspended') {
      const list = this.getStudents().map(s => s.id === id ? { ...s, status } : s);
      this.set('sc_students', list);
  }

  // --- Teacher Management ---
  getTeachers() { return this.get<Teacher>('sc_teachers'); }

  addTeacher(data: { name: string, mobile: string, gradeId: string, subdivisionId: string, specialization: string }) {
      const list = this.getTeachers();
      const customId = generateCustomId(data.name, data.mobile);

      const newTeacher: Teacher = {
          id: `t${Date.now()}`,
          teacherCustomId: customId,
          name: data.name,
          mobile: data.mobile,
          gradeId: data.gradeId,
          subdivisionId: data.subdivisionId,
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          password: data.mobile, 
          specialization: data.specialization
      };

      this.set('sc_teachers', [newTeacher, ...list]);
  }

  updateTeacher(id: string, data: Partial<Teacher>) {
      const list = this.getTeachers();
      const updatedList = list.map(t => t.id === id ? { ...t, ...data } : t);
      this.set('sc_teachers', updatedList);
  }

  updateTeacherStatus(id: string, status: 'Active' | 'Suspended') {
      const list = this.getTeachers().map(t => t.id === id ? { ...t, status } : t);
      this.set('sc_teachers', list);
  }

  resetUserPassword(type: 'student' | 'teacher', id: string, newPassword?: string) {
      if (type === 'student') {
          const list = this.getStudents().map(s => s.id === id ? { ...s, password: newPassword || s.mobile } : s);
          this.set('sc_students', list);
      } else {
          const list = this.getTeachers().map(t => t.id === id ? { ...t, password: newPassword || t.mobile } : t);
          this.set('sc_teachers', list);
      }
  }

  // --- General Getters/Setters ---
  getNotices() { return this.get<Notice>('sc_notices'); }
  getTimetable(divisionId?: string) { return this.get<TimetableEntry>('sc_timetable'); }
  addTimetableEntry(entry: any) {
       const list = this.getTimetable();
       this.set('sc_timetable', [...list, { ...entry, id: Math.random().toString(36).substr(2, 9) }]);
  }
  
  getFeeSubmissions() { return this.get<FeeSubmission>('sc_fee_submissions'); }
  addFeeSubmission(submission: any) {
       const list = this.getFeeSubmissions();
       this.set('sc_fee_submissions', [...list, { ...submission, id: Math.random().toString(), status: 'Pending', date: new Date().toISOString().split('T')[0] }]);
       const students = this.getStudents();
       const updatedStudents = students.map(s => s.id === submission.studentId ? { ...s, feesStatus: 'Pending' } : s);
       this.set('sc_students', updatedStudents);
  }
  updateFeeStatus(id: string, status: any) {
       const list = this.getFeeSubmissions().map(s => s.id === id ? { ...s, status } : s);
       this.set('sc_fee_submissions', list);
       if (status === 'Approved') {
           const sub = list.find(s => s.id === id);
           if (sub) {
               const students = this.getStudents().map(s => s.id === sub.studentId ? { ...s, feesStatus: 'Paid', totalFees: (parseInt(s.totalFees || '0') + parseInt(sub.amount)).toString() } : s);
               this.set('sc_students', students);
           }
       }
  }

  getAttendance(studentId?: string, date?: string) { 
      let all = this.get<AttendanceRecord>('sc_attendance'); 
      if (studentId) all = all.filter(a => a.studentId === studentId);
      if (date) all = all.filter(a => a.date === date);
      return all;
  }
  markAttendance(records: any[]) { 
      const newKeys = new Set(records.map(r => `${r.studentId}_${r.date}`));
      const current = this.getAttendance().filter(r => !newKeys.has(`${r.studentId}_${r.date}`));
      this.set('sc_attendance', [...current, ...records.map(r => ({...r, id: Math.random().toString()}))]);
  }
  getLiveClasses(divId: string) { return this.get<LiveClass>('sc_live_classes'); }

  getSettings(): SystemSettings { 
      return JSON.parse(localStorage.getItem('sc_settings') || JSON.stringify(INITIAL_SETTINGS)); 
  }
  updateSettings(s: SystemSettings) { localStorage.setItem('sc_settings', JSON.stringify(s)); }

  // --- HOMEWORK ---
  getHomework(teacherId?: string) {
      let hw = this.get<Homework>('sc_homework');
      if (teacherId) hw = hw.filter(h => h.assignedBy === teacherId);
      return hw;
  }
  
  // Student Portal Logic: Get Homework by Grade/Div
  getHomeworkForStudent(gradeId: string, subdivisionId: string) {
      const hw = this.get<Homework>('sc_homework');
      return hw.filter(h => h.gradeId === gradeId && h.subdivisionId === subdivisionId);
  }

  addHomework(data: Omit<Homework, 'id'>) {
      const list = this.getHomework();
      this.set('sc_homework', [{ ...data, id: `hw${Date.now()}` }, ...list]);
  }

  // Student Homework Submission
  getHomeworkSubmission(homeworkId: string, studentId: string) {
      return this.get<HomeworkSubmission>('sc_homework_submissions').find(s => s.homeworkId === homeworkId && s.studentId === studentId);
  }

  submitHomework(homeworkId: string, studentId: string, text: string) {
      const list = this.get<HomeworkSubmission>('sc_homework_submissions').filter(s => !(s.homeworkId === homeworkId && s.studentId === studentId));
      this.set('sc_homework_submissions', [...list, {
          id: `hsub${Date.now()}`,
          homeworkId,
          studentId,
          submissionText: text,
          submittedAt: new Date().toISOString().split('T')[0],
          status: 'Submitted'
      }]);
  }

  getHomeworkStatus(homeworkId: string) {
     // Legacy method support if needed, or use submissions table now
      return this.get<HomeworkSubmission>('sc_homework_submissions').filter(s => s.homeworkId === homeworkId).map(s => ({
          id: s.id, homeworkId: s.homeworkId, studentId: s.studentId, status: s.status === 'Submitted' ? 'Pending' : 'Completed' // Map for old types if necessary
      }));
  }
  updateHomeworkStatus(homeworkId: string, studentId: string, status: 'Pending' | 'Completed') {
      // Mock logic: In real app, teacher would update the 'status' field in homework_submissions
  }

  // --- EXAMS ---
  getExams(createdBy?: string) {
      let exams = this.get<Exam>('sc_exams');
      if (createdBy) exams = exams.filter(e => e.createdBy === createdBy);
      return exams;
  }
  
  // Student Portal Logic: Get Exams by Grade/Div
  getExamsForStudent(gradeId: string, subdivisionId: string) {
      const exams = this.get<Exam>('sc_exams');
      return exams.filter(e => e.gradeId === gradeId && e.subdivisionId === subdivisionId);
  }

  addExam(data: Omit<Exam, 'id'>) {
      const list = this.getExams();
      this.set('sc_exams', [{ ...data, id: `ex${Date.now()}` }, ...list]);
  }

  // Exam Submission
  isExamSubmitted(examId: string, studentId: string) {
      return this.get<ExamSubmission>('sc_exam_submissions').some(s => s.examId === examId && s.studentId === studentId);
  }

  submitExamAnswers(examId: string, studentId: string, answers: Record<string, string>) {
      const list = this.get<ExamSubmission>('sc_exam_submissions');
      if(list.find(s => s.examId === examId && s.studentId === studentId)) throw new Error("Exam already submitted");

      this.set('sc_exam_submissions', [...list, {
          id: `esub${Date.now()}`,
          examId, studentId, answers, submittedAt: new Date().toISOString()
      }]);
  }
  
  getExamResults(examId: string) {
      return this.get<ExamResult>('sc_exam_results').filter(r => r.examId === examId);
  }
  addExamResult(data: Omit<ExamResult, 'id'>) {
      let all = this.get<ExamResult>('sc_exam_results');
      all = all.filter(r => !(r.examId === data.examId && r.studentId === data.studentId)); 
      this.set('sc_exam_results', [...all, { ...data, id: `er${Date.now()}` }]);
  }

  // --- QUERY SYSTEM ---
  addQuery(data: {studentId: string, studentName: string, subject: string, queryText: string}) {
      const list = this.get<StudentQuery>('sc_queries');
      this.set('sc_queries', [{
          id: `q${Date.now()}`,
          ...data,
          status: 'Unanswered',
          createdAt: new Date().toISOString().split('T')[0]
      }, ...list]);
  }

  getQueries(studentId?: string) {
      const all = this.get<StudentQuery>('sc_queries');
      if (studentId) return all.filter(q => q.studentId === studentId);
      return all;
  }

  answerQuery(queryId: string, replyText: string) {
      const list = this.getQueries().map(q => q.id === queryId ? { ...q, status: 'Answered' as const, replyText } : q);
      this.set('sc_queries', list);
  }
}

export const db = new DatabaseService();