
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
  role: 'admin';
  status?: 'Active' | 'Suspended';
  imageUrl?: string;
}

// Added Student interface to support student-related features and payment portal
export interface Student {
  id: string;
  name: string;
  mobile: string;
  gradeId: string;
  studentCustomId: string;
  monthlyFees?: string;
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

export interface StudentNotification {
    id: string;
    targetType: 'all' | 'grade' | 'division' | 'student';
    targetId?: string; 
    type: 'fee' | 'announcement' | 'notice';
    title: string;
    message: string;
    createdAt: string;
}

export type TabView = 'dashboard' | 'notices' | 'grades' | 'fees' | 'settings' | 'enquiries' | 'shop' | 'products' | 'broadcast';
