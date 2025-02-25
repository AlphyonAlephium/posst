
export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  user_id: string;
}

export interface NearbyUser {
  user_id: string;
}

export enum AccountType {
  USER = 'user',
  BUSINESS = 'business',
  SERVICE = 'service'
}

export interface MapFilters {
  showUsers: boolean;
  showBusinesses: boolean;
  showServices: boolean;
}

export const DEFAULT_FILTERS: MapFilters = {
  showUsers: true,
  showBusinesses: true,
  showServices: true
};

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

export const ACCOUNT_COLORS = {
  [AccountType.USER]: '#FFFFFF',     // White for regular users
  [AccountType.BUSINESS]: '#7ed957', // Green for businesses
  [AccountType.SERVICE]: '#8B5CF6'   // Purple for service providers
};
