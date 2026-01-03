import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Student, Grade, Subdivision, Notice, User, Teacher, TimetableEntry, LiveClass, FeeSubmission, SystemSettings, AttendanceRecord, Homework, Exam, ExamResult, HomeworkSubmission, ExamSubmission, StudentQuery } from '../types';

// Helper to map snake_case (DB) to camelCase (Frontend)
const mapStudent = (s: any): Student => ({
    id: s.id,
    studentCustomId: s.student_custom_id,
    name: s.name,
    mobile: s.mobile,
    parentName: s.parent_name,
    gradeId: s.grade_id,
    subdivisionId: s.subdivision_id,
    joiningDate: s.joining_date,
    totalFees: s.total_fees,
    feesStatus: s.fees_status as any,
    status: s.status as any,
    password: s.password,
    email: s.email
});

const mapTeacher = (t: any): Teacher => ({
    id: t.id,
    teacherCustomId: t.teacher_custom_id,
    name: t.name,
    mobile: t.mobile,
    gradeId: t.grade_id,
    subdivisionId: t.subdivision_id,
    joiningDate: t.joining_date,
    status: t.status as any,
    specialization: t.specialization,
    password: t.password
});

class DatabaseService {
  
  // --- Auth Logic ---
  async login(username: string, password: string): Promise<User | null> {
    // 1. Check Hardcoded Admin
    if (username === 'Admin' && password === 'Reset@852') {
      return { id: 'admin1', username: 'Shriya Admin', role: 'admin', status: 'Active' };
    }
    
    // 2. Check Teachers Table
    const { data: teachers, error: tError } = await supabase
        .from('teachers')
        .select('*')
        .or(`teacher_custom_id.eq.${username},name.eq.${username}`);
    
    if (teachers && teachers.length > 0) {
        const t = teachers[0];
        if (t.status === 'Active' && (t.password === password || t.mobile === password)) {
            return { id: t.id, username: t.name, role: 'teacher', status: 'Active' };
        }
    }

    // 3. Check Students Table
    const { data: students, error: sError } = await supabase
        .from('students')
        .select('*')
        .or(`student_custom_id.eq.${username},name.eq.${username}`);

    if (students && students.length > 0) {
        const s = students[0];
        if (s.status === 'Active' && (s.password === password || s.mobile === password)) {
            return { id: s.id, username: s.name, role: 'student', divisionId: s.subdivision_id, status: 'Active' };
        }
    }
    
    return null;
  }

  // --- Realtime Subscriptions ---
  subscribe(table: string, callback: () => void): RealtimeChannel {
      return supabase
          .channel(`public:${table}:${Math.random()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: table }, () => {
              callback();
          })
          .subscribe();
  }

  unsubscribe(channel: RealtimeChannel) {
      supabase.removeChannel(channel);
  }

  // --- Grades & Subdivisions ---
  async getGrades(): Promise<Grade[]> {
      const { data } = await supabase.from('grades').select('*');
      return (data || []).map(g => ({ id: g.id, gradeName: g.grade_name, hasSubdivision: g.has_subdivision }));
  }
  
  async addGrade(gradeName: string, subdivisionNames: string[]) {
      const { data: grade, error } = await supabase.from('grades').insert({ grade_name: gradeName, has_subdivision: subdivisionNames.length > 0 }).select().single();
      if (error || !grade) throw error;

      if (subdivisionNames.length > 0) {
          const subs = subdivisionNames.map(name => ({
              grade_id: grade.id,
              division_name: name
          }));
          await supabase.from('subdivisions').insert(subs);
      }
  }

  async updateGrade(id: string, gradeName: string, subdivisionNames: string[]) {
      await supabase.from('grades').update({ grade_name: gradeName, has_subdivision: subdivisionNames.length > 0 }).eq('id', id);
      
      if (subdivisionNames.length > 0) {
         for (const name of subdivisionNames) {
             const { data } = await supabase.from('subdivisions').select('*').eq('grade_id', id).eq('division_name', name);
             if (!data || data.length === 0) {
                 await supabase.from('subdivisions').insert({ grade_id: id, division_name: name });
             }
         }
      }
  }

  async deleteGrade(id: string) {
      await supabase.from('grades').delete().eq('id', id);
  }

  async getSubdivisions(gradeId?: string): Promise<Subdivision[]> { 
      let query = supabase.from('subdivisions').select('*');
      if (gradeId) query = query.eq('grade_id', gradeId);
      const { data } = await query;
      return (data || []).map(s => ({ id: s.id, gradeId: s.grade_id, divisionName: s.division_name }));
  }

  // --- Student Management ---
  async getStudents(gradeId?: string, subdivisionId?: string): Promise<Student[]> { 
      let query = supabase.from('students').select('*');
      if (gradeId) query = query.eq('grade_id', gradeId);
      if (subdivisionId) query = query.eq('subdivision_id', subdivisionId);
      
      const { data } = await query;
      return (data || []).map(mapStudent);
  }

  async addStudent(data: { name: string, mobile: string, parentName: string, gradeId: string, subdivisionId: string }) {
      const customId = data.name.substring(0,3).toUpperCase() + data.mobile.substring(0,3);
      
      await supabase.from('students').insert({
          student_custom_id: customId,
          name: data.name,
          mobile: data.mobile,
          parent_name: data.parentName,
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          password: data.mobile,
          email: `${customId.toLowerCase()}@sc.com`
      });
  }

  async updateStudent(id: string, data: Partial<Student>) {
      const payload: any = {};
      if(data.name) payload.name = data.name;
      if(data.mobile) payload.mobile = data.mobile;
      if(data.parentName) payload.parent_name = data.parentName;
      if(data.gradeId) payload.grade_id = data.gradeId;
      if(data.subdivisionId) payload.subdivision_id = data.subdivisionId;
      
      await supabase.from('students').update(payload).eq('id', id);
  }

  async updateStudentStatus(id: string, status: 'Active' | 'Suspended') {
      await supabase.from('students').update({ status }).eq('id', id);
  }

  // --- Teacher Management ---
  async getTeachers(): Promise<Teacher[]> { 
      const { data } = await supabase.from('teachers').select('*');
      return (data || []).map(mapTeacher);
  }

  async addTeacher(data: { name: string, mobile: string, gradeId: string, subdivisionId: string, specialization: string }) {
      const customId = data.name.substring(0,3).toUpperCase() + data.mobile.substring(0,3);
      await supabase.from('teachers').insert({
          teacher_custom_id: customId,
          name: data.name,
          mobile: data.mobile,
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          specialization: data.specialization,
          password: data.mobile
      });
  }

  async updateTeacher(id: string, data: Partial<Teacher>) {
      const payload: any = {};
      if(data.name) payload.name = data.name;
      if(data.mobile) payload.mobile = data.mobile;
      if(data.gradeId) payload.grade_id = data.gradeId;
      if(data.subdivisionId) payload.subdivision_id = data.subdivisionId;
      if(data.specialization) payload.specialization = data.specialization;

      await supabase.from('teachers').update(payload).eq('id', id);
  }

  async updateTeacherStatus(id: string, status: 'Active' | 'Suspended') {
      await supabase.from('teachers').update({ status }).eq('id', id);
  }

  async resetUserPassword(type: 'student' | 'teacher', id: string, newPassword?: string) {
      const table = type === 'student' ? 'students' : 'teachers';
      if (!newPassword) {
         const { data } = await supabase.from(table).select('mobile').eq('id', id).single();
         if(data) newPassword = data.mobile;
      }
      await supabase.from(table).update({ password: newPassword }).eq('id', id);
  }

  // --- General Getters/Setters ---
  async getNotices(): Promise<Notice[]> { 
      const { data } = await supabase.from('notices').select('*');
      return data || [];
  }
  
  async getTimetable(divisionId?: string): Promise<TimetableEntry[]> { 
      let query = supabase.from('timetable').select('*');
      if(divisionId) query = query.eq('division_id', divisionId);
      const { data } = await query;
      return (data || []).map(t => ({
          id: t.id,
          divisionId: t.division_id,
          day: t.day,
          startTime: t.start_time,
          endTime: t.end_time,
          subject: t.subject,
          teacherName: t.teacher_name
      }));
  }
  
  async getFeeSubmissions(): Promise<FeeSubmission[]> { 
      const { data } = await supabase.from('fee_submissions').select('*');
      return (data || []).map(f => ({
          id: f.id,
          studentId: f.student_id,
          studentName: f.student_name,
          amount: f.amount,
          transactionRef: f.transaction_ref,
          paymentMethod: f.payment_method as any,
          status: f.status as any,
          date: f.date
      }));
  }

  async addFeeSubmission(submission: any) {
      await supabase.from('fee_submissions').insert({
          student_id: submission.studentId,
          student_name: submission.studentName,
          amount: submission.amount,
          transaction_ref: submission.transactionRef,
          payment_method: submission.paymentMethod,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
      });
      // Update student status
      await supabase.from('students').update({ fees_status: 'Pending' }).eq('id', submission.studentId);
  }

  async getAttendance(studentId?: string, date?: string): Promise<AttendanceRecord[]> { 
      let query = supabase.from('attendance').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      if (date) query = query.eq('date', date);
      const { data } = await query;
      return (data || []).map(a => ({
          id: a.id,
          studentId: a.student_id,
          divisionId: a.division_id,
          date: a.date,
          status: a.status as any
      }));
  }

  async markAttendance(records: any[]) { 
      const payload = records.map(r => ({
          student_id: r.studentId,
          division_id: r.divisionId,
          date: r.date,
          status: r.status
      }));
      await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date' as any });
  }

  async getLiveClasses(divId: string): Promise<LiveClass[]> { return []; } 

  async getSettings(): Promise<SystemSettings> { 
      const { data } = await supabase.from('system_settings').select('*').single();
      if (!data) return { paymentMode: 'manual', adminUpiId: '', googleSiteKey: '', phonePeSaltKey: '', phonePeMerchantId: '' };
      return {
          paymentMode: data.payment_mode,
          adminUpiId: data.admin_upi_id,
          googleSiteKey: data.google_site_key,
          phonePeSaltKey: data.phone_pe_salt_key,
          phonePeMerchantId: data.phone_pe_merchant_id
      };
  }

  async updateSettings(s: SystemSettings) { 
      await supabase.from('system_settings').update({
          payment_mode: s.paymentMode,
          admin_upi_id: s.adminUpiId,
          google_site_key: s.googleSiteKey,
          phone_pe_salt_key: s.phonePeSaltKey,
          phone_pe_merchant_id: s.phonePeMerchantId
      }).eq('id', 1);
  }

  // --- HOMEWORK ---
  async getHomework(teacherId?: string): Promise<Homework[]> {
      let query = supabase.from('homework').select('*');
      if (teacherId) query = query.eq('assigned_by', teacherId);
      const { data } = await query;
      return (data || []).map(h => ({
          id: h.id,
          gradeId: h.grade_id,
          subdivisionId: h.subdivision_id,
          subject: h.subject,
          task: h.task,
          dueDate: h.due_date,
          assignedBy: h.assigned_by
      }));
  }
  
  async getHomeworkForStudent(gradeId: string, subdivisionId: string): Promise<Homework[]> {
      const { data } = await supabase.from('homework').select('*').eq('grade_id', gradeId).eq('subdivision_id', subdivisionId);
       return (data || []).map(h => ({
          id: h.id,
          gradeId: h.grade_id,
          subdivisionId: h.subdivision_id,
          subject: h.subject,
          task: h.task,
          dueDate: h.due_date,
          assignedBy: h.assigned_by
      }));
  }

  async addHomework(data: Omit<Homework, 'id'>) {
      await supabase.from('homework').insert({
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          subject: data.subject,
          task: data.task,
          due_date: data.dueDate,
          assigned_by: data.assignedBy
      });
  }

  async getHomeworkSubmission(homeworkId: string, studentId: string): Promise<HomeworkSubmission | undefined> {
      const { data } = await supabase.from('homework_submissions').select('*').eq('homework_id', homeworkId).eq('student_id', studentId).single();
      if (!data) return undefined;
      return {
          id: data.id,
          homeworkId: data.homework_id,
          studentId: data.student_id,
          submissionText: data.submission_text,
          submittedAt: data.submitted_at,
          status: data.status as any
      };
  }

  async submitHomework(homeworkId: string, studentId: string, text: string) {
      await supabase.from('homework_submissions').insert({
          homework_id: homeworkId,
          student_id: studentId,
          submission_text: text,
          submitted_at: new Date().toISOString().split('T')[0],
          status: 'Submitted'
      });
  }

  async getHomeworkStatus(homeworkId: string): Promise<any[]> {
      const { data } = await supabase.from('homework_submissions').select('*').eq('homework_id', homeworkId);
      return data || [];
  }

  // --- EXAMS ---
  async getExams(createdBy?: string): Promise<Exam[]> {
      let query = supabase.from('exams').select('*');
      if (createdBy) query = query.eq('created_by', createdBy);
      const { data } = await query;
      return (data || []).map(e => ({
          id: e.id,
          gradeId: e.grade_id,
          subdivisionId: e.subdivision_id,
          subject: e.subject,
          examDate: e.exam_date,
          totalMarks: e.total_marks,
          questions: e.questions,
          createdBy: e.created_by
      }));
  }
  
  async getExamsForStudent(gradeId: string, subdivisionId: string): Promise<Exam[]> {
      const { data } = await supabase.from('exams').select('*').eq('grade_id', gradeId).eq('subdivision_id', subdivisionId);
      return (data || []).map(e => ({
          id: e.id,
          gradeId: e.grade_id,
          subdivisionId: e.subdivision_id,
          subject: e.subject,
          examDate: e.exam_date,
          totalMarks: e.total_marks,
          questions: e.questions,
          createdBy: e.created_by
      }));
  }

  async addExam(data: Omit<Exam, 'id'>) {
      await supabase.from('exams').insert({
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          subject: data.subject,
          exam_date: data.examDate,
          total_marks: data.totalMarks,
          questions: data.questions,
          created_by: data.createdBy
      });
  }

  async isExamSubmitted(examId: string, studentId: string): Promise<boolean> {
      const { data } = await supabase.from('exam_submissions').select('id').eq('exam_id', examId).eq('student_id', studentId);
      return (data && data.length > 0) || false;
  }

  async submitExamAnswers(examId: string, studentId: string, answers: Record<string, string>) {
      await supabase.from('exam_submissions').insert({
          exam_id: examId,
          student_id: studentId,
          answers: answers
      });
  }
  
  async getExamResults(examId: string): Promise<ExamResult[]> {
      const { data } = await supabase.from('exam_results').select('*').eq('exam_id', examId);
      return (data || []).map(r => ({
          id: r.id,
          examId: r.exam_id,
          studentId: r.student_id,
          marksObtained: r.marks_obtained,
          percentage: r.percentage,
          status: r.status as any
      }));
  }

  async addExamResult(data: Omit<ExamResult, 'id'>) {
      await supabase.from('exam_results').insert({
          exam_id: data.examId,
          student_id: data.studentId,
          marks_obtained: data.marksObtained,
          percentage: data.percentage,
          status: data.status
      });
  }

  // --- QUERY SYSTEM ---
  async addQuery(data: {studentId: string, studentName: string, subject: string, queryText: string}) {
      await supabase.from('queries').insert({
          student_id: data.studentId,
          student_name: data.studentName,
          subject: data.subject,
          query_text: data.queryText,
          status: 'Unanswered'
      });
  }

  async getQueries(studentId?: string): Promise<StudentQuery[]> {
      let query = supabase.from('queries').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      const { data } = await query;
      return (data || []).map(q => ({
          id: q.id,
          studentId: q.student_id,
          studentName: q.student_name,
          subject: q.subject,
          queryText: q.query_text,
          status: q.status as any,
          replyText: q.reply_text,
          createdAt: q.created_at
      }));
  }

  async answerQuery(queryId: string, replyText: string) {
      await supabase.from('queries').update({ status: 'Answered', reply_text: replyText }).eq('id', queryId);
  }
}

export const db = new DatabaseService();