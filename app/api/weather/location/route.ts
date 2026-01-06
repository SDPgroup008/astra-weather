import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.OPENWEATHER_API_KEY || ""
const BASE_URL = "https://api.openweathermap.org"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  // Accept both ?q=... and ?query=...
  const locationName = searchParams.get("q") || searchParams.get("query")

  if (!locationName) {
    return NextResponse.json({ error: "Location name required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch location coordinates")
    }

    const data = await response.json()
    if (data.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({
      latitude: data[0].lat,
      longitude: data[0].lon,
      name: `${data[0].name}${data[0].state ? ", " + data[0].state : ""}, ${data[0].country}`,
    })
  } catch (error) {
    console.error("Geolocation API error:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}
