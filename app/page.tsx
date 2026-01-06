"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Cloud, ArrowRight, Zap, Eye, Gauge } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-20 left-10 w-80 h-80 bg-primary/15 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed top-1/2 left-1/3 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg sticky top-0 z-50 mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/20">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AstraWeather
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/15 rounded-full">
            <p className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powered by Advanced AI Weather Intelligence
            </p>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-balance">
            Weather Intelligence Reimagined
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Experience hyper-personalized weather forecasts with cutting-edge AI insights, stunning 3D visualizations,
            and predictions that adapt to your lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth">
              <Button className="h-12 px-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/20">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="h-12 px-8 border-primary/40 text-base font-semibold hover:bg-primary/10 bg-transparent"
              >
                View Plans
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "AI-Powered Insights",
                desc: "Machine learning models learn your preferences and patterns for ultra-personalized forecasts",
              },
              {
                icon: Eye,
                title: "3D Visualizations",
                desc: "See weather data come alive with interactive 3D globe and advanced data visualizations",
              },
              {
                icon: Gauge,
                title: "Smart Alerts",
                desc: "Get notified only about weather that truly impacts your day and activities",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl p-6 hover:border-accent/50 transition-all group"
                >
                  <div className="mb-4 p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-border/40">
          {[
            { stat: "100K+", label: "Active Users" },
            { stat: "98%", label: "Prediction Accuracy" },
            { stat: "24/7", label: "Real-time Updates" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {item.stat}
              </p>
              <p className="text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg mx-4 mb-4">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-6 text-lg">Ready to master the weather?</p>
          <Link href="/auth">
            <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-base h-12 px-8 font-semibold shadow-lg shadow-primary/20">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}
