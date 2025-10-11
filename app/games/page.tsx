import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { BackButton } from "@/components/back-button"
import Image from "next/image"

const games = [
  {
    id: 1,
    name: "Game Vault",
    url: "https://download.gamevault999.com/",
    logo: "/game-vault-logo.jpg",
  },
  {
    id: 2,
    name: "Juwa",
    url: "https://dl.juwa777.com/",
    logo: "/juwa-logo.jpg",
  },
  {
    id: 3,
    name: "Ultrapanda",
    url: "https://www.ultrapanda.mobi/",
    logo: "/ultrapanda-logo.jpg",
  },
  {
    id: 4,
    name: "Panda Master",
    url: "https://pandamaster.vip:8888/",
    logo: "/panda-master-logo.jpg",
  },
  {
    id: 5,
    name: "Fire Kirin",
    url: "http://start.firekirin.xyz:8580/",
    logo: "/fire-kirin-logo.jpg",
  },
  {
    id: 6,
    name: "Gameroom",
    url: "https://www.gameroom777.com/",
    logo: "/gameroom-logo.jpg",
  },
]

export default function GamesPage() {
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
            Our Games
          </h1>
          <p className="text-center text-base sm:text-lg md:text-xl text-foreground/90 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Choose your adventure and dive into the magical world beneath the waves
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {games.map((game) => (
              <a key={game.id} href={game.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl group-hover:border-primary/50 transition-all group-hover:scale-105 bg-gradient-to-br from-ocean-dark/80 to-ocean-light/80 backdrop-blur-sm">
                      <Image
                        src={game.logo || "/placeholder.svg"}
                        alt={game.name}
                        fill
                        className="object-cover p-2 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-center colorful-text font-serif px-2">
                    {game.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
