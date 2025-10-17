"use client"

import { useEffect } from "react"

export default function HelioCheckoutPage() {
  useEffect(() => {
    // Load Helio checkout script
    const script = document.createElement("script")
    script.type = "module"
    script.crossOrigin = "anonymous"
    script.src = "https://embed.hel.io/assets/index-v1.js"
    document.body.appendChild(script)

    script.onload = () => {
      const container = document.getElementById("helioCheckoutContainer")
      if (container && window.helioCheckout) {
        window.helioCheckout(container, {
          paylinkId: "68ef6f7d89c8017dde33644f",
          theme: { themeMode: "dark" },
          primaryColor: "#abff09",
          neutralColor: "#8200b7",
        })
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-background">
      <div
        id="helioCheckoutContainer"
        className="w-full min-h-screen flex items-center justify-center"
      />
    </div>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
