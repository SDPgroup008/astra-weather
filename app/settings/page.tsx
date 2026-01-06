"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Bell, Sun, Moon, Code } from "lucide-react"
import Link from "next/link"
import type { UserPreferences } from "@/lib/types"
import { DEV_MODE, shouldAllowPremium } from "@/lib/dev-mode"

function SettingsContent() {
  const { user, updatePreferences } = useAuth()
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ✅ Allow "auto" in the union type
  const [localTheme, setLocalTheme] = useState<"auto" | "dark" | "light">("dark")

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences)
      const savedTheme = (user.preferences?.theme as "auto" | "dark" | "light") || "dark"
      setLocalTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [user])

  // ✅ Apply theme with "auto" support
  const applyTheme = (theme: "auto" | "dark" | "light") => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // Auto mode: follow system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  const handleChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setSaveSuccess(false)

    if (key === "theme") {
      applyTheme(value)
      setLocalTheme(value)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updatePreferences(preferences)
      setSaveSuccess(true)
      applyTheme(localTheme)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isPremium = shouldAllowPremium(user?.isPremium || false)

  return (
    <div className="flex-1 overflow-auto">
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-border/40 px-8 py-4">
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your preferences and account</p>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl space-y-8 pb-32 md:pb-8">
        {DEV_MODE.ENABLED && (
          <Card className="bg-accent/10 border border-accent/30 backdrop-blur-xl">
            <div className="p-4 flex items-center gap-3">
              <Code className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-accent">Development Mode Active</p>
                <p className="text-sm text-muted-foreground">All premium features are unlocked for testing</p>
              </div>
            </div>
          </Card>
        )}

        {/* Location & Units */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/15">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold">Location & Units</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground/90 block mb-3">Default Location</label>
                <input
                  type="text"
                  value={preferences.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your city or location"
                />
                <p className="text-xs text-muted-foreground mt-2">Your default location when opening the app</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground/90 block mb-3">Temperature Unit</label>
                  <select
                    value={preferences.tempUnit || "C"}
                    onChange={(e) => handleChange("tempUnit", e.target.value as "C" | "F")}
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground/90 block mb-3">Wind Speed Unit</label>
                  <select
                    value={preferences.windUnit || "ms"}
                    onChange={(e) => handleChange("windUnit", e.target.value as "ms" | "kmh" | "mph")}
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="ms">Meters/second (m/s)</option>
                    <option value="kmh">Kilometers/hour (km/h)</option>
                    <option value="mph">Miles/hour (mph)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/15">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold">Display Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl hover:border-white/25 transition-all">
                <div className="flex-1">
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme (changes apply instantly)</p>
                </div>
                <button
                  onClick={() => handleChange("theme", localTheme === "dark" ? "light" : "dark")}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    localTheme === "dark" ? "bg-gradient-to-r from-primary to-accent" : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`absolute w-7 h-7 bg-background rounded-full top-0.5 transition-transform shadow-md ${
                      localTheme === "dark" ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  >
                    {localTheme === "dark" ? (
                      <Moon className="w-4 h-4 m-1.5 text-primary" />
                    ) : (
                      <Sun className="w-4 h-4 m-1.5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl hover:border-white/25 transition-all">
                <div className="flex-1">
                  <p className="font-semibold">Smart Alerts</p>
                  <p className="text-sm text-muted-foreground">Weather notifications</p>
                </div>
                <button
                  onClick={() => handleChange("notificationsEnabled", !preferences.notificationsEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    preferences.notificationsEnabled ? "bg-gradient-to-r from-primary to-accent" : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`absolute w-7 h-7 bg-background rounded-full top-0.5 transition-transform shadow-md ${
                      preferences.notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/15">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Account Information</h3>

            <div className="space-y-4 mb-8 pb-8 border-b border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Account Type</p>
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <span className="font-semibold text-accent">Premium</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
                        {DEV_MODE.ENABLED && !user?.isPremium ? "Dev Mode" : "Active"}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-muted-foreground">Free</span>
                  )}
                </div>
              </div>
              {user?.subscriptionEnd && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Subscription Expires</p>
                  <p className="font-semibold text-accent">{new Date(user.subscriptionEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <Link href="/pricing" className="block">
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 shadow-lg shadow-primary/20">
                {user?.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold h-12 shadow-lg shadow-primary/20"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {saveSuccess && (
            <div className="flex items-center justify-center px-4 py-3 bg-white/5 backdrop-blur-xl border border-accent/50 rounded-xl">
              <span className="text-accent font-semibold">✓ Saved successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  )
}
