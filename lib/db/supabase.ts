import { createClient } from '@supabase/supabase-js';
import { TravelFormData, TravelItinerary } from '../types';
import { Database } from '../database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DbItinerary = Database['public']['Tables']['itineraries']['Row'];
type DbItineraryDay = Database['public']['Tables']['itinerary_days']['Row'];

export async function saveItinerary(formData: TravelFormData, itinerary: TravelItinerary): Promise<string> {
  try {
    // Create the main itinerary record
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itineraries')
      .insert({
        city: formData.city,
        hotel: formData.hotel,
        arrival_date_time: formData.arrivalDateTime,
        departure_date_time: formData.departureDateTime,
        total_activities_cost: itinerary.summary.totalActivitiesCost,
        total_travel_cost: itinerary.summary.totalTravelCost
      })
      .select('*')
      .single<DbItinerary>();

    if (itineraryError) throw itineraryError;
    if (!itineraryData) throw new Error('Failed to create itinerary');

    // Create days and activities
    const daysWithIndex = itinerary.days.map((day, index) => ({ day, index }));
    
    for (const { day, index } of daysWithIndex) {
      const { data: dayData, error: dayError } = await supabase
        .from('itinerary_days')
        .insert({
          date: day.date,
          itinerary_id: itineraryData.id,
          day_number: index + 1
        })
        .select('*')
        .single<DbItineraryDay>();

      if (dayError) throw dayError;
      if (!dayData) throw new Error('Failed to create day');

      // Create activities for the day
      const activities = day.activities.map((activity, activityIndex) => ({
        name: activity.name,
        description: activity.description,
        image: activity.image,
        cost: activity.cost,
        recommended_time: activity.recommendedTime,
        location_link: activity.locationLink,
        rating: activity.rating,
        must_try_food: activity.mustTryFood,
        travel_time: activity.travelInfo.time,
        travel_cost: activity.travelInfo.cost,
        travel_link: activity.travelInfo.link,
        category: activity.category,
        day_id: dayData.id,
        activity_order: activityIndex + 1
      }));

      const { error: activitiesError } = await supabase
        .from('activities')
        .insert(activities);

      if (activitiesError) throw activitiesError;
    }

    return itineraryData.id;
  } catch (error) {
    console.error('Error saving itinerary:', error);
    throw error;
  }
}