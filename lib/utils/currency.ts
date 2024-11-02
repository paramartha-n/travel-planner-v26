"use client";

import { Currency, Cost } from "../types";

export const currencies: Record<string, Currency> = {
  EUR: { code: "EUR", symbol: "€", rate: 1 },
  USD: { code: "USD", symbol: "$", rate: 1 },
  GBP: { code: "GBP", symbol: "£", rate: 1 },
  JPY: { code: "JPY", symbol: "¥", rate: 1 },
  CHF: { code: "CHF", symbol: "CHF", rate: 1 },
  AUD: { code: "AUD", symbol: "A$", rate: 1 },
  CAD: { code: "CAD", symbol: "C$", rate: 1 },
  CNY: { code: "CNY", symbol: "¥", rate: 1 },
  HKD: { code: "HKD", symbol: "HK$", rate: 1 },
  SGD: { code: "SGD", symbol: "S$", rate: 1 },
  THB: { code: "THB", symbol: "฿", rate: 1 }
};

export const defaultCurrency = currencies.EUR;

// Cache exchange rates
let exchangeRates: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchExchangeRates(): Promise<void> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION && Object.keys(exchangeRates).length > 0) {
    return;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/EUR`
    );
    const data = await response.json();
    
    if (data.result === "success") {
      exchangeRates = data.conversion_rates;
      lastFetchTime = now;
      
      // Update currency rates
      Object.keys(currencies).forEach(code => {
        if (exchangeRates[code]) {
          currencies[code].rate = exchangeRates[code];
        }
      });
    }
  } catch (error) {
    console.warn("Failed to fetch exchange rates:", error);
  }
}

// Initialize exchange rates
if (typeof window !== 'undefined') {
  fetchExchangeRates();
}

export function formatCurrency(cost: Cost): string {
  if (!cost || typeof cost.amount !== 'number' || !cost.currency) {
    return 'Free';
  }

  if (cost.amount === 0) {
    return 'Free';
  }

  const formattedAmount = cost.amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${cost.currency.symbol}${formattedAmount}`;
}

export async function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): Promise<number> {
  if (amount === 0 || fromCurrency.code === toCurrency.code) {
    return amount;
  }

  await fetchExchangeRates();

  // Convert using the latest rates
  const fromRate = exchangeRates[fromCurrency.code] || fromCurrency.rate;
  const toRate = exchangeRates[toCurrency.code] || toCurrency.rate;

  // Convert through EUR as base currency
  const eurAmount = amount / fromRate;
  return Math.round(eurAmount * toRate * 100) / 100;
}

export function createCost(amount: number, currency: Currency): Cost {
  return { amount, currency };
}

export async function sumCosts(costs: Cost[], targetCurrency: Currency): Promise<Cost> {
  await fetchExchangeRates();

  const totalInEur = await costs.reduce(async (promisedSum, cost) => {
    const sum = await promisedSum;
    if (!cost || !cost.currency) return sum;
    
    const convertedAmount = await convertCurrency(
      cost.amount,
      cost.currency,
      currencies.EUR
    );
    return sum + convertedAmount;
  }, Promise.resolve(0));

  const totalInTargetCurrency = await convertCurrency(
    totalInEur,
    currencies.EUR,
    targetCurrency
  );

  return createCost(totalInTargetCurrency, targetCurrency);
}

export function getDefaultCurrency(): Currency {
  return defaultCurrency;
}

export function setUserCurrency(currency: Currency): void {
  try {
    localStorage.setItem('preferredCurrency', currency.code);
  } catch {
    // Ignore storage errors
  }
}