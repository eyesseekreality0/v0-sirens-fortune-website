"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function BackButton() {
  return (
    <Link href="/" className="inline-block">
      <Button
        size="lg"
        className="magical-button animated-button-colors bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-500 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl px-6 py-3 text-lg"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
          Back to Home
        </span>
      </Button>
    </Link>
  )
}
