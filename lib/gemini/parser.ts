import { TravelFormData, TravelItinerary, DayItinerary, Currency, Cost, Activity } from "../types";
import { createCost, sumCosts } from "../utils/currency";
import { parseActivity } from "./activities";
import { createAirportArrivalActivity, createHotelCheckInActivity, createAirportDepartureActivity } from "./activities";

export interface HotelInfo {
  name: string;
  pricePerNight: number;
  distance: string;
  rating: string;
}

export async function parseItinerary(text: string, formData: TravelFormData): Promise<TravelItinerary> {
  try {
    const days: DayItinerary[] = [];
    const activityCosts: Cost[] = [];
    const travelCosts: Cost[] = [];

    // Calculate expected number of days
    const arrival = new Date(formData.arrivalDateTime);
    const departure = new Date(formData.departureDateTime);
    const expectedDays = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));

    // Extract hotel information if using hotel search
    let hotelInfo: HotelInfo | null = null;
    if (formData.priceRange) {
      const hotelMatch = text.match(/SELECTED_HOTEL:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/);
      if (hotelMatch) {
        const priceStr = hotelMatch[2].trim();
        const priceMatch = priceStr.match(/[€$£¥](\d+)/);
        const pricePerNight = priceMatch ? parseInt(priceMatch[1], 10) : 0;

        hotelInfo = {
          name: hotelMatch[1].trim(),
          pricePerNight,
          distance: hotelMatch[3].trim(),
          rating: hotelMatch[4].trim()
        };

        formData = {
          ...formData,
          hotel: hotelInfo.name
        };
      }
    }

    // Extract currency information
    const currencyMatch = text.match(/LOCAL_CURRENCY:\s*(\w+)\s*\((.+?)\)\s*([\d.]+)/);
    if (!currencyMatch) {
      console.warn("Currency information not found, using EUR as default");
      return createDefaultItinerary(formData, hotelInfo);
    }

    const currency: Currency = {
      code: currencyMatch[1],
      symbol: currencyMatch[2],
      rate: parseFloat(currencyMatch[3])
    };

    // Split by "Day X:" pattern and keep the day number
    const dayMatches = text.match(/Day \d+:[\s\S]*?(?=Day \d+:|$)/g);
    
    if (!dayMatches || dayMatches.length === 0) {
      console.warn("No daily itinerary found, using default template");
      return createDefaultItinerary(formData, hotelInfo);
    }

    for (const dayBlock of dayMatches) {
      const dayNumberMatch = dayBlock.match(/Day (\d+):/);
      if (!dayNumberMatch) continue;

      const dayNumber = parseInt(dayNumberMatch[1], 10) - 1;
      const activities: Activity[] = [];

      // For Day 1, always start with airport arrival and hotel check-in
      if (dayNumber === 0) {
        const airportArrival = createAirportArrivalActivity(formData);
        const hotelCheckIn = createHotelCheckInActivity(formData, hotelInfo?.pricePerNight);
        activities.push(airportArrival, hotelCheckIn);
        
        if (airportArrival.travelInfo.cost.amount > 0) {
          travelCosts.push(airportArrival.travelInfo.cost);
        }
      }

      // For last day, add airport departure as the last activity
      const isLastDay = dayNumber === expectedDays - 1;
      
      // Split activities by bullet points and filter empty lines
      const items = dayBlock
        .split(/\n- /)
        .map(item => item.trim())
        .filter(item => item && !item.match(/^Day \d+:/));

      // Process regular activities for the day
      for (let i = 0; i < items.length; i++) {
        // Skip processing if it's day 1 and we're at the first two activities (already added airport and hotel)
        if (dayNumber === 0 && i < 2) continue;
        
        // Skip processing if it's the last day and we're at the last activity (will add airport departure)
        if (isLastDay && i === items.length - 1) continue;

        try {
          const parsedActivity = await parseActivity(
            items[i], 
            formData, 
            activities,
            i === 0 && dayNumber !== 0,
            currency
          );

          if (parsedActivity) {
            activities.push(parsedActivity);
            if (parsedActivity.cost.amount > 0) {
              activityCosts.push(parsedActivity.cost);
            }
            if (parsedActivity.travelInfo.cost.amount > 0) {
              travelCosts.push(parsedActivity.travelInfo.cost);
            }
          }
        } catch (error) {
          console.warn("Skipping invalid activity:", { dayNumber, activityIndex: i });
          continue;
        }
      }

      // Add airport departure activity on the last day
      if (isLastDay) {
        const airportDeparture = createAirportDepartureActivity(formData);
        activities.push(airportDeparture);
        if (airportDeparture.travelInfo.cost.amount > 0) {
          travelCosts.push(airportDeparture.travelInfo.cost);
        }
      }

      if (activities.length > 0) {
        const currentDate = new Date(formData.arrivalDateTime);
        currentDate.setDate(currentDate.getDate() + dayNumber);

        days.push({
          date: formatDate(currentDate),
          activities
        });
      }
    }

    // Sort days by date
    days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate totals
    const totalActivitiesCost = await sumCosts(activityCosts, currency);
    const totalTravelCost = await sumCosts(travelCosts, currency);

    return {
      days,
      summary: {
        totalActivitiesCost,
        totalTravelCost
      }
    };
  } catch (error) {
    console.error("Error parsing itinerary:", error);
    return createDefaultItinerary(formData);
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createDefaultItinerary(formData: TravelFormData, hotelInfo?: HotelInfo | null): TravelItinerary {
  const arrival = new Date(formData.arrivalDateTime);
  const departure = new Date(formData.departureDateTime);
  const dayDiff = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
  const days: DayItinerary[] = [];

  // First day: Airport arrival and hotel check-in
  const firstDayActivities = [
    createAirportArrivalActivity(formData),
    createHotelCheckInActivity(formData, hotelInfo?.pricePerNight)
  ];

  days.push({
    date: formatDate(arrival),
    activities: firstDayActivities
  });

  // Last day: Airport departure
  const lastDayActivities = [createAirportDepartureActivity(formData)];

  if (dayDiff > 1) {
    const departureDate = new Date(departure);
    days.push({
      date: formatDate(departureDate),
      activities: lastDayActivities
    });
  }

  return {
    days,
    summary: {
      totalActivitiesCost: createCost(0, { code: 'EUR', symbol: '€', rate: 1 }),
      totalTravelCost: createCost(60, { code: 'EUR', symbol: '€', rate: 1 }) // Airport transfers
    }
  };
}