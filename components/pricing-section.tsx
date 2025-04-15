import { Check } from "lucide-react"

interface PricingTierProps {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
}

function PricingTier({ name, price, description, features, isPopular = false }: PricingTierProps) {
  return (
    <div
      className={`bg-zinc-900 rounded-xl border ${
        isPopular ? "border-[#d0ff00]" : "border-zinc-800"
      } p-8 flex flex-col h-full relative`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#d0ff00] text-black px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="text-3xl font-bold mb-1">{price}</div>
        <p className="text-gray-500 text-sm">per month</p>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-[#d0ff00] mr-2 mt-1">
              <Check size={16} />
            </span>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 rounded-lg font-medium ${
          isPopular ? "bg-[#d0ff00] text-black hover:bg-opacity-90" : "bg-zinc-800 text-white hover:bg-zinc-700"
        } transition`}
      >
        Get Started
      </button>
    </div>
  )
}

export default function PricingSection() {
  return (
    <section className="py-20 px-6 bg-black" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingTier
            name="Starter"
            price="$29"
            description="Perfect for small businesses just getting started."
            features={[
              "1 AI chat agent",
              "5,000 messages per month",
              "Basic customization",
              "Email support",
              "1 team member",
            ]}
          />
          <PricingTier
            name="Professional"
            price="$79"
            description="Ideal for growing businesses with more traffic."
            features={[
              "3 AI chat agents",
              "25,000 messages per month",
              "Advanced customization",
              "Priority support",
              "5 team members",
              "Analytics dashboard",
            ]}
            isPopular={true}
          />
          <PricingTier
            name="Enterprise"
            price="$199"
            description="For large businesses with high volume needs."
            features={[
              "10 AI chat agents",
              "100,000 messages per month",
              "Full customization",
              "24/7 dedicated support",
              "Unlimited team members",
              "Advanced analytics",
              "Custom integrations",
            ]}
          />
        </div>
      </div>
    </section>
  )
}
