"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2, Check, X, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Room = {
  id: string
  roomNumber: string
  floor: number
  roomType: "single" | "double" | "suite" | "deluxe"
  basePrice: number
  status: "available" | "occupied" | "dirty" | "out_of_service"
  taxRate: number
  maxGuests: number
  notes: string | null
}

export default function RoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchRoom()
  }, [roomId])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
        setNotes(data.notes || "")
      }
    } catch (error) {
      console.error("Failed to fetch room:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRoomStatus = async (status: Room["status"]) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setRoom({ ...room!, status })
      }
    } catch (error) {
      console.error("Failed to update room status:", error)
    } finally {
      setSaving(false)
    }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        setRoom({ ...room!, notes })
        setShowNotesInput(false)
      }
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setSaving(false)
    }
  }

  const deleteRoom = async () => {
    if (!confirm("Are you sure you want to delete this room?")) return

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard/rooms")
      }
    } catch (error) {
      console.error("Failed to delete room:", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!room) {
    return <div>Room not found</div>
  }

  const statusColors = {
    available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    occupied: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    dirty: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    out_of_service: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  }

  const roomTypeLabels = {
    single: "Single",
    double: "Double",
    suite: "Suite",
    deluxe: "Deluxe",
  }

  const canChangeStatus = room.status !== "occupied"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="destructive" onClick={deleteRoom}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Room
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Room Number</Label>
              <p className="text-2xl font-bold">{room.roomNumber}</p>
            </div>

            <div>
              <Label>Floor</Label>
              <p className="text-lg">{room.floor}</p>
            </div>

            <div>
              <Label>Room Type</Label>
              <p className="text-lg">{roomTypeLabels[room.roomType]}</p>
            </div>

            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[room.status]}`}>
                  {room.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div>
              <Label>Base Price</Label>
              <p className="text-lg">{formatCurrency(room.basePrice)} / night</p>
            </div>

            <div>
              <Label>Tax Rate</Label>
              <p className="text-lg">{room.taxRate}%</p>
            </div>

            <div>
              <Label>Max Guests</Label>
              <p className="text-lg">{room.maxGuests} guests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Actions</CardTitle>
            <CardDescription>Update room status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canChangeStatus && room.status === "dirty" && (
              <Button
                className="w-full"
                onClick={() => updateRoomStatus("available")}
                disabled={saving}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Clean / Available
              </Button>
            )}

            {canChangeStatus && room.status !== "dirty" && room.status !== "occupied" && (
              <>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateRoomStatus("dirty")}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Mark as Dirty
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateRoomStatus("out_of_service")}
                  disabled={saving}
                >
                  Mark Out of Service
                </Button>
              </>
            )}

            {canChangeStatus && room.status === "out_of_service" && (
              <Button
                className="w-full"
                onClick={() => updateRoomStatus("available")}
                disabled={saving}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Available
              </Button>
            )}

            {room.status === "occupied" && (
              <div className="text-sm text-muted-foreground p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                Room is currently occupied. Check out the guest before changing status.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Housekeeping Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showNotesInput ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="Add housekeeping notes..."
                  disabled={saving}
                />
                <div className="flex gap-2">
                  <Button onClick={saveNotes} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowNotesInput(false)
                    setNotes(room.notes || "")
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {room.notes ? (
                  <p className="text-sm whitespace-pre-wrap">{room.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added</p>
                )}
                <Button variant="outline" onClick={() => setShowNotesInput(true)}>
                  {room.notes ? "Edit Notes" : "Add Notes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
