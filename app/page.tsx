import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Gamepad2, BookOpen, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="h-screen relative overflow-y-auto flex flex-col">
      <OceanBackground />
      <AnimatedFish />
      <div className="magical-sparkles" />
      <Navigation />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8 pt-32 md:pt-36">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mb-4 sm:mb-6 relative inline-block px-2 max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-20 blur-2xl animate-pulse" />
              <Image
                src="/sirens-fortune-logo.jpeg"
                alt="Sirens Fortune"
                width={300}
                height={300}
                className="relative w-full mx-auto rounded-2xl shadow-2xl magical-border"
                priority
              />
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <Link href="/games" className="w-full group">
                <Button
                  size="lg"
                  className="magical-button animated-button-colors w-full bg-gradient-to-br from-[var(--button-primary-from)] via-[var(--button-primary-via)] to-[var(--button-primary-to)] hover:from-[var(--button-primary-hover-from)] hover:via-[var(--button-primary-hover-via)] hover:to-[var(--button-primary-hover-to)] text-xl sm:text-2xl md:text-3xl px-6 py-6 sm:py-10 md:py-12 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
                >
                  <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 mb-1 group-hover:animate-bounce" />
                  <span className="block text-primary-foreground font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
                    Games
                  </span>
                </Button>
              </Link>

              <Link href="/rules" className="w-full group">
                <Button
                  size="lg"
                  className="magical-button animated-button-colors w-full bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-xl sm:text-2xl md:text-3xl px-6 py-6 sm:py-10 md:py-12 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
                >
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 mb-1 group-hover:animate-bounce" />
                  <span className="block text-primary-foreground font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
                    Rules
                  </span>
                </Button>
              </Link>

              <Link href="/contact" className="w-full group">
                <Button
                  size="lg"
                  className="magical-button animated-button-colors w-full bg-gradient-to-br from-[var(--button-tertiary-from)] via-[var(--button-tertiary-via)] to-[var(--button-tertiary-to)] hover:from-[var(--button-tertiary-hover-from)] hover:via-[var(--button-tertiary-hover-via)] hover:to-[var(--button-tertiary-hover-to)] text-xl sm:text-2xl md:text-3xl px-6 py-6 sm:py-10 md:py-12 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
                >
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 mb-1 group-hover:animate-bounce" />
                  <span className="block text-primary-foreground font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
                    Contact
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
