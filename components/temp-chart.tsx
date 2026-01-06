"use client"

import type { HourlyForecast } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type MetricMode = "atm" | "temp" | "humid" | "wind" | "press"

export function TemperatureChart({ forecast, mode = "temp" }: { forecast: HourlyForecast[]; mode?: MetricMode }) {
  const data = forecast.slice(0, 12).map((item) => {
    let value = 0
    let label = "Value"

    switch (mode) {
      case "temp":
        value = item.temperature
        label = "Temperature (°C)"
        break
      case "humid":
        value = item.humidity
        label = "Humidity (%)"
        break
      case "wind":
        value = (item.windSpeed || 0) * 3.6 // Convert m/s to km/h if needed
        label = "Wind Speed (km/h)"
        break
      case "press":
        value = item.pressure || 1013
        label = "Pressure (hPa)"
        break
      case "atm":
        value = item.cloudCover || 0
        label = "Cloud Cover (%)"
        break
    }

    return {
      time: new Date(item.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      value,
      label,
    }
  })

  const metricLabels: Record<MetricMode, string> = {
    temp: "Temperature",
    humid: "Humidity",
    wind: "Wind Speed",
    press: "Pressure",
    atm: "Cloud Cover",
  }

  const metricUnits: Record<MetricMode, string> = {
    temp: "°C",
    humid: "%",
    wind: "km/h",
    press: "hPa",
    atm: "%",
  }

  const gradientId = `color${mode}`
  let gradientStops = [
    { offset: "5%", stopColor: "#f59e0b" },
    { offset: "95%", stopColor: "#3b82f6" },
  ]

  if (mode === "humid") {
    gradientStops = [
      { offset: "5%", stopColor: "#06b6d4" },
      { offset: "95%", stopColor: "#0284c7" },
    ]
  } else if (mode === "wind") {
    gradientStops = [
      { offset: "5%", stopColor: "#a78bfa" },
      { offset: "95%", stopColor: "#7c3aed" },
    ]
  } else if (mode === "press") {
    gradientStops = [
      { offset: "5%", stopColor: "#fbbf24" },
      { offset: "95%", stopColor: "#ea580c" },
    ]
  } else if (mode === "atm") {
    gradientStops = [
      { offset: "5%", stopColor: "#60a5fa" },
      { offset: "95%", stopColor: "#0284c7" },
    ]
  }

  return (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{metricLabels[mode]} Trend (12h)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: "12px" }}
            label={{ value: metricUnits[mode], angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
            formatter={(value) => {
              const numValue = typeof value === "number" ? value : 0
              return `${numValue.toFixed(1)} ${metricUnits[mode]}`
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              {gradientStops.map((stop, idx) => (
                <stop key={idx} offset={stop.offset} stopColor={stop.stopColor} stopOpacity={idx === 0 ? 0.8 : 0.2} />
              ))}
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
