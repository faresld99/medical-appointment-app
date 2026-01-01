"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

const specialties = [
  "All Specialties",
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
]

type DoctorSearchProps = {
  initialFilters: { specialty?: string; location?: string }
}

export function DoctorSearch({ initialFilters }: DoctorSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [specialty, setSpecialty] = useState(initialFilters.specialty || "")
  const [location, setLocation] = useState(initialFilters.location || "")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (specialty && specialty !== "All Specialties") {
      params.set("specialty", specialty)
    }
    if (location) {
      params.set("location", location)
    }

    startTransition(() => {
      router.push(`/doctors?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setSpecialty("")
    setLocation("")
    startTransition(() => {
      router.push("/doctors")
    })
  }

  const hasFilters = searchParams.has("specialty") || searchParams.has("location")

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2 min-w-0">
          <Label htmlFor="specialty">Specialty</Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger id="specialty" className="w-full">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City or State"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full"
          />
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <Button onClick={handleSearch} disabled={isPending} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={handleClear} disabled={isPending} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
