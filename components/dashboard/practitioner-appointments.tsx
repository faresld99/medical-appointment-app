"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, Clock, User, Mail, Check, X } from "lucide-react"
import { confirmAppointment, cancelAppointment } from "@/lib/actions/appointments"
import { toast } from "sonner"
import type { AppointmentWithDetails } from "@/lib/db"

type PractitionerAppointmentsProps = {
  appointments: AppointmentWithDetails[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PractitionerAppointments({ appointments }: PractitionerAppointmentsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const now = new Date()
  const upcomingAppointments = appointments.filter((a) => new Date(a.start_time) > now && a.status !== "cancelled")
  const pastAppointments = appointments.filter((a) => new Date(a.start_time) <= now || a.status === "cancelled")

  const handleConfirm = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    const result = await confirmAppointment(appointmentId)
    setActionLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Appointment confirmed")
    }
  }

  const handleCancel = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    const result = await cancelAppointment(appointmentId)
    setActionLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Appointment cancelled")
    }
  }

  const AppointmentCard = ({
    appointment,
    showActions = false,
  }: { appointment: AppointmentWithDetails; showActions?: boolean }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium truncate">{appointment.patient_name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate break-all">{appointment.patient_email}</span>
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{format(new Date(appointment.start_time), "EEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {format(new Date(appointment.start_time), "h:mm a")} -{" "}
                  {format(new Date(appointment.end_time), "h:mm a")}
                </span>
              </div>
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground break-words">
                <span className="font-medium">Patient notes:</span> {appointment.notes}
              </p>
            )}
          </div>

          <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
            <Badge className={statusColors[appointment.status]}>{appointment.status}</Badge>

            {showActions && appointment.status === "pending" && (
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary hover:text-primary bg-transparent flex-1 sm:flex-none"
                  onClick={() => handleConfirm(appointment.id)}
                  disabled={actionLoading === appointment.id}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Confirm
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive flex-1 sm:flex-none">
                      <X className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Decline Appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to decline the appointment with {appointment.patient_name}? The patient
                        will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">Keep</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                      >
                        Decline
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {showActions && appointment.status === "confirmed" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive w-full sm:w-auto">
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel the confirmed appointment with {appointment.patient_name}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Keep</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(appointment.id)}
                      disabled={actionLoading === appointment.id}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                    >
                      Cancel Appointment
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
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No upcoming appointments</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set your availability to allow patients to book appointments
                </p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No past appointments</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your appointment history will appear here</p>
              </div>
            ) : (
              pastAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
