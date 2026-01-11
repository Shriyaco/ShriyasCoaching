
import { supabase } from './supabase';
import { 
  Grade, StudentProfile, AttendanceRecord, Profile,
  TeacherAssignment, User, Notice, Division,
  Enquiry, SystemSettings, RequestStatus, Student, Product, Order,
  Homework, Exam, Doubt
} from '../types';

class DatabaseService {
  
  // --- AUTH & PROFILES ---
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!data) return null;
    return {
      id: data.id,
      fullName: data.full_name,
      mobile: data.mobile,
      role: data.role as any,
      status: data.status as any,
      academyId: data.academy_id || 'SHRIYA_MAIN'
    };
  }

  /**
   * Legacy Account Creation Format:
   * Username: First 3 of Name + First 3 of Mobile
   * Password: Full Mobile Number
   */
  async createProfile(p: { fullName: string; mobile: string; role: string }) {
    // 1. Generate Credentials
    const cleanName = p.fullName.replace(/\s/g, '').substring(0, 3);
    const cleanMobPrefix = p.mobile.substring(0, 3);
    const generatedUsername = `${cleanName}${cleanMobPrefix}`;
    const generatedEmail = `${generatedUsername.toLowerCase()}@shriyasgurukul.in`;
    const password = p.mobile;

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: generatedEmail,
      password: password,
      options: {
        data: {
          full_name: p.fullName,
          role: p.role
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Auth creation failed");

    // 3. Create Public Profile
    const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id, 
      full_name: p.fullName,
      mobile: p.mobile,
      role: p.role,
      status: 'Active',
      academy_id: 'SHRIYA_MAIN'
    }).select().single();

    if (profileError) throw profileError;

    // 4. Create Student Specific Record (Crucial for profile_id mapping)
    if (p.role === 'student') {
        const { error: studentError } = await supabase.from('students').insert({
            profile_id: authData.user.id,
            name: p.fullName,
            mobile: p.mobile,
            student_custom_id: `SID-${Math.floor(1000 + Math.random() * 9000)}`
        });
        if (studentError) console.error("Student specific record failed:", studentError);
    }
    
    return { ...profileData, generatedUsername, password };
  }

  async login(username: string, password: string): Promise<User | null> {
    const loginEmail = username.includes('@') ? username : `${username.toLowerCase()}@shriyasgurukul.in`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });
    
    if (error) {
      if (username === 'Admin' && password === 'Reset@852') {
        return { id: 'admin1', username: 'Shriya Admin', role: 'admin' };
      }
      return null;
    }

    const profile = await this.getCurrentProfile();
    if (profile) return { id: profile.id, username: profile.fullName, role: profile.role, mobile: profile.mobile };
    return null;
  }

  // --- ADMIN: OVERSIGHT & AUDIT ---
  private async logAction(action: string, table: string, id: string, payload: any = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      admin_id: user?.id,
      action_type: action,
      target_table: table,
      target_id: id,
      payload
    });
  }

  async getAdminAllHomework(): Promise<Homework[]> {
    const { data } = await supabase.from('homework')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async adminDeleteHomework(id: string) {
    const { error } = await supabase.from('homework')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_HOMEWORK', 'homework', id);
  }

  async getAdminAllExams(): Promise<Exam[]> {
    const { data } = await supabase.from('exams')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async adminDeleteExam(id: string) {
    const { error } = await supabase.from('exams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_EXAM', 'exams', id);
  }

  // --- CMS ---
  async getPageContent(page: string): Promise<any | null> {
    const { data } = await supabase.from('cms_content').select('content').eq('page_id', page).maybeSingle();
    return data?.content || null;
  }

  async updatePageContent(page: string, content: any) {
    const { error } = await supabase.from('cms_content').upsert({
      page_id: page,
      content: content,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  }

  // --- NOTICES ---
  async getNotices(): Promise<Notice[]> {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      important: d.important,
      createdAt: d.created_at
    }));
  }

  // --- STUDENTS & ATTENDANCE ---
  async getStudentsByDivision(divisionId: string): Promise<StudentProfile[]> {
    const { data } = await supabase.from('students').select('*').eq('division_id', divisionId);
    return (data || []).map(d => ({
      id: d.id,
      profileId: d.profile_id,
      name: d.name,
      rollNo: d.roll_no,
      gradeId: d.grade_id,
      divisionId: d.division_id,
      mobile: d.mobile,
      monthlyFees: d.monthly_fees,
      studentCustomId: d.student_custom_id
    }));
  }

  async markAttendance(records: any[]) {
    const { error } = await supabase.from('attendance').insert(records.map(r => ({
      student_id: r.studentId,
      date: r.date,
      status: r.status,
      marked_by: r.markedBy
    })));
    if (error) throw error;
  }

  async getStudentAttendanceSummary(studentId: string) {
    const { data } = await supabase.from('attendance').select('status').eq('student_id', studentId);
    const total = data?.length || 0;
    const present = data?.filter(d => d.status === 'Present').length || 0;
    return {
      total,
      present,
      percentage: total > 0 ? (present / total) * 100 : 0
    };
  }

  // --- SHOP ---
  async getProducts(): Promise<Product[]> {
    const { data } = await supabase.from('products').select('*').eq('is_active', true);
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      basePrice: d.base_price,
      imageUrl: d.image_url,
      category: d.category,
      stockStatus: d.stock_status
    }));
  }

  async adminAddProduct(p: Omit<Product, 'id'>) {
    const { data, error } = await supabase.from('products').insert({
      name: p.name,
      description: p.description,
      base_price: p.basePrice,
      image_url: p.imageUrl,
      category: p.category,
      stock_status: p.stockStatus,
      is_active: true
    }).select().single();
    if (error) throw error;
    await this.logAction('ADD_PRODUCT', 'products', data.id, p);
  }

  async adminUpdateProduct(id: string, updates: Partial<Product>) {
    const { error } = await supabase.from('products').update({
      name: updates.name,
      base_price: updates.basePrice,
      stock_status: updates.stockStatus,
      is_active: updates.stockStatus !== 'Archived'
    }).eq('id', id);
    if (error) throw error;
    await this.logAction('UPDATE_PRODUCT', 'products', id, updates);
  }

  // --- ANNOUNCEMENTS ---
  async getAnnouncements(): Promise<any[]> {
    const { data } = await supabase.from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async adminAddAnnouncement(a: any) {
    const { data, error } = await supabase.from('announcements').insert({
      title: a.title,
      priority: a.priority,
      is_ticker: a.isTicker,
      academy_id: 'SHRIYA_MAIN'
    }).select().single();
    if (error) throw error;
    await this.logAction('ADD_ANNOUNCEMENT', 'announcements', data.id, a);
  }

  // --- MANAGEMENT ---
  async getAllProfiles(role?: string): Promise<Profile[]> {
    let query = supabase.from('profiles').select('*');
    if (role) query = query.eq('role', role);
    const { data } = await query.order('full_name');
    return (data || []).map(d => ({
      id: d.id,
      fullName: d.full_name,
      mobile: d.mobile,
      role: d.role as any,
      status: d.status as any,
      academyId: d.academy_id
    }));
  }

  async getGrades(): Promise<Grade[]> {
    const { data } = await supabase.from('grades').select('*').order('grade_name');
    return (data || []).map(d => ({ id: d.id, gradeName: d.grade_name }));
  }

  async addGrade(name: string) {
    await supabase.from('grades').insert({ grade_name: name, academy_id: 'SHRIYA_MAIN' });
  }

  async deleteGrade(id: string) {
    await supabase.from('grades').delete().eq('id', id);
  }

  async getTeacherAssignments(): Promise<TeacherAssignment[]> {
    const { data } = await supabase.from('teacher_assignments').select('*');
    return (data || []).map(d => ({
      id: d.id,
      teacherId: d.teacher_id,
      gradeId: d.grade_id,
      subject: d.subject
    }));
  }

  async addTeacherAssignment(a: Omit<TeacherAssignment, 'id'>) {
    await supabase.from('teacher_assignments').insert({
      teacher_id: a.teacherId,
      grade_id: a.gradeId,
      subject: a.subject
    });
  }

  async deleteTeacherAssignment(id: string) {
    await supabase.from('teacher_assignments').delete().eq('id', id);
  }

  async getEnquiries(): Promise<Enquiry[]> {
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id,
      studentName: d.student_name,
      parentName: d.parent_name,
      relation: d.relation,
      grade: d.grade,
      board: d.board,
      mobile: d.mobile,
      createdAt: d.created_at
    }));
  }

  async addEnquiry(e: any) {
    const { error } = await supabase.from('enquiries').insert({
      student_name: e.studentName,
      parent_name: e.parentName,
      relation: e.relation,
      grade: e.grade,
      board: e.board,
      mobile: e.mobile,
      school_name: e.schoolName,
      has_coaching: e.hasCoaching,
      coaching_name: e.coachingName,
      shifting_reason: e.shiftingReason,
      expectations: e.expectations,
      reason: e.reason
    });
    if (error) throw error;
  }

  async getFeeSubmissions(): Promise<any[]> {
    const { data } = await supabase.from('fee_submissions').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async addFeeSubmission(s: any) {
    const { error } = await supabase.from('fee_submissions').insert({
      student_id: s.studentId,
      student_name: s.studentName,
      amount: s.amount,
      transaction_ref: s.transactionRef,
      payment_method: s.paymentMethod,
      status: 'Pending'
    });
    if (error) throw error;
  }

  async getSettings(): Promise<SystemSettings | null> {
    const { data } = await supabase.from('system_settings').select('*').single();
    return data;
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select('*').eq('id', id).single();
    if (!data) return null;
    return {
      id: data.id,
      profileId: data.profile_id,
      name: data.name,
      rollNo: data.roll_no,
      gradeId: data.grade_id,
      divisionId: data.division_id,
      mobile: data.mobile,
      monthlyFees: data.monthly_fees,
      studentCustomId: data.student_custom_id
    };
  }

  async findStudentByMobile(mobile: string): Promise<Student | null> {
    const { data } = await supabase.from('students').select('*').eq('mobile', mobile).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      profileId: data.profile_id,
      name: data.name,
      rollNo: data.roll_no,
      gradeId: data.grade_id,
      divisionId: data.division_id,
      mobile: data.mobile,
      monthlyFees: data.monthly_fees,
      studentCustomId: data.student_custom_id
    };
  }

  async createOrder(o: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const { data, error } = await supabase.from('orders').insert({
      student_id: o.studentId,
      student_name: o.studentName,
      product_id: o.productId,
      product_name: o.productName,
      product_image: o.productImage,
      custom_name: o.customName,
      change_request: o.changeRequest,
      address: o.address,
      pincode: o.pincode,
      state: o.state,
      mobile: o.mobile,
      status: o.status,
      final_price: o.finalPrice
    }).select().single();
    if (error) throw error;
    return { ...o, id: data.id, createdAt: data.created_at };
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) throw error;
  }

  async getOrders(studentId: string): Promise<Order[]> {
    const { data } = await supabase.from('orders').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    return (data || []).map(d => ({
      id: d.id,
      studentId: d.student_id,
      studentName: d.student_name,
      productId: d.product_id,
      productName: d.product_name,
      productImage: d.product_image,
      customName: d.custom_name,
      change_request: d.change_request,
      address: d.address,
      pincode: d.pincode,
      state: d.state,
      mobile: d.mobile,
      status: d.status,
      finalPrice: d.final_price,
      transactionRef: d.transaction_ref,
      createdAt: d.created_at
    }));
  }
}

export const db = new DatabaseService();
