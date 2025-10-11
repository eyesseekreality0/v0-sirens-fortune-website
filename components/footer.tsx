"use client"

import { useEffect, useState } from "react"

export function Footer() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <footer className="relative mt-4 py-6 border-t border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Animated bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute bottom-0 w-2 h-2 bg-secondary/30 rounded-full bubble"
            style={{
              left: `${bubble.left}%`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <p className="text-muted-foreground" style={{ fontFamily: "var(--font-inter)" }}>
          © {new Date().getFullYear()} Sirens Fortune. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground/70 mt-2">Dive into the magic of the ocean</p>
      </div>
    </footer>
  )
}
