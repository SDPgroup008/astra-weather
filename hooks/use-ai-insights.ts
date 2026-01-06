"use client"

import { useEffect, useState } from "react"
import type { AIInsight, WeatherData, UserPreferences } from "@/lib/types"

export interface UserActivity {
  type: "outdoor" | "sports" | "commute" | "travel" | "indoor"
  frequency: number
  preferredWeather: string[]
}

export function useAIInsights(weatherData: WeatherData | null, preferences: UserPreferences | null) {
  const [insights, setInsights] = useState<AIInsight[]>([])

  useEffect(() => {
    if (!weatherData || !preferences) return

    const enhancedInsights = generatePersonalizedInsights(weatherData, preferences, getStoredActivityProfile())
    setInsights(enhancedInsights)
  }, [weatherData, preferences])

  return { insights }
}

function getStoredActivityProfile(): UserActivity {
  // In a real app, this would come from user history and Firebase
  // For now, return a default profile
  return {
    type: "commute",
    frequency: 5,
    preferredWeather: ["clear", "partly-cloudy"],
  }
}

function generatePersonalizedInsights(
  weatherData: WeatherData,
  preferences: UserPreferences,
  activity: UserActivity,
): AIInsight[] {
  const insights: AIInsight[] = []
  const { current, dailyForecast } = weatherData

  // Commute recommendations
  if (activity.type === "commute" || activity.frequency > 3) {
    const isGoodCommute =
      current.windSpeed < 30 && current.visibility > 5 && current.temperature > -5 && current.temperature < 35

    if (isGoodCommute) {
      insights.push({
        type: "recommendation",
        title: "Ideal Commute Weather",
        description: "Excellent conditions for your commute. Safe driving and comfortable travel.",
        priority: "low",
        icon: "activity",
      })
    } else {
      const warnings: string[] = []
      if (current.windSpeed > 30) warnings.push(`high winds (${current.windSpeed} m/s)`)
      if (current.visibility < 5) warnings.push("low visibility")
      if (current.temperature < -5 || current.temperature > 35) warnings.push("extreme temperature")

      insights.push({
        type: "warning",
        title: "Commute Alert",
        description: `Be cautious: ${warnings.join(", ")}. Allow extra travel time.`,
        priority: "high",
        icon: "wind",
      })
    }
  }

  // Sports/Outdoor activity recommendations
  if (activity.type === "sports" || activity.type === "outdoor") {
    const tomorrow = dailyForecast[0]

    if (current.humidity < 70 && current.windSpeed < 20 && current.uvIndex < 6) {
      insights.push({
        type: "recommendation",
        title: "Perfect for Outdoor Activities",
        description: `${current.condition} today. Great day for sports, cycling, or hiking. Apply sunscreen (UV: ${current.uvIndex}).`,
        priority: "low",
        icon: "activity",
      })
    }

    if (tomorrow.precipitation > 60) {
      insights.push({
        type: "warning",
        title: "Rain Expected Tomorrow",
        description: `${tomorrow.precipitation}% chance of precipitation. Plan indoor activities or postpone outdoor sports.`,
        priority: "medium",
        icon: "cloud-rain",
      })
    }
  }

  // Temperature-based alerts
  const tempTrend = dailyForecast.slice(0, 3).map((d) => d.tempMax)
  const tempChanging = Math.abs(tempTrend[2] - tempTrend[0]) > 8

  if (tempChanging) {
    const direction = tempTrend[2] > tempTrend[0] ? "warming up" : "cooling down"
    insights.push({
      type: "trend",
      title: `Temperature ${direction}`,
      description: `${direction.charAt(0).toUpperCase() + direction.slice(1)} significantly over the next 3 days. Adjust your wardrobe accordingly.`,
      priority: "low",
      icon: "trending-up",
    })
  }

  // Air quality and health warnings
  if (current.humidity > 85) {
    insights.push({
      type: "warning",
      title: "High Humidity Alert",
      description: "Extremely humid conditions. Stay hydrated and limit strenuous outdoor activity.",
      priority: "medium",
      icon: "droplets",
    })
  }

  // Allergy season indicator (simplified)
  const month = new Date().getMonth()
  if ((month >= 2 && month <= 4) || (month >= 8 && month <= 10)) {
    if (current.windSpeed > 20) {
      insights.push({
        type: "warning",
        title: "High Pollen Count Alert",
        description: "Windy conditions increase pollen spread. Take allergy medication if needed.",
        priority: "medium",
        icon: "wind",
      })
    }
  }

  // Sunrise/Sunset recommendations
  const sunrise = dailyForecast[0].sunrise
  const sunset = dailyForecast[0].sunset
  const now = new Date()

  if (current.condition.toLowerCase().includes("clear") && Math.abs(now.getTime() - sunrise.getTime()) < 3600000) {
    insights.push({
      type: "recommendation",
      title: "Beautiful Sunrise Coming",
      description: `Clear skies expected at sunrise (${sunrise.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}). Great for photography!`,
      priority: "low",
      icon: "sun",
    })
  }

  return insights.slice(0, 6)
}
