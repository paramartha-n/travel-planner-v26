export function createItineraryPrompt(city: string, hotel: string, arrival: string, departure: string, priceRange?: string): string {
  // Calculate number of days
  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);
  const dayDiff = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates for hotel search
  const formattedArrival = arrivalDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedDeparture = departureDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Create hotel search section if price range is provided
  const hotelSearchPrompt = priceRange ? `
First, find a suitable hotel in ${city} that matches these criteria:
- Price Range: ${getPriceRangeText(priceRange)}
- Check-in: ${formattedArrival}
- Check-out: ${formattedDeparture}

REQUIREMENTS:
1. Must be a real, currently operating hotel
2. Must be within 3km of city center
3. Must have 8.0+ rating on Booking.com
4. Must be well-connected to public transport
5. Must be in a safe, tourist-friendly area
6. Must have 24/7 reception
7. Must have air conditioning and Wi-Fi
8. Must have recent reviews (within last 6 months)

Return the selected hotel in this EXACT format:
SELECTED_HOTEL: [Hotel Name] | [Price per Night] | [Distance to Center] | [Rating]

Example:
SELECTED_HOTEL: Grand Hotel Palace | €180 | 0.5 km from center | 9.2

` : '';

  return `${hotelSearchPrompt}Create a detailed ${dayDiff}-day travel itinerary for ${city}.

First line must be in this EXACT format:
LOCAL_CURRENCY: [Currency Code] ([Symbol]) [Exchange Rate to EUR]
Example: LOCAL_CURRENCY: JPY (¥) 161.29

Key Details:
- Arrival: ${arrival}
- Hotel: ${hotel}
- Departure: ${departure}
- Total Days: ${dayDiff}

Format each day EXACTLY as shown below:

Day 1:
- Activity: [Name]
  Description: [2-3 short sentences]
  Recommended Time: [Duration]
  Cost: [Amount in local currency with symbol] ([Amount in EUR with €])
  Travel Time: [Duration from previous location]
  Travel Cost: [Amount in local currency with symbol] ([Amount in EUR with €])

- Restaurant: [Name] (Lunch)
  Description: [2-3 short sentences]
  Must-Try: [Signature dish]
  Cost: [Amount in local currency with symbol] ([Amount in EUR with €])
  Rating: [4.0+ rating]
  Category: [Cheap Eats/Mid-range/Fine Dining]
  Travel Time: [Duration from previous location]
  Travel Cost: [Amount in local currency with symbol] ([Amount in EUR with €])

- Activity: [Name]
  Description: [2-3 short sentences]
  Recommended Time: [Duration]
  Cost: [Amount in local currency with symbol] ([Amount in EUR with €])
  Travel Time: [Duration from previous location]
  Travel Cost: [Amount in local currency with symbol] ([Amount in EUR with €])

- Restaurant: [Name] (Dinner)
  Description: [2-3 short sentences]
  Must-Try: [Signature dish]
  Cost: [Amount in local currency with symbol] ([Amount in EUR with €])
  Rating: [4.0+ rating]
  Category: [Cheap Eats/Mid-range/Fine Dining]
  Travel Time: [Duration from previous location]
  Travel Cost: [Amount in local currency with symbol] ([Amount in EUR with €])

Day 2:
[Follow same format as Day 1]

[Continue for remaining days...]

Guidelines:
1. Start Day 1 with airport arrival and hotel check-in
2. End the last day with airport departure
3. Include exactly 4 activities per day (2 activities + lunch + dinner)
4. All restaurants must be currently operating with 4.0+ rating
5. Vary restaurant price categories throughout the trip
6. Include at least one highly-rated local restaurant per day
7. All costs must be in both local currency and EUR
8. Travel times and costs must be realistic for the city
9. Activities should be well-distributed throughout the day
10. Consider opening hours for all venues

Remember:
- Only include real, operating venues
- Verify all locations exist on Google Maps
- Ensure realistic travel times between locations
- Include clear travel costs for all movements
- Mark meals clearly with (Lunch) or (Dinner)
- Keep descriptions concise and informative`;
}

function getPriceRangeText(priceRange: string): string {
  switch (priceRange) {
    case 'budget':
      return '€5-€20 per night';
    case 'economy':
      return '€20-€50 per night';
    case 'standard':
      return '€50-€150 per night';
    case 'comfort':
      return '€150-€300 per night';
    case 'first_class':
      return '€300-€500 per night';
    case 'luxury':
      return '€500-€5000 per night';
    default:
      return '';
  }
}