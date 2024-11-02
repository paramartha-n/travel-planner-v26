export interface TravelFormData {
  city: string;
  hotel: string;
  arrivalDateTime: string;
  departureDateTime: string;
  priceRange?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface Cost {
  amount: number;
  currency: Currency;
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