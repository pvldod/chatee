"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-4">Něco se pokazilo!</h1>
      <p className="text-gray-400 text-center mb-8">
        Omlouváme se za nepříjemnosti. Zkuste to prosím znovu.
      </p>
      <Button onClick={() => reset()}>Zkusit znovu</Button>
    </div>
  )
} 