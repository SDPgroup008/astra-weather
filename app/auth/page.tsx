"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, loading, error } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [formError, setFormError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    try {
      if (isSignUp) {
        if (!formData.name.trim()) {
          setFormError("Name is required")
          return
        }
        await signUp(formData.email, formData.password, formData.name)
      } else {
        await signIn(formData.email, formData.password)
      }
      router.push("/dashboard")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Authentication failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md glass-dark border-primary/30">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">AstraWeather</h1>
          </div>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Get started with intelligent weather predictions" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="bg-background/50 border-primary/30 focus:border-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="bg-background/50 border-primary/30 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="bg-background/50 border-primary/30 focus:border-primary"
                required
              />
            </div>

            {(error || formError) && (
              <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-sm text-destructive">
                {error || formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary/20">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormError("")
              }}
              className="w-full text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
