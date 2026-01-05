"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Mail, Lock, User, CheckCircle2, Loader2 } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"check" | "setup" | "success">("check")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    hotelName: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    confirmPassword: "",
  })

  useState(() => {
    checkSetup()
  })

  const checkSetup = async () => {
    try {
      const response = await fetch("/api/setup/check")
      if (response.ok) {
        const data = await response.json()
        if (data.setup) {
          router.push("/login")
        } else {
          setStep("setup")
        }
      }
    } catch (error) {
      console.error("Failed to check setup status:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.adminPassword !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (formData.adminPassword.length < 8) {
      alert("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName: formData.hotelName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          adminName: formData.adminName,
        }),
      })

      if (response.ok) {
        setStep("success")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.error || "Setup failed")
      }
    } catch (error) {
      console.error("Setup failed:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "check") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking setup status...</span>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Hotel PMS</CardTitle>
          <CardDescription>Set up your hotel management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotelName">
                <Building className="inline-block mr-2 h-4 w-4" />
                Hotel Name
              </Label>
              <Input
                id="hotelName"
                value={formData.hotelName}
                onChange={(e) =>
                  setFormData({ ...formData, hotelName: e.target.value })
                }
                required
                placeholder="e.g., Grand Hotel"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">
                <User className="inline-block mr-2 h-4 w-4" />
                Admin Name
              </Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) =>
                  setFormData({ ...formData, adminName: e.target.value })
                }
                required
                placeholder="e.g., John Doe"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">
                <Mail className="inline-block mr-2 h-4 w-4" />
                Admin Email
              </Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) =>
                  setFormData({ ...formData, adminEmail: e.target.value })
                }
                required
                placeholder="admin@hotel.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">
                <Lock className="inline-block mr-2 h-4 w-4" />
                Password
              </Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) =>
                  setFormData({ ...formData, adminPassword: e.target.value })
                }
                required
                placeholder="At least 8 characters"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                placeholder="Re-enter password"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
