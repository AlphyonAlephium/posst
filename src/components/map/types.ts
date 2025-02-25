
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

export const MAP_COLORS = {
  REGULAR_USER: '#FFFFFF', // White for regular users
  BUSINESS_USER: '#8B5CF6'  // Vivid Purple for business users
};
