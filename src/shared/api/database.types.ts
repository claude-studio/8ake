export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_comments_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      ingredient_reviews: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          memo: string | null
          purchase_place: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          memo?: string | null
          purchase_place?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          memo?: string | null
          purchase_place?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ingredient_reviews_ingredient_id_fkey'
            columns: ['ingredient_id']
            isOneToOne: false
            referencedRelation: 'ingredients'
            referencedColumns: ['id']
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          price_unit: string | null
          price_updated_at: string | null
          unit_price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_unit?: string | null
          price_updated_at?: string | null
          unit_price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_unit?: string | null
          price_updated_at?: string | null
          unit_price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: string | null
          id: string
          name: string
          order: number
          recipe_id: string
          unit_price_snapshot: number | null
        }
        Insert: {
          amount?: string | null
          id?: string
          name: string
          order?: number
          recipe_id: string
          unit_price_snapshot?: number | null
        }
        Update: {
          amount?: string | null
          id?: string
          name?: string
          order?: number
          recipe_id?: string
          unit_price_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      recipe_photos: {
        Row: {
          id: string
          order: number
          recipe_id: string
          storage_path: string
        }
        Insert: {
          id?: string
          order?: number
          recipe_id: string
          storage_path: string
        }
        Update: {
          id?: string
          order?: number
          recipe_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_photos_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      recipes: {
        Row: {
          bake_time: string | null
          created_at: string
          id: string
          is_public: boolean
          memo: string | null
          name: string
          oven_temp: string | null
          preheat_temp: string | null
          preheat_time: string | null
          quantity: string | null
          source_type: string | null
          source_url: string | null
          steps: string | null
          tags: string[]
          thumbnail_photo_id: string | null
          user_id: string
        }
        Insert: {
          bake_time?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          memo?: string | null
          name: string
          oven_temp?: string | null
          preheat_temp?: string | null
          preheat_time?: string | null
          quantity?: string | null
          source_type?: string | null
          source_url?: string | null
          steps?: string | null
          tags?: string[]
          thumbnail_photo_id?: string | null
          user_id: string
        }
        Update: {
          bake_time?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          memo?: string | null
          name?: string
          oven_temp?: string | null
          preheat_temp?: string | null
          preheat_time?: string | null
          quantity?: string | null
          source_type?: string | null
          source_url?: string | null
          steps?: string | null
          tags?: string[]
          thumbnail_photo_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipes_thumbnail_photo_id_fkey'
            columns: ['thumbnail_photo_id']
            isOneToOne: false
            referencedRelation: 'recipe_photos'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          date: string | null
          id: string
          ingredient_availability: number | null
          recipe_id: string
          recipe_simplicity: number | null
          storability: number | null
          storage_memo: string | null
          taste: number | null
          texture: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          date?: string | null
          id?: string
          ingredient_availability?: number | null
          recipe_id: string
          recipe_simplicity?: number | null
          storability?: number | null
          storage_memo?: string | null
          taste?: number | null
          texture?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          date?: string | null
          id?: string
          ingredient_availability?: number | null
          recipe_id?: string
          recipe_simplicity?: number | null
          storability?: number | null
          storage_memo?: string | null
          taste?: number | null
          texture?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
