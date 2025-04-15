"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, MessageSquare, Settings, CreditCard, HelpCircle, LogOut, ChevronDown } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d0ff00] rounded-md flex items-center justify-center text-black font-bold">A</div>
          <span className="text-xl font-semibold">chatee.io</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActive("/dashboard") &&
                  !isActive("/dashboard/chatbots") &&
                  !isActive("/dashboard/settings") &&
                  !isActive("/dashboard/billing")
                    ? "bg-zinc-800"
                    : ""
                }`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/chatbots">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive("/dashboard/chatbots") ? "bg-zinc-800" : ""}`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chatbots
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive("/dashboard/settings") ? "bg-zinc-800" : ""}`}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/billing">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive("/dashboard/billing") ? "bg-zinc-800" : ""}`}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Button>
            </Link>
          </li>
        </ul>

        <div className="mt-8">
          <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Support</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/docs">
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
