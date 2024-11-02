"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, Calendar, MapPin, Clock, Plus, Hotel, CalendarRange } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";
import { format, differenceInDays } from "date-fns";
import { Database } from "@/lib/database.types";

type SavedTrip = Database['public']['Tables']['itineraries']['Row'];

export default function SavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data, error } = await supabase
          .from('itineraries')
          .select('*')
          .order('created_at', { ascending: false })
          .returns<SavedTrip[]>();

        if (error) throw error;
        setTrips(data || []);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrips();
  }, []);

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "PPP 'at' p");
  };

  const calculateDays = (arrival: string, departure: string) => {
    return differenceInDays(new Date(departure), new Date(arrival)) + 1;
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Saved Trips</h1>
          <Button onClick={() => router.push("/")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Plan New Trip
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="p-8 text-center">
            <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No saved trips yet</h2>
            <p className="text-muted-foreground mb-4">
              Start planning your next adventure!
            </p>
            <Button onClick={() => router.push("/")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Plan Your First Trip
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{trip.city}</h2>
                    <div className="flex items-center text-sm text-muted-foreground gap-2 mb-1">
                      <Hotel className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{trip.hotel}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <CalendarRange className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">
                        {calculateDays(trip.arrival_date_time, trip.departure_date_time)} Days
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/saved/${trip.id}`)}
                  >
                    View Details
                  </Button>
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Arrival</p>
                      <p className="text-muted-foreground">{formatDateTime(trip.arrival_date_time)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-red-500" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Departure</p>
                      <p className="text-muted-foreground">{formatDateTime(trip.departure_date_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground gap-2 pt-2 border-t">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Activities: {trip.total_activities_cost} • Travel: {trip.total_travel_cost}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}