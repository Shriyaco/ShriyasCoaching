
import { supabase } from './supabase';
import { 
  Grade, StudentProfile, AttendanceRecord, Homework, HomeworkSubmission,
  Exam, ExamQuestion, ExamAttempt, ExamResponse, LeaveApplication,
  Doubt, StudyNote, SchoolExam, User, RequestStatus, Notice, Division,
  Enquiry, Product, Order, FeeSubmission, SystemSettings, Student
} from '../types';

class DatabaseService {
  
  // --- AUTH & USER ---
  async login(username: string, password: string): Promise<User | null> {
    // Demo implementation - in production use Supabase Auth
    if (username === 'Admin' && password === 'Reset@852') {
      return { id: 'admin1', username: 'Shriya Admin', role: 'admin' };
    }
    // Mobile number as login for students/teachers
    const { data: profile } = await supabase.from('profiles').select('*').eq('mobile', username).single();
    if (profile) return { id: profile.id, username: profile.full_name, role: profile.role as any, mobile: profile.mobile };
    return null;
  }

  // --- ATTENDANCE ---
  async getStudentsByDivision(divisionId: string): Promise<StudentProfile[]> {
    const { data } = await supabase.from('students').select(`
      *, profiles(full_name)
    `).eq('division_id', divisionId);
    return (data || []).map(s => ({
      id: s.id,
      profileId: s.profile_id,
      name: s.profiles.full_name,
      rollNo: s.roll_no,
      gradeId: s.grade_id,
      divisionId: s.division_id,
      mobile: s.mobile,
      monthlyFees: s.monthly_fees,
      studentCustomId: s.student_custom_id
    }));
  }

  async markAttendance(records: Omit<AttendanceRecord, 'id'>[]) {
    // Uses UPSERT with UNIQUE(student_id, date) constraint
    const { error } = await supabase.from('attendance').upsert(records.map(r => ({
      student_id: r.studentId,
      date: r.date,
      status: r.status,
      marked_by: r.markedBy
    })));
    if (error) throw error;
  }

  async getStudentAttendanceSummary(studentId: string) {
    const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    const total = data?.length || 0;
    const present = data?.filter(r => r.status === 'Present').length || 0;
    return { total, present, percentage: total ? (present / total) * 100 : 0 };
  }

  // --- HOMEWORK ---
  async assignHomework(hw: Omit<Homework, 'id'>) {
    const { error } = await supabase.from('homework').insert({
      teacher_id: hw.teacherId,
      subject: hw.subject,
      topic: hw.topic,
      description: hw.description,
      due_date: hw.dueDate,
      attachment_url: hw.attachmentUrl,
      target_type: hw.targetType,
      target_grade_id: hw.targetGradeId,
      target_student_id: hw.targetStudentId
    });
    if (error) throw error;
  }

  async getHomeworkSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
    const { data } = await supabase.from('homework_submissions').select('*, profiles(full_name)').eq('homework_id', homeworkId);
    return (data || []).map(s => ({
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      content: s.content,
      attachmentUrl: s.attachment_url,
      submittedAt: s.submitted_at,
      isChecked: s.is_checked,
      remarks: s.remarks
    }));
  }

  // --- EXAMS ---
  async createExam(exam: Omit<Exam, 'id'>, questions: Omit<ExamQuestion, 'id' | 'examId'>[]) {
    const { data: newExam, error: examErr } = await supabase.from('exams').insert({
      teacher_id: exam.teacherId,
      title: exam.title,
      subject: exam.subject,
      target_type: exam.targetType,
      target_id: exam.targetId,
      start_time: exam.startTime,
      end_time: exam.endTime,
      duration_minutes: exam.durationMinutes,
      total_marks: exam.totalMarks,
      negative_marking_factor: exam.negativeMarkingFactor
    }).select().single();

    if (examErr) throw examErr;

    const questionsWithId = questions.map(q => ({ ...q, exam_id: newExam.id }));
    const { error: qErr } = await supabase.from('exam_questions').insert(questionsWithId);
    if (qErr) throw qErr;

    return newExam.id;
  }

  async startExamAttempt(examId: string, studentId: string): Promise<string> {
    const { data, error } = await supabase.from('exam_attempts').insert({
      exam_id: examId,
      student_id: studentId,
      start_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data.id;
  }

  async submitExamAttempt(attemptId: string, responses: Omit<ExamResponse, 'id' | 'attemptId'>[]) {
    const { error: rErr } = await supabase.from('exam_responses').insert(
      responses.map(r => ({ ...r, attempt_id: attemptId }))
    );
    if (rErr) throw rErr;

    const { error: aErr } = await supabase.from('exam_attempts').update({
      submitted_at: new Date().toISOString()
    }).eq('id', attemptId);
    if (aErr) throw aErr;
  }

  // --- LEAVE & DOUBTS ---
  async applyLeave(leave: Omit<LeaveApplication, 'id' | 'status'>) {
    const { error } = await supabase.from('leave_applications').insert({
      student_id: leave.studentId,
      from_date: leave.fromDate,
      to_date: leave.toDate,
      reason: leave.reason,
      status: 'Pending'
    });
    if (error) throw error;
  }

  async updateLeaveStatus(leaveId: string, status: RequestStatus, remarks: string) {
    const { error: lErr } = await supabase.from('leave_applications')
      .update({ status, teacher_remarks: remarks })
      .eq('id', leaveId);
    
    if (lErr) throw lErr;

    // Proactive Attendance Sync: If approved, mark attendance table as 'Leave'
    if (status === 'Approved') {
      // Logic for generating dates array between from/to and bulk upserting to attendance
    }
  }

  async raiseDoubt(doubt: Omit<Doubt, 'id' | 'status' | 'createdAt'>) {
    await supabase.from('doubts').insert({
      student_id: doubt.studentId,
      subject: doubt.subject,
      question: doubt.question,
      attachment_url: doubt.attachmentUrl,
      status: 'Open'
    });
  }

  // --- CMS & SHOP ---
  async getPageContent(pageKey: string): Promise<any> {
      const { data } = await supabase.from('site_content').select('content_json').eq('page_key', pageKey).single();
      return data?.content_json || null;
  }

  async updatePageContent(pageKey: string, content: any) {
      await supabase.from('site_content').upsert({ page_key: pageKey, content_json: content });
  }

  async getNotices(): Promise<Notice[]> {
    const { data } = await supabase.from('notices').select('*').order('date', { ascending: false });
    return data || [];
  }

  async addNotice(notice: Omit<Notice, 'id'>) {
    const { error } = await supabase.from('notices').insert(notice);
    if (error) throw error;
  }
  
  async getSettings(): Promise<SystemSettings | null> {
    const { data } = await supabase.from('system_settings').select('*').single();
    return data;
  }

  async updateSettings(settings: SystemSettings) {
    const { error } = await supabase.from('system_settings').upsert(settings);
    if (error) throw error;
  }

  // --- ADMIN MODULES ---
  async getGrades(): Promise<Grade[]> {
    const { data } = await supabase.from('grades').select('*').order('grade_name', { ascending: true });
    return data || [];
  }

  async addGrade(gradeName: string, divisions: string[]) {
    const { data: newGrade, error: gErr } = await supabase.from('grades').insert({ grade_name: gradeName }).select().single();
    if (gErr) throw gErr;
    if (divisions.length > 0) {
      const divRecords = divisions.map(d => ({ grade_id: newGrade.id, division_name: d }));
      await supabase.from('divisions').insert(divRecords);
    }
  }

  async deleteGrade(id: string) {
    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) throw error;
  }

  async getDivisions(): Promise<Division[]> {
    const { data } = await supabase.from('divisions').select('*');
    return data || [];
  }

  async getFeeSubmissions(): Promise<FeeSubmission[]> {
    const { data } = await supabase.from('fee_submissions').select('*').order('created_at', { ascending: false });
    return (data || []).map(f => ({
      id: f.id,
      studentId: f.student_id,
      studentName: f.student_name,
      amount: f.amount,
      status: f.status,
      transactionRef: f.transaction_ref,
      paymentMethod: f.payment_method,
      createdAt: f.created_at
    }));
  }

  async addFeeSubmission(fee: Omit<FeeSubmission, 'id' | 'createdAt' | 'status'>) {
    const { error } = await supabase.from('fee_submissions').insert({
      student_id: fee.studentId,
      student_name: fee.studentName,
      amount: fee.amount,
      transaction_ref: fee.transactionRef,
      payment_method: fee.paymentMethod,
      status: 'Pending'
    });
    if (error) throw error;
  }

  async getEnquiries(): Promise<Enquiry[]> {
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async addEnquiry(enquiry: any) {
    const { error } = await supabase.from('enquiries').insert(enquiry);
    if (error) throw error;
  }

  async getProducts(): Promise<Product[]> {
    const { data } = await supabase.from('products').select('*');
    return data || [];
  }

  async getOrders(studentId?: string): Promise<Order[]> {
    let query = supabase.from('shop_orders').select('*');
    if (studentId) query = query.eq('student_id', studentId);
    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(o => ({
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
      status: o.status,
      finalPrice: o.final_price,
      transactionRef: o.transaction_ref,
      createdAt: o.created_at
    }));
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const { data, error } = await supabase.from('shop_orders').insert({
      student_id: order.studentId,
      student_name: order.studentName,
      product_id: order.productId,
      product_name: order.productName,
      product_image: order.productImage,
      custom_name: order.customName,
      change_request: order.changeRequest,
      address: order.address,
      pincode: order.pincode,
      state: order.state,
      mobile: order.mobile,
      status: order.status,
      final_price: order.finalPrice
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    const { error } = await supabase.from('shop_orders').update({
      status: updates.status,
      transaction_ref: updates.transactionRef
    }).eq('id', id);
    if (error) throw error;
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select(`
      *, profiles(full_name)
    `).eq('id', id).single();
    return data ? {
      id: data.id,
      profileId: data.profile_id,
      name: data.profiles.full_name,
      rollNo: data.roll_no,
      gradeId: data.grade_id,
      divisionId: data.division_id,
      mobile: data.mobile,
      monthlyFees: data.monthly_fees,
      studentCustomId: data.student_custom_id
    } : null;
  }

  async findStudentByMobile(mobile: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select(`
      *, profiles(full_name)
    `).eq('mobile', mobile).single();
    return data ? {
      id: data.id,
      profileId: data.profile_id,
      name: data.profiles.full_name,
      rollNo: data.roll_no,
      gradeId: data.grade_id,
      divisionId: data.division_id,
      mobile: data.mobile,
      monthlyFees: data.monthly_fees,
      studentCustomId: data.student_custom_id
    } : null;
  }

  // --- REAL-TIME SUBSCRIPTION ---
  subscribe(table: string, callback: () => void) {
    return supabase.channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
}

export const db = new DatabaseService();
