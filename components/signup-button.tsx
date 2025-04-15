"use client"

import { useRouter } from "next/navigation"

export default function SignUpButton() {
  const router = useRouter()

  return (
    <div className="mt-8">
      <button
        onClick={() => router.push("/signup")}
        className="bg-[#d0ff00] text-black font-medium px-8 py-3 rounded-full hover:bg-opacity-90 transition glow text-lg"
      >
        Sign up
      </button>
    </div>
  )
}
