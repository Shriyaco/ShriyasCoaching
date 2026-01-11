
export type UserRole = 'admin' | 'teacher' | 'student';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type TargetType = 'Academy' | 'Grade' | 'Individual';
export type QuestionType = 'mcq' | 'short' | 'long';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type DoubtStatus = 'Open' | 'Resolved';

// User interface for authentication and sessions
export interface User {
  id: string;
  username: string;
  role: UserRole;
  mobile?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
}

export interface Grade {
  id: string;
  gradeName: string;
}

export interface Division {
  id: string;
  gradeId: string;
  divisionName: string;
}

export interface Profile {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  academyId: string;
}

export interface StudentProfile {
  id: string;
  profileId: string;
  name: string;
  rollNo: string;
  gradeId: string;
  divisionId: string;
  mobile: string;
  monthlyFees?: string;
  studentCustomId?: string;
}

// Alias Student to StudentProfile as used in PayFees
export interface Student extends StudentProfile {}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  gradeId: string;
  subject: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

export interface Homework {
  id: string;
  teacherId: string;
  subject: string;
  topic: string;
  description: string;
  dueDate: string;
  attachmentUrl?: string;
  targetType: 'Grade' | 'Individual';
  targetGradeId?: string;
  targetStudentId?: string;
  deletedAt?: string;
  academyId?: string;
}

export interface Exam {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  targetType: TargetType;
  targetId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarkingFactor: number;
  isPublished: boolean;
  deletedAt?: string;
  academyId?: string;
}

export interface Enquiry {
  id: string;
  studentName: string;
  parentName: string;
  relation: string;
  grade: string;
  board: string;
  mobile: string;
  createdAt: string;
  schoolName?: string;
  hasCoaching?: boolean;
  coachingName?: string;
  shiftingReason?: string;
  expectations?: string;
  reason?: string;
}

export interface FeeSubmission {
  id: string;
  student_id: string;
  student_name: string;
  amount: string;
  status: RequestStatus;
  transaction_ref: string;
  payment_method: string;
  created_at: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  subject: string;
  question: string;
  status: DoubtStatus;
  answer?: string;
  createdAt: string;
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
}

export interface GatewayConfig {
  name: string;
  enabled: boolean;
}

export interface SystemSettings {
  id?: string;
  googleSiteKey?: string;
  gateways: Record<string, GatewayConfig>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  category: string;
  stockStatus: string;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  productId: string;
  productName: string;
  productImage: string;
  customName?: string;
  changeRequest?: string;
  address: string;
  pincode: string;
  state: string;
  mobile: string;
  status: string;
  finalPrice: string;
  transactionRef?: string;
  createdAt: string;
}

export type TabView = 'dashboard' | 'notices' | 'grades' | 'fees' | 'settings' | 'enquiries' | 'shop' | 'products' | 'broadcast' | 'users' | 'mapping' | 'homework' | 'exams' | 'notes' | 'doubts' | 'attendance';
