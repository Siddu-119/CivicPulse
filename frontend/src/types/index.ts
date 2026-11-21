export type Role = 'CITIZEN' | 'ADMIN';

export type ComplaintCategory =
  | 'ROADS_POTHOLES'
  | 'GARBAGE_COLLECTION'
  | 'STREETLIGHTS'
  | 'WATER_LEAKAGE'
  | 'DRAINAGE'
  | 'PUBLIC_SANITATION'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  ward?: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Assignment {
  id: number;
  department: string;
  teamName: string;
  officerName?: string;
  officerContact?: string;
  notes?: string;
  assignedByName: string;
  assignedAt: string;
  updatedAt: string;
}

export interface ComplaintUpdate {
  id: number;
  status: ComplaintStatus;
  remark: string;
  updatedByName: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  citizenName: string;
  trackingCode: string;
  complaintTitle: string;
  createdAt: string;
}

export interface Complaint {
  id: number;
  trackingCode: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  address: string;
  landmark?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  imagePath?: string;
  citizenName: string;
  citizenEmail?: string;
  citizenPhone?: string;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  updates: ComplaintUpdate[];
  feedback?: Feedback;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminDashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  averageRating: number;
  categoryBreakdown: Record<string, number>;
  recentFeedback: Feedback[];
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  resolved: number;
}

export interface AdminAnalytics {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  rejectedComplaints: number;
  resolutionRate: number;
  averageRating: number;
  averageResolutionHours: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  departmentWorkload: Record<string, number>;
  statusDistribution: Record<string, number>;
  monthlyTrends: MonthlyTrend[];
}

export interface PublicStats {
  totalComplaints: number;
  resolvedComplaints: number;
  activeComplaints: number;
  averageRating: number;
}

export interface MapComplaint {
  id: number;
  trackingCode: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  address: string;
  ward?: string;
  latitude: number;
  longitude: number;
  imagePath?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  complaintId?: number;
  trackingCode?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ClassificationResult {
  category: ComplaintCategory;
  priority: ComplaintPriority;
  department: string;
  confidenceScore: number;
  detectedKeywords: string[];
  reason: string;
}
