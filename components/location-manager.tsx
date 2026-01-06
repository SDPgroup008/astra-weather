"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, X, Star, Plus } from "lucide-react"
import type { SavedLocation } from "@/lib/types"

interface LocationManagerProps {
  userId: string
  locations: SavedLocation[]
  defaultLocationId?: string
  onLocationSelect: (location: SavedLocation) => void
  onLocationsUpdated: () => void
}

export function LocationManager({
  userId,
  locations,
  defaultLocationId,
  onLocationSelect,
  onLocationsUpdated,
}: LocationManagerProps) {
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [newLocationName, setNewLocationName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return

    try {
      setIsLoading(true)

      // Get coordinates from location name (simple implementation)
      const geoResponse = await fetch(`/api/weather/location?query=${encodeURIComponent(newLocationName)}`)
      const geoData = await geoResponse.json()

      if (!geoData.latitude || !geoData.longitude) {
        alert("Location not found. Please try another search.")
        return
      }

      const saveResponse = await fetch("/api/locations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: geoData.name || newLocationName,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        }),
      })

      if (saveResponse.ok) {
        setNewLocationName("")
        setIsAddingLocation(false)
        onLocationsUpdated()
      }
    } catch (error) {
      console.error("Error adding location:", error)
      alert("Failed to add location")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Delete this location?")) return

    try {
      const response = await fetch("/api/locations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, locationId }),
      })

      if (response.ok) {
        onLocationsUpdated()
      }
    } catch (error) {
      console.error("Error deleting location:", error)
      alert("Failed to delete location")
    }
  }

  const handleSetDefault = async (locationId: string) => {
    try {
      const response = await fetch("/api/locations/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, locationId }),
      })

      if (response.ok) {
        onLocationsUpdated()
      }
    } catch (error) {
      console.error("Error setting default location:", error)
      alert("Failed to set default location")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          My Locations
        </h3>
        <Button
          size="sm"
          onClick={() => setIsAddingLocation(!isAddingLocation)}
          className="gap-2"
          variant={isAddingLocation ? "destructive" : "default"}
        >
          <Plus className="w-4 h-4" />
          {isAddingLocation ? "Cancel" : "Add"}
        </Button>
      </div>

      {isAddingLocation && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name..."
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLocation()
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleAddLocation} disabled={isLoading || !newLocationName.trim()}>
              {isLoading ? "..." : "Save"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {locations && locations.length > 0 ? (
          locations.map((location) => (
            <Card
              key={location.id}
              className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-4 flex items-center justify-between group hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => onLocationSelect(location)}
            >
              <div className="flex items-center gap-3 flex-1">
                <MapPin className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant={defaultLocationId === location.id ? "default" : "ghost"}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetDefault(location.id)
                  }}
                  className="gap-1"
                >
                  <Star className={`w-4 h-4 ${defaultLocationId === location.id ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteLocation(location.id)
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No saved locations yet</p>
        )}
      </div>
    </div>
  )
}
