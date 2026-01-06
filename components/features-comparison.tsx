"use client"

import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

const DETAILED_FEATURES = [
  {
    category: "Weather Data",
    features: [
      { name: "Real-time weather conditions", free: true, premium: true },
      { name: "5-day forecast with hourly details", free: true, premium: true },
      { name: "Extended 14-day forecast", free: false, premium: true },
      { name: "Historical weather data", free: false, premium: true },
    ],
  },
  {
    category: "AI & Personalization",
    features: [
      { name: "Basic weather insights", free: true, premium: true },
      { name: "AI-powered predictions", free: false, premium: true },
      { name: "Behavioral pattern learning", free: false, premium: true },
      { name: "Custom recommendation engine", free: false, premium: true },
      { name: "Hyper-personalized forecasts", free: false, premium: true },
    ],
  },
  {
    category: "Locations & Tracking",
    features: [
      { name: "Save up to 3 locations", free: true, premium: false },
      { name: "Unlimited saved locations", free: false, premium: true },
      { name: "Location history tracking", free: false, premium: true },
      { name: "Favorite locations shortcuts", free: false, premium: true },
    ],
  },
  {
    category: "Alerts & Notifications",
    features: [
      { name: "Basic weather notifications", free: false, premium: true },
      { name: "Smart weather alerts", free: false, premium: true },
      { name: "Custom alert thresholds", free: false, premium: true },
      { name: "Activity-based alerts", free: false, premium: true },
      { name: "Real-time push notifications", free: false, premium: true },
    ],
  },
  {
    category: "Visualizations",
    features: [
      { name: "Standard weather charts", free: true, premium: true },
      { name: "3D weather globe", free: false, premium: true },
      { name: "Interactive data visualizations", free: false, premium: true },
      { name: "Advanced radar overlays", free: false, premium: true },
    ],
  },
  {
    category: "Support & Experience",
    features: [
      { name: "Community support", free: true, premium: true },
      { name: "Priority email support", free: false, premium: true },
      { name: "Live chat support", free: false, premium: true },
      { name: "Ad-free experience", free: false, premium: true },
      { name: "Early access to features", free: false, premium: true },
    ],
  },
]

export function FeaturesComparison() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Detailed Feature Comparison
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compare all features between Free and Premium plans to find the perfect fit for you
        </p>
      </div>

      <div className="space-y-6">
        {DETAILED_FEATURES.map((category) => (
          <Card key={category.category} className="bg-white/5 backdrop-blur-xl border border-white/15 p-6">
            <h3 className="text-lg font-bold mb-4 text-accent">{category.category}</h3>
            <div className="space-y-3">
              {category.features.map((feature) => (
                <div key={feature.name} className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">{feature.name}</p>
                  <div className="flex justify-center">
                    {feature.free ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.premium ? (
                      <Check className="w-5 h-5 text-accent shadow-lg shadow-accent/40" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky top-0 bg-background/95 backdrop-blur-xl -mx-6 px-6 py-4 border-b border-border/40">
        <div className="grid grid-cols-3 items-center gap-4 text-sm font-semibold">
          <p>Feature</p>
          <p className="text-center">Free</p>
          <p className="text-center text-accent">Premium</p>
        </div>
      </div>
    </div>
  )
}
