export interface User {
  id: string
  email: string
  name: string
  isPremium: boolean
  subscriptionEnd?: Date
  subscriptionStart?: Date
  subscriptionStatus?: string
  paypalSubscriptionId?: string
  savedLocations: SavedLocation[]
  defaultLocationId?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt?: Date
}

export interface UserPreferences {
  location: string
  latitude: number
  longitude: number
  tempUnit: "C" | "F"
  windUnit: "ms" | "kmh" | "mph"
  notificationsEnabled: boolean
  darkMode: boolean
  theme: "auto" | "dark" | "light"
}

export interface WeatherData {
  id: string
  userId: string
  location: string
  latitude: number
  longitude: number
  current: CurrentWeather
  forecast: HourlyForecast[]
  dailyForecast: DailyForecast[]
  aiInsights: AIInsight[]
  updatedAt: Date
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  visibility: number
  uvIndex: number
  condition: string
  icon: string
  description?: string // optional if you want to add it
}


export interface HourlyForecast {
  time: Date
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  pressure: number
  cloudCover: number
  condition: string
  icon: string
}

export interface DailyForecast {
  date: Date
  tempMax: number
  tempMin: number
  humidity: number
  windSpeed: number
  precipitation: number
  condition: string
  icon: string
  sunrise: Date
  sunset: Date
}

export interface AIInsight {
  type: "activity" | "warning" | "recommendation" | "trend"
  title: string
  description: string
  priority: "low" | "medium" | "high"
  icon: string
  actionUrl?: string
}

export interface Subscription {
  userId: string
  plan: "free" | "premium"
  status: "active" | "cancelled" | "expired"
  startDate: Date
  endDate?: Date
  stripeCustomerId?: string
  stripePriceId?: string
}

export interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  isDefault: boolean
  createdAt: Date
}
