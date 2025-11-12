// index.ts

// ===== CORE AVIATION BAY REPORTING INTERFACES =====
export interface DetectedJet {
  jetType: string
  confidence: number
  description: string
}

export interface JetCategory {
  id: string
  name: string // 'Fighter Jet', 'Commercial Airliner', etc.
  description: string
  color: string
  icon: string
}

export interface JetReport {
  id: string
  image: string
  jetTypes: string[] // Types detected (e.g. fighter, airliner, etc.)
  comments: string
  detectedJets: DetectedJet[]
  timestamp: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  userId?: string
  submissionType?: 'manual' | 'ai-only'
}

export interface GeminiJetResponse {
  jets: DetectedJet[]
}

// ===== COMPONENT PROPS INTERFACES =====
export interface CameraCaptureProps {
  onImageCapture: (imageDataUrl: string) => void
}

export interface JetCategoriesProps {
  selectedJetTypes: string[]
  onSelectionChange: (jetTypes: string[]) => void
}

export interface AIAnalysisProps {
  detectedJets: DetectedJet[]
  isAnalyzing: boolean
}

// ===== COMMUNITY & REVIEWS INTERFACES =====
export interface SpotterReview {
  id: string
  reportId: string
  title: string
  description: string
  jetType: string
  status: 'completed' | 'in-progress' | 'pending' | 'rejected'
  beforeImage?: string
  afterImage?: string
  location: {
    lat: number
    lng: number
    address: string
  }
  completedDate: string
  rating: number // 1-5 stars
  platformResponse?: string
  likes: number
  comments: SpotterComment[]
  createdAt: string
  updatedAt: string
}

export interface SpotterComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  replies: SpotterReply[]
  createdAt: string
  updatedAt: string
}

export interface SpotterReply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  createdAt: string
}

// ===== USER AUTHENTICATION & PROFILE INTERFACES =====
export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  joinedDate: string
  isVerified: boolean
}

export interface User extends AuthUser {
  totalReports: number
  uniqueJetsSpotted: number
  badges: UserBadge[]
  preferences: UserPreferences
}

export interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
  category: 'spotter' | 'community' | 'expert'
}

export interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    showProfile: boolean
    showReports: boolean
  }
  language: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>
}

// ===== USER REPORTS & TRACKING INTERFACES =====
export interface UserJetReport extends JetReport {
  status: 'submitted' | 'acknowledged' | 'reviewed' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  updates: JetReportUpdate[]
  spotterRating?: number
  feedback?: string
}

export interface JetReportUpdate {
  id: string
  timestamp: string
  status: string
  message: string
  updatedBy: string
  attachments?: string[]
}

export interface ReportDetailProps {
  report: UserJetReport
  onClose: () => void
  onBack: () => void
}

// ===== ADMIN PANEL INTERFACES =====
export interface Jet {
  id: string
  title: string
  description: string
  jetType: 'fighter jet' | 'commercial airliner' | 'helicopter' | 'drone' | 'cargo aircraft'
  status: 'pending' | 'approved' | 'reviewed' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location: {
    lat: number
    lng: number
    address: string
    airfield?: string
    region?: string
  }
  images: string[]
  reportedBy: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  createdAt: Date
  updatedAt: Date
  notes: JetNote[]
  attachments?: string[]
  spotterRating?: number
  resolutionSummary?: string
  tags?: string[]
}

export interface JetNote {
  id: string
  jetId: string
  authorId: string
  authorName: string
  authorRole: 'spotter' | 'admin' | 'expert'
  content: string
  isInternal: boolean
  createdAt: Date
  attachments?: string[]
}

export interface JetCategoryStats {
  jetType: string
  count: number
  percentage: number
}

// Extend as needed for additional admin/analytics interfaces...
