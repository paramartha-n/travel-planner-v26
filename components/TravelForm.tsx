"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TravelFormData, Currency } from "@/lib/types";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { currencies, defaultCurrency } from "@/lib/utils/currency";
import { AccommodationPreferences } from "./AccommodationPreferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, ArrowRight, ArrowLeft } from "lucide-react";
import { generateHotelSearch } from "@/lib/gemini/hotels";

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  isLoading: boolean;
  onCurrencyChange: (currency: Currency) => void;
}

export function TravelForm({ onSubmit, isLoading, onCurrencyChange }: TravelFormProps) {
  const [formData, setFormData] = useState<TravelFormData>({
    city: "",
    hotel: "",
    arrivalDateTime: "",
    departureDateTime: "",
    priceRange: undefined,
  });
  const [step, setStep] = useState(1);
  const [minDateTime, setMinDateTime] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(defaultCurrency);
  const [isSearchingHotel, setIsSearchingHotel] = useState(false);

  useEffect(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    setMinDateTime(today.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSearchingHotel(true);
      
      // If no hotel is specified but we have a price range, perform hotel search
      if (!formData.hotel && formData.priceRange) {
        const hotelRecommendation = await generateHotelSearch({
          city: formData.city,
          arrivalDateTime: formData.arrivalDateTime,
          departureDateTime: formData.departureDateTime,
          priceRange: formData.priceRange
        });

        if (hotelRecommendation) {
          const updatedFormData = {
            ...formData,
            hotel: hotelRecommendation
          };
          onSubmit(updatedFormData);
          return;
        }
      }

      // If we have a hotel specified or hotel search failed, proceed with current data
      onSubmit(formData);
    } catch (error) {
      console.error("Error during hotel search:", error);
      // If hotel search fails, use a default value
      const updatedFormData = {
        ...formData,
        hotel: formData.hotel || `Hotel in ${formData.city}`
      };
      onSubmit(updatedFormData);
    } finally {
      setIsSearchingHotel(false);
    }
  };

  const handleChange = (field: keyof TravelFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "arrivalDateTime" && newData.departureDateTime && 
          new Date(value) > new Date(newData.departureDateTime)) {
        newData.departureDateTime = value;
      }
      if (field === "departureDateTime" && newData.arrivalDateTime && 
          new Date(value) < new Date(newData.arrivalDateTime)) {
        newData.arrivalDateTime = value;
      }
      return newData;
    });
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const newCurrency = currencies[currencyCode];
    setSelectedCurrency(newCurrency);
    onCurrencyChange(newCurrency);
  };

  const handleAccommodationSelect = (priceRange: string) => {
    setFormData(prev => ({
      ...prev,
      priceRange,
      hotel: "" // Clear hotel when using accommodation search
    }));
    setStep(4); // Skip to final step
  };

  const handleManualHotel = () => {
    setFormData(prev => ({
      ...prev,
      priceRange: undefined // Clear price range when choosing manual hotel
    }));
    setStep(4); // Go to hotel input step
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.city.length > 0;
      case 2: return formData.arrivalDateTime && formData.departureDateTime;
      case 3: return true; // Can always proceed from accommodation preferences
      case 4: return formData.hotel.length > 0 || formData.priceRange;
      default: return false;
    }
  };

  const isFormProcessing = isLoading || isSearchingHotel;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="h-2 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex justify-end">
          <Select
            value={selectedCurrency.code}
            onValueChange={handleCurrencyChange}
            defaultValue="EUR"
          >
            <SelectTrigger className="w-fit text-xs">
              <Globe className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(currencies).map(([code, currency]) => (
                <SelectItem key={code} value={code} className="text-xs">
                  {currency.symbol} {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Where would you like to go?</h2>
            <PlacesAutocomplete
              value={formData.city}
              onChange={(value) => handleChange("city", value)}
              placeholder="Enter city name"
              type="cities"
              required
              disabled={isFormProcessing}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">When are you traveling?</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="arrivalDateTime" className="block text-sm font-medium mb-1">
                  Arrival
                </label>
                <input
                  id="arrivalDateTime"
                  type="datetime-local"
                  value={formData.arrivalDateTime}
                  onChange={(e) => handleChange("arrivalDateTime", e.target.value)}
                  min={minDateTime}
                  required
                  disabled={isFormProcessing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="departureDateTime" className="block text-sm font-medium mb-1">
                  Departure
                </label>
                <input
                  id="departureDateTime"
                  type="datetime-local"
                  value={formData.departureDateTime}
                  onChange={(e) => handleChange("departureDateTime", e.target.value)}
                  min={formData.arrivalDateTime || minDateTime}
                  required
                  disabled={isFormProcessing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-center">
              Let's find you a place to stay
            </h2>
            <AccommodationPreferences onSelect={handleAccommodationSelect} />
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleManualHotel}
                className="text-sm"
              >
                I already have a hotel in mind
              </Button>
            </div>
          </div>
        )}

        {step === 4 && !formData.priceRange && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Where will you be staying?</h2>
            <PlacesAutocomplete
              value={formData.hotel}
              onChange={(value) => handleChange("hotel", value)}
              placeholder="Enter hotel name"
              type="establishments"
              cityContext={formData.city}
              required
              disabled={isFormProcessing}
            />
          </div>
        )}

        {step === 4 && formData.priceRange && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Ready to plan your trip!</h2>
            <p className="text-sm text-muted-foreground">
              We'll find you the perfect hotel based on your preferences and create a personalized itinerary.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFormProcessing}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed() || isFormProcessing}
              className="flex items-center gap-2 ml-auto"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!canProceed() || isFormProcessing}
              className="flex items-center gap-2 ml-auto"
            >
              {isSearchingHotel ? "Finding Hotel..." : isLoading ? "Generating Itinerary..." : "Plan Travel"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}