
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Student, Grade, Subdivision, Notice, User, Teacher, TimetableEntry, FeeSubmission, SystemSettings, GatewayConfig, AttendanceRecord, Homework, Exam, ExamResult, HomeworkSubmission, ExamSubmission, StudentQuery, Enquiry, Product, Order, StudyNote, StudentNotification, LeaveApplication, StudentOwnExam } from '../types';

const mapStudent = (s: any): Student => ({
    id: s.id,
    studentCustomId: s.student_custom_id,
    name: s.name,
    mobile: s.mobile,
    parentName: s.parent_name,
    gradeId: s.grade_id,
    subdivisionId: s.subdivision_id,
    joiningDate: s.joining_date,
    dob: s.dob,
    imageUrl: s.image_url,
    totalFees: s.total_fees || '0',
    monthlyFees: s.monthly_fees || '5000',
    schoolName: s.school_name || '',
    address: s.address || '',
    feesStatus: s.fees_status as any || 'Pending',
    status: s.status as any || 'Active',
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
    joiningDate: t.joining_date || new Date().toISOString().split('T')[0],
    status: t.status as any || 'Active',
    specialization: t.specialization || 'General',
    password: t.password
});

const mapOrder = (o: any): Order => ({
    id: o.id,
    studentId: o.student_id,
    studentName: o.student_name,
    productId: o.product_id,
    productName: o.product_name,
    productImage: o.product_image,
    customName: o.custom_name,
    changeRequest: o.change_request,
    address: o.address,
    pincode: o.pincode,
    state: o.state,
    mobile: o.mobile,
    status: o.status as any,
    finalPrice: o.final_price,
    transactionRef: o.transaction_ref,
    createdAt: o.created_at
});

const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    basePrice: p.base_price,
    category: p.category || 'General',
    stockStatus: p.stock_status || 'In Stock',
    imageUrl: p.image_url
});

const mapNote = (n: any): StudyNote => ({
    id: n.id,
    gradeId: n.grade_id,
    divisionId: n.division_id,
    targetType: n.target_type || 'Grade',
    targetStudentId: n.target_student_id,
    subject: n.subject,
    title: n.title,
    content: n.content,
    fileUrl: n.file_url,
    createdAt: n.created_at,
    teacherId: n.teacher_id
});

const mapNotification = (n: any): StudentNotification => ({
    id: n.id,
    targetType: n.target_type,
    targetId: n.target_id,
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.created_at
});

const mapLeave = (l: any): LeaveApplication => ({
    id: l.id,
    studentId: l.student_id,
    studentName: l.student_name,
    gradeId: l.grade_id,
    subdivisionId: l.subdivision_id,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason,
    status: l.status
});

const mapStudentExam = (e: any): StudentOwnExam => ({
    id: e.id,
    studentId: e.student_id,
    studentName: e.student_name,
    gradeId: e.grade_id,
    subdivisionId: e.subdivision_id,
    subject: e.subject,
    examDate: e.exam_date,
    description: e.description
});

class DatabaseService {
  
  async login(username: string, password: string): Promise<User | null> {
    if (username === 'Admin' && password === 'Reset@852') {
      return { id: 'admin1', username: 'Shriya Admin', role: 'admin', status: 'Active' };
    }
    
    const [teacherRes, studentRes] = await Promise.all([
        supabase.from('teachers').select('id, name, teacher_custom_id, password, mobile, status').or(`teacher_custom_id.eq.${username},name.eq.${username}`),
        supabase.from('students').select('id, name, student_custom_id, password, mobile, status, subdivision_id').or(`student_custom_id.eq.${username},name.eq.${username}`)
    ]);

    if (teacherRes.data && teacherRes.data.length > 0) {
        const t = teacherRes.data.find(teacher => teacher.password === password || teacher.mobile === password);
        if (t && t.status === 'Active') {
            return { id: t.id, username: t.name, role: 'teacher', status: 'Active' };
        }
    }

    if (studentRes.data && studentRes.data.length > 0) {
        const s = studentRes.data.find(student => student.password === password || student.mobile === password);
        if (s && s.status === 'Active') {
            return { id: s.id, username: s.name, role: 'student', divisionId: s.subdivision_id, status: 'Active' };
        }
    }
    return null;
  }

  async getPageContent(pageKey: string): Promise<any> {
      const { data, error } = await supabase.from('site_content').select('content_json').eq('page_key', pageKey).single();
      if (error || !data) return null;
      return data.content_json;
  }

  async updatePageContent(pageKey: string, content: any) {
      const { error } = await supabase.from('site_content').upsert(
          { page_key: pageKey, content_json: content },
          { onConflict: 'page_key' }
      );
      if (error) throw error;
  }

  async changePassword(id: string, role: 'student' | 'teacher', oldPassword: string, newPassword: string): Promise<void> {
    const table = role === 'student' ? 'students' : 'teachers';
    const { data, error } = await supabase.from(table).select('password').eq('id', id).single();
    if (error || !data) throw new Error("User not found");
    if (data.password !== oldPassword) throw new Error("Incorrect current password");
    
    const { error: updateError } = await supabase.from(table).update({ password: newPassword }).eq('id', id);
    if (updateError) throw updateError;
  }

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

  async getGrades(): Promise<Grade[]> {
      const { data } = await supabase.from('grades').select('*');
      return (data || []).map(g => ({ id: g.id, gradeName: g.grade_name, hasSubdivision: g.has_subdivision }));
  }

  async addGrade(name: string, subdivisionNames: string[]) {
    const { data: grade, error: gradeError } = await supabase.from('grades').insert({ grade_name: name, has_subdivision: true }).select().single();
    if (gradeError) throw gradeError;
    
    if (subdivisionNames.length > 0) {
      const subs = subdivisionNames.map(s => ({ grade_id: grade.id, division_name: s }));
      const { error: subError } = await supabase.from('subdivisions').insert(subs);
      if (subError) throw subError;
    }
  }

  async deleteGrade(id: string) {
    await supabase.from('subdivisions').delete().eq('grade_id', id);
    await supabase.from('grades').delete().eq('id', id);
  }
  
  async getSubdivisions(gradeId?: string): Promise<Subdivision[]> { 
      let query = supabase.from('subdivisions').select('*');
      if (gradeId) query = query.eq('grade_id', gradeId);
      const { data } = await query;
      return (data || []).map(s => ({ 
        id: s.id, 
        gradeId: s.grade_id, 
        divisionName: s.division_name,
        isLive: s.is_live,
        liveMeetingId: s.live_meeting_id
      }));
  }

  async setLiveStatus(divisionId: string, isLive: boolean, meetingId?: string) {
      await supabase.from('subdivisions').update({ 
        is_live: isLive, 
        live_meeting_id: isLive ? meetingId : null 
      }).eq('id', divisionId);
  }

  async getStudents(gradeId?: string, subdivisionId?: string): Promise<Student[]> { 
      let query = supabase.from('students').select('*');
      if (gradeId) query = query.eq('grade_id', gradeId);
      if (subdivisionId) query = query.eq('subdivision_id', subdivisionId);
      const { data } = await query;
      return (data || []).map(mapStudent);
  }

  async getStudentById(id: string): Promise<Student | null> {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error || !data) return null;
      return mapStudent(data);
  }

  async findStudentByMobile(mobile: string): Promise<Student | null> {
      const { data, error } = await supabase.from('students').select('*').eq('mobile', mobile.trim()).limit(1);
      if (error || !data || data.length === 0) return null;
      return mapStudent(data[0]);
  }

  async addStudent(data: any) {
      const cleanName = (data.name || '').trim().replace(/\s+/g, '');
      const cleanMobile = (data.mobile || '').trim().replace(/\s+/g, '');
      const namePart = cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X');
      const mobilePart = cleanMobile.length >= 3 ? cleanMobile.substring(0, 3) : cleanMobile.padEnd(3, '0');
      const customId = (namePart + mobilePart).toUpperCase();
      const password = cleanMobile;

      const { error } = await supabase.from('students').insert({
          student_custom_id: customId,
          name: data.name,
          mobile: data.mobile,
          parent_name: data.parentName,
          grade_id: data.gradeId || null,
          subdivision_id: data.subdivision_id || null,
          joining_date: data.joiningDate,
          monthly_fees: data.monthlyFees,
          total_fees: data.monthlyFees,
          school_name: data.schoolName,
          address: data.address,
          dob: data.dob || null,
          image_url: data.imageUrl || null,
          password: password,
          email: `${customId.toLowerCase()}_${Date.now()}@sc.com`,
          status: 'Active',
          fees_status: 'Pending'
      });

      if (error) throw error;
  }

  async updateStudent(id: string, data: Partial<Student>) {
      const payload: any = {};
      if(data.name) payload.name = data.name;
      if(data.mobile) payload.mobile = data.mobile;
      if(data.parentName) payload.parent_name = data.parentName;
      if(data.gradeId) payload.grade_id = data.gradeId;
      if(data.subdivisionId) payload.subdivision_id = data.subdivisionId;
      if(data.joiningDate) payload.joining_date = data.joiningDate;
      if(data.monthlyFees) payload.monthly_fees = data.monthlyFees;
      if(data.schoolName) payload.school_name = data.schoolName;
      if(data.address) payload.address = data.address;
      if(data.dob) payload.dob = data.dob;
      if(data.imageUrl) payload.image_url = data.imageUrl;
      const { error } = await supabase.from('students').update(payload).eq('id', id);
      if (error) throw error;
  }

  async updateStudentStatus(id: string, status: 'Active' | 'Suspended') {
      await supabase.from('students').update({ status }).eq('id', id);
  }

  async deleteStudent(id: string) {
      await supabase.from('students').delete().eq('id', id);
  }

  async getTeachers(): Promise<Teacher[]> { 
      const { data } = await supabase.from('teachers').select('*');
      return (data || []).map(mapTeacher);
  }

  async addTeacher(data: any) {
      const cleanName = (data.name || '').trim().replace(/\s+/g, '');
      const cleanMobile = (data.mobile || '').trim().replace(/\s+/g, '');
      const namePart = cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X');
      const mobilePart = cleanMobile.length >= 4 ? cleanMobile.slice(-4) : cleanMobile.padEnd(4, '0');
      const customId = (namePart + mobilePart).toUpperCase();
      const password = cleanMobile;

      const { error } = await supabase.from('teachers').insert({
          teacher_custom_id: customId,
          name: data.name,
          mobile: data.mobile,
          grade_id: data.gradeId || null,
          subdivision_id: data.subdivision_id || null,
          specialization: data.specialization || 'General',
          joining_date: new Date().toISOString().split('T')[0],
          password: password,
          status: 'Active'
      });
      if (error) throw error;
  }

  async updateTeacher(id: string, data: Partial<Teacher>) {
      const payload: any = {};
      if(data.name) payload.name = data.name;
      if(data.mobile) payload.mobile = data.mobile;
      if(data.gradeId) payload.grade_id = data.gradeId;
      if(data.subdivisionId) payload.subdivision_id = data.subdivisionId;
      if(data.specialization) payload.specialization = data.specialization;
      const { error } = await supabase.from('teachers').update(payload).eq('id', id);
      if (error) throw error;
  }

  async updateTeacherStatus(id: string, status: 'Active' | 'Suspended') {
      await supabase.from('teachers').update({ status }).eq('id', id);
  }

  async deleteTeacher(id: string) {
      await supabase.from('teachers').delete().eq('id', id);
  }

  async resetUserPassword(type: 'student' | 'teacher', id: string) {
      const table = type === 'student' ? 'students' : 'teachers';
      const { data, error: fetchError } = await supabase.from(table).select('mobile').eq('id', id).single();
      if (fetchError || !data) throw new Error("Could not find user mobile number.");
      const { error } = await supabase.from(table).update({ password: data.mobile }).eq('id', id);
      if (error) throw error;
  }

  async getNotices(): Promise<Notice[]> { 
      const { data } = await supabase.from('notices').select('*').order('date', { ascending: false });
      return data || [];
  }

  async addNotice(notice: Omit<Notice, 'id'>) {
      await supabase.from('notices').insert({
          title: notice.title,
          content: notice.content,
          date: notice.date,
          important: notice.important
      });
  }

  async deleteNotice(id: string) {
      await supabase.from('notices').delete().eq('id', id);
  }
  
  async getTimetable(divisionId?: string): Promise<TimetableEntry[]> { 
      let query = supabase.from('timetable').select('*');
      if(divisionId) query = query.eq('division_id', divisionId);
      const { data } = await query.order('start_time');
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

  async addTimetableEntry(entry: Omit<TimetableEntry, 'id'>) {
      await supabase.from('timetable').insert({
          division_id: entry.divisionId,
          day: entry.day,
          start_time: entry.startTime,
          end_time: entry.endTime,
          subject: entry.subject,
          teacher_name: entry.teacherName
      });
  }

  async deleteTimetableEntry(id: string) {
      await supabase.from('timetable').delete().eq('id', id);
  }
  
  async getFeeSubmissions(): Promise<FeeSubmission[]> { 
      const { data } = await supabase.from('fee_submissions').select('*').order('date', { ascending: false });
      return (data || []).map(f => ({
          id: f.id,
          studentId: f.student_id,
          studentName: f.student_name,
          amount: f.amount,
          transactionRef: f.transaction_ref,
          paymentMethod: f.payment_method,
          status: f.status as any,
          date: f.date
      }));
  }

  async updateFeeSubmissionStatus(id: string, status: 'Approved' | 'Rejected', studentId: string) {
      await supabase.from('fee_submissions').update({ status }).eq('id', id);
      if (status === 'Approved') {
          await supabase.from('students').update({ fees_status: 'Paid' }).eq('id', studentId);
      } else {
          await supabase.from('students').update({ fees_status: 'Pending' }).eq('id', studentId);
      }
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

  async getSettings(): Promise<SystemSettings> { 
      const { data } = await supabase.from('system_settings').select('*').single();
      const defaultGateways: any = {
          manual: { name: 'Manual UPI', enabled: true, credentials: { upiId: '' } },
          phonepe: { name: 'PhonePe', enabled: false, credentials: { merchantId: '', saltKey: '', saltIndex: '1' } },
          paytm: { name: 'Paytm', enabled: false, credentials: { mid: '', merchantKey: '' } },
          billdesk: { name: 'BillDesk', enabled: false, credentials: { merchantId: '', secret: '' } }
      };
      if (!data) return { googleSiteKey: '', gateways: defaultGateways };
      return { googleSiteKey: data.google_site_key || '', gateways: data.payment_config || defaultGateways };
  }

  async updateSettings(s: SystemSettings) { 
      await supabase.from('system_settings').update({ google_site_key: s.googleSiteKey, payment_config: s.gateways }).eq('id', 1);
  }

  async getHomeworkForStudent(gradeId: string, subdivisionId: string, studentId: string): Promise<Homework[]> {
       // ROBUST CLIENT-SIDE FILTERING REPLACEMENT (IMPROVED)
       const { data, error } = await supabase.from('homework').select('*');
       
       if (error || !data) {
           console.error("Error fetching homework:", error);
           return [];
       }

       const norm = (id: any) => String(id || '').trim();
       const sGrade = norm(gradeId);
       const sDiv = norm(subdivisionId);
       const sId = norm(studentId);

       const filtered = data.filter(h => {
           // Default to 'Division' if target_type is missing/null to handle legacy data safely
           const type = h.target_type || 'Division'; 
           const hGrade = norm(h.grade_id);
           const hDiv = norm(h.subdivision_id);
           const hStudent = norm(h.target_student_id);

           // 1. Individual Target (Highest Priority)
           if (type === 'Individual') {
               return hStudent === sId;
           }

           // 2. Grade Check
           // Must match student's grade OR be 'Global' (All Grades)
           const gradeMatches = hGrade === 'Global' || hGrade === sGrade;
           if (!gradeMatches) return false;

           // 3. Division Check
           // If type is 'Grade', we assume it applies to the whole grade (ignore division)
           if (type === 'Grade') return true;

           // If type is 'Division' (default), we check division
           // Matches if division is 'Global' (All Divs) OR matches student's division
           if (type === 'Division') {
               return hDiv === 'Global' || hDiv === sDiv;
           }

           return false;
       });

       return filtered.map(h => ({
          id: h.id, 
          gradeId: h.grade_id, 
          subdivisionId: h.subdivision_id, 
          targetType: h.target_type || 'Division',
          targetStudentId: h.target_student_id,
          subject: h.subject, 
          task: h.task, 
          dueDate: h.due_date, 
          assignedBy: h.assigned_by
      })).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }

  async getAllHomework(): Promise<Homework[]> {
      const { data } = await supabase.from('homework').select('*').order('created_at', { ascending: false });
       return (data || []).map(h => ({
          id: h.id, 
          gradeId: h.grade_id, 
          subdivisionId: h.subdivision_id, 
          targetType: h.target_type || 'Division',
          targetStudentId: h.target_student_id,
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
          target_type: data.targetType,
          target_student_id: data.targetStudentId,
          subject: data.subject, 
          task: data.task, 
          due_date: data.dueDate, 
          assigned_by: data.assignedBy
      });
  }

  async deleteHomework(id: string) {
      const { error } = await supabase.from('homework').delete().eq('id', id);
      if (error) throw error;
  }

  async submitHomework(homeworkId: string, studentId: string, text: string, imageUrl?: string) {
      await supabase.from('homework_submissions').insert({
          homework_id: homeworkId, student_id: studentId, submission_text: text, image_url: imageUrl, submitted_at: new Date().toISOString().split('T')[0], status: 'Submitted'
      });
  }

  async getAllHomeworkSubmissions(): Promise<HomeworkSubmission[]> {
    const { data } = await supabase.from('homework_submissions').select('*');
    return (data || []).map(s => ({
        id: s.id,
        homeworkId: s.homework_id,
        studentId: s.student_id,
        submissionText: s.submission_text,
        imageUrl: s.image_url,
        submittedAt: s.submitted_at,
        status: s.status as any
    }));
  }

  async updateHomeworkStatus(id: string, status: 'Reviewed') {
      await supabase.from('homework_submissions').update({ status }).eq('id', id);
  }

  async getExams(gradeId?: string): Promise<Exam[]> {
      let query = supabase.from('exams').select('*');
      if (gradeId) query = query.eq('grade_id', gradeId);
      const { data } = await query;
      return (data || []).map(e => ({
          id: e.id, 
          title: e.title, 
          gradeId: e.grade_id, 
          subdivisionId: e.subdivision_id, 
          targetType: e.target_type || 'Division',
          targetStudentId: e.target_student_id,
          subject: e.subject, 
          examDate: e.exam_date, 
          startTime: e.start_time, 
          duration: e.duration, 
          totalMarks: e.total_marks, 
          questions: e.questions, 
          reopenable: e.reopenable || false,
          createdBy: e.created_by 
      }));
  }

  async getExamsForStudent(gradeId: string, subdivisionId: string, studentId: string): Promise<Exam[]> {
      // ROBUST CLIENT-SIDE FILTERING REPLACEMENT FOR EXAMS (IMPROVED)
      const { data, error } = await supabase.from('exams').select('*');
      
      if (error || !data) return [];

      const norm = (id: any) => String(id || '').trim();
      const sGrade = norm(gradeId);
      const sDiv = norm(subdivisionId);
      const sId = norm(studentId);

      const filtered = data.filter(e => {
           const type = e.target_type || 'Division'; // Fail-safe default
           const eGrade = norm(e.grade_id);
           const eDiv = norm(e.subdivision_id);
           const eStudent = norm(e.target_student_id);

           if (type === 'Individual') return eStudent === sId;
           
           // Grade Match
           const gradeMatches = eGrade === 'Global' || eGrade === sGrade;
           if (!gradeMatches) return false;

           if (type === 'Grade') return true;
           
           if (type === 'Division') {
               return eDiv === 'Global' || eDiv === sDiv;
           }
           
           return false;
      });
        
      return filtered.map(e => ({
          id: e.id, 
          title: e.title, 
          gradeId: e.grade_id, 
          subdivisionId: e.subdivision_id, 
          targetType: e.target_type || 'Division',
          targetStudentId: e.target_student_id,
          subject: e.subject, 
          examDate: e.exam_date, 
          startTime: e.start_time, 
          duration: e.duration, 
          totalMarks: e.total_marks, 
          questions: e.questions, 
          reopenable: e.reopenable || false,
          createdBy: e.created_by 
      })).sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  }
  
  async addExam(data: Omit<Exam, 'id'>) {
      await supabase.from('exams').insert({
          title: data.title, 
          grade_id: data.gradeId, 
          subdivision_id: data.subdivisionId, 
          target_type: data.targetType,
          target_student_id: data.targetStudentId,
          subject: data.subject, 
          exam_date: data.examDate, 
          start_time: data.startTime, 
          duration: data.duration, 
          total_marks: data.totalMarks, 
          questions: data.questions, 
          reopenable: data.reopenable,
          created_by: data.createdBy
      });
  }

  async deleteExam(id: string) {
      await supabase.from('exams').delete().eq('id', id);
  }

  async getAllExamSubmissions(): Promise<ExamSubmission[]> {
      const { data } = await supabase.from('exam_submissions').select('*, students(name)');
      return (data || []).map(s => ({
          id: s.id,
          examId: s.exam_id,
          studentId: s.student_id,
          studentName: s.students?.name,
          answers: s.answers,
          marksAwarded: s.marks_awarded,
          totalObtained: s.total_obtained,
          submittedAt: s.created_at,
          status: s.status as any
      }));
  }

  async updateExamSubmissionGrading(id: string, marksRecord: Record<string, number>, total: number) {
      await supabase.from('exam_submissions').update({
          marks_awarded: marksRecord,
          total_obtained: total,
          status: 'Graded'
      }).eq('id', id);
  }

  async addQuery(data: any) {
      await supabase.from('queries').insert({ student_id: data.studentId, student_name: data.studentName, subject: data.subject, query_text: data.queryText, status: 'Unanswered' });
  }

  async getQueries(studentId?: string): Promise<StudentQuery[]> {
      let query = supabase.from('queries').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      const { data } = await query;
      return (data || []).map(q => ({ id: q.id, studentId: q.student_id, studentName: q.student_name, subject: q.subject, queryText: q.query_text, status: q.status as any, replyText: q.reply_text, createdAt: q.created_at }));
  }

  async answerQuery(queryId: string, replyText: string) {
      await supabase.from('queries').update({ status: 'Answered', reply_text: replyText }).eq('id', queryId);
  }

  async addEnquiry(data: any) {
      await supabase.from('enquiries').insert({
          student_name: data.studentName,
          parent_name: data.parentName,
          relation: data.relation,
          grade: data.grade,
          school_name: data.schoolName,
          has_coaching: data.hasCoaching,
          reason: data.reason,
          mobile: data.mobile,
          connect_time: data.connectTime,
          status: 'New'
      });
  }

  async getEnquiries(): Promise<Enquiry[]> {
      const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      return (data || []).map(e => ({
          id: e.id,
          studentName: e.student_name,
          parentName: e.parent_name,
          relation: e.relation,
          grade: e.grade,
          schoolName: e.school_name,
          hasCoaching: e.has_coaching,
          reason: e.reason,
          mobile: e.mobile,
          connectTime: e.connect_time,
          createdAt: e.created_at,
          status: e.status
      }));
  }

  async updateEnquiryStatus(id: string, status: 'New' | 'Contacted') {
      await supabase.from('enquiries').update({ status }).eq('id', id);
  }

  async getProducts(): Promise<Product[]> {
      const { data } = await supabase.from('products').select('*');
      return (data || []).map(mapProduct);
  }

  async addProduct(data: Omit<Product, 'id'>) {
      const { error } = await supabase.from('products').insert({
          name: data.name,
          description: data.description,
          base_price: data.basePrice,
          category: data.category,
          stock_status: data.stockStatus,
          image_url: data.imageUrl
      });
      if (error) throw error;
  }

  async updateProduct(id: string, data: Partial<Product>) {
      const payload: any = {};
      if (data.name) payload.name = data.name;
      if (data.description) payload.description = data.description;
      if (data.basePrice) payload.base_price = data.basePrice;
      if (data.category) payload.category = data.category;
      if (data.stockStatus) payload.stock_status = data.stockStatus;
      if (data.imageUrl) payload.image_url = data.imageUrl;
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) throw error;
  }

  async deleteProduct(id: string) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt'>) {
      const { data: res, error } = await supabase.from('shop_orders').insert({
          student_id: data.studentId,
          student_name: data.studentName,
          product_id: data.productId,
          product_name: data.productName,
          product_image: data.productImage,
          custom_name: data.customName,
          change_request: data.changeRequest,
          address: data.address,
          pincode: data.pincode,
          state: data.state,
          mobile: data.mobile,
          status: data.status,
          final_price: data.finalPrice,
          transaction_ref: data.transactionRef
      }).select().single();
      if (error) throw error;
      return mapOrder(res);
  }

  async getOrders(studentId?: string): Promise<Order[]> {
      let query = supabase.from('shop_orders').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      const { data } = await query.order('created_at', { ascending: false });
      return (data || []).map(mapOrder);
  }

  async updateOrder(id: string, updates: Partial<Order>) {
      const payload: any = {};
      if (updates.status) payload.status = updates.status;
      if (updates.finalPrice) payload.final_price = updates.finalPrice;
      if (updates.transactionRef) payload.transaction_ref = updates.transactionRef;
      await supabase.from('shop_orders').update(payload).eq('id', id);
  }

  async getNotes(gradeId?: string, divisionId?: string, studentId?: string): Promise<StudyNote[]> {
    // ROBUST CLIENT-SIDE FILTERING FOR NOTES (IMPROVED)
    const { data, error } = await supabase.from('study_notes').select('*');
    if (error || !data) return [];

    const norm = (id: any) => String(id || '').trim();

    let filtered = data;
    
    // If specific student request (Student Panel)
    if (studentId && gradeId) {
        const sGrade = norm(gradeId);
        const sDiv = norm(divisionId);
        const sId = norm(studentId);

        filtered = data.filter(n => {
            const type = n.target_type || 'Grade'; // Default to Grade if missing
            const nGrade = norm(n.grade_id);
            const nDiv = norm(n.division_id);
            const nStudent = norm(n.target_student_id);
            
            // Individual
            if (type === 'Individual') return nStudent === sId;
            
            // Grade Check (Global or Match)
            const gradeMatch = nGrade === 'Global' || nGrade === sGrade;
            
            // Division Check (Global or Match or Empty)
            // Allow empty division in notes to mean global within grade implicitly
            const divMatch = nDiv === 'Global' || nDiv === '' || nDiv === sDiv;

            return gradeMatch && divMatch;
        });
    } else {
        // Teacher view logic (Show what they created/relevant to their selection)
        if (gradeId) filtered = filtered.filter(n => norm(n.grade_id) === norm(gradeId) || norm(n.grade_id) === 'Global');
        if (divisionId) filtered = filtered.filter(n => norm(n.division_id) === norm(divisionId) || norm(n.division_id) === 'Global');
    }
    
    return filtered.map(mapNote).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addNote(data: Omit<StudyNote, 'id' | 'createdAt'>) {
    await supabase.from('study_notes').insert({
      grade_id: data.gradeId,
      division_id: data.divisionId,
      target_type: data.targetType,
      target_student_id: data.targetStudentId,
      subject: data.subject,
      title: data.title,
      content: data.content,
      file_url: data.fileUrl,
      teacher_id: data.teacherId
    });
  }

  async deleteNote(id: string) {
    await supabase.from('study_notes').delete().eq('id', id);
  }

  async addLeaveApplication(data: Omit<LeaveApplication, 'id' | 'status'>) {
      await supabase.from('leave_applications').insert({
          student_id: data.studentId,
          student_name: data.studentName,
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason,
          status: 'Pending'
      });
  }

  async getLeaveApplications(studentId?: string, gradeId?: string, divisionId?: string): Promise<LeaveApplication[]> {
      let query = supabase.from('leave_applications').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      if (gradeId) query = query.eq('grade_id', gradeId);
      if (divisionId) query = query.eq('subdivision_id', divisionId);
      const { data } = await query.order('start_date', { ascending: false });
      return (data || []).map(mapLeave);
  }

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected') {
      await supabase.from('leave_applications').update({ status }).eq('id', id);
  }

  async addStudentExam(data: Omit<StudentOwnExam, 'id'>) {
      await supabase.from('student_exams').insert({
          student_id: data.studentId,
          student_name: data.studentName,
          grade_id: data.gradeId,
          subdivision_id: data.subdivisionId,
          subject: data.subject,
          exam_date: data.examDate,
          description: data.description
      });
  }

  async getStudentExams(studentId?: string, gradeId?: string, divisionId?: string): Promise<StudentOwnExam[]> {
      let query = supabase.from('student_exams').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      if (gradeId) query = query.eq('grade_id', gradeId);
      if (divisionId) query = query.eq('subdivision_id', divisionId);
      const { data } = await query.order('exam_date', { ascending: true });
      return (data || []).map(mapStudentExam);
  }

  async pushNotification(data: Omit<StudentNotification, 'id' | 'createdAt'>) {
      const { error } = await supabase.from('app_notifications').insert({
          target_type: data.targetType,
          target_id: data.targetId,
          type: data.type,
          title: data.title,
          message: data.message
      });
      if (error) throw error;
  }
}

export const db = new DatabaseService();
