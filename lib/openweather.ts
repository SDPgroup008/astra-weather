const BASE_URL = "https://api.openweathermap.org"

export interface WeatherResponse {
  current: any
  hourly: any[]
  daily: any[]
}

export async function getWeatherData(latitude: number, longitude: number, p0: string): Promise<WeatherResponse> {
  try {
    const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

    if (!response.ok) {
      throw new Error("Failed to fetch weather data")
    }

    return await response.json()
  } catch (error) {
    console.error("Weather API error:", error)
    throw error
  }
}

export async function getLocationCoordinates(
  locationName: string,
): Promise<{ latitude: number; longitude: number; name: string }> {
  try {
    const response = await fetch(`/api/weather/location?q=${encodeURIComponent(locationName)}`)

    if (!response.ok) {
      throw new Error("Failed to fetch location coordinates")
    }

    return await response.json()
  } catch (error) {
    console.error("Geolocation API error:", error)
    throw error
  }
}
