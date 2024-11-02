import { GoogleGenerativeAI } from "@google/generative-ai";
import { TravelFormData, TravelItinerary } from "./types";
import { createItineraryPrompt } from "./gemini/prompt";
import { parseItinerary } from "./gemini/parser";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096, // Increased for longer itineraries
  },
});

const TIMEOUT_DURATION = 30000; // Increased to 30 seconds for longer itineraries

export async function generateItinerary(formData: TravelFormData): Promise<TravelItinerary> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured. Please check your environment variables.");
    }
    
    // Validate dates
    const arrival = new Date(formData.arrivalDateTime);
    const departure = new Date(formData.departureDateTime);
    
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      throw new Error("Invalid date format. Please check your dates.");
    }
    
    if (arrival >= departure) {
      throw new Error("Departure date must be after arrival date.");
    }

    // Calculate number of days
    const dayDiff = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff > 14) {
      throw new Error("Maximum trip duration is 14 days. Please adjust your dates.");
    }

    // Validate required fields
    if (!formData.city.trim()) {
      throw new Error("City is required.");
    }
    
    if (!formData.hotel.trim()) {
      throw new Error("Hotel is required.");
    }

    const prompt = createItineraryPrompt(
      formData.city,
      formData.hotel,
      formData.arrivalDateTime,
      formData.departureDateTime
    );

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(
        "Request timed out. For longer itineraries, try breaking your trip into smaller segments."
      )), TIMEOUT_DURATION);
    });

    // Race between the API call and timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;

    if (!result?.response) {
      throw new Error("Failed to generate itinerary. Please try again.");
    }

    const text = result.response.text();
    
    if (!text) {
      throw new Error("Failed to generate itinerary. Please try again.");
    }

    return await parseItinerary(text, formData);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
      if (error.message.includes("key")) {
        throw new Error("Invalid API key. Please check your configuration.");
      }
      if (error.message.includes("timeout")) {
        throw new Error(
          "Request timed out. For longer itineraries, try breaking your trip into smaller segments."
        );
      }
      throw error;
    }
    
    throw new Error("An unexpected error occurred. Please try again.");
  }
}