"use client"

import type { HourlyForecast } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Cloud, CloudRain, Sun } from "lucide-react"

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase()
  if (lower.includes("clear") || lower.includes("sunny")) return <Sun className="w-5 h-5 text-yellow-400" />
  if (lower.includes("rain")) return <CloudRain className="w-5 h-5 text-blue-400" />
  if (lower.includes("cloud")) return <Cloud className="w-5 h-5 text-gray-400" />
  return <Cloud className="w-5 h-5 text-gray-400" />
}

export function HourlyWeatherForecast({ forecast }: { forecast: HourlyForecast[] }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Next 24 Hours</h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {forecast.slice(0, 12).map((hour, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-4 bg-background/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
            >
              <p className="text-sm font-semibold text-muted-foreground">
                {new Date(hour.time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
              <div>{getWeatherIcon(hour.condition)}</div>
              <p className="text-lg font-bold">{hour.temperature}°</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Humidity: {hour.humidity}%</p>
                <p>Wind: {Math.round(hour.windSpeed * 3.6)} km/h</p>
                {hour.precipitation > 0 && <p className="text-blue-400">Rain: {hour.precipitation}%</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
