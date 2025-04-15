import { OpenAI } from "openai"
import { Pinecone } from "@pinecone-database/pinecone"
import type { Document } from "@prisma/client"

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// Initialize Pinecone client
let pinecone: Pinecone | null = null

async function initPinecone() {
  if (!pinecone && process.env.PINECONE_API_KEY && process.env.PINECONE_ENVIRONMENT) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    })
  }
  return pinecone
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // If OpenAI is not configured, return a mock embedding
  if (!openai) {
    console.warn("OpenAI not configured. Using mock embedding.")
    return Array(1536)
      .fill(0)
      .map(() => Math.random() - 0.5)
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  })

  return response.data[0].embedding
}

export async function storeDocument(document: Document): Promise<string> {
  // Generate embedding for document
  const embedding = await generateEmbedding(document.content)

  // If Pinecone is not configured, return a mock vector ID
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_INDEX) {
    console.warn("Pinecone not configured. Using mock vector ID.")
    return `mock_vector_${document.id}`
  }

  // Store in vector database
  try {
    const index = (await pinecone.describeIndex({ indexName: process.env.PINECONE_INDEX })).name
    const pineconeIndex = pinecone.Index(index)

    const vectorId = `doc_${document.id}`

    await pineconeIndex.upsert({
      upsertRequest: {
        vectors: [
          {
            id: vectorId,
            values: embedding,
            metadata: {
              documentId: document.id,
              title: document.title,
              url: document.url || "",
            },
          },
        ],
      },
    })

    return vectorId
  } catch (error) {
    console.warn("Failed to store document in Pinecone:", error)
    return `mock_vector_${document.id}`
  }
}

interface PineconeMatch {
  id: string;
  score: number;
  values: number[];
  metadata?: Record<string, any>;
}

export async function searchSimilarDocuments(query: string, limit: number = 5): Promise<string[]> {
  const client = await initPinecone()
  
  if (!client) {
    console.warn("Pinecone not configured. Returning empty results.")
    return []
  }

  try {
    const queryEmbedding = await generateEmbedding(query)
    const index = client.Index("chatbot-docs")
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
    })

    return queryResponse.matches.map((match: PineconeMatch) => match.id)
  } catch (error) {
    console.error("Error searching similar documents:", error)
    return []
  }
}

interface ChatMessage {
  role: string;
  content: string;
}

interface Document {
  content: string;
}

export async function generateChatResponse(messages: ChatMessage[], documents: Document[]): Promise<string> {
  if (!openai) {
    return "AI není nakonfigurováno. Prosím kontaktujte administrátora."
  }

  try {
    const context = documents.map(doc => doc.content).join("\n\n")
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Jsi AI asistent. Používej následující kontext pro odpovědi na otázky:\n\n${context}`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content || "Omlouváme se, ale nepodařilo se vygenerovat odpověď."
  } catch (error) {
    console.error("Error generating chat response:", error)
    return "Omlouváme se, ale došlo k chybě při generování odpovědi."
  }
}

export async function processWebsite(url: string): Promise<string[]> {
  // TODO: Implement website scraping
  return ["Website content will be processed here"]
}

export async function processDocument(buffer: Buffer, filename: string): Promise<string> {
  // TODO: Implement document processing
  return "Document content will be processed here"
}
