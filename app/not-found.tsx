"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Stránka nenalezena</h1>
      <p className="text-gray-400 text-center mb-8">
        Omlouváme se, ale stránka, kterou hledáte, neexistuje.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.back()}>Zpět</Button>
        <Button onClick={() => router.push("/")} variant="outline">
          Domů
        </Button>
      </div>
    </div>
  )
} 