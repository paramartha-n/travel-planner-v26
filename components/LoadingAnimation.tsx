"use client";

import { Bot, MapPin, Utensils, Luggage } from "lucide-react";
import { useEffect, useState } from "react";

const loadingStates = [
  {
    message: "Using AI to learn more about the city..",
    Icon: Bot
  },
  {
    message: "Finding the best places & activities..",
    Icon: MapPin
  },
  {
    message: "Curating the best food & restaurants..",
    Icon: Utensils
  },
  {
    message: "Creating your perfect travel experience..",
    Icon: Luggage
  }
];

export function LoadingAnimation() {
  const [stateIndex, setStateIndex] = useState(0);
  const currentState = loadingStates[stateIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex((current) => {
        // Only increment if we haven't reached the last message
        if (current < loadingStates.length - 1) {
          return current + 1;
        }
        // Clear the interval when we reach the last message
        clearInterval(interval);
        return current;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const IconComponent = currentState.Icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-25">
          <IconComponent className="w-12 h-12 text-primary" />
        </div>
        <IconComponent className="w-12 h-12 text-primary animate-bounce" />
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <p className="text-lg font-medium text-primary animate-pulse min-h-[28px] text-center">
        {currentState.message}
      </p>
    </div>
  );
}