import { Activity } from "./types";
import { defaultCurrency } from "./utils/currency";

export async function getPlaceDetails(
  placeName: string, 
  city: string, 
  placeId?: string
): Promise<Partial<Activity>> {
  try {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not configured");
      return {};
    }

    if (!window.google?.maps?.places) {
      console.warn("Google Places API not loaded");
      return {};
    }

    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    return new Promise((resolve) => {
      if (placeId) {
        // If we have a placeId, use getDetails for more accurate data
        const request = {
          placeId,
          fields: ["photos", "formatted_address", "name", "rating", "price_level", "url"]
        };

        service.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const details: Partial<Activity> = {
              image: place.photos?.[0]?.getUrl() || getDefaultImage(placeName),
              rating: place.rating?.toFixed(1),
              locationLink: place.url || createMapsLink(placeName, city),
              cost: {
                amount: getPriceLevelAmount(place.price_level),
                currency: defaultCurrency
              }
            };
            resolve(details);
          } else {
            resolve(getFallbackDetails(placeName, city));
          }
        });
      } else {
        // Fallback to findPlaceFromQuery
        const request = {
          query: `${placeName} ${city}`,
          fields: ["photos", "formatted_address", "name", "rating", "price_level", "place_id"]
        };

        service.findPlaceFromQuery(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
            const place = results[0];
            const details: Partial<Activity> = {
              image: place.photos?.[0]?.getUrl() || getDefaultImage(placeName),
              rating: place.rating?.toFixed(1),
              locationLink: createMapsLink(placeName, city, place.place_id),
              cost: {
                amount: getPriceLevelAmount(place.price_level),
                currency: defaultCurrency
              }
            };
            resolve(details);
          } else {
            resolve(getFallbackDetails(placeName, city));
          }
        });
      }
    });
  } catch (error) {
    console.warn("Error fetching place details:", error);
    return getFallbackDetails(placeName, city);
  }
}

function getDefaultImage(placeName: string): string {
  const name = placeName.toLowerCase();
  if (name.includes('restaurant') || name.includes('café') || name.includes('dining')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
  }
  if (name.includes('museum') || name.includes('gallery')) {
    return 'https://images.unsplash.com/photo-1554907984-15263bfd63bd';
  }
  if (name.includes('park') || name.includes('garden')) {
    return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae';
  }
  return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a';
}

function createMapsLink(placeName: string, city: string, placeId?: string): string {
  const baseUrl = 'https://www.google.com/maps/search/?api=1';
  const query = encodeURIComponent(`${placeName} ${city}`);
  
  if (placeId) {
    return `${baseUrl}&query=${query}&query_place_id=${placeId}`;
  }
  
  return `${baseUrl}&query=${query}`;
}

function getPriceLevelAmount(priceLevel?: number): number {
  switch (priceLevel) {
    case 0: return 15;  // Cheap
    case 1: return 30;  // Inexpensive
    case 2: return 50;  // Moderate
    case 3: return 100; // Expensive
    case 4: return 200; // Very Expensive
    default: return 50; // Default moderate price
  }
}

function getFallbackDetails(placeName: string, city: string): Partial<Activity> {
  return {
    image: getDefaultImage(placeName),
    locationLink: createMapsLink(placeName, city),
    cost: {
      amount: 50,
      currency: defaultCurrency
    }
  };
}