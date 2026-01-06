"use client"

import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"
import type { CurrentWeather, DailyForecast } from "@/lib/types"

interface ActivityScore {
  activity: string
  score: number
  emoji: string
  reason: string
}

interface ActivityRecommendationsProps {
  current: CurrentWeather | null
  forecast: DailyForecast[]
}

export function ActivityRecommendations({ current, forecast }: ActivityRecommendationsProps) {
  const getActivityScores = (): ActivityScore[] => {
    if (!current) return []

    const scores: ActivityScore[] = []

    // Running/Jogging
    const runningScore =
      (100 -
        Math.abs(current.temperature - 15) * 2 -
        Math.min(current.humidity - 50, 0) * 0.5 -
        current.windSpeed * 1.5) /
      100
    scores.push({
      activity: "Running",
      score: Math.max(0, Math.min(100, runningScore * 100)),
      emoji: "🏃",
      reason: current.temperature > 28 || current.temperature < 5 ? "Temperature not ideal" : "Great conditions",
    })

    // Cycling
    const cyclingScore = (100 - current.windSpeed * 2 - Math.abs(current.temperature - 18) * 1.5) / 100
    scores.push({
      activity: "Cycling",
      score: Math.max(0, Math.min(100, cyclingScore * 100)),
      emoji: "🚴",
      reason: current.windSpeed > 30 ? "Windy conditions" : "Suitable conditions",
    })

    // Outdoor Sports
    const sportsScore =
      (100 - current.cloudCover * 0.5 - current.humidity * 0.3 - Math.abs(current.temperature - 20) * 1.5) / 100
    scores.push({
      activity: "Outdoor Sports",
      score: Math.max(0, Math.min(100, sportsScore * 100)),
      emoji: "⚽",
      reason: current.cloudCover > 70 ? "Cloudy day" : "Excellent visibility",
    })

    // Hiking
    const hikingScore =
      (100 -
        Math.abs(current.temperature - 18) * 1.5 -
        current.windSpeed * 0.8 -
        Math.max(forecast[0]?.precipitation || 0, 0) * 0.8) /
      100
    scores.push({
      activity: "Hiking",
      score: Math.max(0, Math.min(100, hikingScore * 100)),
      emoji: "⛰️",
      reason: forecast[0]?.precipitation > 50 ? "Rain in forecast" : "Good trail conditions",
    })

    // Picnic/Outdoor Dining
    const picnicScore =
      (100 - current.windSpeed * 1.2 - Math.abs(current.temperature - 22) * 1.5 - current.humidity * 0.2) / 100
    scores.push({
      activity: "Picnic",
      score: Math.max(0, Math.min(100, picnicScore * 100)),
      emoji: "🧺",
      reason: current.temperature > 28 ? "Too warm" : "Pleasant conditions",
    })

    // Beach
    const beachScore =
      (100 - current.cloudCover * 0.3 - Math.abs(current.temperature - 25) * 1 - current.windSpeed * 0.5) / 100
    scores.push({
      activity: "Beach",
      score: Math.max(0, Math.min(100, beachScore * 100)),
      emoji: "🏖️",
      reason: current.cloudCover > 60 ? "Overcast" : "Perfect beach weather",
    })

    return scores.sort((a, b) => b.score - a.score)
  }

  const scores = getActivityScores()

  return (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Activity Recommendations</h3>
      </div>

      <div className="space-y-3">
        {scores.map((score, index) => (
          <div key={score.activity} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{score.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{score.activity}</p>
                  <p className="text-xs text-muted-foreground">{score.reason}</p>
                </div>
              </div>
              <span className="font-bold text-accent">{Math.round(score.score)}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${score.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">Scores based on current weather conditions</p>
    </Card>
  )
}
