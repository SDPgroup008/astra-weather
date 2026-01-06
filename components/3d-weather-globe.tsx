"use client"

import { useEffect, useRef, useState } from "react"
import type { CurrentWeather } from "@/lib/types"
import { Card } from "@/components/ui/card"

type VisualizationMode = "atm" | "temp" | "humid" | "wind" | "press"

export function WeatherGlobe3D({
  current,
  selectedMode,
  onModeChange,
}: {
  current: CurrentWeather | null
  selectedMode?: VisualizationMode
  onModeChange?: (mode: VisualizationMode) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<VisualizationMode>(selectedMode || "temp")
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (selectedMode) {
      setMode(selectedMode)
    }
  }, [selectedMode])

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.offsetWidth
    canvas.width = size
    canvas.height = size

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, size, size)
    bgGradient.addColorStop(0, "#0a0e27")
    bgGradient.addColorStop(0.5, "#1a1a4d")
    bgGradient.addColorStop(1, "#0a0e27")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, size, size)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 3

    // Animated background particles
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 20; i++) {
      const angle = (rotation + i * 18) * (Math.PI / 180)
      const distance = radius * 1.5
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      ctx.fillStyle = "#60a5fa"
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Glow layers
    const glowLayers = [
      { offset: radius * 1.3, color: "rgba(96, 165, 250, 0.15)" },
      { offset: radius * 1.15, color: "rgba(168, 85, 247, 0.1)" },
      { offset: radius * 1.05, color: "rgba(59, 130, 246, 0.08)" },
    ]

    glowLayers.forEach(({ offset, color }) => {
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, offset)
      glow.addColorStop(0, color)
      glow.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, size, size)
    })

    if (mode === "atm") {
      // Cloud cover and pressure based coloring
      let globeColor = "#0c4a6e"
      const isHighPressure = current.pressure > 1013

      if (isHighPressure) {
        globeColor = "#fbbf24" // High pressure = yellow
      } else {
        globeColor = "#0284c7" // Low pressure = blue
      }

      const globeGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius,
      )
      globeGradient.addColorStop(0, "#60a5fa")
      globeGradient.addColorStop(0.5, globeColor)
      globeGradient.addColorStop(1, "#0c4a6e")
      ctx.fillStyle = globeGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Cloud coverage visualization from real data
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(current.cloudCover / 150, 0.7)})`
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2)
      ctx.fill()

      // Atmospheric rings showing visibility
      for (let i = 1; i <= 4; i++) {
        const ringRadius = radius * (0.2 + i * 0.18)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 - i * 0.06})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else if (mode === "temp") {
      const tempGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY)
      tempGradient.addColorStop(0, "#0284c7")
      tempGradient.addColorStop(0.25, "#16a34a")
      tempGradient.addColorStop(0.5, "#fbbf24")
      tempGradient.addColorStop(0.75, "#ea580c")
      tempGradient.addColorStop(1, "#dc2626")

      ctx.fillStyle = tempGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Temperature rings based on actual temperature
      const tempRings = Math.min(Math.max(current.temperature / 5, 1), 5)
      for (let i = 1; i <= tempRings; i++) {
        const ringRadius = radius * (0.2 + i * 0.15)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.05})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else if (mode === "humid") {
      const humidityGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      humidityGradient.addColorStop(0, "#06b6d4")
      humidityGradient.addColorStop(1, current.humidity > 70 ? "#0369a1" : "#164e63")
      ctx.fillStyle = humidityGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Droplet pattern based on actual humidity percentage
      const droplets = Math.ceil(current.humidity / 15)
      for (let i = 0; i < droplets; i++) {
        const angle = (i / droplets) * Math.PI * 2 + rotation * (Math.PI / 180)
        const distance = radius * 0.8
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 - (i / droplets) * 0.4})`
        ctx.beginPath()
        ctx.arc(x, y, Math.min(8 + current.humidity / 20, 15), 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (mode === "wind") {
      const windGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      windGradient.addColorStop(0, "#a78bfa")
      windGradient.addColorStop(1, current.windSpeed > 20 ? "#dc2626" : "#7c3aed")
      ctx.fillStyle = windGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Wind vectors based on actual wind direction and speed
      const windAngle = (current.windDirection * Math.PI) / 180
      const windIntensity = Math.min(current.windSpeed / 30, 1)

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const distance = radius * 0.7
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 - (i / 8) * 0.4})`
        ctx.lineWidth = Math.max(1, 3 * windIntensity)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(windAngle) * 40 * windIntensity, y + Math.sin(windAngle) * 40 * windIntensity)
        ctx.stroke()
      }
    } else if (mode === "press") {
      const pressureGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      const normalizedPressure = Math.min(current.pressure / 1013, 1.2)
      const isHighPressure = current.pressure > 1013

      pressureGradient.addColorStop(0, isHighPressure ? "#fbbf24" : "#0284c7")
      pressureGradient.addColorStop(1, isHighPressure ? "#ea580c" : "#06b6d4")
      ctx.fillStyle = pressureGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Isobars representing pressure systems
      const isobarCount = Math.ceil(normalizedPressure * 5)
      for (let i = 1; i <= isobarCount; i++) {
        const ringRadius = radius * (0.2 + i * 0.15)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - i * 0.1})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Center glow
    const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50)
    glowGrad.addColorStop(0, "rgba(96, 165, 250, 0.2)")
    glowGrad.addColorStop(1, "rgba(96, 165, 250, 0)")
    ctx.fillStyle = glowGrad
    ctx.fillRect(centerX - 50, centerY - 50, 100, 100)

    ctx.fillStyle = "#fbbf24"
    ctx.font = "bold 32px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    let displayValue = ""
    let displayUnit = ""

    switch (mode) {
      case "temp":
        displayValue = Math.round(current.temperature).toString()
        displayUnit = "°C"
        break
      case "humid":
        displayValue = Math.round(current.humidity).toString()
        displayUnit = "%"
        break
      case "wind":
        displayValue = Math.round(current.windSpeed).toString()
        displayUnit = "km/h"
        break
      case "press":
        displayValue = Math.round(current.pressure).toString()
        displayUnit = "hPa"
        break
      case "atm":
        displayValue = Math.round(current.cloudCover).toString()
        displayUnit = "%"
        break
    }

    ctx.fillText(`${displayValue}${displayUnit}`, centerX, centerY - 10)

    // Display weather description
    ctx.fillStyle = "#60a5fa"
    ctx.font = "14px sans-serif"
    ctx.fillText(current.condition, centerX, centerY + 18)
  }, [current, mode, rotation])

  const buttonLabels = {
    atm: "Atm",
    temp: "Temp",
    humid: "Humid",
    wind: "Wind",
    press: "Press",
  }

  const handleModeChange = (newMode: VisualizationMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }

  return (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Advanced Weather Visualization</h3>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full max-w-sm mx-auto rounded-lg mb-4"
        style={{ maxHeight: "400px", aspectRatio: "1" }}
      />

      <div className="grid grid-cols-5 gap-1 md:gap-2">
        {(["atm", "temp", "humid", "wind", "press"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-2 md:px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === m
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-white/5 border border-white/15 text-muted-foreground hover:border-white/30"
            }`}
          >
            {buttonLabels[m]}
          </button>
        ))}
      </div>
    </Card>
  )
}
