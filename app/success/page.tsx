"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Cloud, ArrowRight, Zap } from "lucide-react"
import Loading from "./loading"

function SuccessContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="w-full max-w-md">
        <Card className="glass border-0 p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
              <CheckCircle className="w-20 h-20 text-accent relative" />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-4xl font-bold mb-3 gradient-text">Welcome to Premium!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your subscription has been activated successfully. Get ready to experience weather intelligence like never
            before.
          </p>

          {/* Features Grid */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 mb-8 space-y-3 text-left">
            {[
              { icon: Zap, text: "Advanced AI Predictions" },
              { icon: Cloud, text: "3D Weather Visualizations" },
              { icon: CheckCircle, text: "Smart Weather Alerts" },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              )
            })}
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="font-medium">Unlimited Saved Locations</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="font-medium">Ad-free Experience</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-12 glow">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/visualizations" className="block">
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary font-semibold h-12 hover:bg-primary/10 bg-transparent"
              >
                Explore 3D Visualizations
              </Button>
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground mt-6">
            Your subscription is active and will renew automatically each month. You can cancel anytime from your
            account settings.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessContent />
    </Suspense>
  )
}
