"use client"

import { useEffect, useState, useCallback } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getWeatherData, getLocationCoordinates } from "@/lib/openweather"
import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, AIInsight } from "@/lib/types"

export function useWeather(userId: string | undefined, location: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async () => {
    if (!userId || !location) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { latitude, longitude, name } = await getLocationCoordinates(location)

      // ✅ Ensure getWeatherData requests metric units (Celsius)
      const data = await getWeatherData(latitude, longitude, "metric")

      const current: CurrentWeather = {
        temperature: Math.round(data.current.temp),
        feelsLike: Math.round(data.current.feels_like),
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: Math.round(data.current.wind_speed * 10) / 10,
        windDirection: data.current.wind_deg,
        cloudCover: data.current.clouds,
        visibility: Math.round(data.current.visibility / 1000),
        uvIndex: 0, // Free API doesn't include UV index
        condition: data.current.weather[0].main,
        icon: data.current.weather[0].icon,
        description: data.current.weather[0].description, // ✅ added
      }

      const hourly: HourlyForecast[] = data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 10) / 10,
        precipitation: item.pop ? Math.round(item.pop * 100) : 0,
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
      }))

      const dailyMap = new Map<string, any[]>()
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString()
        if (!dailyMap.has(date)) dailyMap.set(date, [])
        dailyMap.get(date)!.push(item)
      })

      const daily: DailyForecast[] = Array.from(dailyMap.entries())
        .slice(0, 5)
        .map(([_, items]) => ({
          date: new Date(items[0].dt * 1000),
          tempMax: Math.round(Math.max(...items.map((i: any) => i.main.temp_max))),
          tempMin: Math.round(Math.min(...items.map((i: any) => i.main.temp_min))),
          humidity: Math.round(items.reduce((sum: number, i: any) => sum + i.main.humidity, 0) / items.length),
          windSpeed: Math.round((items[0].wind.speed * 10) / 10),
          precipitation: Math.max(...items.map((i: any) => (i.pop ? i.pop * 100 : 0))),
          condition: items[0].weather[0].main,
          icon: items[0].weather[0].icon,
          sunrise: new Date((items[0].sys?.sunrise || 0) * 1000),
          sunset: new Date((items[0].sys?.sunset || 0) * 1000),
        }))

      const aiInsights = generateAIInsights(current, daily[0], location)

      const weatherData: WeatherData = {
        id: `${userId}_${Date.now()}`,
        userId,
        location: name,
        latitude,
        longitude,
        current,
        forecast: hourly,
        dailyForecast: daily,
        aiInsights,
        updatedAt: new Date(),
      }

      setWeatherData(weatherData)

      if (userId) {
        await setDoc(doc(db, "weather", userId), weatherData)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch weather"
      setError(message)
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [userId, location])

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWeather])

  return { weatherData, loading, error, refetch: fetchWeather }
}

function generateAIInsights(current: CurrentWeather, tomorrow: DailyForecast, location: string): AIInsight[] {
  const insights: AIInsight[] = []

  if (current.humidity > 80) {
    insights.push({
      type: "warning",
      title: "High Humidity",
      description: "Muggy conditions. Stay hydrated and dress comfortably.",
      priority: "medium",
      icon: "droplets",
    })
  }

  if (current.windSpeed > 40) {
    insights.push({
      type: "warning",
      title: "Strong Winds",
      description: `Wind speed is ${Math.round(current.windSpeed)} km/h. Be cautious outdoors.`,
      priority: "high",
      icon: "wind",
    })
  }

  if (tomorrow.precipitation > 50) {
    insights.push({
      type: "warning",
      title: "Heavy Rain Expected",
      description: `${tomorrow.precipitation}% chance of rain soon. Bring an umbrella.`,
      priority: "high",
      icon: "cloud-rain",
    })
  }

  if (current.humidity < 70 && current.windSpeed < 20) {
    insights.push({
      type: "recommendation",
      title: "Perfect Outdoor Weather",
      description: "Great conditions for outdoor activities like hiking or cycling.",
      priority: "low",
      icon: "activity",
    })
  }

  const tempDiff = tomorrow.tempMax - current.temperature
  if (tempDiff > 5) {
    insights.push({
      type: "trend",
      title: "Temperature Rising",
      description: `It will warm up to ${tomorrow.tempMax}°C tomorrow.`,
      priority: "low",
      icon: "trending-up",
    })
  }

  return insights.slice(0, 5)
}
