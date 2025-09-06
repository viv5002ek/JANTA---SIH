export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

export interface PublicAdmin {
  id: string;
  email: string;
  district: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  district: string;
  sector_number: string;
  address_line: string;
  latitude?: number;
  longitude?: number;
  status: 'submitted' | 'in_progress' | 'resolved' | 'false_complaint';
  images?: string[];
  assigned_admin?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReassignmentRequest {
  id: string;
  report_id: string;
  requesting_admin: string;
  suggested_category: string;
  suggested_district: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'public_admin' | 'citizen';