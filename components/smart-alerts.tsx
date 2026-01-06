"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Bell, AlertTriangle, TrendingUp, Wind, Droplets } from "lucide-react"
import type { CurrentWeather, DailyForecast } from "@/lib/types"

interface Alert {
  id: string
  type: "warning" | "info" | "recommendation"
  title: string
  message: string
  icon: React.ReactNode
  severity: "high" | "medium" | "low"
  timestamp: Date
  dismissible: boolean
}

interface SmartAlertsProps {
  current: CurrentWeather | null
  forecast: DailyForecast[]
  preferences?: any
}

export function SmartAlerts({ current, forecast, preferences }: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!current || !forecast || forecast.length === 0) return

    const generatedAlerts: Alert[] = []

    // High temperature warning
    if (current.temperature > 35) {
      generatedAlerts.push({
        id: "heat-warning",
        type: "warning",
        title: "Extreme Heat Alert",
        message: `Temperature ${current.temperature}°C. Stay hydrated, limit outdoor activities, and use sun protection.`,
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
        severity: "high",
        timestamp: new Date(),
        dismissible: true,
      })
    }

    // Low temperature warning
    if (current.temperature < -10) {
      generatedAlerts.push({
        id: "cold-warning",
        type: "warning",
        title: "Extreme Cold Alert",
        message: `Temperature ${current.temperature}°C. Frostbite risk. Limit outdoor exposure and wear multiple layers.`,
        icon: <AlertTriangle className="w-5 h-5 text-blue-400" />,
        severity: "high",
        timestamp: new Date(),
        dismissible: true,
      })
    }

    // High wind warning
    if (current.windSpeed > 40) {
      generatedAlerts.push({
        id: "wind-warning",
        type: "warning",
        title: "High Wind Warning",
        message: `Wind speed ${(current.windSpeed * 3.6).toFixed(1)} km/h. Hazardous conditions for outdoor activities.`,
        icon: <Wind className="w-5 h-5 text-yellow-400" />,
        severity: "high",
        timestamp: new Date(),
        dismissible: true,
      })
    }

    // High humidity alert
    if (current.humidity > 85) {
      generatedAlerts.push({
        id: "humidity-alert",
        type: "info",
        title: "High Humidity",
        message: `Humidity at ${current.humidity}%. Oppressive conditions - heat index feels significantly higher.`,
        icon: <Droplets className="w-5 h-5 text-cyan-400" />,
        severity: "medium",
        timestamp: new Date(),
        dismissible: true,
      })
    }

    // Upcoming rain recommendation
    if (forecast[0]?.precipitation > 70) {
      generatedAlerts.push({
        id: "rain-tomorrow",
        type: "recommendation",
        title: "Rain Tomorrow",
        message: `${forecast[0].precipitation}% chance of rain tomorrow. Plan indoor activities or bring an umbrella.`,
        icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
        severity: "medium",
        timestamp: new Date(),
        dismissible: true,
      })
    }

    // Temperature trend
    if (forecast.length >= 2) {
      const tempChange = forecast[0].tempMax - current.temperature
      if (Math.abs(tempChange) > 8) {
        generatedAlerts.push({
          id: "temp-trend",
          type: "info",
          title: `Temperature ${tempChange > 0 ? "Rising" : "Falling"}`,
          message: `Expect ${Math.abs(tempChange).toFixed(0)}° change tomorrow. Adjust your wardrobe accordingly.`,
          icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
          severity: "low",
          timestamp: new Date(),
          dismissible: true,
        })
      }
    }

    setAlerts(generatedAlerts)
  }, [current, forecast])

  const handleDismiss = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]))
  }

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Smart Weather Alerts</h3>
        {visibleAlerts.length > 0 && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
            {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active alerts. Weather looks good!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {visibleAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-3 border-l-4 ${
                alert.severity === "high"
                  ? "bg-red-500/10 border-red-500 border-l-red-500"
                  : alert.severity === "medium"
                    ? "bg-yellow-500/10 border-yellow-500 border-l-yellow-500"
                    : "bg-blue-500/10 border-blue-500 border-l-blue-500"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="mt-1">{alert.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
                {alert.dismissible && (
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
