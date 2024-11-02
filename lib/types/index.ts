import { Currency, Cost, TravelCosts } from './currency';

export interface TravelFormData {
  city: string;
  hotel: string;
  arrivalDateTime: string;
  departureDateTime: string;
}

export interface TravelInfo {
  time: string;
  cost: Cost;
  link: string;
}

export interface Activity {
  name: string;
  image: string;
  description: string;
  cost: Cost;
  recommendedTime?: string;
  locationLink: string;
  rating?: string;
  mustTryFood?: string;
  travelInfo: TravelInfo;
  category?: string;
}

export interface DayItinerary {
  date: string;
  activities: Activity[];
}

export interface TravelItinerary {
  days: DayItinerary[];
  summary: {
    totalActivitiesCost: Cost;
    totalTravelCost: Cost;
  };
}

export type { Currency, Cost, TravelCosts };