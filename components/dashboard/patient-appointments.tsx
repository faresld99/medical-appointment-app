"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MapPin, User, X } from "lucide-react"
import { cancelAppointment } from "@/lib/actions/appointments"
import { toast } from "sonner"
import type { AppointmentWithDetails } from "@/lib/db"

type PatientAppointmentsProps = {
  upcomingAppointments: AppointmentWithDetails[]
  pastAppointments: AppointmentWithDetails[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PatientAppointments({ upcomingAppointments, pastAppointments }: PatientAppointmentsProps) {
  const [cancelling, setCancelling] = useState<string | null>(null)

  const handleCancel = async (appointmentId: string) => {
    setCancelling(appointmentId)
    const result = await cancelAppointment(appointmentId)
    setCancelling(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Appointment cancelled successfully")
    }
  }

  const AppointmentCard = ({
    appointment,
    showCancel = false,
  }: { appointment: AppointmentWithDetails; showCancel?: boolean }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium truncate">{appointment.practitioner_name}</span>
              <Badge variant="secondary" className="flex-shrink-0">{appointment.specialty}</Badge>
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{format(new Date(appointment.start_time), "EEEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {format(new Date(appointment.start_time), "h:mm a")} -{" "}
                  {format(new Date(appointment.end_time), "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{appointment.location}</span>
              </div>
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground break-words">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            )}
          </div>

          <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
            <Badge className={statusColors[appointment.status]}>{appointment.status}</Badge>
            {showCancel && appointment.status !== "cancelled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive w-full sm:w-auto">
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your appointment with {appointment.practitioner_name} on{" "}
                      {format(new Date(appointment.start_time), "MMMM d")} at{" "}
                      {format(new Date(appointment.start_time), "h:mm a")}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Keep Appointment</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(appointment.id)}
                      disabled={cancelling === appointment.id}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                    >
                      {cancelling === appointment.id ? "Cancelling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No upcoming appointments</h3>
              <p className="mt-2 text-sm text-muted-foreground">Find a doctor and book your next appointment</p>
            </CardContent>
          </Card>
        ) : (
          upcomingAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} showCancel />
          ))
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No past appointments</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your appointment history will appear here</p>
            </CardContent>
          </Card>
        ) : (
          pastAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
        )}
      </TabsContent>
    </Tabs>
  )
}
