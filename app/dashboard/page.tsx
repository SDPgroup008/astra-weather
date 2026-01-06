"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useWeather } from "@/hooks/use-weather"
import { LocationManager } from "@/components/location-manager"
import { WeatherHeader } from "@/components/weather-header"
import { HourlyWeatherForecast } from "@/components/hourly-forecast"
import { DailyForecastComponent } from "@/components/daily-forecast"
import { AIInsights } from "@/components/ai-insights"
import { SmartAlerts } from "@/components/smart-alerts"
import { ActivityRecommendations } from "@/components/activity-recommendations"
import { SupportChat } from "@/components/support-chat"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import type { SavedLocation } from "@/lib/types"
import { useRouter } from "next/navigation"

import { shouldAllowPremium } from "@/lib/dev-mode"

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null)
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])

  const { weatherData, loading: weatherLoading } = useWeather(
    user?.id || "",
    selectedLocation?.name || user?.preferences?.location || "",
  )

  useEffect(() => {
    if (user?.savedLocations) {
      setSavedLocations(user.savedLocations)
      if (!selectedLocation && user.defaultLocationId) {
        const defaultLoc = user.savedLocations.find((loc) => loc.id === user.defaultLocationId)
        if (defaultLoc) {
          setSelectedLocation(defaultLoc)
        }
      } else if (!selectedLocation && user.savedLocations.length > 0) {
        setSelectedLocation(user.savedLocations[0])
      }
    }
  }, [user])

  const handleLocationsUpdated = async () => {
    if (user?.id) {
      window.location.reload()
    }
  }

  const handleLocationSelect = (location: SavedLocation) => {
    setSelectedLocation(location)
    sessionStorage.setItem("selectedLocation", JSON.stringify(location))
  }

  const handleNavigateToVisualizations = () => {
    if (selectedLocation) {
      router.push(`/visualizations?location=${encodeURIComponent(selectedLocation.name)}`)
    }
  }

  const isPremium = shouldAllowPremium(user?.isPremium || false)

  return (
    <div className="flex-1 overflow-auto">
      {/* Animated background */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-border/40 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">Weather Dashboard</h2>
            <p className="text-muted-foreground">Real-time weather intelligence</p>
          </div>
          {selectedLocation && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Location</p>
              <p className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {selectedLocation.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Location Manager Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-6">
              {user && (
                <LocationManager
                  userId={user.id}
                  locations={savedLocations}
                  defaultLocationId={user.defaultLocationId}
                  onLocationSelect={handleLocationSelect}
                  onLocationsUpdated={handleLocationsUpdated}
                />
              )}
            </Card>
          </div>

          {/* Weather Data */}
          <div className="lg:col-span-3 space-y-8">
            {weatherLoading && selectedLocation ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading weather data...</p>
              </Card>
            ) : weatherData ? (
              <>
                <WeatherHeader current={weatherData.current} location={weatherData.location} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <HourlyWeatherForecast forecast={weatherData.forecast} />
                  </div>
                  <div>
                    <AIInsights insights={weatherData.aiInsights} />
                  </div>
                </div>

                {isPremium && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SmartAlerts
                      current={weatherData.current}
                      forecast={weatherData.dailyForecast}
                      preferences={user?.preferences}
                    />
                    <ActivityRecommendations current={weatherData.current} forecast={weatherData.dailyForecast} />
                  </div>
                )}

                <DailyForecastComponent forecast={weatherData.dailyForecast} />

                {!isPremium && (
                  <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 p-8 text-center shadow-lg shadow-primary/20">
                    <h3 className="text-xl font-bold mb-2">Unlock Premium Features</h3>
                    <p className="text-muted-foreground mb-6">
                      Get 3D visualizations, advanced insights, unlimited locations, and ad-free experience.
                    </p>
                    <Link href="/pricing">
                      <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8">
                        View Premium
                      </Button>
                    </Link>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-12 text-center">
                <p className="text-muted-foreground">
                  {savedLocations.length === 0
                    ? "Add a location to see weather data"
                    : "Select a location to view weather"}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Support Chat */}
      {isPremium && <SupportChat userId={user?.id} />}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  )
}
