

export interface Grade {
  id: string;
  gradeName: string;
  hasSubdivision: boolean;
}

export interface Subdivision {
  id: string;
  gradeId: string;
  divisionName: string;
}

export interface Student {
  id: string;
  studentCustomId: string; // Auto-generated
  name: string;
  mobile: string;
  parentName: string;
  gradeId: string;
  subdivisionId: string;
  joiningDate: string;
  dob?: string; // New field
  imageUrl?: string; // New field (Base64)
  totalFees: string; // Kept for legacy/total calculation
  monthlyFees: string; 
  schoolName: string; 
  address: string; 
  feesStatus: 'Paid' | 'Pending' | 'Overdue';
  status: 'Active' | 'Suspended';
  password?: string; // In real app, this is hashed
  email?: string; // Kept for legacy compatibility if needed
}

export interface Teacher {
  id: string;
  teacherCustomId: string; // Auto-generated
  name: string;
  mobile: string;
  gradeId: string;
  subdivisionId: string;
  joiningDate: string;
  status: 'Active' | 'Suspended';
  specialization: string; // Kept for UI display
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
    name: string; // Display Name e.g. "PhonePe"
    enabled: boolean;
    credentials: Record<string, string>; // Flexible Key-Value pairs
}

export interface SystemSettings {
  googleSiteKey: string;
  gateways: Record<string, GatewayConfig>; // key: 'manual', 'phonepe', etc.
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

export interface LiveClass {
  id: string;
  divisionId: string;
  title: string;
  meetingLink: string;
  scheduledAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  divisionId: string;
  date: string;
  status: 'Present' | 'Absent';
}

// --- New Modules ---

export interface Homework {
  id: string;
  gradeId: string;
  subdivisionId: string;
  subject: string;
  task: string;
  dueDate: string;
  assignedBy: string; // Teacher ID
}

export interface HomeworkSubmission {
    id: string;
    homeworkId: string;
    studentId: string;
    submissionText: string;
    submittedAt: string;
    status: 'Submitted' | 'Reviewed';
}

export interface Question {
    id: string;
    text: string;
    type: 'short' | 'mcq' | 'paragraph';
    marks: number;
}

export interface Exam {
    id: string;
    title: string; // New: Exam Name
    gradeId: string;
    subdivisionId: string;
    subject: string;
    examDate: string;
    startTime: string; // New: HH:mm
    duration: number; // New: Minutes
    totalMarks: number;
    questions: Question[];
    createdBy: string;
}

export interface ExamSubmission {
    id: string;
    examId: string;
    studentId: string;
    answers: Record<string, string>; // questionId -> answer text
    submittedAt: string;
    isLocked: boolean; // Prevent reopening
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
    subject: string; // e.g., Math, Science
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

export type TabView = 'dashboard' | 'students' | 'notices' | 'timetable' | 'grades' | 'teachers' | 'fees' | 'settings' | 'enquiries';