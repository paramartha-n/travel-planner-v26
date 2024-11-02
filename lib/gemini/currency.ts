// Currency mapping for major cities/countries
export const cityToCurrency: Record<string, string> = {
  // Europe
  'Paris': 'EUR',
  'London': 'GBP',
  'Rome': 'EUR',
  'Madrid': 'EUR',
  'Berlin': 'EUR',
  'Amsterdam': 'EUR',
  'Zurich': 'CHF',
  'Geneva': 'CHF',
  // Asia
  'Tokyo': 'JPY',
  'Kyoto': 'JPY',
  'Hong Kong': 'HKD',
  'Singapore': 'SGD',
  'Bangkok': 'THB',
  'Shanghai': 'CNY',
  'Beijing': 'CNY',
  // Americas
  'New York': 'USD',
  'Los Angeles': 'USD',
  'Chicago': 'USD',
  'Toronto': 'CAD',
  'Vancouver': 'CAD',
  // Australia
  'Sydney': 'AUD',
  'Melbourne': 'AUD'
};

export function detectLocalCurrency(city: string): string {
  // Remove common words and clean the city name
  const cleanCity = city.replace(/(city|town|village|municipality)/i, '').trim();
  
  // Check direct city match
  if (cityToCurrency[cleanCity]) {
    return cityToCurrency[cleanCity];
  }

  // Check if city contains any known city name
  for (const [knownCity, currency] of Object.entries(cityToCurrency)) {
    if (cleanCity.toLowerCase().includes(knownCity.toLowerCase())) {
      return currency;
    }
  }

  // Default to EUR if no match found
  return 'EUR';
}