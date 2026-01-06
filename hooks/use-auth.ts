"use client"

import { useEffect, useState, useCallback } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, UserPreferences } from "@/lib/types"

const DEFAULT_PREFERENCES: UserPreferences = {
  location: "New York, USA",
  latitude: 40.7128,
  longitude: -74.006,
  tempUnit: "C",
  windUnit: "ms",
  notificationsEnabled: true,
  darkMode: true,
  theme: "dark",
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setLoading(true)
        if (fbUser) {
          const userDocRef = doc(db, "users", fbUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            setUser(userDocSnap.data() as User)
          } else {
            const newUser: User = {
              id: fbUser.uid,
              email: fbUser.email || "",
              name: fbUser.displayName || "User",
              isPremium: false,
              preferences: DEFAULT_PREFERENCES,
              createdAt: new Date(),
            }
            await setDoc(userDocRef, newUser)
            setUser(newUser)
          }
          setFirebaseUser(fbUser)
        } else {
          setUser(null)
          setFirebaseUser(null)
        }
      } catch (err) {
        console.error("Auth state error:", err)
        setError(err instanceof Error ? err.message : "Auth error")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setError(null)
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUser: User = {
        id: fbUser.uid,
        email,
        name,
        isPremium: false,
        preferences: DEFAULT_PREFERENCES,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", fbUser.uid), newUser)
      setUser(newUser)
      return newUser
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed"
      setError(message)
      throw err
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      setError(message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)
      await signOut(auth)
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed"
      setError(message)
      throw err
    }
  }, [])

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      if (!user) return

      try {
        const updatedUser = {
          ...user,
          preferences: { ...user.preferences, ...preferences },
        }
        await setDoc(doc(db, "users", user.id), updatedUser)
        setUser(updatedUser)
      } catch (err) {
        console.error("Update preferences error:", err)
        throw err
      }
    },
    [user],
  )

  return {
    user,
    firebaseUser,
    loading,
    error,
    signUp,
    signIn,
    logout,
    updatePreferences,
    isAuthenticated: !!user,
  }
}
