export interface Chatbot {
  id: string
  userId: string
  name: string
  description?: string
  welcomeMessage: string
  appearance: {
    primaryColor: string
    textColor: string
    fontFamily?: string
    logoUrl?: string
  }
  settings: {
    enableAttachments: boolean
    enableHistory: boolean
    enableFeedback: boolean
    enableTranscripts: boolean
  }
  integrations: {
    webhookUrl?: string
    slackUrl?: string
    emailNotifications?: boolean
    allowedDomains?: string[]
    apiKey?: string
    customCss?: string
  }
  status: "active" | "inactive" | "training"
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeBase {
  id: string
  chatbotId: string
  name: string
  description?: string
  type: "document" | "website" | "qa" | "api"
  status: "processing" | "active" | "error"
  metadata: {
    documentCount?: number
    websiteUrls?: string[]
    qaCount?: number
    apiEndpoint?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  chatbotId: string
  sessionId: string
  userIdentifier?: string
  messages: Message[]
  metadata: {
    userAgent?: string
    ipAddress?: string
    referrer?: string
    pageUrl?: string
  }
  rating?: number
  feedback?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}
