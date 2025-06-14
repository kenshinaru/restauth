type PricingItem = {
  key: string
  name: string
  price: number
  days: number
  duration: string
  limit: number
  unlimited: boolean
  isPopular: boolean
  features: string[]
}

export const PRICING: {
  LIST: PricingItem[]
} = {
  LIST: [
    {
      key: "phoenix",
      name: "Phoenix",
      price: 3500,
      limit: 5000,
      duration: "1 Month",
      days: 30,
      unlimited: false,
      isPopular: false,
      features: ["5K Requests Limit", "Custom Apikey", "Active 1 Month", "Admin Support", "All API Access"],
    },
    {
      key: "phoenix_plus",
      name: "Phoenix Plus",
      price: 6500,
      limit: 5000,
      duration: "2 Months",
      days: 60,
      unlimited: false,
      isPopular: false,
      features: ["5K Requests Limit", "Custom Apikey", "Active 2 Months", "Admin Support", "All API Access"],
    },
    {
      key: "phoenix_pro",
      name: "Phoenix Pro",
      price: 10000,
      limit: 999999,
      duration: "3 Months",
      days: 90,
      unlimited: true,
      isPopular: false,
      features: ["5K Requests Limit", "Custom Apikey", "Active 3 Months", "Admin Support", "All API Access"],
    },
    {
      key: "dragon",
      name: "Dragon",
      price: 7000,
      limit: 10000,
      duration: "1 Month",
      days: 30,
      unlimited: false,
      isPopular: true,
      features: ["10K Requests Limit", "Custom Apikey", "Active 1 Month", "Admin Support", "All API Access"],
    },
    {
      key: "dragon_plus",
      name: "Dragon Plus",
      price: 10500,
      limit: 10000,
      duration: "2 Months",
      days: 60,
      unlimited: false,
      isPopular: false,
      features: ["10K Requests Limit", "Custom Apikey", "Active 2 Months", "Admin Support", "All API Access"],
    },
    {
      key: "griffin",
      name: "Griffin",
      price: 14000,
      limit: 20000,
      duration: "1 Month",
      days: 30,
      unlimited: false,
      isPopular: false,
      features: ["20K Requests Limit", "Custom Apikey", "Active 1 Month", "Admin Support", "All API Access"],
    },
    {
      key: "titan",
      name: "Titan",
      price: 20000,
      limit: 50000,
      duration: "1 Month",
      days: 30,
      unlimited: false,
      isPopular: false,
      features: ["50K Requests Limit", "Custom Apikey", "Active 1 Month", "Admin Support", "All API Access"],
    },
    {
      key: "kraken",
      name: "Kraken",
      price: 25000,
      limit: 50000,
      duration: "3 Months",
      days: 90,
      unlimited: false,
      isPopular: false,
      features: ["50K Requests Limit", "Custom Apikey", "Active 3 Months", "Admin Support", "All API Access"],
    },
    {
      key: "leviathan",
      name: "Leviathan",
      price: 50000, 
      limit: 100000,
      duration: "6 Months",
      days: 180,
      unlimited: false,
      isPopular: false,
      features: ["100K Requests Limit", "Custom Apikey", "Active 6 Months", "Admin Support", "All API Access"],
    },
    {
      key: "celestial",
      name: "Celestial",
      price: 35000,
      limit: 50000,
      duration: "1 Year",
      days: 365,
      unlimited: false,
      isPopular: false,
      features: ["50K Requests Limit", "Custom Apikey", "Active 1 Year", "Admin Support", "All API Access"],
    },
    {
      key: "immortal",
      name: "Immortal",
      price: 50000, 
      limit: 999999,
      duration: "1 Year",
      days: 365,
      unlimited: true,
      isPopular: false,
      features: ["100K Requests Limit", "Custom Apikey", "Active 1 Year", "Admin Support", "All API Access"],
    },
  ],
}
