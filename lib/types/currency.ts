export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface Cost {
  amount: number;
  currency: Currency;
}

export interface TravelCosts {
  activities: Cost;
  transportation: Cost;
}