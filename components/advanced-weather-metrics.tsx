"use client"

import type { CurrentWeather, DailyForecast } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Cloud, Droplets, Wind, Eye, Gauge, Thermometer } from "lucide-react"

export function AdvancedWeatherMetrics({
  current,
  daily,
}: { current: CurrentWeather | null; daily: DailyForecast | null }) {
  if (!current) return null

  const feelsLike = (current as any).feelsLike || current.temperature

  const metrics = [
    {
      label: "Feels Like",
      value: `${Math.round(feelsLike)}°`,
      icon: Thermometer,
      color: "text-orange-400",
    },
    {
      label: "Humidity",
      value: `${current.humidity}%`,
      icon: Droplets,
      color: "text-blue-400",
    },
    {
      label: "Wind Speed",
      value: `${current.windSpeed} km/h`,
      icon: Wind,
      color: "text-purple-400",
    },
    {
      label: "Visibility",
      value: `${current.visibility} km`,
      icon: Eye,
      color: "text-cyan-400",
    },
    {
      label: "Pressure",
      value: `${current.pressure} mb`,
      icon: Gauge,
      color: "text-yellow-400",
    },
    {
      label: "Cloud Cover",
      value: `${current.cloudCover}%`,
      icon: Cloud,
      color: "text-gray-400",
    },
  ]

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Weather Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-xs md:text-sm text-muted-foreground font-medium">{metric.label}</h4>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <p className={`text-lg md:text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
