"use client"

import { useEffect, useRef } from "react"

export function OceanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "oklch(0.15 0.08 240)") // Deep ocean
      gradient.addColorStop(0.3, "oklch(0.25 0.12 250)") // Mid ocean with purple tint
      gradient.addColorStop(0.7, "oklch(0.20 0.10 240)") // Darker blue
      gradient.addColorStop(1, "oklch(0.18 0.08 245)") // Deep bottom

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let offset = 0
    const drawWaves = () => {
      ctx.globalAlpha = 0.2

      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x < canvas.width; x++) {
          const y = Math.sin((x + offset + i * 100) * 0.01) * 30 + canvas.height / 2 + i * 50
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        const waveGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        // Alternate between neon colors for each wave
        if (i % 3 === 0) {
          waveGradient.addColorStop(0, "oklch(0.6 0.25 240)") // Neon blue
          waveGradient.addColorStop(1, "oklch(0.4 0.15 240)")
        } else if (i % 3 === 1) {
          waveGradient.addColorStop(0, "oklch(0.6 0.28 290)") // Neon purple
          waveGradient.addColorStop(1, "oklch(0.4 0.18 290)")
        } else {
          waveGradient.addColorStop(0, "oklch(0.75 0.2 200)") // Neon cyan
          waveGradient.addColorStop(1, "oklch(0.5 0.12 200)")
        }

        ctx.fillStyle = waveGradient
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    const animate = () => {
      drawBackground()
      drawWaves()
      offset += 0.5
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ pointerEvents: "none" }} />
}
