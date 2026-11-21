import axios from 'axios';
import type {
  AdminAnalytics,
  AdminDashboardStats,
  AuthResponse,
  ClassificationResult,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  Feedback,
  MapComplaint,
  NotificationItem,
  PagedResponse,
  PublicStats,
  User,
} from '../types';

const TOKEN_KEY = 'civicpulse_jwt';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const serverMessage =
      (err.response?.data as { error?: string; message?: string } | undefined)?.error ||
      (err.response?.data as { message?: string } | undefined)?.message;
    throw new Error(serverMessage || err.message || 'Network request failed');
  }
  throw err instanceof Error ? err : new Error('Unexpected error');
}

export const api = {
  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    ward?: string;
  }): Promise<AuthResponse> {
    try {
      const { data } = await http.post<AuthResponse>('/api/auth/register', payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const { data } = await http.post<AuthResponse>('/api/auth/login', payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getCitizenProfile(): Promise<User> {
    try {
      const { data } = await http.get<User>('/api/citizen/profile');
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getCitizenComplaints(params?: {
    status?: ComplaintStatus | '';
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Complaint>> {
    try {
      const query: Record<string, string | number> = {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
      };
      if (params?.status) query.status = params.status;
      const { data } = await http.get<PagedResponse<Complaint>>('/api/citizen/complaints', {
        params: query,
      });
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getCitizenComplaintById(id: number): Promise<Complaint> {
    try {
      const { data } = await http.get<Complaint>(`/api/citizen/complaints/${id}`);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async createComplaint(formData: FormData): Promise<Complaint> {
    try {
      const { data } = await http.post<Complaint>('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async trackComplaint(trackingCode: string): Promise<Complaint> {
    try {
      const { data } = await http.get<Complaint>(
        `/api/complaints/track/${encodeURIComponent(trackingCode.trim())}`
      );
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getPublicRecentComplaints(): Promise<Complaint[]> {
    try {
      const { data } = await http.get<Complaint[]>('/api/complaints/public');
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getMapComplaints(params?: {
    status?: ComplaintStatus | '';
    category?: ComplaintCategory | '';
    priority?: ComplaintPriority | '';
  }): Promise<MapComplaint[]> {
    try {
      const query: Record<string, string> = {};
      if (params?.status) query.status = params.status;
      if (params?.category) query.category = params.category;
      if (params?.priority) query.priority = params.priority;
      const { data } = await http.get<MapComplaint[]>('/api/complaints/map', {
        params: query,
      });
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async classifyComplaint(payload: { title: string; description?: string }): Promise<ClassificationResult> {
    try {
      const { data } = await http.post<ClassificationResult>('/api/complaints/classify', payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getPublicStats(): Promise<PublicStats> {
    try {
      const { data } = await http.get<PublicStats>('/api/public/stats');
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async submitFeedback(
    complaintId: number,
    payload: { rating: number; comment: string }
  ): Promise<Feedback> {
    try {
      const { data } = await http.post<Feedback>(`/api/complaints/${complaintId}/feedback`, payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getAdminDashboard(): Promise<AdminDashboardStats> {
    try {
      const { data } = await http.get<AdminDashboardStats>('/api/admin/dashboard');
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    try {
      const { data } = await http.get<AdminAnalytics>('/api/admin/analytics');
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getAdminComplaints(params?: {
    status?: ComplaintStatus | '';
    category?: ComplaintCategory | '';
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Complaint>> {
    try {
      const query: Record<string, string | number> = {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
      };
      if (params?.status) query.status = params.status;
      if (params?.category) query.category = params.category;
      if (params?.search) query.search = params.search;

      const { data } = await http.get<PagedResponse<Complaint>>('/api/admin/complaints', {
        params: query,
      });
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getAdminComplaintById(id: number): Promise<Complaint> {
    try {
      const { data } = await http.get<Complaint>(`/api/admin/complaints/${id}`);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async updateComplaintStatus(
    id: number,
    payload: { status: ComplaintStatus; remark: string }
  ): Promise<Complaint> {
    try {
      const { data } = await http.put<Complaint>(`/api/admin/complaints/${id}/status`, payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async assignComplaint(
    id: number,
    payload: {
      department: string;
      teamName: string;
      officerName?: string;
      officerContact?: string;
      notes?: string;
    }
  ): Promise<Complaint> {
    try {
      const { data } = await http.put<Complaint>(`/api/admin/complaints/${id}/assign`, payload);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  // Notification API
  async getNotifications(page = 0, size = 20): Promise<PagedResponse<NotificationItem>> {
    try {
      const { data } = await http.get<PagedResponse<NotificationItem>>('/api/notifications', {
        params: { page, size },
      });
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const { data } = await http.get<{ unreadCount: number }>('/api/notifications/unread-count');
      return data.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id: number): Promise<NotificationItem> {
    try {
      const { data } = await http.put<NotificationItem>(`/api/notifications/${id}/read`);
      return data;
    } catch (err) {
      extractError(err);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await http.put('/api/notifications/read-all');
    } catch (err) {
      extractError(err);
    }
  },
};
