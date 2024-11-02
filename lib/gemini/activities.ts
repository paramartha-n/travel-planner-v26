import { Activity, TravelFormData, Currency, Cost } from "../types";
import { getRandomImage } from "../utils";
import { getPlaceDetails } from "../places";
import { createCost, defaultCurrency } from "../utils/currency";

export function createAirportArrivalActivity(formData: TravelFormData): Activity {
  return {
    name: `${formData.city} Airport Arrival`,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    description: "Welcome to your destination! After landing, collect your luggage and prepare for your adventure.",
    cost: createCost(0, defaultCurrency),
    recommendedTime: "1 hour",
    locationLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.city} Airport`)}`,
    travelInfo: {
      time: "45 minutes",
      cost: createCost(30, defaultCurrency),
      link: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${formData.city} Airport`)}&destination=${encodeURIComponent(formData.hotel)}&travelmode=transit`
    }
  };
}

export function createHotelCheckInActivity(formData: TravelFormData, pricePerNight?: number): Activity {
  // Calculate number of nights
  const arrival = new Date(formData.arrivalDateTime);
  const departure = new Date(formData.departureDateTime);
  const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));

  // Get cost per night from provided price or fallback to price range
  const perNightCost = pricePerNight || getHotelCostPerNight(formData.priceRange);

  // Get previous activity (airport arrival) for travel info
  const airportActivity = createAirportArrivalActivity(formData);

  return {
    name: formData.hotel,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    description: `Your accommodation for ${nights} nights. The hotel offers comfortable rooms with modern amenities including air conditioning and Wi-Fi. Located in a convenient area with easy access to public transport.`,
    cost: createCost(perNightCost, defaultCurrency),
    recommendedTime: "30 minutes",
    locationLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.hotel)}`,
    category: "per night",
    travelInfo: {
      ...airportActivity.travelInfo,
      link: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${formData.city} Airport`)}&destination=${encodeURIComponent(formData.hotel)}&travelmode=transit`
    }
  };
}

export function createAirportDepartureActivity(formData: TravelFormData): Activity {
  return {
    name: `${formData.city} Airport Departure`,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    description: "Time to head home. Make your way to the airport for your departure flight.",
    cost: createCost(0, defaultCurrency),
    recommendedTime: "1 hour",
    locationLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.city} Airport`)}`,
    travelInfo: {
      time: "45 minutes",
      cost: createCost(30, defaultCurrency),
      link: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(formData.hotel)}&destination=${encodeURIComponent(`${formData.city} Airport`)}&travelmode=transit`
    }
  };
}

export async function parseActivity(
  item: string, 
  formData: TravelFormData, 
  previousActivities: Activity[], 
  isFirstActivityOfDay: boolean = false,
  currency: Currency
): Promise<Activity | null> {
  try {
    const lines = item.split('\n').map(line => line.trim()).filter(line => line);
    const details: Record<string, string> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':').map(part => part.trim());
      if (valueParts.length > 0) {
        details[key] = valueParts.join(':').trim();
      }
    });

    let name = details['Activity'] || details['Restaurant'] || lines[0].replace(/^(Activity|Restaurant):\s*/, '').trim();
    const type = details['Restaurant'] ? 'restaurant' : 'activity';
    const isAirport = name.toLowerCase().includes('airport');

    const cost = parseCost(details['Cost'], currency);
    const travelCost = parseCost(details['Travel Cost'], currency);

    let image = '';
    let locationLink = '';
    let rating: string | undefined;

    if (isAirport) {
      image = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05';
      locationLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${formData.city}`)}`;
    } else {
      const placeDetails = await getPlaceDetails(name, formData.city);
      image = placeDetails.image || getRandomImage(type);
      locationLink = placeDetails.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${formData.city}`)}`;
      rating = placeDetails.rating || details['Rating']?.match(/\d+\.\d+/)?.[0];
    }

    const travelTime = details['Travel Time']?.toLowerCase() === 'n/a' 
      ? '15 minutes' 
      : details['Travel Time'] || '15 minutes';

    const previousLocation = getPreviousLocation(previousActivities, formData, isFirstActivityOfDay);
    const searchQuery = encodeURIComponent(`${name} ${formData.city}`);

    return {
      name,
      image,
      description: details['Description'] || 'Experience this local attraction.',
      cost,
      recommendedTime: details['Recommended Time'] || details['Duration'] || '1 hour',
      locationLink,
      rating,
      category: details['Category'],
      mustTryFood: details['Must-Try'] || details['Must-try dishes'],
      travelInfo: {
        time: travelTime,
        cost: travelCost,
        link: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(previousLocation)}&destination=${searchQuery}&travelmode=transit`
      }
    };
  } catch (error) {
    console.error("Error parsing activity details:", { error, item });
    return null;
  }
}

function parseCost(costStr: string, currency: Currency): Cost {
  if (!costStr || costStr.toLowerCase() === 'free' || costStr.toLowerCase() === 'n/a') {
    return createCost(0, currency);
  }

  const match = costStr.match(/([^\d]*)(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (!match) {
    return createCost(0, currency);
  }

  const amount = parseFloat(match[2].replace(/,/g, ''));
  return createCost(amount, currency);
}

function getPreviousLocation(activities: Activity[], formData: TravelFormData, isFirstActivityOfDay: boolean): string {
  if (isFirstActivityOfDay) {
    return formData.hotel;
  }
  if (activities.length === 0) {
    return formData.hotel;
  }
  return activities[activities.length - 1].name;
}

function getHotelCostPerNight(priceRange?: string): number {
  if (!priceRange) return 150; // Default mid-range price

  const priceRanges: Record<string, number> = {
    'budget': 15,
    'economy': 35,
    'standard': 100,
    'comfort': 225,
    'first_class': 400,
    'luxury': 1000
  };

  return priceRanges[priceRange] || 150;
}