export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          day_id: string
          name: string
          image: string
          description: string
          cost: string
          recommended_time: string | null
          location_link: string
          rating: string | null
          category: string | null
          must_try_food: string | null
          travel_time: string
          travel_cost: string
          travel_link: string
          activity_order: number
          created_at: string
        }
        Insert: {
          id?: string
          day_id: string
          name: string
          image: string
          description: string
          cost: string
          recommended_time?: string | null
          location_link: string
          rating?: string | null
          category?: string | null
          must_try_food?: string | null
          travel_time: string
          travel_cost: string
          travel_link: string
          activity_order: number
          created_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          name?: string
          image?: string
          description?: string
          cost?: string
          recommended_time?: string | null
          location_link?: string
          rating?: string | null
          category?: string | null
          must_try_food?: string | null
          travel_time?: string
          travel_cost?: string
          travel_link?: string
          activity_order?: number
          created_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          city: string
          hotel: string
          arrival_date_time: string
          departure_date_time: string
          total_activities_cost: string
          total_travel_cost: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city: string
          hotel: string
          arrival_date_time: string
          departure_date_time: string
          total_activities_cost: string
          total_travel_cost: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city?: string
          hotel?: string
          arrival_date_time?: string
          departure_date_time?: string
          total_activities_cost?: string
          total_travel_cost?: string
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_days: {
        Row: {
          id: string
          itinerary_id: string
          date: string
          day_number: number
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          date: string
          day_number: number
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          date?: string
          day_number?: number
          created_at?: string
        }
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