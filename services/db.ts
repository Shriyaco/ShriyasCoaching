
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Grade, Subdivision, Notice, User, FeeSubmission, SystemSettings, Enquiry, Product, Order, StudentNotification, Student } from '../types';

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

class DatabaseService {
  
  async login(username: string, password: string): Promise<User | null> {
    if (username === 'Admin' && password === 'Reset@852') {
      return { id: 'admin1', username: 'Shriya Admin', role: 'admin', status: 'Active' };
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
  }

  async getSettings(): Promise<SystemSettings> { 
      const { data } = await supabase.from('system_settings').select('*').single();
      const defaultGateways: any = {
          manual: { name: 'Manual UPI', enabled: true, credentials: { upiId: '' } },
          phonepe: { name: 'PhonePe', enabled: false, credentials: { merchantId: '', saltKey: '', saltIndex: '1' } }
      };
      if (!data) return { googleSiteKey: '', gateways: defaultGateways };
      return { googleSiteKey: data.google_site_key || '', gateways: data.payment_config || defaultGateways };
  }

  async updateSettings(s: SystemSettings) { 
      await supabase.from('system_settings').update({ google_site_key: s.googleSiteKey, payment_config: s.gateways }).eq('id', 1);
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
      await supabase.from('products').insert({
          name: data.name,
          description: data.description,
          base_price: data.basePrice,
          category: data.category,
          stock_status: data.stockStatus,
          image_url: data.imageUrl
      });
  }

  async updateProduct(id: string, data: Partial<Product>) {
      const payload: any = {};
      if (data.name) payload.name = data.name;
      if (data.description) payload.description = data.description;
      if (data.basePrice) payload.base_price = data.basePrice;
      if (data.category) payload.category = data.category;
      if (data.stockStatus) payload.stock_status = data.stockStatus;
      if (data.imageUrl) payload.image_url = data.imageUrl;
      await supabase.from('products').update(payload).eq('id', id);
  }

  async deleteProduct(id: string) {
      await supabase.from('products').delete().eq('id', id);
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt'>) {
      const { data: res, error } = await supabase.from('shop_orders').insert({
          student_id: data.studentId,
          student_name: data.studentName,
          product_id: data.productId,
          product_name: data.productName,
          product_image: data.productImage,
          custom_name: data.customName,
          // Fixed property mapping from snake_case to camelCase
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

  async pushNotification(data: Omit<StudentNotification, 'id' | 'createdAt'>) {
      await supabase.from('app_notifications').insert({
          target_type: data.targetType,
          target_id: data.targetId,
          type: data.type,
          title: data.title,
          message: data.message
      });
  }

  // Added missing method to retrieve student by ID
  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      mobile: data.mobile,
      gradeId: data.grade_id,
      studentCustomId: data.student_custom_id,
      monthlyFees: data.monthly_fees
    };
  }

  // Added missing method to find student by mobile number for guest lookups
  async findStudentByMobile(mobile: string): Promise<Student | null> {
    const { data, error } = await supabase.from('students').select('*').eq('mobile', mobile).single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      mobile: data.mobile,
      gradeId: data.grade_id,
      studentCustomId: data.student_custom_id,
      monthlyFees: data.monthly_fees
    };
  }

  // Added missing method to record a new fee submission
  async addFeeSubmission(data: Omit<FeeSubmission, 'id' | 'status' | 'date'>) {
    const { error } = await supabase.from('fee_submissions').insert({
      student_id: data.studentId,
      student_name: data.studentName,
      amount: data.amount,
      transaction_ref: data.transactionRef,
      payment_method: data.paymentMethod,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
    if (error) throw error;
  }
}

export const db = new DatabaseService();
