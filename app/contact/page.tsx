import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Facebook, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen relative">
      <OceanBackground />
      <AnimatedFish />
      <Navigation />

      <main className="relative z-10 pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-3 colorful-text font-serif">
            Contact Us
          </h1>
          <p className="text-center text-base sm:text-lg md:text-xl text-foreground/90 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with us through Facebook for support and updates
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card/70 backdrop-blur-md rounded-xl border-2 border-border/50 p-6 md:p-12">
              <div className="flex flex-col gap-6">
                <Button
                  size="lg"
                  className="seashell-button w-full bg-gradient-to-br from-[#1877F2] to-[#0d5dbf] hover:from-[#0d5dbf] hover:to-[#1877F2] text-white text-base sm:text-lg md:text-xl py-8 sm:py-10 md:py-12 font-bold shadow-xl"
                  asChild
                >
                  <a
                    href="https://www.facebook.com/sirens2fortune"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2"
                  >
                    <Facebook className="w-7 h-7 sm:w-8 sm:h-8" />
                    <span className="block text-center leading-tight">Visit Our Facebook Page</span>
                  </a>
                </Button>

                <Button
                  size="lg"
                  className="seashell-button w-full bg-gradient-to-br from-[#0084FF] to-[#00C6FF] hover:from-[#00C6FF] hover:to-[#0084FF] text-white text-base sm:text-lg md:text-xl py-8 sm:py-10 md:py-12 font-bold shadow-xl"
                  asChild
                >
                  <a
                    href="https://m.me/sirens2fortune"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                    <span className="block text-center leading-tight">Message Us on Messenger</span>
                  </a>
                </Button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                  We&apos;re here to help! Reach out to us for any questions, support, or feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
