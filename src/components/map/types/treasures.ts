
export interface Treasure {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  hint: string | null;
  image_url: string | null;
  reward_amount: number;
  is_found: boolean;
  created_at: string;
  created_by: string;
}

export interface TreasureFound {
  id: string;
  treasure_id: string;
  user_id: string;
  found_at: string;
}
