"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FaqItemProps {
  question: string
  answer: string
  isOpen: boolean
  toggleOpen: () => void
}

function FaqItem({ question, answer, isOpen, toggleOpen }: FaqItemProps) {
  return (
    <div className="border-b border-zinc-800 py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-medium">{question}</h3>
        <span className="text-gray-400 ml-2">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-400 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What is chatee.io?",
      answer:
        "chatee.io is an AI-powered chat agent platform that allows you to create support bots that talk like humans. You can train them on your documentation and sitemap to provide accurate and helpful responses to your users' questions.",
    },
    {
      question: "How does the training process work?",
      answer:
        "Training your AI chat agent is simple. You can upload your documentation, connect your sitemap, or directly input information. Our system processes this data and makes it available to your chat agent, allowing it to provide accurate responses based on your content.",
    },
    {
      question: "Is chatee.io currently available?",
      answer:
        "Yes! chatee.io is fully available and ready to help transform your customer support. You can sign up and start using our service right away to create your own AI-powered chat agent.",
    },
    {
      question: "How much does chatee.io cost?",
      answer:
        "We offer several pricing tiers to suit different needs, from small businesses to large enterprises. You can view our pricing plans above. All plans include a 14-day free trial so you can test the service before committing.",
    },
    {
      question: "Can I customize the chat widget?",
      answer:
        "Yes, chatee.io offers customization options to match your brand's look and feel. You can adjust colors, add your logo, and customize the chat interface to create a seamless experience for your users.",
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-6" id="faqs">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">FAQ</h2>
          <p className="text-gray-400">Find answers to common questions about chatee.io.</p>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
