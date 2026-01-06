
export interface Grade {
  id: string;
  gradeName: string;
  hasSubdivision: boolean;
}

export interface Subdivision {
  id: string;
  gradeId: string;
  divisionName: string;
  isLive?: boolean;
  liveMeetingId?: string;
}

export interface Student {
  id: string;
  studentCustomId: string;
  name: string;
  mobile: string;
  parentName: string;
  gradeId: string;
  subdivisionId: string;
  joiningDate: string;
  dob?: string;
  imageUrl?: string;
  totalFees: string;
  monthlyFees: string; 
  schoolName: string; 
  address: string; 
  feesStatus: 'Paid' | 'Pending' | 'Overdue';
  status: 'Active' | 'Suspended';
  password?: string;
  email?: string;
}

export interface Teacher {
  id: string;
  teacherCustomId: string;
  name: string;
  mobile: string;
  gradeId: string;
  subdivisionId: string;
  joiningDate: string;
  status: 'Active' | 'Suspended';
  specialization: string;
  password?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'student' | 'teacher';
  divisionId?: string; 
  status?: 'Active' | 'Suspended';
  imageUrl?: string;
}

export interface FeeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  amount: string;
  transactionRef: string;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export interface GatewayConfig {
    name: string;
    enabled: boolean;
    credentials: Record<string, string>;
}

export interface SystemSettings {
  googleSiteKey: string;
  gateways: Record<string, GatewayConfig>;
}

export interface TimetableEntry {
  id: string;
  divisionId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  subject: string;
  teacherName?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  divisionId: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface Homework {
  id: string;
  gradeId: string;
  subdivisionId: string;
  targetType: 'Grade' | 'Division' | 'Individual';
  targetStudentId?: string;
  subject: string;
  task: string;
  dueDate: string;
  assignedBy: string;
}

export interface HomeworkSubmission {
    id: string;
    homeworkId: string;
    studentId: string;
    submissionText: string;
    imageUrl?: string; 
    submittedAt: string;
    status: 'Submitted' | 'Reviewed';
}

export interface Question {
    id: string;
    text: string;
    type: 'short' | 'mcq' | 'paragraph';
    marks: number;
    options?: string[]; // 4 options for OMR/MCQ
}

export interface Exam {
    id: string;
    title: string;
    gradeId: string;
    subdivisionId: string;
    subject: string;
    examDate: string;
    startTime: string;
    duration: number;
    totalMarks: number;
    questions: Question[];
    reopenable: boolean;
    createdBy: string;
}

export interface ExamSubmission {
    id: string;
    examId: string;
    studentId: string;
    studentName?: string;
    answers: Record<string, string>;
    marksAwarded?: Record<string, number>;
    totalObtained?: number;
    submittedAt: string;
    status: 'Submitted' | 'Graded';
}

export interface ExamResult {
    id: string;
    examId: string;
    studentId: string;
    marksObtained: number;
    percentage: number;
    status: 'Pass' | 'Fail';
}

export interface StudentQuery {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    queryText: string;
    status: 'Unanswered' | 'Answered';
    replyText?: string;
    createdAt: string;
}

export interface Enquiry {
    id: string;
    studentName: string;
    parentName: string;
    relation: string;
    grade: string;
    schoolName: string;
    hasCoaching: boolean;
    reason: string;
    mobile: string;
    connectTime: string;
    createdAt: string;
    status: 'New' | 'Contacted';
}

export interface Product {
    id: string;
    name: string;
    description: string;
    basePrice: string;
    category: string;
    stockStatus: 'In Stock' | 'Out of Stock';
    imageUrl?: string;
}

export interface Order {
    id: string;
    studentId: string;
    studentName: string;
    productId: string;
    productName: string;
    productImage?: string;
    customName: string;
    changeRequest: string;
    address: string;
    pincode: string;
    state: string;
    mobile: string;
    status: 'Payment Pending' | 'Payment Under Verification' | 'Processing Order' | 'Completed' | 'Rejected';
    finalPrice: string;
    transactionRef?: string;
    createdAt: string;
}

export interface StudyNote {
  id: string;
  gradeId: string;
  divisionId: string;
  targetType: 'Grade' | 'Individual';
  targetStudentId?: string;
  subject: string;
  title: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  teacherId: string;
}

export interface StudentNotification {
    id: string;
    targetType: 'all' | 'grade' | 'division' | 'student';
    targetId?: string; 
    type: 'fee' | 'announcement' | 'notice';
    title: string;
    message: string;
    createdAt: string;
}

export type TabView = 'dashboard' | 'students' | 'notices' | 'timetable' | 'grades' | 'teachers' | 'fees' | 'settings' | 'enquiries' | 'shop' | 'products' | 'broadcast' | 'homework' | 'exams';

export interface StudentOwnExam {
    id: string;
    studentId: string;
    studentName: string;
    gradeId: string;
    subdivisionId: string;
    subject: string;
    examDate: string;
    description: string;
}

export interface LeaveApplication {
    id: string;
    studentId: string;
    studentName: string;
    gradeId: string;
    subdivisionId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}
