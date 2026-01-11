
export type UserRole = 'admin' | 'teacher' | 'student';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type TargetType = 'Academy' | 'Grade' | 'Individual';
export type QuestionType = 'mcq' | 'short' | 'long';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type DoubtStatus = 'Open' | 'Resolved';

export interface Grade {
  id: string;
  gradeName: string;
}

export interface Division {
  id: string;
  gradeId: string;
  divisionName: string;
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

// Added alias for Student
export type Student = StudentProfile;

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
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string;
  attachmentUrl?: string;
  submittedAt: string;
  isChecked: boolean;
  remarks?: string;
}

export interface Exam {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  targetType: TargetType;
  targetId: string; // Grade ID or Student ID
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarkingFactor: number;
  isPublished: boolean;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // Only for MCQ
  correctAnswer: string;
  marks: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startAt: string;
  submittedAt?: string;
  totalObtained?: number;
}

export interface ExamResponse {
  id: string;
  attemptId: string;
  questionId: string;
  studentAnswer: string;
  marksAwarded?: number;
  teacherRemarks?: string;
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: RequestStatus;
  teacherRemarks?: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  subject: string;
  question: string;
  attachmentUrl?: string;
  reply?: string;
  status: DoubtStatus;
  createdAt: string;
}

export interface StudyNote {
  id: string;
  teacherId: string;
  gradeId: string;
  title: string;
  fileUrl: string;
  version: number;
  createdAt: string;
}

export interface SchoolExam {
  id: string;
  studentId: string;
  subject: string;
  examDate: string;
  description: string;
}

// Existing Generic Types for Admin/Public
export interface User {
  id: string;
  username: string;
  role: UserRole;
  status?: 'Active' | 'Suspended';
  mobile?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

// Added missing interfaces for Admin and Shop
export interface Enquiry {
  id: string;
  studentName: string;
  parentName: string;
  relation: string;
  grade: string;
  board: string;
  schoolName: string;
  hasCoaching: boolean;
  coachingName?: string;
  shiftingReason?: string;
  expectations?: string;
  mobile: string;
  connectTime: string;
  reason: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: string;
  imageUrl: string;
  description: string;
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

export interface FeeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  amount: string;
  status: RequestStatus;
  transactionRef: string;
  paymentMethod: string;
  createdAt: string;
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

export type TabView = 'dashboard' | 'notices' | 'grades' | 'fees' | 'settings' | 'enquiries' | 'shop' | 'products' | 'broadcast' | 'homework' | 'exams' | 'attendance' | 'leaves' | 'doubts' | 'notes';
