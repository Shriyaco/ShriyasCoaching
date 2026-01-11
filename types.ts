
export type UserRole = 'admin' | 'teacher' | 'student';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type TargetType = 'Academy' | 'Grade' | 'Individual';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type DoubtStatus = 'Open' | 'Resolved';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  mobile?: string;
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
  studentCustomId?: string;
}

// Added Student interface
export interface Student extends StudentProfile {
  monthlyFees?: string;
}

export interface Grade {
  id: string;
  gradeName: string;
}

export interface Homework {
  id: string;
  teacherId: string;
  subject: string;
  topic: string;
  description: string;
  dueDate: string;
  targetType: 'Grade' | 'Individual';
  targetGradeId?: string;
  targetStudentId?: string;
  deletedAt?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: 'Submitted' | 'Graded';
  remarks?: string;
  grade?: string;
}

export interface Exam {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  gradeId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  questions: any[];
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  totalMarks: number;
  remarks?: string;
  submittedAt: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  question: string;
  answer?: string;
  status: DoubtStatus;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
  createdAt: string;
}

// Added Notice interface
export interface Notice {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
}

// Added Enquiry interface
export interface Enquiry {
  id: string;
  studentName: string;
  parentName: string;
  relation: string;
  grade: string;
  board: string;
  mobile: string;
  schoolName: string;
  hasCoaching: boolean;
  reason: string;
  createdAt: string;
}

// Added TeacherAssignment interface
export interface TeacherAssignment {
  id: string;
  teacherId: string;
  gradeId: string;
  subject: string;
}

// Added Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  category: string;
  stockStatus: 'In Stock' | 'Sold Out';
}

// Added Order interface
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

// Added FeeSubmission interface
export interface FeeSubmission {
  id: string;
  studentId: string;
  student_name: string;
  amount: string;
  status: RequestStatus;
  transaction_ref: string;
  paymentMethod: string;
  createdAt: string;
}

// Added GatewayConfig interface
export interface GatewayConfig {
  name: string;
  enabled: boolean;
}

// Added SystemSettings interface
export interface SystemSettings {
  gateways: Record<string, GatewayConfig>;
}

export type TabView = 
  | 'dashboard' | 'attendance' | 'homework' | 'exams' 
  | 'doubts' | 'leave' | 'external' | 'settings' 
  | 'users' | 'mapping' | 'grades' | 'products' | 'broadcast' | 'enquiries' | 'fees';
