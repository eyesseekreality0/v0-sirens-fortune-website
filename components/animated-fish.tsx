"use client"

import { useEffect, useState } from "react"
import { Fish } from "lucide-react"

interface FishData {
  id: number
  x: number
  y: number
  speed: number
  size: number
  direction: number
  color: string
}

const fishColors = [
  "text-[var(--fish-pink)]",
  "text-[var(--fish-blue)]",
  "text-[var(--fish-purple)]",
  "text-[var(--fish-green)]",
  "text-[var(--fish-cyan)]",
  "text-[var(--fish-rose)]",
]

export function AnimatedFish() {
  const [fish, setFish] = useState<FishData[]>([])

  useEffect(() => {
    const initialFish: FishData[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.1 + Math.random() * 0.3,
      size: 20 + Math.random() * 20,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: fishColors[i % fishColors.length],
    }))

    setFish(initialFish)

    const interval = setInterval(() => {
      setFish((prevFish) =>
        prevFish.map((f) => {
          let newX = f.x + f.speed * f.direction
          let newDirection = f.direction

          // Reverse direction at edges
          if (newX > 100 || newX < -10) {
            newDirection = -f.direction
            newX = f.x + f.speed * newDirection
          }

          return { ...f, x: newX, direction: newDirection }
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {fish.map((f) => (
        <div
          key={f.id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: `scaleX(${f.direction})`,
          }}
        >
          <Fish className={`${f.color} opacity-60`} style={{ width: f.size, height: f.size }} />
        </div>
      ))}
    </div>
  )
}
