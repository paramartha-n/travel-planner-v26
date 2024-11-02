"use client";

import { useState, useEffect } from "react";
import { Cost, Currency } from "@/lib/types";
import { convertCurrency, formatCurrency, createCost } from "@/lib/utils/currency";

interface CostDisplayProps {
  cost: Cost;
  selectedCurrency: Currency;
  className?: string;
}

export function CostDisplay({ cost, selectedCurrency, className = "" }: CostDisplayProps) {
  const [convertedCost, setConvertedCost] = useState<Cost | null>(null);

  useEffect(() => {
    async function convert() {
      if (!cost || !cost.currency || cost.amount === 0) {
        return;
      }

      if (cost.currency.code === selectedCurrency.code) {
        setConvertedCost(null);
        return;
      }

      try {
        const convertedAmount = await convertCurrency(
          cost.amount,
          cost.currency,
          selectedCurrency
        );
        setConvertedCost(createCost(convertedAmount, selectedCurrency));
      } catch (error) {
        console.warn("Failed to convert currency:", error);
        setConvertedCost(null);
      }
    }

    convert();
  }, [cost, selectedCurrency]);

  if (!cost || !cost.currency || cost.amount === 0) {
    return <span className={className}>Free</span>;
  }

  return (
    <span className={className}>
      {formatCurrency(cost)}
      {convertedCost && (
        <span className="text-muted-foreground ml-1">
          ({formatCurrency(convertedCost)})
        </span>
      )}
    </span>
  );
}