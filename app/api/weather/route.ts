import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.OPENWEATHER_API_KEY || ""
const BASE_URL = "https://api.openweathermap.org"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    if (lat && lon) {
      const data = await getWeatherData(Number.parseFloat(lat), Number.parseFloat(lon))
      return NextResponse.json(data)
    }

    if (location) {
      const coords = await getLocationCoordinates(location)
      const data = await getWeatherData(coords.latitude, coords.longitude)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Location or coordinates required" }, { status: 400 })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 })
  }
}

async function getWeatherData(latitude: number, longitude: number) {
  // Free API 2.5 provides current weather + 5-day forecast
  const response = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&cnt=40`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch weather data")
  }

  const forecastData = await response.json()

  // Get current weather from the first forecast entry
  const current = forecastData.list[0]

  return {
    current: {
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      wind_speed: current.wind.speed,
      wind_deg: current.wind.deg,
      clouds: current.clouds.all,
      visibility: current.visibility,
      weather: current.weather,
    },
    list: forecastData.list, // 5-day forecast data
    city: forecastData.city,
  }
}

async function getLocationCoordinates(locationName: string) {
  const response = await fetch(`${BASE_URL}/geo/1.0/direct?q=${locationName}&limit=1&appid=${API_KEY}`)

  if (!response.ok) {
    throw new Error("Failed to fetch location coordinates")
  }

  const data = await response.json()
  if (data.length === 0) {
    throw new Error("Location not found")
  }

  return {
    latitude: data[0].lat,
    longitude: data[0].lon,
    name: `${data[0].name}${data[0].state ? ", " + data[0].state : ""}, ${data[0].country}`,
  }
}
