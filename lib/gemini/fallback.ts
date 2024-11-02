import { TravelFormData, TravelItinerary } from "../types";
import { createCost, defaultCurrency } from "../utils/currency";

export function createDefaultItinerary(formData: TravelFormData): TravelItinerary {
  const arrival = new Date(formData.arrivalDateTime);
  const departure = new Date(formData.departureDateTime);
  const dayDiff = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
  const days = [];

  // First day: Airport arrival
  days.push({
    date: formatDate(arrival),
    activities: [createAirportArrivalActivity(formData)]
  });

  // Middle days: Default activities
  for (let i = 1; i < dayDiff - 1; i++) {
    const currentDate = new Date(arrival);
    currentDate.setDate(arrival.getDate() + i);
    
    days.push({
      date: formatDate(currentDate),
      activities: [
        {
          name: "St. Peter's Cathedral",
          image: "https://images.unsplash.com/photo-1548661710-7f540c9c56d6",
          description: `Visit the iconic St. Peter's Cathedral, a masterpiece of Gothic architecture dating back to the 14th century. Climb the bell tower for panoramic city views and explore the ancient crypts below.`,
          cost: createCost(35, defaultCurrency),
          recommendedTime: "3 hours",
          locationLink: `https://www.google.com/maps/search/St+Peters+Cathedral+${encodeURIComponent(formData.city)}`,
          travelInfo: {
            time: "20 mins",
            cost: createCost(10, defaultCurrency),
            link: `https://www.google.com/maps/dir/${encodeURIComponent(formData.hotel)}/St+Peters+Cathedral+${encodeURIComponent(formData.city)}`
          }
        },
        {
          name: "Café Central (Lunch)",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
          description: "Historic café-restaurant known for its grand interior and traditional cuisine, serving guests since 1876.",
          cost: createCost(45, defaultCurrency),
          recommendedTime: "1.5 hours",
          locationLink: `https://www.google.com/maps/search/Cafe+Central+${encodeURIComponent(formData.city)}`,
          rating: "4.7",
          mustTryFood: "Wiener Schnitzel with potato salad, Classic Apple Strudel",
          travelInfo: {
            time: "15 mins",
            cost: createCost(8, defaultCurrency),
            link: `https://www.google.com/maps/dir/St+Peters+Cathedral+${encodeURIComponent(formData.city)}/Cafe+Central+${encodeURIComponent(formData.city)}`
          }
        },
        {
          name: "Museum of Fine Arts",
          image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd",
          description: `Explore one of Europe's finest art collections housed in a magnificent palace. Features masterpieces from Raphael, Bruegel, and Vermeer.`,
          cost: createCost(40, defaultCurrency),
          recommendedTime: "3 hours",
          locationLink: `https://www.google.com/maps/search/Museum+of+Fine+Arts+${encodeURIComponent(formData.city)}`,
          travelInfo: {
            time: "20 mins",
            cost: createCost(10, defaultCurrency),
            link: `https://www.google.com/maps/dir/Cafe+Central+${encodeURIComponent(formData.city)}/Museum+of+Fine+Arts+${encodeURIComponent(formData.city)}`
          }
        },
        {
          name: "Restaurant Steirereck (Dinner)",
          image: "https://images.unsplash.com/photo-1544148103-0773bf10d330",
          description: "Two Michelin-starred restaurant set in a beautiful city park, offering innovative Austrian cuisine with a modern twist.",
          cost: createCost(65, defaultCurrency),
          recommendedTime: "2.5 hours",
          locationLink: `https://www.google.com/maps/search/Restaurant+Steirereck+${encodeURIComponent(formData.city)}`,
          rating: "4.9",
          mustTryFood: "Fresh char with beeswax, Vienna bread selection",
          travelInfo: {
            time: "15 mins",
            cost: createCost(8, defaultCurrency),
            link: `https://www.google.com/maps/dir/Museum+of+Fine+Arts+${encodeURIComponent(formData.city)}/Restaurant+Steirereck+${encodeURIComponent(formData.city)}`
          }
        }
      ]
    });
  }

  // Last day: Airport departure
  days.push({
    date: formatDate(departure),
    activities: [createAirportDepartureActivity(formData)]
  });

  return {
    days,
    summary: {
      totalActivitiesCost: createCost(dayDiff * 140, defaultCurrency),
      totalTravelCost: createCost(dayDiff * 36, defaultCurrency)
    }
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createAirportArrivalActivity(formData: TravelFormData) {
  return {
    name: `${formData.city} Airport Arrival`,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    description: "Arrive at the airport and transfer to your hotel to begin your adventure.",
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

function createAirportDepartureActivity(formData: TravelFormData) {
  return {
    name: `${formData.city} Airport Departure`,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    description: "Transfer to the airport for your departure flight.",
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