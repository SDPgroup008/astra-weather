"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useWeather } from "@/hooks/use-weather"
import { AppLayout } from "@/components/app-layout"
import { WeatherGlobe3D } from "@/components/3d-weather-globe"
import { TemperatureChart } from "@/components/temp-chart"
import { AdvancedWeatherMetrics } from "@/components/advanced-weather-metrics"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { shouldAllowPremium } from "@/lib/dev-mode"

function VisualizationsContent() {
  const { user } = useAuth()
  const [location, setLocation] = useState("")
  const [mode, setMode] = useState<"atm" | "temp" | "humid" | "wind" | "press">("temp")
  const { weatherData, loading: weatherLoading } = useWeather(user?.id, location || user?.preferences?.location || "")

  useEffect(() => {
    if (user && !location) {
      setLocation(user.preferences?.location || "New York, USA")
    }
  }, [user, location])

  const isPremium = shouldAllowPremium(user?.isPremium || false)

  if (!isPremium) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 pb-32 md:pb-8">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-muted-foreground mb-6">3D visualizations are available for premium subscribers only.</p>
          <Link href="/pricing" className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
              Upgrade Now
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-border/40 px-8 py-4">
        <h2 className="text-3xl font-bold">3D Weather Visualizations</h2>
        <p className="text-muted-foreground">Advanced weather data visualization for {location || "your location"}</p>
      </div>

      {/* Content */}
      <div className="p-8 pb-32 md:pb-8 space-y-8">
        {weatherLoading || !weatherData ? (
          <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading visualizations...</p>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8">
              <WeatherGlobe3D current={weatherData.current} selectedMode={mode} onModeChange={setMode} />
              <TemperatureChart forecast={weatherData.forecast} mode={mode} />
            </div>

            <AdvancedWeatherMetrics current={weatherData.current} daily={weatherData.dailyForecast[0]} />
          </>
        )}
      </div>
    </div>
  )
}

export default function VisualizationsPage() {
  return (
    <AppLayout>
      <VisualizationsContent />
    </AppLayout>
  )
}
