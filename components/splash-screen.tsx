"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-6 p-8 rounded-xl">
        <Image src="/logo_gonetwork.png" alt="GoNetwork AI Logo" width={120} height={120} className="mb-4" />
        <h1 className="text-3xl font-bold text-primary">GoNetwork AI</h1>
        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full bg-primary transition-all duration-300 ease-out")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
