export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  interests?: string[];
}

export interface Group {
  group_id: number;
  group_name: string;
  description: string;
  created_at: string;
  member_count: number;
  interests?: string[];
  message_count?: number;
  event_count?: number;
  is_member?: boolean;
}

export interface GroupMember {
  group_id: number;
  user_id: number;
  joined_at: string;
  role: string;
}

export interface Friend {
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
} 