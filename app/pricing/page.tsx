"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Cloud, Sparkles, X, Zap } from "lucide-react"
import Link from "next/link"
import { initializePayPalScript, createPayPalSubscription } from "@/lib/paypal-client"

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "Forever",
    description: "Perfect for casual weather checking",
    features: [
      { name: "Current weather & conditions", included: true },
      { name: "5-day forecast with hourly details", included: true },
      { name: "Basic AI insights", included: true },
      { name: "Save up to 3 locations", included: true },
      { name: "3D visualizations", included: false },
      { name: "Advanced AI predictions", included: false },
      { name: "Smart weather alerts", included: false },
      { name: "Activity recommendations", included: false },
      { name: "Priority support", included: false },
      { name: "Ad-free experience", included: false },
    ],
    cta: "Current Plan",
    ctaStyle: "secondary",
    paypalPlanId: null,
  },
  {
    name: "Premium",
    price: 1.98,
    period: "month",
    description: "Everything you need for weather mastery",
    badge: "Most Popular",
    features: [
      { name: "All Free features", included: true },
      { name: "Unlimited saved locations", included: true },
      { name: "3D weather visualizations", included: true },
      { name: "Advanced AI predictions", included: true },
      { name: "Smart weather alerts", included: true },
      { name: "Activity recommendations", included: true },
      { name: "Priority support", included: true },
      { name: "Ad-free experience", included: true },
      { name: "Early access to new features", included: true },
      { name: "Customizable alert thresholds", included: true },
    ],
    cta: "Upgrade Now",
    ctaStyle: "primary",
    paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "",
    highlight: true,
  },
]

export default function PricingPage() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [paypalReady, setPaypalReady] = useState(false)

  useEffect(() => {
    initializePayPalScript()
    const timer = setTimeout(() => setPaypalReady(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleUpgrade = async (paypalPlanId: string | null) => {
    if (!paypalPlanId || !user) {
      console.error("Unable to process subscription. Missing plan ID or user.")
      return
    }

    try {
      setIsLoading(true)
      const subscription = await createPayPalSubscription(paypalPlanId, user.id)

      if (subscription.links) {
        const approveLink = subscription.links.find((link: any) => link.rel === "approve")
        if (approveLink) {
          // Redirect user to PayPal approval page
          window.location.href = approveLink.href
        }
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <header className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-lg sticky top-0 z-50 mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/20">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AstraWeather
            </h1>
          </Link>

          {user && (
            <Link href="/dashboard">
              <Button variant="outline" className="border-primary/40 hover:bg-primary/10 bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Get instant access to advanced weather intelligence with our flexible plans
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all ${
                plan.highlight
                  ? "bg-gradient-to-br from-primary/15 to-accent/15 border-primary/60 ring-2 ring-primary/30 transform md:scale-105"
                  : "bg-white/5 backdrop-blur-xl border border-white/15 hover:border-white/25"
              } rounded-xl p-8`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.name === "Premium" && <Sparkles className="w-5 h-5 text-accent" />}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-border/40">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.period !== "Forever" && <span className="text-muted-foreground">/{plan.period}</span>}
                </div>

                {user?.isPremium && plan.name === "Premium" && (
                  <div className="text-sm text-green-400 font-semibold">
                    Active until {new Date(user.subscriptionEnd || "").toLocaleDateString()}
                  </div>
                )}
              </div>

              <Button
                disabled={
                  isLoading || (user?.isPremium && plan.name === "Premium") || (!user && plan.name === "Premium")
                }
                onClick={() => handleUpgrade(plan.paypalPlanId)}
                className={`w-full mb-6 font-semibold h-11 ${
                  plan.ctaStyle === "primary"
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                    : ""
                }`}
                variant={plan.ctaStyle === "secondary" ? "outline" : "default"}
              >
                {isLoading ? "Processing..." : plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included ? "text-foreground text-sm" : "text-muted-foreground text-sm line-through"
                      }
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-2xl p-12 mb-16">
          <h3 className="text-2xl font-bold text-center mb-4">Why Upgrade to Premium?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Advanced AI Predictions</p>
                <p className="text-sm text-muted-foreground">
                  ML models learn your patterns for hyper-personalized forecasts
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">3D Visualizations</p>
                <p className="text-sm text-muted-foreground">
                  Interactive globe with temperature rings and wind indicators
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Smart Weather Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Real-time alerts for weather that impacts your activities
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Activity Recommendations</p>
                <p className="text-sm text-muted-foreground">
                  Personalized suggestions for outdoor & sports activities
                </p>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">Ready to upgrade?</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to unlock premium features and take control of your weather
            </p>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20">
                Sign In Now
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
