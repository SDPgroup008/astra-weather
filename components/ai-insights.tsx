"use client"

import type React from "react"

import type { AIInsight } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Lightbulb, Zap } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  sun: "☀️",
  droplets: "💧",
  wind: "💨",
  "cloud-rain": "🌧️",
  activity: "🏃",
  "trending-up": "📈",
}

const typeStyles: Record<string, string> = {
  warning: "border-red-500/30 bg-red-500/5",
  recommendation: "border-green-500/30 bg-green-500/5",
  trend: "border-blue-500/30 bg-blue-500/5",
  activity: "border-primary/30 bg-primary/5",
}

export function AIInsights({ insights }: { insights: AIInsight[] }) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
        <p className="text-muted-foreground">No insights available at this time.</p>
      </Card>
    )
  }

  return (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">AI Insights</h3>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border ${typeStyles[insight.type] || typeStyles.activity}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-1">
                {insight.type === "warning" && <AlertTriangle className="w-5 h-5 text-red-400" />}
                {insight.type === "recommendation" && <Lightbulb className="w-5 h-5 text-green-400" />}
                {insight.type === "trend" && <TrendingUp className="w-5 h-5 text-blue-400" />}
                {insight.type === "activity" && <Zap className="w-5 h-5 text-yellow-400" />}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>

                {insight.priority === "high" && (
                  <span className="inline-block mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                    High Priority
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
