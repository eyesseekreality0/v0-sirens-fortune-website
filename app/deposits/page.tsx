"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeposits = async () => {
      const { data, error } = await supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) setDeposits(data)
      setLoading(false)
    }

    fetchDeposits()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-black colorful-text font-serif mb-8">
        Deposit History
      </h1>

      <div className="w-full max-w-3xl bg-card/80 border border-primary/30 rounded-2xl shadow-2xl p-6 backdrop-blur-md">
        {loading ? (
          <p className="text-center text-muted-foreground animate-pulse">Loading deposits...</p>
        ) : deposits.length === 0 ? (
          <p className="text-center text-muted-foreground">No deposits yet.</p>
        ) : (
          <ul className="space-y-4">
            {deposits.map((d) => (
              <li
                key={d.id}
                className="flex justify-between bg-card/60 border border-primary/20 rounded-xl px-4 py-3 text-lg"
              >
                <div className="text-left">
                  <p className="font-serif font-semibold">${d.amount} {d.currency}</p>
                  <p className="text-sm text-muted-foreground">{d.payer_email}</p>
                </div>
                <div className="text-right text-muted-foreground text-sm">
                  {new Date(d.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
