
export interface Location {
  latitude: number;
  longitude: number;
  user_id: string;
}

export interface NearbyUser {
  user_id: string;
  is_company?: boolean;
}

export const LATVIA_CENTER = {
  lng: 24.105186,
  lat: 56.946285,
  zoom: 7
};

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface HotDeal {
  id: string;
  user_id: string;
  company_name: string;
  title: string;
  description: string;
  start_time: string;
  duration_hours: number;
  image_url: string;
  created_at: string;
}

export interface LocationWithProfile {
  latitude: number;
  longitude: number;
  user_id: string;
  is_company: boolean;
}
