"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { Chatbot } from "@/types/chatbot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Upload, Globe, MessageSquare } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ChatbotDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false)
  const [qaDialogOpen, setQaDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isStatusChanging, setIsStatusChanging] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchChatbot()
    }
  }, [params?.id])

  const fetchChatbot = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch chatbot")
      }
      const data = await response.json()
      setChatbot(data.chatbot)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chatbot. Please try again.",
      })
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      const response = await fetch(`/api/chatbots/${chatbot?.id}/knowledge/document`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload document")

      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      })
      setUploadDialogOpen(false)
      setSelectedFile(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleWebsiteAdd = async () => {
    if (!websiteUrl) return

    try {
      const response = await fetch(`/api/chatbots/${chatbot?.id}/knowledge/website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      })

      if (!response.ok) throw new Error("Failed to add website")

      toast({
        title: "Website added",
        description: "Website has been successfully added to knowledge base.",
      })
      setWebsiteDialogOpen(false)
      setWebsiteUrl("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add website. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleQaPairAdd = async () => {
    if (!question || !answer) return

    try {
      const response = await fetch(`/api/chatbots/${chatbot?.id}/knowledge/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      })

      if (!response.ok) throw new Error("Failed to add Q&A pair")

      toast({
        title: "Q&A added",
        description: "Question and answer have been successfully added to knowledge base.",
      })
      setQaDialogOpen(false)
      setQuestion("")
      setAnswer("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add Q&A. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegenerateApiKey = async () => {
    if (!chatbot) return

    try {
      setIsRegeneratingKey(true)
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Chatbot ${chatbot.name} API Key`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate API key")
      }

      // Update chatbot with new API key
      const updatedChatbot: Chatbot = {
        ...chatbot,
        integrations: {
          ...chatbot.integrations,
          apiKey: data.key,
        },
      }

      const updateResponse = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChatbot),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update chatbot")
      }

      setChatbot(updatedChatbot)
      toast({
        title: "Success",
        description: "API key has been successfully generated",
      })
    } catch (error) {
      console.error("Error regenerating API key:", error)
      toast({
        title: "Error",
        description: "Failed to generate new API key",
      })
    } finally {
      setIsRegeneratingKey(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!chatbot) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatbot),
      })

      if (!response.ok) {
        throw new Error("Failed to update chatbot")
      }

      toast({
        title: "Changes saved",
        description: "Chatbot settings have been successfully updated.",
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async () => {
    if (!chatbot) return
    
    setIsStatusChanging(true)
    try {
      const newStatus = chatbot.status === "active" ? "inactive" : "active"
      
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...chatbot,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update chatbot status")
      }

      const updatedChatbot = await response.json()
      setChatbot(updatedChatbot.chatbot)
      
      toast({
        title: "Status updated",
        description: `Chatbot is now ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      })
    } finally {
      setIsStatusChanging(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Chatbot not found</h2>
          <p className="text-gray-400 mb-6">
            The chatbot you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{chatbot.name}</h1>
          {chatbot.description && <p className="text-gray-400 mt-1">{chatbot.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/demo?chatbotId=${chatbot.id}`)}>
            Preview
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={chatbot?.status === "active"}
              onCheckedChange={handleStatusChange}
              disabled={isStatusChanging}
            />
            <Label>{isStatusChanging ? "Updating..." : (chatbot?.status === "active" ? "Active" : "Inactive")}</Label>
          </div>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <p className="text-gray-400 mb-6">Configure your chatbot's basic settings and behavior.</p>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Chatbot Name</Label>
                  <Input
                    id="name"
                    value={chatbot.name}
                    onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={chatbot.description || ""}
                    onChange={(e) => setChatbot({ ...chatbot, description: e.target.value })}
                    className="mt-1"
                    placeholder="Describe what this chatbot is for"
                  />
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Input
                    id="welcomeMessage"
                    value={chatbot.welcomeMessage}
                    onChange={(e) => setChatbot({ ...chatbot, welcomeMessage: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-medium mb-4">Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAttachments">File Attachments</Label>
                      <p className="text-sm text-gray-400">Allow users to send files in chat</p>
                    </div>
                    <Switch
                      id="enableAttachments"
                      checked={chatbot.settings.enableAttachments}
                      onCheckedChange={(checked) =>
                        setChatbot({
                          ...chatbot,
                          settings: { ...chatbot.settings, enableAttachments: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableHistory">Conversation History</Label>
                      <p className="text-sm text-gray-400">Save chat history for future reference</p>
                    </div>
                    <Switch
                      id="enableHistory"
                      checked={chatbot.settings.enableHistory}
                      onCheckedChange={(checked) =>
                        setChatbot({
                          ...chatbot,
                          settings: { ...chatbot.settings, enableHistory: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableFeedback">User Feedback</Label>
                      <p className="text-sm text-gray-400">Allow users to rate responses</p>
                    </div>
                    <Switch
                      id="enableFeedback"
                      checked={chatbot.settings.enableFeedback}
                      onCheckedChange={(checked) =>
                        setChatbot({
                          ...chatbot,
                          settings: { ...chatbot.settings, enableFeedback: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableTranscripts">Email Transcripts</Label>
                      <p className="text-sm text-gray-400">Send chat transcripts to users</p>
                    </div>
                    <Switch
                      id="enableTranscripts"
                      checked={chatbot.settings.enableTranscripts}
                      onCheckedChange={(checked) =>
                        setChatbot({
                          ...chatbot,
                          settings: { ...chatbot.settings, enableTranscripts: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
            <p className="text-gray-400 mb-6">Train your chatbot by adding documents, websites, or Q&A pairs.</p>
            <div className="flex gap-4">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a document to train your chatbot. Supported formats: PDF, DOCX, TXT.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="document">Document</Label>
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <Button onClick={handleFileUpload} disabled={!selectedFile}>
                      Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={websiteDialogOpen} onOpenChange={setWebsiteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Add Website
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Website</DialogTitle>
                    <DialogDescription>
                      Add a website URL to train your chatbot with its content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="url">Website URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleWebsiteAdd} disabled={!websiteUrl}>
                      Add Website
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={qaDialogOpen} onOpenChange={setQaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Q&A Pairs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Q&A Pair</DialogTitle>
                    <DialogDescription>
                      Add a question and answer pair to train your chatbot.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        placeholder="What is your return policy?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        placeholder="You can return any item within 30 days..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleQaPairAdd} disabled={!question || !answer}>
                      Add Q&A Pair
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <p className="text-gray-400 mb-6">Customize how your chatbot looks on your website.</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={chatbot.appearance.primaryColor}
                      onChange={(e) =>
                        setChatbot({
                          ...chatbot,
                          appearance: { ...chatbot.appearance, primaryColor: e.target.value },
                        })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={chatbot.appearance.primaryColor}
                      onChange={(e) =>
                        setChatbot({
                          ...chatbot,
                          appearance: { ...chatbot.appearance, primaryColor: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-400">Used for buttons and user messages</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="textColor"
                      value={chatbot.appearance.textColor}
                      onChange={(e) =>
                        setChatbot({
                          ...chatbot,
                          appearance: { ...chatbot.appearance, textColor: e.target.value },
                        })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={chatbot.appearance.textColor}
                      onChange={(e) =>
                        setChatbot({
                          ...chatbot,
                          appearance: { ...chatbot.appearance, textColor: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-400">Used for bot messages and UI elements</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={chatbot.appearance.fontFamily || "system"}
                  onValueChange={(value) =>
                    setChatbot({
                      ...chatbot,
                      appearance: { ...chatbot.appearance, fontFamily: value === "system" ? undefined : value },
                    })
                  }
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">Font used in the chat widget</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={chatbot.appearance.logoUrl || ""}
                  onChange={(e) =>
                    setChatbot({
                      ...chatbot,
                      appearance: { ...chatbot.appearance, logoUrl: e.target.value || undefined },
                    })
                  }
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-gray-400">Optional: Display your logo in the chat header</p>
              </div>

              <div className="mt-6 p-4 border border-zinc-800 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Preview</h3>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-full mb-4"
                    style={{ backgroundColor: chatbot.appearance.primaryColor }}
                  ></div>
                  <div
                    className="max-w-[80%] rounded-lg p-3 mb-2"
                    style={{ backgroundColor: chatbot.appearance.primaryColor }}
                  >
                    <span className="text-black">Hello! How can I help you?</span>
                  </div>
                  <div
                    className="max-w-[80%] rounded-lg p-3"
                    style={{ backgroundColor: "#2a2a2a", color: chatbot.appearance.textColor }}
                  >
                    <span>I'm here to assist you with any questions.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Integration</h2>
            <p className="text-gray-400 mb-6">Get the code to add your chatbot to your website.</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Installation Code</Label>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <code className="text-sm text-gray-300 whitespace-pre-wrap break-all">
                    {`<script>
  (function(c,h,a,t,e,e_,i,o) {
    c[e]=c[e]||function(){(c[e].q=c[e].q||[]).push(arguments)};
    o=h.createElement(a),i=h.getElementsByTagName(a)[0];
    o.async=1;o.src=t;i.parentNode.insertBefore(o,i)
  })(window,document,'script','https://cdn.chatee.io/widget.js','chatee');
  
  chatee('init', '${chatbot.id}');
</script>`}
                  </code>
                </div>
                <p className="text-sm text-gray-400">Add this code to your website's HTML, just before the closing {"</body>"} tag.</p>
              </div>

              <div className="space-y-2">
                <Label>Allowed Domains</Label>
                <div className="flex gap-2">
                  <Input
                    value={chatbot.integrations?.allowedDomains?.join(", ") || ""}
                    onChange={(e) =>
                      setChatbot({
                        ...chatbot,
                        integrations: {
                          ...chatbot.integrations,
                          allowedDomains: e.target.value.split(",").map((d) => d.trim()).filter(Boolean),
                        },
                      })
                    }
                    placeholder="example.com, subdomain.example.com"
                  />
                </div>
                <p className="text-sm text-gray-400">List of domains where the chatbot is allowed to run (comma separated). Leave empty to allow all domains.</p>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={chatbot.integrations?.apiKey || ""}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleRegenerateApiKey}
                    disabled={isRegeneratingKey}
                  >
                    {isRegeneratingKey ? "Generating..." : "Regenerate"}
                  </Button>
                </div>
                <p className="text-sm text-gray-400">Use this API key for programmatic interaction with your chatbot.</p>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={chatbot.integrations?.webhookUrl || ""}
                    onChange={(e) =>
                      setChatbot({
                        ...chatbot,
                        integrations: {
                          ...chatbot.integrations,
                          webhookUrl: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <p className="text-sm text-gray-400">Optional: Receive notifications about new messages and events.</p>
              </div>

              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  value={chatbot.integrations?.customCss || ""}
                  onChange={(e) =>
                    setChatbot({
                      ...chatbot,
                      integrations: {
                        ...chatbot.integrations,
                        customCss: e.target.value || undefined,
                      },
                    })
                  }
                  placeholder=".chatee-widget { /* your custom styles */ }"
                  className="font-mono"
                  rows={5}
                />
                <p className="text-sm text-gray-400">Optional: Add custom CSS to style your chatbot widget.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-400">View usage statistics and conversation analytics.</p>
            {/* Analytics would go here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

