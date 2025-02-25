
export interface Location {
  latitude: number;
  longitude: number;
  user_id: string;
  is_company?: boolean;
  company_name?: string;
}

export interface NearbyUser {
  user_id: string;
  is_company?: boolean;
  company_name?: string;
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
