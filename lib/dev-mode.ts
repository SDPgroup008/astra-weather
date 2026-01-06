"use client"

export const DEV_MODE = {
  ENABLED: false, // Toggle this to enable/disable development mode
  description: "When enabled, all premium features are accessible without subscription for testing purposes",
}

export function shouldAllowPremium(isPremium: boolean): boolean {
  return isPremium || DEV_MODE.ENABLED
}
