export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_start_date: string
          completion_rate: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          longest_streak: number | null
          total_submissions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_start_date?: string
          completion_rate?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          total_submissions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_start_date?: string
          completion_rate?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          total_submissions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_challenge_completed: boolean | null
          is_disqualified: boolean | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_challenge_completed?: boolean | null
          is_disqualified?: boolean | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_challenge_completed?: boolean | null
          is_disqualified?: boolean | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      prop_firms: {
        Row: {
          asset_classes: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          evaluation_fee: number | null
          featured: boolean | null
          features: string[] | null
          founded: number | null
          headquarters: string | null
          id: string
          instant_funding: boolean | null
          leverage: number | null
          logo_url: string | null
          max_account_size: number | null
          max_drawdown: number | null
          min_account_size: number | null
          name: string
          platforms: string[] | null
          profit_split: number | null
          profit_target: number | null
          rating: number | null
          refundable: boolean | null
          review_count: number | null
          scaling: boolean | null
          status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          asset_classes?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evaluation_fee?: number | null
          featured?: boolean | null
          features?: string[] | null
          founded?: number | null
          headquarters?: string | null
          id?: string
          instant_funding?: boolean | null
          leverage?: number | null
          logo_url?: string | null
          max_account_size?: number | null
          max_drawdown?: number | null
          min_account_size?: number | null
          name: string
          platforms?: string[] | null
          profit_split?: number | null
          profit_target?: number | null
          rating?: number | null
          refundable?: boolean | null
          review_count?: number | null
          scaling?: boolean | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          asset_classes?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evaluation_fee?: number | null
          featured?: boolean | null
          features?: string[] | null
          founded?: number | null
          headquarters?: string | null
          id?: string
          instant_funding?: boolean | null
          leverage?: number | null
          logo_url?: string | null
          max_account_size?: number | null
          max_drawdown?: number | null
          min_account_size?: number | null
          name?: string
          platforms?: string[] | null
          profit_split?: number | null
          profit_target?: number | null
          rating?: number | null
          refundable?: boolean | null
          review_count?: number | null
          scaling?: boolean | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          account_size: string | null
          cons: string[] | null
          content: string
          created_at: string | null
          firm_id: string
          helpful_votes: number | null
          id: string
          payout_received: boolean | null
          pros: string[] | null
          rating: number
          title: string
          trading_experience: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          account_size?: string | null
          cons?: string[] | null
          content: string
          created_at?: string | null
          firm_id: string
          helpful_votes?: number | null
          id?: string
          payout_received?: boolean | null
          pros?: string[] | null
          rating: number
          title: string
          trading_experience?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          account_size?: string | null
          cons?: string[] | null
          content?: string
          created_at?: string | null
          firm_id?: string
          helpful_votes?: number | null
          id?: string
          payout_received?: boolean | null
          pros?: string[] | null
          rating?: number
          title?: string
          trading_experience?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "prop_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      trade_submissions: {
        Row: {
          chart_image_url: string | null
          created_at: string | null
          day_number: number | null
          id: string
          market_pair: string | null
          rule_followed: boolean | null
          submission_date: string
          trade_idea: string
          twitter_link: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chart_image_url?: string | null
          created_at?: string | null
          day_number?: number | null
          id?: string
          market_pair?: string | null
          rule_followed?: boolean | null
          submission_date?: string
          trade_idea: string
          twitter_link: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chart_image_url?: string | null
          created_at?: string | null
          day_number?: number | null
          id?: string
          market_pair?: string | null
          rule_followed?: boolean | null
          submission_date?: string
          trade_idea?: string
          twitter_link?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      website_sections: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          section_key: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          section_key: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          section_key?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
