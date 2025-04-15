import type React from "react"
import { MessageSquare, Zap, Lock, FileText } from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
      <div className="mb-4 text-[#d0ff00]">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our AI chat agent provides everything you need to create a powerful support bot without the complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<MessageSquare size={24} />}
            title="Human-like Conversations"
            description="Create support bots that talk naturally with your customers, providing helpful responses."
          />
          <FeatureCard
            icon={<FileText size={24} />}
            title="Train on Your Content"
            description="Easily train the AI on your documentation and sitemap to provide accurate information."
          />
          <FeatureCard
            icon={<Zap size={24} />}
            title="Fast & Reliable"
            description="Quick response times and high uptime ensure your customers always get the help they need."
          />
          <FeatureCard
            icon={<Lock size={24} />}
            title="Secure & Private"
            description="Your data is encrypted and protected, ensuring customer information stays safe."
          />
        </div>
      </div>
    </section>
  )
}
