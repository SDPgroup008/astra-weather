"use client"

import type React from "react"
import type { CurrentWeather } from "@/lib/types"
import { Cloud, CloudRain, Sun, Wind, Eye, Gauge } from "lucide-react"
import { Card } from "@/components/ui/card"

const iconMap: Record<string, React.ReactNode> = {
  clear: <Sun className="w-24 h-24 text-yellow-400" />,
  clouds: <Cloud className="w-24 h-24 text-gray-400" />,
  rain: <CloudRain className="w-24 h-24 text-blue-400" />,
  drizzle: <CloudRain className="w-24 h-24 text-blue-300" />,
  thunderstorm: <Cloud className="w-24 h-24 text-purple-400" />,
}

export function WeatherHeader({
  current,
  location,
}: {
  current: CurrentWeather | null
  location: string
}) {
  if (!current)
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl text-center p-12">
        <p className="text-muted-foreground">Loading weather data...</p>
      </Card>
    )

  const getIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes("clear") || lower.includes("sunny")) return iconMap.clear
    if (lower.includes("rain")) return iconMap.rain
    if (lower.includes("cloud")) return iconMap.clouds
    if (lower.includes("drizzle")) return iconMap.drizzle
    if (lower.includes("thunder")) return iconMap.thunderstorm
    return iconMap.clouds
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-accent mb-2">{location}</h2>
          <p className="text-muted-foreground mb-6">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {current.temperature}°
            </span>
            <span className="text-xl text-muted-foreground">{current.condition}</span>
          </div>

          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Feels Like</p>
              <p className="text-lg font-bold">{current.feelsLike}°</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Humidity</p>
              <p className="text-lg font-bold">{current.humidity}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-6">{getIcon(current.condition)}</div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg p-4 text-center">
              <Wind className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-bold text-sm">{Math.round(current.windSpeed * 3.6)} km/h</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg p-4 text-center">
              <Gauge className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="font-bold text-sm">{current.pressure} hPa</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg p-4 text-center">
              <Eye className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="font-bold text-sm">{current.visibility} km</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg p-4 text-center">
              <Cloud className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Cloud Cover</p>
              <p className="font-bold text-sm">{current.cloudCover}%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
