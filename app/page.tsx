"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TravelForm } from "@/components/TravelForm";
import { Itinerary } from "@/components/Itinerary";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { generateItinerary } from "@/lib/gemini";
import { saveItinerary } from "@/lib/db/supabase";
import { TravelItinerary, TravelFormData, Currency } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getDefaultCurrency } from "@/lib/utils/currency";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accordionValue, setAccordionValue] = useState("travel-form");
  const [lastFormData, setLastFormData] = useState<TravelFormData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(getDefaultCurrency());
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formData: TravelFormData) => {
    setIsLoading(true);
    setError(null);
    setAccordionValue("");
    setLastFormData(formData);
    
    try {
      const generatedItinerary = await generateItinerary(formData);
      setItinerary(generatedItinerary);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setAccordionValue("travel-form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itinerary || !lastFormData) return;

    setIsSaving(true);
    try {
      const id = await saveItinerary(lastFormData, itinerary);
      toast({
        title: "Itinerary Saved!",
        description: "Your travel itinerary has been saved successfully.",
      });
      router.push("/saved");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Saving Itinerary",
        description: "Failed to save your itinerary. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    if (lastFormData) {
      handleSubmit(lastFormData);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <Accordion 
          type="single" 
          collapsible 
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="transition-all duration-1000 ease-in-out pt-2"
        >
          <AccordionItem value="travel-form">
            <AccordionTrigger className="text-sm font-medium text-center justify-center">
              Your Trip Details
            </AccordionTrigger>
            <AccordionContent>
              <TravelForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                onCurrencyChange={setSelectedCurrency}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {error && (
          <Alert variant="destructive" className="flex flex-col items-center text-center mt-4">
            <AlertCircle className="h-6 w-6 mb-2" />
            <AlertDescription className="text-lg mb-4">{error}</AlertDescription>
            <Button variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
          </Alert>
        )}
        
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          itinerary && (
            <div className="space-y-4">
              <Itinerary 
                itinerary={itinerary} 
                selectedCurrency={selectedCurrency} 
              />
              <div className="max-w-4xl mx-auto px-6 pb-8">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Itinerary"}
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}