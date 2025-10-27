"use client"

export function OceanBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        autoPlay
        loop
        muted
        playsInline
        poster="/sirens-fortune-logo.jpeg"
        src="https://cdn.coverr.co/videos/coverr-underwater-world-1584810535425?download=1"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b2a]/70 via-[#09164f]/55 to-[#040714]/85 mix-blend-soft-light" />
      <div className="absolute inset-0 ocean-video-overlay" />
      <div className="absolute inset-0 ocean-light-rays" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#03050f] via-transparent to-transparent" />
    </div>
  )
}
