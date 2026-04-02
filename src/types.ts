import { Timestamp } from 'firebase/firestore';

export interface Post {
  id?: string;
  title: string;
  content: string;
  category: string;
  createdAt: Timestamp | Date;
  authorUid: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
}

export interface SiteSettings {
  name: string;
  facebook: string;
  whatsapp: string;
  gmail: string;
}
