type PricingItem = {
  name: string;
  price: number;
  days: number;
  duration: string;
  limit: number;
  unlimited: boolean;
};

export const PRICING: {
  LIST: Record<string, PricingItem>;
} = {
  LIST: {
    "1": { name: "Phoenix", price: 1000, days: 1, duration: "1 Day", limit: 1000, unlimited: false },
    "3": { name: "Phoenix Plus", price: 2500, days: 3, duration: "3 Days", limit: 3000, unlimited: false },
    "7": { name: "Phoenix Pro", price: 5000, days: 7, duration: "1 Week", limit: 5000, unlimited: false },
    "14": { name: "Dragon", price: 8000, days: 14, duration: "2 Weeks", limit: 10000, unlimited: false },
    "30": { name: "Dragon Plus", price: 15000, days: 30, duration: "1 Month", limit: 20000, unlimited: false },
    "60": { name: "Griffin", price: 35000, days: 60, duration: "2 Months", limit: 999999, unlimited: true },
    "90": { name: "Titan", price: 50000, days: 90, duration: "3 Months", limit: 999999, unlimited: true },
    "365": { name: "Kraken", price: 100000, days: 365, duration: "1 Year", limit: 999999, unlimited: true },
  },
};
