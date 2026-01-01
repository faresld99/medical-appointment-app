"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore, addMinutes } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, LogIn } from "lucide-react"
import { BookingModal } from "./booking-modal"
import type { PractitionerWithUser, AvailabilitySlot } from "@/lib/db"

type BookingCalendarProps = {
  practitioner: PractitionerWithUser
  availability: AvailabilitySlot[]
  bookedSlots: { start_time: Date; end_time: Date }[]
  isLoggedIn: boolean
  isPatient: boolean
}

export function BookingCalendar({
  practitioner,
  availability,
  bookedSlots,
  isLoggedIn,
  isPatient,
}: BookingCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Generate available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []

    const slots: { start: Date; end: Date }[] = []
    const duration = practitioner.appointment_duration

    // Find availability slots that overlap with selected date
    for (const avail of availability) {
      const availStart = new Date(avail.start_time)
      const availEnd = new Date(avail.end_time)

      // Check if availability overlaps with selected date
      const dayStart = startOfDay(selectedDate)
      const dayEnd = addDays(dayStart, 1)

      if (isBefore(availEnd, dayStart) || isAfter(availStart, dayEnd)) {
        continue
      }

      // Generate slots within this availability window
      let slotStart = isAfter(availStart, dayStart) ? availStart : dayStart
      slotStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        slotStart.getHours(),
        slotStart.getMinutes(),
      )

      while (true) {
        const slotEnd = addMinutes(slotStart, duration)

        // Check if slot is within availability
        if (isAfter(slotEnd, availEnd)) break

        // Check if slot is in the future
        if (isBefore(slotStart, new Date())) {
          slotStart = addMinutes(slotStart, duration)
          continue
        }

        // Check if slot overlaps with booked appointments
        const isBooked = bookedSlots.some((booked) => {
          const bookedStart = new Date(booked.start_time)
          const bookedEnd = new Date(booked.end_time)
          return (
            (slotStart >= bookedStart && slotStart < bookedEnd) ||
            (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
            (slotStart <= bookedStart && slotEnd >= bookedEnd)
          )
        })

        if (!isBooked) {
          slots.push({ start: slotStart, end: slotEnd })
        }

        slotStart = addMinutes(slotStart, duration)
      }
    }

    return slots.sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [selectedDate, availability, bookedSlots, practitioner.appointment_duration])

  // Check which dates have availability
  const datesWithAvailability = useMemo(() => {
    const dates: Date[] = []
    const today = startOfDay(new Date())

    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i)

      const hasAvailability = availability.some((avail) => {
        const availStart = new Date(avail.start_time)
        const availEnd = new Date(avail.end_time)
        const dayStart = startOfDay(date)
        const dayEnd = addDays(dayStart, 1)

        return !(isBefore(availEnd, dayStart) || isAfter(availStart, dayEnd))
      })

      if (hasAvailability) {
        dates.push(date)
      }
    }

    return dates
  }, [availability])

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    setSelectedSlot(slot)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Book an Appointment
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isLoggedIn && (
            <Alert>
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                Please{" "}
                <Button variant="link" className="h-auto p-0" onClick={() => router.push("/login")}>
                  log in
                </Button>{" "}
                to book an appointment.
              </AlertDescription>
            </Alert>
          )}

          {isLoggedIn && !isPatient && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Only patients can book appointments.</AlertDescription>
            </Alert>
          )}

          {availability.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This practitioner has not set up their availability yet. Please check back later.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar */}
            <div>
              <h3 className="mb-4 font-medium text-foreground">Select a Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = startOfDay(new Date())
                  if (isBefore(date, today)) return true
                  return !datesWithAvailability.some((d) => isSameDay(d, date))
                }}
                modifiers={{
                  available: datesWithAvailability,
                }}
                modifiersClassNames={{
                  available: "bg-primary/10 text-primary font-medium",
                }}
                className="rounded-md border w-full"
              />
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="mb-4 font-medium text-foreground text-sm sm:text-base">
                {selectedDate
                  ? `Available Times on ${format(selectedDate, "MMMM d, yyyy")}`
                  : "Select a date to see available times"}
              </h3>

              {selectedDate && availableSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">No available slots for this date.</p>
              )}

              {selectedDate && availableSlots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-center bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!isLoggedIn || !isPatient}
                    >
                      {format(slot.start, "h:mm a")}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedSlot(null)
          }}
          practitioner={practitioner}
          slot={selectedSlot}
        />
      )}
    </>
  )
}
