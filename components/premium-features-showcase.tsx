"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Globe as Globe3D, AlertCircle, Lightbulb, Shield, Headphones, Sparkles, Check } from "lucide-react"
import Link from "next/link"

const PREMIUM_FEATURES = [
  {
    icon: Globe3D,
    title: "3D Weather Globe",
    description:
      "Interactive 3D visualizations showing global weather patterns, temperature rings, humidity layers, and wind directions in stunning detail.",
    premium: true,
  },
  {
    icon: AlertCircle,
    title: "Smart Weather Alerts",
    description:
      "AI-powered alerts notify you only about weather that impacts your specific activities and location. Customizable thresholds and timing.",
    premium: true,
  },
  {
    icon: Lightbulb,
    title: "Activity Recommendations",
    description:
      "Get personalized suggestions for outdoor activities, sports, commuting, and travel based on current and forecasted weather conditions.",
    premium: true,
  },
  {
    icon: Zap,
    title: "Advanced AI Predictions",
    description:
      "Machine learning models analyze your location history and preferences to predict weather impacts hours before traditional forecasts.",
    premium: true,
  },
  {
    icon: Sparkles,
    title: "Unlimited Saved Locations",
    description:
      "Save unlimited locations and switch between them instantly. Track weather for home, work, travel destinations, and loved ones.",
    premium: true,
  },
  {
    icon: Shield,
    title: "Ad-Free Experience",
    description: "No interruptions, no tracking, no ads. Pure, uncluttered weather intelligence tailored just for you.",
    premium: true,
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description:
      "Get instant access to our support team with priority response times. Direct chat with weather intelligence experts.",
    premium: true,
  },
  {
    icon: Check,
    title: "Current Weather & 5-Day Forecast",
    description:
      "Real-time weather data, hourly forecasts, and detailed 5-day outlook with comprehensive weather metrics.",
    premium: false,
  },
]

export function PremiumFeaturesShowcase() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Unlock Weather Mastery
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the most advanced weather intelligence platform ever built. From AI predictions to stunning 3D
          visualizations, every feature is designed for maximum impact.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREMIUM_FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className={`relative group overflow-hidden transition-all ${
                feature.premium
                  ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 hover:border-accent/60 shadow-lg shadow-primary/10"
                  : "bg-white/5 border-white/15 hover:border-white/25"
              }`}
            >
              {feature.premium && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  Premium
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-accent" />
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </Card>
          )
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to Experience the Difference?</h3>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join thousands of users who've transformed how they interact with weather data. Start your free trial today.
        </p>
        <Link href="/pricing">
          <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 h-12 shadow-lg shadow-primary/20">
            Explore Premium Plans
          </Button>
        </Link>
      </div>
    </div>
  )
}
