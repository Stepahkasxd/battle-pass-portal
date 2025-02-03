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
      action_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      battle_passes: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_premium: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_premium?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          battle_pass_id: string | null
          created_at: string
          description: string | null
          id: string
          mission_type: Database["public"]["Enums"]["mission_type"]
          required_count: number | null
          title: string
          xp_reward: number
        }
        Insert: {
          battle_pass_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_type: Database["public"]["Enums"]["mission_type"]
          required_count?: number | null
          title: string
          xp_reward: number
        }
        Update: {
          battle_pass_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_type?: Database["public"]["Enums"]["mission_type"]
          required_count?: number | null
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "missions_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          numeric_id: string
          points: number
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          numeric_id: string
          points?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          numeric_id?: string
          points?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          battle_pass_id: string | null
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          name: string
          required_level: number
          reward_type: Database["public"]["Enums"]["reward_type"]
        }
        Insert: {
          battle_pass_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          required_level: number
          reward_type: Database["public"]["Enums"]["reward_type"]
        }
        Update: {
          battle_pass_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          required_level?: number
          reward_type?: Database["public"]["Enums"]["reward_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rewards_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_battle_passes: {
        Row: {
          battle_pass_id: string | null
          created_at: string
          current_level: number | null
          current_xp: number | null
          id: string
          is_premium: boolean | null
          user_id: string | null
        }
        Insert: {
          battle_pass_id?: string | null
          created_at?: string
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_premium?: boolean | null
          user_id?: string | null
        }
        Update: {
          battle_pass_id?: string | null
          created_at?: string
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_premium?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_battle_passes_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_passes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_battle_passes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string | null
          progress: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          id: string
          item_id: string | null
          price_paid: number
          purchased_at: string
          received: boolean | null
          user_id: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          price_paid: number
          purchased_at?: string
          received?: boolean | null
          user_id?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          price_paid?: number
          purchased_at?: string
          received?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          claimed_at: string
          id: string
          reward_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string
          id?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string
          id?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_type:
        | "user_login"
        | "user_register"
        | "battle_pass_create"
        | "battle_pass_update"
        | "battle_pass_delete"
        | "reward_create"
        | "reward_update"
        | "reward_delete"
        | "mission_create"
        | "mission_update"
        | "mission_delete"
        | "admin_action"
        | "shop_item_create"
        | "shop_item_update"
        | "shop_item_delete"
        | "item_purchase"
        | "reward_claimed"
      mission_type: "daily" | "weekly" | "seasonal"
      reward_type: "discount" | "bonus" | "item" | "shop_item"
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
