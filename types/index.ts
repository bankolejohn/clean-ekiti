export interface Report {
  id: string
  category: 'dumping' | 'flooding' | 'pollution' | 'drainage' | 'other'
  description?: string
  image_url?: string
  latitude: number
  longitude: number
  status: 'pending' | 'investigating' | 'resolved'
  reporter_email?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  email: string
  password_hash: string
  created_at: string
}

export interface CreateReportData {
  category: Report['category']
  description?: string
  image?: File
  latitude: number
  longitude: number
  reporter_email?: string
}