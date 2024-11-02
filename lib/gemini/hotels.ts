"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

interface HotelSearchParams {
  city: string;
  arrivalDateTime: string;
  departureDateTime: string;
  priceRange: string;
}

export async function generateHotelSearch(params: HotelSearchParams): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  });

  const arrival = new Date(params.arrivalDateTime);
  const departure = new Date(params.departureDateTime);

  const formattedArrival = arrival.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDeparture = departure.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
  const priceRange = getPriceRangeText(params.priceRange);
  const [minPrice, maxPrice] = extractPriceRange(priceRange);
  const totalBudget = maxPrice * nights;

  const prompt = `Act as an expert hotel concierge. Find a real, currently operating hotel in ${params.city} that matches these criteria:

SEARCH CRITERIA:
- City: ${params.city}
- Check-in: ${formattedArrival}
- Check-out: ${formattedDeparture} (${nights} nights)
- Price Range: ${priceRange} (Total budget up to €${totalBudget})
- Location: Within 3km of city center
- Rating: Minimum 8.0/10 on Booking.com
- Must be currently operational and accepting reservations

REQUIREMENTS:
- Hotel MUST be a real, verifiable property
- Must be well-connected to public transport
- Must be in a safe, tourist-friendly area
- Must have 24/7 reception
- Must have air conditioning and Wi-Fi
- Must have recent reviews (within last 6 months)
- Must be suitable for international travelers

IMPORTANT:
1. Do NOT suggest hotels that are permanently or temporarily closed
2. Do NOT suggest hotels under renovation
3. Do NOT make up or invent hotel names
4. Verify the hotel exists on major booking platforms
5. Price must be within specified range
6. Must be an actual hotel (not apartment or guesthouse)

Return ONLY the hotel name in this exact format:
HOTEL: [Full Hotel Name]

Example response:
HOTEL: The Ritz-Carlton Berlin`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract hotel name using regex
    const hotelMatch = text.match(/HOTEL:\s*(.+)/);
    if (hotelMatch && hotelMatch[1]) {
      return hotelMatch[1].trim();
    }
    
    // Fallback to simple text cleaning if format doesn't match
    return text.replace(/HOTEL:\s*/i, '').trim() || `Hotel in ${params.city}`;
  } catch (error) {
    console.error("Error generating hotel recommendation:", error);
    return `Hotel in ${params.city}`;
  }
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
      return '€50-€300 per night';
  }
}

function extractPriceRange(priceRange: string): [number, number] {
  const matches = priceRange.match(/€(\d+)-€(\d+)/);
  if (matches) {
    return [parseInt(matches[1]), parseInt(matches[2])];
  }
  return [50, 300]; // Default range
}