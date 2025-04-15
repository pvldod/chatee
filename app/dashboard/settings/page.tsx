"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  expiresAt?: string
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newMessages: true,
      dailyDigest: false,
      weeklyDigest: true,
      systemNotifications: true,
    },
    webNotifications: {
      realTime: true,
      errors: true,
      updates: false,
    },
  })
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchApiKeys()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchNotificationSettings()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys")
      if (!response.ok) {
        throw new Error("Failed to fetch API keys")
      }
      const data = await response.json()
      setApiKeys(data.apiKeys)
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst API klíče. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch("/api/user/notifications")
      if (!response.ok) {
        throw new Error("Failed to fetch notification settings")
      }
      const data = await response.json()
      setNotificationSettings(data.settings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (category: 'emailNotifications' | 'webNotifications', setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }))
  }

  const handleSaveNotifications = async () => {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast({
        title: "Success",
        description: "Your notification settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!id) return;
    
    setIsRevoking(id)

    try {
      const response = await fetch(`/api/api-keys`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to revoke API key")
      }

      toast({
        title: "Klíč zrušen",
        description: "API klíč byl úspěšně zrušen.",
      })

      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== id))
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se zrušit API klíč. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    } finally {
      setIsRevoking(null)
    }
  }

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsGenerating(true)

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newKeyName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate API key")
      }

      const data = await response.json()

      toast({
        title: "API klíč vygenerován",
        description: "Nový API klíč byl úspěšně vygenerován.",
      })

      setNewKey(data.apiKey.key)
      setShowGenerateDialog(false)
      fetchApiKeys() // Refresh the list
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se vygenerovat API klíč. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={profileData.name} onChange={handleProfileChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Klíče</CardTitle>
              <CardDescription>Spravujte své API klíče pro programový přístup.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                API klíče vám umožňují přistupovat k chatee.io API programově. Udržujte své API klíče v bezpečí.
              </p>

              {/* API Keys List */}
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="bg-zinc-900 p-4 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-gray-400">{key.key}</p>
                      <p className="text-xs text-gray-500">
                        Vytvořeno: {new Date(key.createdAt).toLocaleDateString()}
                        {key.expiresAt && ` · Vyprší: ${new Date(key.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={isRevoking === key.id}
                    >
                      {isRevoking === key.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rušení...
                        </>
                      ) : (
                        "Zrušit"
                      )}
                    </Button>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="bg-zinc-900 p-4 rounded-md">
                    <p className="text-sm text-gray-400">Zatím nemáte žádné API klíče</p>
                  </div>
                )}
              </div>

              {/* Generate Key Dialog */}
              <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">Generovat API Klíč</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generovat nový API klíč</DialogTitle>
                    <DialogDescription>
                      Vytvořte nový API klíč pro přístup k chatee.io API. Klíč bude zobrazen pouze jednou.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleGenerateKey} className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Název klíče</Label>
                      <Input
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="např. Produkční API"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generování...
                          </>
                        ) : (
                          "Generovat klíč"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Show New Key Dialog */}
              <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nový API klíč byl vygenerován</DialogTitle>
                    <DialogDescription>
                      Zkopírujte si tento klíč. Z bezpečnostních důvodů ho už nikdy neuvidíte celý.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-zinc-900 p-4 rounded-md break-all font-mono">
                    {newKey}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      if (newKey) {
                        navigator.clipboard.writeText(newKey);
                        toast({
                          title: "Zkopírováno",
                          description: "API klíč byl zkopírován do schránky.",
                        });
                      }
                    }}>
                      Kopírovat
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications about your chatbots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="newMessages" className="flex-1">New Messages</Label>
                      <input
                        type="checkbox"
                        id="newMessages"
                        checked={notificationSettings.emailNotifications.newMessages}
                        onChange={() => handleNotificationChange('emailNotifications', 'newMessages')}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dailyDigest" className="flex-1">Daily Activity Digest</Label>
                      <input
                        type="checkbox"
                        id="dailyDigest"
                        checked={notificationSettings.emailNotifications.dailyDigest}
                        onChange={() => handleNotificationChange('emailNotifications', 'dailyDigest')}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weeklyDigest" className="flex-1">Weekly Activity Digest</Label>
                      <input
                        type="checkbox"
                        id="weeklyDigest"
                        checked={notificationSettings.emailNotifications.weeklyDigest}
                        onChange={() => handleNotificationChange('emailNotifications', 'weeklyDigest')}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="systemNotifications" className="flex-1">System Notifications</Label>
                      <input
                        type="checkbox"
                        id="systemNotifications"
                        checked={notificationSettings.emailNotifications.systemNotifications}
                        onChange={() => handleNotificationChange('emailNotifications', 'systemNotifications')}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Web Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="realTime" className="flex-1">Real-time Notifications</Label>
                      <input
                        type="checkbox"
                        id="realTime"
                        checked={notificationSettings.webNotifications.realTime}
                        onChange={() => handleNotificationChange('webNotifications', 'realTime')}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="errors" className="flex-1">Error Notifications</Label>
                      <input
                        type="checkbox"
                        id="errors"
                        checked={notificationSettings.webNotifications.errors}
                        onChange={() => handleNotificationChange('webNotifications', 'errors')}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="updates" className="flex-1">Update Notifications</Label>
                      <input
                        type="checkbox"
                        id="updates"
                        checked={notificationSettings.webNotifications.updates}
                        onChange={() => handleNotificationChange('webNotifications', 'updates')}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
