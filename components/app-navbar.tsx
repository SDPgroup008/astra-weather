"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Cloud, LayoutDashboard, Settings, Zap, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Weather", icon: LayoutDashboard },
  { href: "/visualizations", label: "3D View", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/auth")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen flex-col bg-background text-foreground fixed left-0 top-0 w-64 border-r border-border/40 bg-black/30 backdrop-blur-xl">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AstraWeather
              </h1>
              <p className="text-xs text-muted-foreground">AI Weather</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border/40 space-y-4">
          {user?.isPremium && (
            <div className="px-3 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg text-xs font-semibold text-center text-accent">
              Premium Active
            </div>
          )}

          <div className="px-3 py-3 bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="font-semibold truncate text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>

          <Link href="/pricing" className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold h-10 shadow-lg shadow-primary/20">
              {user?.isPremium ? "Manage Plan" : "Upgrade"}
            </Button>
          </Link>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-center gap-2 bg-destructive/20 text-destructive hover:bg-destructive/30 border-0"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-border/40 z-50">
        <nav className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full rounded-lg py-2 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                  size="sm"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </Link>
            )
          })}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex-1 rounded-lg text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </>
  )
}
