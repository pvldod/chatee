import Link from "next/link"
import Logo from "./logo"

export default function Footer() {
  return (
    <footer className="bg-zinc-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-6 md:mb-0">
            <Logo />
            <span className="ml-3 text-xl font-semibold">chatee.io</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/features" className="text-gray-400 hover:text-white transition">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">
              Pricing
            </Link>
            <Link href="/faqs" className="text-gray-400 hover:text-white transition">
              FAQs
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition">
              Terms
            </Link>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 mb-4 md:mb-0">&copy; {new Date().getFullYear()} chatee.io. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white transition">
              Twitter
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition">
              LinkedIn
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
