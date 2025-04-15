import Link from "next/link"
import Logo from "./logo"

export default function Navbar() {
  return (
    <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center">
      <Link href="/" className="flex items-center">
        <Logo />
      </Link>

      <div className="bg-zinc-900 rounded-full px-6 py-2">
        <ul className="flex space-x-6">
          <li>
            <Link href="/features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/faqs" className="text-gray-300 hover:text-white transition">
              FAQs
            </Link>
          </li>
        </ul>
      </div>

      <Link 
        href="/login" 
        className="bg-zinc-900 text-gray-300 hover:text-white transition px-6 py-2 rounded-full"
      >
        Log in
      </Link>
    </nav>
  )
}
