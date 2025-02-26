
export interface Location {
  latitude: number;
  longitude: number;
  user_id: string;
  is_company?: boolean;
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

export interface BusinessProfile {
  id: number;
  user_id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  phone_number: string | null;
  website: string | null;
  open_hours: string | null;
  delivery_available: boolean;
  logo_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface MapFilter {
  showBusinesses: boolean;
  showUsers: boolean;
}
