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

      <main className="relative z-10 pt-16 md:pt-20 pb-0 px-0">
        <div className="container mx-auto max-w-full px-0">
          <div className="mb-1 px-2">
            <BackButton />
          </div>

          <div className="relative w-full h-[calc(100vh-50px)]">
            <Image
              src="/deepwater-decrees-flyer.png"
              alt="Deepwater Decrees - Game Rules"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </main>
    </div>
  )
}
