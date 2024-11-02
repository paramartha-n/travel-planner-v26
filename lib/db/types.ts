export interface DbActivity {
  id: string;
  name: string;
  description: string;
  image: string;
  cost: string;
  recommended_time?: string;
  location_link: string;
  rating?: string;
  must_try_food?: string;
  travel_info: {
    time: string;
    cost: string;
    link: string;
  };
  category?: string;
  day_id: string;
  created_at: string;
}

export interface DbItineraryDay {
  id: string;
  date: string;
  itinerary_id: string;
  activities: DbActivity[];
  created_at: string;
}

export interface DbItinerary {
  id: string;
  city: string;
  hotel: string;
  arrival_date: string;
  departure_date: string;
  days: DbItineraryDay[];
  summary: {
    total_activities_cost: string;
    total_travel_cost: string;
  };
  created_at: string;
  user_id?: string;
}