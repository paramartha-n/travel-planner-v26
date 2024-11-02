"use client";

import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

interface AccommodationPreferencesProps {
  onSelect: (priceRange: string) => void;
}

export function AccommodationPreferences({ onSelect }: AccommodationPreferencesProps) {
  const accommodationTypes = [
    {
      level: 1,
      type: "Backpacking",
      range: "€5-€20 per night",
      searchParams: "budget",
    },
    {
      level: 2,
      type: "Budget",
      range: "€20-€50 per night",
      searchParams: "economy",
    },
    {
      level: 3,
      type: "Standard",
      range: "€50-€150 per night",
      searchParams: "standard",
    },
    {
      level: 4,
      type: "Comfort",
      range: "€150-€300 per night",
      searchParams: "comfort",
    },
    {
      level: 5,
      type: "First Class",
      range: "€300-€500 per night",
      searchParams: "first_class",
    },
    {
      level: 6,
      type: "Luxury",
      range: "€500-€5000 per night",
      searchParams: "luxury",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {accommodationTypes.map((accommodation) => (
        <Button
          key={accommodation.level}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => onSelect(accommodation.searchParams)}
        >
          <div className="flex gap-0.5 text-primary">
            {[...Array(accommodation.level)].map((_, i) => (
              <DollarSign key={i} className="h-4 w-4" />
            ))}
          </div>
          <div className="mt-2 font-semibold">{accommodation.type}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {accommodation.range}
          </div>
        </Button>
      ))}
    </div>
  );
}