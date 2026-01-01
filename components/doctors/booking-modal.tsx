"use client"

import { useActionState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react"
import { bookAppointment, type AppointmentState } from "@/lib/actions/appointments"
import type { PractitionerWithUser } from "@/lib/db"

type BookingModalProps = {
  isOpen: boolean
  onClose: () => void
  practitioner: PractitionerWithUser
  slot: { start: Date; end: Date }
}

const initialState: AppointmentState = {}

export function BookingModal({ isOpen, onClose, practitioner, slot }: BookingModalProps) {
  const [state, formAction, isPending] = useActionState(bookAppointment, initialState)

  if (state.success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Appointment Booked!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Your appointment with {practitioner.user_name} has been successfully booked.
            </p>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(slot.start, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You will receive a confirmation once the practitioner accepts your appointment.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>Review the details and confirm your booking</DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <input type="hidden" name="practitionerId" value={practitioner.id} />
          <input type="hidden" name="startTime" value={slot.start.toISOString()} />
          <input type="hidden" name="endTime" value={slot.end.toISOString()} />

          <div className="space-y-4 py-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{practitioner.user_name}</span>
                <span className="text-muted-foreground">({practitioner.specialty})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(slot.start, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")} ({practitioner.appointment_duration}{" "}
                  minutes)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for the doctor (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Describe your symptoms or reason for the visit..."
                rows={3}
              />
            </div>
          </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
