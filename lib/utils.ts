import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity, TravelFormData } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractCost(costString: string): { amount: number; currency: string } {
  const cleanedString = costString.replace(/\s+/g, '');
  
  const currencyPatterns = {
    EUR: [/€(\d+)/, /EUR(\d+)/, /(\d+)€/, /(\d+)EUR/],
    USD: [/\$(\d+)/, /USD(\d+)/, /(\d+)\$/, /(\d+)USD/],
    GBP: [/£(\d+)/, /GBP(\d+)/, /(\d+)£/, /(\d+)GBP/],
    JPY: [/¥(\d+)/, /JPY(\d+)/, /(\d+)¥/, /(\d+)JPY/],
    CHF: [/CHF(\d+)/, /(\d+)CHF/],
    AUD: [/A\$(\d+)/, /AUD(\d+)/, /(\d+)A\$/, /(\d+)AUD/],
    CAD: [/C\$(\d+)/, /CAD(\d+)/, /(\d+)C\$/, /(\d+)CAD/],
    CNY: [/¥(\d+)/, /CNY(\d+)/, /(\d+)¥/, /(\d+)CNY/],
    HKD: [/HK\$(\d+)/, /HKD(\d+)/, /(\d+)HK\$/, /(\d+)HKD/],
    SGD: [/S\$(\d+)/, /SGD(\d+)/, /(\d+)S\$/, /(\d+)SGD/],
    THB: [/฿(\d+)/, /THB(\d+)/, /(\d+)฿/, /(\d+)THB/]
  };

  for (const [currency, patterns] of Object.entries(currencyPatterns)) {
    for (const pattern of patterns) {
      const match = cleanedString.match(pattern);
      if (match && match[1]) {
        return { amount: parseInt(match[1], 10), currency };
      }
    }
  }

  // If no currency symbol found, try to extract just the number
  const numberMatch = cleanedString.match(/\d+/);
  if (numberMatch) {
    return { amount: parseInt(numberMatch[0], 10), currency: 'EUR' };
  }

  return { amount: 0, currency: 'EUR' };
}

export function formatCost(cost: { amount: number; currency: string }): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$', 'GBP': '£', 'JPY': '¥', 'CHF': 'CHF',
    'AUD': 'A$', 'CAD': 'C$', 'CNY': '¥', 'HKD': 'HK$',
    'SGD': 'S$', 'THB': '฿', 'EUR': '€'
  };

  const symbol = currencySymbols[cost.currency] || cost.currency;
  return `${symbol}${cost.amount}`;
}

export function getPreviousLocation(activities: Activity[], formData: TravelFormData, isFirstActivityOfDay: boolean = false): string {
  if (isFirstActivityOfDay) {
    return formData.hotel;
  }
  if (activities.length === 0) {
    return formData.hotel;
  }
  return activities[activities.length - 1].name;
}

// High-quality Unsplash images for different types of locations
const images = {
  activity: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
    'https://images.unsplash.com/photo-1548661710-7f540c9c56d6',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e'
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330',
    'https://images.unsplash.com/photo-1560624052-449f5ddf0c31'
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f'
  ]
};

export function getRandomImage(type: 'activity' | 'restaurant' | 'hotel'): string {
  const imageList = images[type];
  return imageList[Math.floor(Math.random() * imageList.length)];
}