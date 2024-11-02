import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelItinerary, Currency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { CostDisplay } from "./CostDisplay";

interface ItineraryProps {
  itinerary: TravelItinerary;
  selectedCurrency: Currency;
}

export function Itinerary({ itinerary, selectedCurrency }: ItineraryProps) {
  const [currentDay, setCurrentDay] = useState(0);
  const itineraryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itineraryRef.current) {
      itineraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [itinerary]);

  if (!itinerary || !itinerary.days) return null;

  const getActivityType = (activity: { name: string; mustTryFood?: string }) => {
    const name = activity.name.toLowerCase();
    if (name.includes('airport')) return 'Airport';
    if (name.includes('hotel') || name.includes('check-in') || name.includes('check out')) return 'Hotel';
    if (name.includes('restaurant') || name.includes('café') || name.includes('dining') || activity.mustTryFood) return 'Restaurant';
    return 'Activity';
  };

  const getLabelStyle = (type: string) => {
    switch (type) {
      case 'Restaurant':
        return 'bg-blue-500 text-white';
      case 'Activity':
        return 'bg-green-500 text-white';
      case 'Airport':
        return 'bg-purple-500 text-white';
      case 'Hotel':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getPriceRange = (cost: { amount: number; currency: Currency }): string => {
    if (cost.amount === 0) return 'Free';
    
    const eurAmount = cost.amount / cost.currency.rate;
    if (eurAmount <= 20) return 'Cheap Eats';
    if (eurAmount <= 50) return 'Mid-range';
    return 'Fine Dining';
  };

  const formatActivityDetails = (activity: any) => {
    if (activity.category === "per night") {
      return (
        <p className="text-sm">⏱️ {activity.recommendedTime} | <CostDisplay cost={activity.cost} selectedCurrency={selectedCurrency} /> per night</p>
      );
    }
    
    if (getActivityType(activity) === 'Restaurant') {
      return (
        <p className="text-sm">
          ⭐ {activity.rating} | {getPriceRange(activity.cost)} | <CostDisplay cost={activity.cost} selectedCurrency={selectedCurrency} />
        </p>
      );
    }
    
    if (activity.recommendedTime) {
      return (
        <p className="text-sm">⏱️ {activity.recommendedTime} | 🎫 <CostDisplay cost={activity.cost} selectedCurrency={selectedCurrency} /></p>
      );
    }

    return null;
  };

  const formatMustTryDish = (mustTryFood: string) => {
    const firstDish = mustTryFood.split(',')[0].trim();
    const [name, description] = firstDish.split('-').map(part => part.trim());
    return (
      <div className="mb-2">
        <div className="font-medium">{name}</div>
        {description && (
          <div className="text-sm text-muted-foreground ml-2">
            {description}
          </div>
        )}
      </div>
    );
  };

  const handleTabChange = (value: string) => {
    const dayIndex = parseInt(value.split('-')[1]);
    setCurrentDay(dayIndex);
    itineraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNextDay = () => {
    if (currentDay < itinerary.days.length - 1) {
      const nextDay = currentDay + 1;
      setCurrentDay(nextDay);
      handleTabChange(`day-${nextDay}`);
    }
  };

  return (
    <div ref={itineraryRef} className="space-y-8 w-full max-w-4xl mx-auto">
      <Tabs 
        value={`day-${currentDay}`}
        onValueChange={handleTabChange}
        className="w-full" 
      >
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
          <TabsList className="w-full h-auto flex flex-nowrap overflow-x-auto bg-zinc-900 p-1">
            {itinerary.days.map((_, index) => (
              <TabsTrigger 
                key={index} 
                value={`day-${index}`}
                className="flex-shrink-0 data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 hover:text-white transition-colors"
              >
                Day {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {itinerary.days.map((day, dayIndex) => (
          <TabsContent 
            key={dayIndex} 
            value={`day-${dayIndex}`}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Day {dayIndex + 1} - {day.date}</h2>
              <div className="space-y-6">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="border-b pb-6 last:border-b-0">
                    <div className="flex justify-end mb-2">
                      <span className={cn(
                        "inline-block px-2 py-1 text-xs font-semibold rounded",
                        getLabelStyle(getActivityType(activity))
                      )}>
                        {getActivityType(activity)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={activity.image}
                          alt={activity.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          priority={dayIndex === 0 && activityIndex === 0}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">{activity.name}</h3>
                          <a
                            href={activity.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm inline-block"
                          >
                            📍 View Location
                          </a>
                        </div>
                        {formatActivityDetails(activity)}
                        <p className="text-muted-foreground">{activity.description}</p>
                        {activity.mustTryFood && (
                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-md">
                            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                              😍 Must-Try Dish:
                            </h4>
                            <div className="text-orange-600 dark:text-orange-200">
                              {formatMustTryDish(activity.mustTryFood)}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          {activity.travelInfo && (
                            <div className="mt-2 p-2 bg-muted rounded-md">
                              <a
                                href={activity.travelInfo.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                🗺️ View Directions | {activity.travelInfo.time} | <CostDisplay cost={activity.travelInfo.cost} selectedCurrency={selectedCurrency} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {dayIndex < itinerary.days.length - 1 && (
                <div className="mt-8">
                  <Button 
                    onClick={handleNextDay}
                    className="w-full flex items-center justify-center gap-2"
                    size="lg"
                  >
                    Next Day <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}