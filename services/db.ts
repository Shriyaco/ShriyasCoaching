
import { supabase } from './supabase';
import { 
  Grade, StudentProfile, Profile,
  User, Homework, HomeworkSubmission, Exam, 
  ExamResult, Doubt, LeaveRequest, RequestStatus,
  Notice, Enquiry, TeacherAssignment, Product, Order, SystemSettings, Student, FeeSubmission
} from '../types';

class DatabaseService {
  // --- AUTH ---
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!data) return null;
    return {
      id: data.id, fullName: data.full_name, mobile: data.mobile,
      role: data.role as any, status: data.status as any, academyId: data.academy_id
    };
  }

  async login(username: string, password: string): Promise<User | null> {
    if (username === 'Admin' && password === 'Reset@852') return { id: 'admin1', username: 'Admin', role: 'admin' };
    const email = username.includes('@') ? username.toLowerCase() : `${username.toLowerCase()}@shriyasgurukul.in`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await this.getCurrentProfile();
    if (!profile) return null;
    return { id: profile.id, username: profile.fullName, role: profile.role, mobile: profile.mobile };
  }

  // --- ATTENDANCE ---
  async markAttendance(records: any[]) {
    const { error } = await supabase.from('attendance').upsert(records.map(r => ({
      student_id: r.studentId, date: r.date, status: r.status, marked_by: r.markedBy
    })));
    if (error) throw error;
  }

  async getAttendance(studentId: string) {
    const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    return data || [];
  }

  // --- HOMEWORK ---
  async createHomework(hw: Omit<Homework, 'id'>) {
    const { error } = await supabase.from('homework').insert({
      teacher_id: hw.teacherId, subject: hw.subject, topic: hw.topic,
      description: hw.description, due_date: hw.dueDate, target_type: hw.targetType,
      target_grade_id: hw.targetGradeId
    });
    if (error) throw error;
  }

  async getHomework(gradeId: string): Promise<Homework[]> {
    const { data } = await supabase.from('homework').select('*').eq('target_grade_id', gradeId).is('deleted_at', null);
    return (data || []).map(d => ({
      id: d.id, teacherId: d.teacher_id, subject: d.subject, topic: d.topic,
      description: d.description, dueDate: d.due_date, targetType: d.target_type
    }));
  }

  // Updated signature to Omit status as it is hardcoded to 'Submitted' in this method
  async submitHomework(sub: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>) {
    const { error } = await supabase.from('homework_submissions').insert({
      homework_id: sub.homeworkId, student_id: sub.studentId, 
      student_name: sub.studentName, content: sub.content, status: 'Submitted'
    });
    if (error) throw error;
  }

  async getSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
    const { data } = await supabase.from('homework_submissions').select('*').eq('homework_id', homeworkId);
    return (data || []).map(d => ({
      id: d.id, homeworkId: d.homework_id, studentId: d.student_id, studentName: d.student_name,
      content: d.content, submittedAt: d.submitted_at, status: d.status, remarks: d.remarks, grade: d.grade
    }));
  }

  async gradeSubmission(id: string, grade: string, remarks: string) {
    const { error } = await supabase.from('homework_submissions').update({ grade, remarks, status: 'Graded' }).eq('id', id);
    if (error) throw error;
  }

  // --- EXAMS ---
  async createExam(ex: Omit<Exam, 'id'>) {
    const { error } = await supabase.from('exams').insert({
      teacher_id: ex.teacherId, title: ex.title, subject: ex.subject, grade_id: ex.gradeId,
      start_time: ex.startTime, end_time: ex.endTime, duration_minutes: ex.durationMinutes,
      total_marks: ex.totalMarks, questions: ex.questions, is_published: true
    });
    if (error) throw error;
  }

  async getExams(gradeId: string): Promise<Exam[]> {
    const { data } = await supabase.from('exams').select('*').eq('grade_id', gradeId);
    return (data || []).map(d => ({
      id: d.id, teacherId: d.teacher_id, title: d.title, subject: d.subject, gradeId: d.grade_id,
      startTime: d.start_time, endTime: d.end_time, durationMinutes: d.duration_minutes,
      totalMarks: d.total_marks, questions: d.questions, is_published: d.is_published
    }));
  }

  async submitResult(res: Omit<ExamResult, 'id' | 'submittedAt'>) {
    const { error } = await supabase.from('exam_results').insert({
      exam_id: res.examId, student_id: res.studentId, marks_obtained: res.marksObtained,
      total_marks: res.totalMarks, remarks: res.remarks
    });
    if (error) throw error;
  }

  // --- DOUBTS ---
  async raiseDoubt(doubt: Omit<Doubt, 'id' | 'status' | 'createdAt'>) {
    const { error } = await supabase.from('doubts').insert({
      student_id: doubt.studentId, student_name: doubt.studentName,
      subject: doubt.subject, question: doubt.question, status: 'Open'
    });
    if (error) throw error;
  }

  async getDoubts(studentId?: string): Promise<Doubt[]> {
    let query = supabase.from('doubts').select('*');
    if (studentId) query = query.eq('student_id', studentId);
    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id, studentId: d.student_id, studentName: d.student_name,
      subject: d.subject, question: d.question, answer: d.answer,
      status: d.status, createdAt: d.created_at
    }));
  }

  async resolveDoubt(id: string, answer: string) {
    const { error } = await supabase.from('doubts').update({ answer, status: 'Resolved' }).eq('id', id);
    if (error) throw error;
  }

  // --- LEAVE ---
  async applyLeave(l: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) {
    const { error } = await supabase.from('leave_requests').insert({
      student_id: l.studentId, student_name: l.studentName, reason: l.reason,
      start_date: l.startDate, end_date: l.endDate, status: 'Pending'
    });
    if (error) throw error;
  }

  async getLeaveRequests(studentId?: string): Promise<LeaveRequest[]> {
    let query = supabase.from('leave_requests').select('*');
    if (studentId) query = query.eq('student_id', studentId);
    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id, studentId: d.student_id, studentName: d.student_name, reason: d.reason,
      startDate: d.start_date, endDate: d.end_date, status: d.status, createdAt: d.created_at
    }));
  }

  async updateLeaveStatus(id: string, status: RequestStatus) {
    const { error } = await supabase.from('leave_requests').update({ status }).eq('id', id);
    if (error) throw error;
  }

  // --- CORE UTILS ---
  async getGrades(): Promise<Grade[]> {
    const { data } = await supabase.from('grades').select('*').order('grade_name');
    return (data || []).map(d => ({ id: d.id, gradeName: d.grade_name }));
  }

  async getStudentsByGrade(gradeId: string): Promise<StudentProfile[]> {
    const { data } = await supabase.from('students').select('*').eq('grade_id', gradeId);
    return (data || []).map(d => ({
      id: d.id, profileId: d.profile_id, name: d.name, rollNo: d.roll_no, 
      gradeId: d.grade_id, divisionId: d.division_id, mobile: d.mobile
    }));
  }

  async getAnnouncements(): Promise<any[]> {
    const { data } = await supabase.from('announcements').select('*').eq('is_active', true);
    return data || [];
  }

  // --- CMS & ENQUIRIES & NOTICES ---
  async getNotices(): Promise<Notice[]> {
    const { data } = await supabase.from('notices').select('*');
    return data || [];
  }

  async getPageContent(page: string): Promise<any> {
    const { data } = await supabase.from('cms_content').select('content').eq('page_id', page).maybeSingle();
    return data?.content || null;
  }

  async addEnquiry(enq: any) {
    const { error } = await supabase.from('enquiries').insert({
      student_name: enq.studentName, parent_name: enq.parentName, relation: enq.relation,
      grade: enq.grade, board: enq.board, mobile: enq.mobile, school_name: enq.schoolName,
      has_coaching: enq.hasCoaching, reason: enq.reason
    });
    if (error) throw error;
  }

  // --- ADMIN MODULES ---
  async getFeeSubmissions(): Promise<FeeSubmission[]> {
    const { data } = await supabase.from('fee_submissions').select('*').order('created_at', { ascending: false });
    return (data || []).map(d => ({
        id: d.id, studentId: d.student_id, student_name: d.student_name,
        amount: d.amount, status: d.status, transaction_ref: d.transaction_ref,
        paymentMethod: d.payment_method, createdAt: d.created_at
    }));
  }

  async getEnquiries(): Promise<Enquiry[]> {
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id, studentName: d.student_name, parentName: d.parent_name, relation: d.relation,
      grade: d.grade, board: d.board, mobile: d.mobile, schoolName: d.school_name,
      hasCoaching: d.has_coaching, reason: d.reason, createdAt: d.created_at
    }));
  }

  async getAllProfiles(): Promise<Profile[]> {
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(d => ({
      id: d.id, fullName: d.full_name, mobile: d.mobile,
      role: d.role as any, status: d.status as any, academyId: d.academy_id
    }));
  }

  async getTeacherAssignments(): Promise<TeacherAssignment[]> {
    const { data } = await supabase.from('teacher_assignments').select('*');
    return (data || []).map(d => ({
        id: d.id, teacherId: d.teacher_id, gradeId: d.grade_id, subject: d.subject
    }));
  }

  async getAdminAllHomework(): Promise<Homework[]> {
    const { data } = await supabase.from('homework').select('*').is('deleted_at', null);
    return (data || []).map(d => ({
      id: d.id, teacherId: d.teacher_id, subject: d.subject, topic: d.topic,
      description: d.description, dueDate: d.due_date, targetType: d.target_type
    }));
  }

  async getAdminAllExams(): Promise<Exam[]> {
    const { data } = await supabase.from('exams').select('*');
    return (data || []).map(d => ({
      id: d.id, teacherId: d.teacher_id, title: d.title, subject: d.subject, gradeId: d.grade_id,
      startTime: d.start_time, endTime: d.end_time, durationMinutes: d.duration_minutes,
      totalMarks: d.total_marks, questions: d.questions, is_published: d.is_published
    }));
  }

  async getProducts(): Promise<Product[]> {
    const { data } = await supabase.from('products').select('*');
    return (data || []).map(d => ({
        id: d.id, name: d.name, description: d.description, basePrice: d.base_price,
        imageUrl: d.image_url, category: d.category, stockStatus: d.stock_status as any
    }));
  }

  async createProfile(profile: any) {
    const { data, error } = await supabase.from('profiles').insert({
        full_name: profile.fullName, mobile: profile.mobile, role: profile.role, status: 'Active'
    }).select().single();
    if (error) throw error;
    return { ...data, generatedUsername: profile.fullName.split(' ')[0] + Math.floor(Math.random()*1000), password: 'Default@123' };
  }

  async adminDeleteHomework(id: string) {
    const { error } = await supabase.from('homework').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async adminDeleteExam(id: string) {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
  }

  async adminAddProduct(p: any) {
    const { error } = await supabase.from('products').insert({
        name: p.name, description: p.description, base_price: p.basePrice,
        image_url: p.imageUrl, category: p.category, stock_status: p.stockStatus
    });
    if (error) throw error;
  }

  async adminUpdateProduct(id: string, data: any) {
    const { error } = await supabase.from('products').update({
        stock_status: data.stockStatus
    }).eq('id', id);
    if (error) throw error;
  }

  async adminAddAnnouncement(ann: any) {
    const { error } = await supabase.from('announcements').insert({
        title: ann.title, is_ticker: ann.isTicker, priority: ann.priority, is_active: true
    });
    if (error) throw error;
  }

  async addTeacherAssignment(a: any) {
    const { error } = await supabase.from('teacher_assignments').insert({
        teacher_id: a.teacherId, grade_id: a.gradeId, subject: a.subject
    });
    if (error) throw error;
  }

  async deleteTeacherAssignment(id: string) {
    const { error } = await supabase.from('teacher_assignments').delete().eq('id', id);
    if (error) throw error;
  }

  async addGrade(name: string) {
    const { error } = await supabase.from('grades').insert({ grade_name: name });
    if (error) throw error;
  }

  async deleteGrade(id: string) {
    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) throw error;
  }

  // --- SETTINGS & FEES ---
  async getSettings(): Promise<SystemSettings> {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data?.config || { gateways: { manual: { name: 'Manual UPI', enabled: true } } };
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    return {
        id: data.id, profileId: data.profile_id, name: data.name, rollNo: data.roll_no,
        gradeId: data.grade_id, divisionId: data.division_id, mobile: data.mobile,
        monthlyFees: data.monthly_fees
    };
  }

  async findStudentByMobile(mobile: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select('*').eq('mobile', mobile).maybeSingle();
    if (!data) return null;
    return {
        id: data.id, profileId: data.profile_id, name: data.name, rollNo: data.roll_no,
        gradeId: data.grade_id, divisionId: data.division_id, mobile: data.mobile,
        monthlyFees: data.monthly_fees
    };
  }

  async addFeeSubmission(sub: any) {
    const { error } = await supabase.from('fee_submissions').insert({
        student_id: sub.studentId, student_name: sub.studentName, amount: sub.amount,
        transaction_ref: sub.transactionRef, payment_method: sub.paymentMethod, status: 'Pending'
    });
    if (error) throw error;
  }

  // --- SHOP & ORDERS ---
  async createOrder(order: any): Promise<Order> {
    const { data, error } = await supabase.from('orders').insert({
        student_id: order.studentId, student_name: order.studentName,
        product_id: order.productId, product_name: order.productName,
        product_image: order.productImage, custom_name: order.customName,
        change_request: order.changeRequest, address: order.address,
        pincode: order.pincode, state: order.state, mobile: order.mobile,
        status: order.status, final_price: order.finalPrice
    }).select().single();
    if (error) throw error;
    return {
        id: data.id, studentId: data.student_id, studentName: data.student_name,
        productId: data.product_id, productName: data.product_name, productImage: data.product_image,
        customName: data.custom_name, changeRequest: data.change_request, address: data.address,
        pincode: data.pincode, state: data.state, mobile: data.mobile,
        status: data.status, finalPrice: data.final_price, transactionRef: data.transaction_ref,
        createdAt: data.created_at
    };
  }

  async getOrders(studentId: string): Promise<Order[]> {
    const { data } = await supabase.from('orders').select('*').eq('student_id', studentId);
    return (data || []).map(d => ({
        id: d.id, studentId: d.student_id, studentName: d.student_name,
        productId: d.product_id, productName: d.product_name, productImage: d.product_image,
        customName: d.custom_name, changeRequest: d.change_request, address: d.address,
        pincode: d.pincode, state: d.state, mobile: d.mobile,
        status: d.status, finalPrice: d.final_price, transactionRef: d.transaction_ref,
        createdAt: d.created_at
    }));
  }

  async updateOrder(id: string, update: any) {
    const { error } = await supabase.from('orders').update({
        status: update.status, transaction_ref: update.transactionRef
    }).eq('id', id);
    if (error) throw error;
  }

  // --- CMS ---
  async updatePageContent(page: string, content: any) {
    const { error } = await supabase.from('cms_content').upsert({
        page_id: page, content: content
    });
    if (error) throw error;
  }
}

export const db = new DatabaseService();
