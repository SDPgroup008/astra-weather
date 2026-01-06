"use client"

import type { DailyForecast } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react"

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase()
  if (lower.includes("clear") || lower.includes("sunny")) return <Sun className="w-6 h-6 text-yellow-400" />
  if (lower.includes("rain")) return <CloudRain className="w-6 h-6 text-blue-400" />
  if (lower.includes("cloud")) return <Cloud className="w-6 h-6 text-gray-400" />
  return <Cloud className="w-6 h-6 text-gray-400" />
}

export function DailyForecastComponent({ forecast }: { forecast: DailyForecast[] }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">5-Day Forecast</h3>

      <div className="space-y-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getWeatherIcon(day.condition)}
                <div>
                  <p className="text-sm font-medium">{day.condition}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-lg font-bold">{day.tempMax}°</p>
                <p className="text-sm text-muted-foreground">{day.tempMin}°</p>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>{day.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>{Math.round(day.windSpeed * 3.6)} km/h</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
