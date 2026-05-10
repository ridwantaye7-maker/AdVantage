export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  balance: number;
  isVerified: boolean;
  createdAt: number;
}

export type AdStatus = 'pending' | 'active' | 'rejected' | 'paused' | 'expired';

export interface Advertisement {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link: string;
  category: string;
  targeting: {
    country: string;
    city?: string;
  };
  budget: number;
  spend: number;
  duration: number;
  status: AdStatus;
  rejectionReason?: string;
  stats: {
    views: number;
    clicks: number;
  };
  createdAt: number;
  approvedAt?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'spend' | 'refund';
  method: 'google_pay' | 'google_play' | 'internal';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: number;
}
