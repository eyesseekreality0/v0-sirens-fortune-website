import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { BackButton } from "@/components/back-button"
import Image from "next/image"

export default function RulesPage() {
  return (
    <div className="min-h-screen relative">
      <OceanBackground />
      <AnimatedFish />
      <Navigation />

      <main className="relative z-10 pt-24 md:pt-32 pb-4 px-2 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-4">
            <BackButton />
          </div>

          <div className="relative w-full h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)]">
            <Image src="/game-rules-flyer-poster.jpg" alt="Game Rules Flyer" fill className="object-contain" priority />
          </div>
        </div>
      </main>
    </div>
  )
}
