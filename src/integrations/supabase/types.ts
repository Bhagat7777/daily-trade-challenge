export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_stats: {
        Row: {
          account_id: string
          current_balance: number
          open_unrealized_pnl: number
          total_closed_pnl: number
          total_closed_pnl_percent: number
          updated_at: string
        }
        Insert: {
          account_id: string
          current_balance?: number
          open_unrealized_pnl?: number
          total_closed_pnl?: number
          total_closed_pnl_percent?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          current_balance?: number
          open_unrealized_pnl?: number
          total_closed_pnl?: number
          total_closed_pnl_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_stats_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          current_balance: number | null
          default_risk_percent: number
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number | null
          default_risk_percent?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number | null
          default_risk_percent?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          comment: string | null
          created_at: string | null
          id: string
          submission_id: string
        }
        Insert: {
          action: string
          admin_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          submission_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "trade_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_check_logs: {
        Row: {
          checked_at: string | null
          contains_hashtag: boolean | null
          duplicate_submission: boolean | null
          id: string
          raw_data: Json | null
          screenshot_present: boolean | null
          submission_id: string
          tags_account: boolean | null
          tweet_exists: boolean | null
        }
        Insert: {
          checked_at?: string | null
          contains_hashtag?: boolean | null
          duplicate_submission?: boolean | null
          id?: string
          raw_data?: Json | null
          screenshot_present?: boolean | null
          submission_id: string
          tags_account?: boolean | null
          tweet_exists?: boolean | null
        }
        Update: {
          checked_at?: string | null
          contains_hashtag?: boolean | null
          duplicate_submission?: boolean | null
          id?: string
          raw_data?: Json | null
          screenshot_present?: boolean | null
          submission_id?: string
          tags_account?: boolean | null
          tweet_exists?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_check_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "trade_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      calculation_audit: {
        Row: {
          changed_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          trade_id: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          trade_id: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          trade_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_audit_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          days_count: number
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          rewards: Json | null
          rules: string | null
          slug: string | null
          start_date: string
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          days_count?: number
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          rewards?: Json | null
          rules?: string | null
          slug?: string | null
          start_date: string
          status?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          days_count?: number
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          rewards?: Json | null
          rules?: string | null
          slug?: string | null
          start_date?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          campaign_id: string | null
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
          campaign_id?: string | null
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
          campaign_id?: string | null
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
            foreignKeyName: "challenge_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
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
          is_admin: boolean | null
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
          is_admin?: boolean | null
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
          is_admin?: boolean | null
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
      propfirm_campaign_clicks: {
        Row: {
          campaign_id: string | null
          click_type: string | null
          clicked_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          click_type?: string | null
          clicked_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          click_type?: string | null
          clicked_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propfirm_campaign_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "propfirm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      propfirm_campaigns: {
        Row: {
          banner_image_url: string | null
          campaign_type: string | null
          coupon_code: string | null
          created_at: string | null
          created_by: string | null
          cta_link: string
          cta_text: string | null
          description: string | null
          display_locations: string[] | null
          end_time: string
          id: string
          is_enabled: boolean | null
          logo_url: string | null
          priority: number | null
          prop_firm_name: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image_url?: string | null
          campaign_type?: string | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_link: string
          cta_text?: string | null
          description?: string | null
          display_locations?: string[] | null
          end_time: string
          id?: string
          is_enabled?: boolean | null
          logo_url?: string | null
          priority?: number | null
          prop_firm_name: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image_url?: string | null
          campaign_type?: string | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_link?: string
          cta_text?: string | null
          description?: string | null
          display_locations?: string[] | null
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          logo_url?: string | null
          priority?: number | null
          prop_firm_name?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propfirm_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      scorecards: {
        Row: {
          campaign_id: string
          completed_days: number
          consistency_score: number
          created_at: string | null
          discipline_score: number
          id: string
          rule_score: number
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          completed_days?: number
          consistency_score?: number
          created_at?: string | null
          discipline_score?: number
          id?: string
          rule_score?: number
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          completed_days?: number
          consistency_score?: number
          created_at?: string | null
          discipline_score?: number
          id?: string
          rule_score?: number
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          admin_comment: string | null
          admin_id: string | null
          automated_checks: Json | null
          campaign_id: string | null
          chart_image_url: string | null
          created_at: string | null
          day_number: number | null
          has_hashtag: boolean | null
          has_tagged_account: boolean | null
          id: string
          market_pair: string | null
          reviewed_at: string | null
          rule_followed: boolean | null
          status: string | null
          submission_date: string
          trade_idea: string
          twitter_link: string
          twitter_screenshot_url: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verifier_id: string | null
        }
        Insert: {
          admin_comment?: string | null
          admin_id?: string | null
          automated_checks?: Json | null
          campaign_id?: string | null
          chart_image_url?: string | null
          created_at?: string | null
          day_number?: number | null
          has_hashtag?: boolean | null
          has_tagged_account?: boolean | null
          id?: string
          market_pair?: string | null
          reviewed_at?: string | null
          rule_followed?: boolean | null
          status?: string | null
          submission_date?: string
          trade_idea: string
          twitter_link: string
          twitter_screenshot_url?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verifier_id?: string | null
        }
        Update: {
          admin_comment?: string | null
          admin_id?: string | null
          automated_checks?: Json | null
          campaign_id?: string | null
          chart_image_url?: string | null
          created_at?: string | null
          day_number?: number | null
          has_hashtag?: boolean | null
          has_tagged_account?: boolean | null
          id?: string
          market_pair?: string | null
          reviewed_at?: string | null
          rule_followed?: boolean | null
          status?: string | null
          submission_date?: string
          trade_idea?: string
          twitter_link?: string
          twitter_screenshot_url?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_submissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          account_id: string
          account_size_snapshot: number | null
          closed_at: string | null
          contract_size: number | null
          created_at: string
          entry_price: number | null
          exit_price: number | null
          id: string
          notes: string | null
          pnl_amount: number | null
          pnl_percent: number | null
          quantity: number | null
          risk_amount: number | null
          risk_percent: number | null
          session_tag: string | null
          setup_tag: string | null
          side: string | null
          status: string
          symbol: string
          trade_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          account_size_snapshot?: number | null
          closed_at?: string | null
          contract_size?: number | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          pnl_amount?: number | null
          pnl_percent?: number | null
          quantity?: number | null
          risk_amount?: number | null
          risk_percent?: number | null
          session_tag?: string | null
          setup_tag?: string | null
          side?: string | null
          status?: string
          symbol: string
          trade_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          account_size_snapshot?: number | null
          closed_at?: string | null
          contract_size?: number | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          pnl_amount?: number | null
          pnl_percent?: number | null
          quantity?: number | null
          risk_amount?: number | null
          risk_percent?: number | null
          session_tag?: string | null
          setup_tag?: string | null
          side?: string | null
          status?: string
          symbol?: string
          trade_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      backfill_trades_and_stats: { Args: never; Returns: undefined }
      get_active_campaign: {
        Args: never
        Returns: {
          created_at: string
          days_count: number
          description: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          title: string
          type: string
        }[]
      }
      get_active_propfirm_campaigns: {
        Args: { p_location?: string }
        Returns: {
          banner_image_url: string | null
          campaign_type: string | null
          coupon_code: string | null
          created_at: string | null
          created_by: string | null
          cta_link: string
          cta_text: string | null
          description: string | null
          display_locations: string[] | null
          end_time: string
          id: string
          is_enabled: boolean | null
          logo_url: string | null
          priority: number | null
          prop_firm_name: string
          start_time: string
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "propfirm_campaigns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_scorecard_leaderboard: {
        Args: { p_campaign_id: string }
        Returns: {
          completed_days: number
          consistency_score: number
          discipline_score: number
          full_name: string
          rank: number
          rule_score: number
          total_score: number
          user_id: string
          username: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_day_unlocked: {
        Args: { campaign_start_date: string; day_number: number }
        Returns: boolean
      }
      refresh_account_stats: {
        Args: { p_account_id: string }
        Returns: undefined
      }
      update_campaign_status: { Args: never; Returns: undefined }
    }
    Enums: {
      campaign_type:
        | "trading_challenge"
        | "payout_contest"
        | "giveaway"
        | "streak_challenge"
        | "other"
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
    Enums: {
      campaign_type: [
        "trading_challenge",
        "payout_contest",
        "giveaway",
        "streak_challenge",
        "other",
      ],
    },
  },
} as const
