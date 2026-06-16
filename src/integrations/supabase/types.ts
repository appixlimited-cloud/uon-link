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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          app_enabled: boolean
          id: number
          maintenance_message: string | null
          updated_at: string
        }
        Insert: {
          app_enabled?: boolean
          id?: number
          maintenance_message?: string | null
          updated_at?: string
        }
        Update: {
          app_enabled?: boolean
          id?: number
          maintenance_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          category: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          social_link: string | null
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          social_link?: string | null
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          social_link?: string | null
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          is_enabled: boolean
          price: number
          quantity_available: number | null
          tier_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          is_enabled?: boolean
          price?: number
          quantity_available?: number | null
          tier_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          is_enabled?: boolean
          price?: number
          quantity_available?: number | null
          tier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          featured_order: number | null
          id: string
          is_featured: boolean
          is_free: boolean
          is_published: boolean
          poster_url: string | null
          slug: string
          time: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description?: string | null
          featured_order?: number | null
          id?: string
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          poster_url?: string | null
          slug: string
          time?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          featured_order?: number | null
          id?: string
          is_featured?: boolean
          is_free?: boolean
          is_published?: boolean
          poster_url?: string | null
          slug?: string
          time?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          category: string
          contact: string | null
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          is_published: boolean
          title: string
        }
        Insert: {
          category: string
          contact?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_published?: boolean
          title: string
        }
        Update: {
          category?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_published?: boolean
          title?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_link: string | null
          created_at: string
          deadline: string
          description: string | null
          eligibility: string | null
          id: string
          is_published: boolean
          organization: string | null
          poster_url: string | null
          title: string
          type: string
        }
        Insert: {
          application_link?: string | null
          created_at?: string
          deadline: string
          description?: string | null
          eligibility?: string | null
          id?: string
          is_published?: boolean
          organization?: string | null
          poster_url?: string | null
          title: string
          type: string
        }
        Update: {
          application_link?: string | null
          created_at?: string
          deadline?: string
          description?: string | null
          eligibility?: string | null
          id?: string
          is_published?: boolean
          organization?: string | null
          poster_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          email: string
          event_id: string
          faculty: string | null
          id: string
          registration_number: string | null
          student_name: string
          ticket_tier: string | null
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          faculty?: string | null
          id?: string
          registration_number?: string | null
          student_name: string
          ticket_tier?: string | null
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          faculty?: string | null
          id?: string
          registration_number?: string | null
          student_name?: string
          ticket_tier?: string | null
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      spotlights: {
        Row: {
          created_at: string
          faculty_or_club: string | null
          headline: string | null
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          publish_date: string | null
          story: string | null
        }
        Insert: {
          created_at?: string
          faculty_or_club?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          publish_date?: string | null
          story?: string | null
        }
        Update: {
          created_at?: string
          faculty_or_club?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          publish_date?: string | null
          story?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          faculty: string | null
          full_name: string
          interests: string[] | null
          is_verified: boolean
          phone: string | null
          registration_number: string | null
          updated_at: string
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          faculty?: string | null
          full_name: string
          interests?: string[] | null
          is_verified?: boolean
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          faculty?: string | null
          full_name?: string
          interests?: string[] | null
          is_verified?: boolean
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
