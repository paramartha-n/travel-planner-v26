"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useLoadScript } from "@/hooks/useLoadScript";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string) => void;
  placeholder: string;
  type: "cities" | "establishments";
  className?: string;
  required?: boolean;
  disabled?: boolean;
  cityContext?: string;
}

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  type,
  className,
  required = false,
  disabled = false,
  cityContext,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const isLoaded = useLoadScript();
  const selectedPlace = useRef<{ value: string; placeId?: string } | null>(null);
  const isUserTyping = useRef(false);

  // Initialize or update selected place when value prop changes
  useEffect(() => {
    if (!isUserTyping.current) {
      setInputValue(value);
      if (value === selectedPlace.current?.value) {
        return;
      }
      if (value === "") {
        selectedPlace.current = null;
      } else {
        selectedPlace.current = { value };
      }
    }
  }, [value]);

  useEffect(() => {
    if (!inputRef.current || !isLoaded || !window.google?.maps?.places) return;

    // Clean up previous instance
    if (autocomplete) {
      google.maps.event.clearInstanceListeners(autocomplete);
    }

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "name", "place_id"],
      strictBounds: false,
    };

    // Configure options based on type
    if (type === "cities") {
      options.types = ["(cities)"];
    } else {
      options.types = ["lodging"];
      
      // Add search term bias for hotels
      if (inputRef.current) {
        inputRef.current.placeholder = `Search for hotels in ${cityContext || ""}`.trim();
      }
    }

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    // Apply location bias for hotel searches
    if (type === "establishments" && cityContext) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: cityContext }, (results, status) => {
        if (status === "OK" && results?.[0] && autocompleteInstance) {
          const location = results[0].geometry.location;
          const bounds = new google.maps.LatLngBounds();
          
          // Create a radius around the city center (15km for better hotel focus)
          const radius = 15; // kilometers
          const lat = location.lat();
          const lng = location.lng();
          
          const latChange = radius / 111.32;
          const lngChange = radius / (111.32 * Math.cos(lat * (Math.PI / 180)));
          
          bounds.extend(new google.maps.LatLng(lat - latChange, lng - lngChange));
          bounds.extend(new google.maps.LatLng(lat + latChange, lng + lngChange));
          
          // Set search bounds
          autocompleteInstance.setBounds(bounds);
          autocompleteInstance.setOptions({
            strictBounds: true
          });

          // Set country restriction if available
          const countryComponent = results[0].address_components.find(
            component => component.types.includes("country")
          );
          
          if (countryComponent?.short_name) {
            autocompleteInstance.setComponentRestrictions({
              country: countryComponent.short_name
            });
          }
        }
      });
    }

    // Handle place selection
    autocompleteInstance.addListener("place_changed", () => {
      const place = autocompleteInstance.getPlace();
      if (place) {
        isUserTyping.current = false;
        let newValue = "";

        if (type === "cities") {
          // For cities, use the formatted address but remove the country
          newValue = place.formatted_address?.split(",").slice(0, -1).join(",").trim() || place.name || "";
        } else {
          // For hotels, use the place name and add the city for clarity
          newValue = place.name || "";
          if (cityContext && !newValue.toLowerCase().includes(cityContext.toLowerCase())) {
            newValue = `${newValue}, ${cityContext}`;
          }
        }

        selectedPlace.current = { value: newValue, placeId: place.place_id };
        setInputValue(newValue);
        onChange(newValue, place.place_id);
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [type, onChange, cityContext, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    isUserTyping.current = true;
    setInputValue(newValue);

    if (newValue === "") {
      selectedPlace.current = null;
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    isUserTyping.current = false;
    if (selectedPlace.current) {
      setInputValue(selectedPlace.current.value);
      onChange(selectedPlace.current.value, selectedPlace.current.placeId);
    }
  };

  const handleFocus = () => {
    if (type === "establishments" && cityContext) {
      // Don't select all text for hotels to preserve context
      inputRef.current?.setSelectionRange(0, 0);
    } else {
      inputRef.current?.select();
    }
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={type === "establishments" && cityContext ? `Search for hotels in ${cityContext}` : placeholder}
      className={className}
      required={required}
      disabled={disabled || !isLoaded}
      autoComplete="off"
    />
  );
}