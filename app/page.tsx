import Navbar from "@/components/navbar"
import SignUpButton from "@/components/signup-button"
import FeaturesSection from "@/components/features-section"
import PricingSection from "@/components/pricing-section"
import FaqSection from "@/components/faq-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20">
        <h1 className="text-5xl md:text-7xl font-bold mt-10 mb-4">
          AI Chat Agent,
          <br />
          <span className="text-gray-400">without the hassle</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mt-8 text-lg">
          Create a support bot that talks like human. Train it on your documentation and sitemap. Fast, secure,
          reliable.
        </p>

        <p className="text-gray-500 mt-8">Ready to transform your customer support? Get started today!</p>

        <SignUpButton />
      </div>

      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
