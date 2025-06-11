export const CONFIG = {
  // Application settings
  APP: {
    TITLE: "Arincy Documentation",
    DESCRIPTION: "Comprehensive API endpoints documentation and testing platform",
    FOOTER: "Arincy API All right reserved",
    VERSION: "1.0.0",
  },

  // API Configuration
  API: {
    CREATOR: "Luthfi Joestars",
    BASE_URL: "https://arincy.vercel.app", // Set your production domain here
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX_REQUESTS: 500, // limit each IP to 500 requests per minute
    MESSAGE: "500 requests/1min",
  },

  // Payment Gateway Configuration
  PAYMENT: {
    OK_MERCHANT: "OK2093447",
    OK_APIKEY: "578444917292265202093447OKCTBBE1030C3BF4CC71097026DE93E0C3BF",
    QRIS_DATA:
      "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214755417675712850303UMI51440014ID.CO.QRIS.WWW0215ID20243553520530303UMI5204541153033605802ID5920KENSHINARU OK20934476010PURWAKARTA61054116662070703A0163048982",
  },

  EWALLET: {
    AN: "M*****D L****I",
    DANA: "081310994964",
    OVO: "081310994964",
    GOPAY: "081310994964",
  },

  // Social Media
  SOCIAL: {
    GITHUB: "https://github.com/kenshinaru",
    INSTAGRAM: "https://instagram.com/urheadfather_",
    WHATSAPP: "https://wa.me/6281310994964",
  },

  // Helper function to get base URL (client-safe)
  getBaseUrl: () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return ""
  },

  // Helper function to get full API URL
  getApiUrl: (endpoint: string) => {
    return `${CONFIG.getBaseUrl()}/api/${endpoint}`
  },
}

export type ConfigType = typeof CONFIG
