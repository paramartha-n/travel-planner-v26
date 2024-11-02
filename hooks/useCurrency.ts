"use client";

import { useState, useEffect } from 'react';
import { Currency } from '@/lib/types';
import { getDefaultCurrency, setUserCurrency, defaultCurrency } from '@/lib/utils/currency';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const userCurrency = getDefaultCurrency();
    setCurrency(userCurrency);
  }, []);

  const updateCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setUserCurrency(newCurrency);
  };

  return {
    currency,
    updateCurrency
  };
}