export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address: string | null
          business_name: string
          cover_image_url: string | null
          created_at: string
          delivery_available: boolean | null
          description: string | null
          id: number
          logo_url: string | null
          open_hours: string | null
          phone_number: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          cover_image_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          description?: string | null
          id?: number
          logo_url?: string | null
          open_hours?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          cover_image_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          description?: string | null
          id?: number
          logo_url?: string | null
          open_hours?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      hot_deals: {
        Row: {
          company_name: string
          created_at: string | null
          description: string
          duration_hours: number
          id: string
          image_url: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          description: string
          duration_hours: number
          id?: string
          image_url: string
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          description?: string
          duration_hours?: number
          id?: string
          image_url?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: number
          latitude: number
          longitude: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          latitude: number
          longitude: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          latitude?: number
          longitude?: number
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          company_name: string
          created_at: string | null
          feedback: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          feedback?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          feedback?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          email: string | null
          id: string
          is_company: boolean | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          email?: string | null
          id: string
          is_company?: boolean | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          email?: string | null
          id?: string
          is_company?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      treasures: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          hint: string | null
          id: string
          image_url: string | null
          is_found: boolean | null
          latitude: number
          longitude: number
          name: string
          reward_amount: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          is_found?: boolean | null
          latitude: number
          longitude: number
          name: string
          reward_amount?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          is_found?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          reward_amount?: number | null
        }
        Relationships: []
      }
      treasures_found: {
        Row: {
          found_at: string | null
          id: string
          treasure_id: string | null
          user_id: string | null
        }
        Insert: {
          found_at?: string | null
          id?: string
          treasure_id?: string | null
          user_id?: string | null
        }
        Update: {
          found_at?: string | null
          id?: string
          treasure_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasures_found_treasure_id_fkey"
            columns: ["treasure_id"]
            isOneToOne: false
            referencedRelation: "treasures"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      distribute_payment: {
        Args: {
          sender_id: string
          receiver_id: string
          total_amount: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
