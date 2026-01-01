import { requirePatient } from "@/lib/auth"
import { getPatientAppointments } from "@/lib/queries/appointments"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PatientAppointments } from "@/components/dashboard/patient-appointments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Search } from "lucide-react"
import Link from "next/link"

export default async function PatientDashboardPage() {
  const user = await requirePatient()
  const appointments = await getPatientAppointments(user.id)

  const now = new Date()
  const upcomingAppointments = appointments.filter((a) => new Date(a.start_time) > now && a.status !== "cancelled")
  const pastAppointments = appointments.filter((a) => new Date(a.start_time) <= now || a.status === "cancelled")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="mt-1 text-muted-foreground">Manage your appointments and health journey</p>
            </div>
            <Button asChild>
              <Link href="/doctors">
                <Search className="mr-2 h-4 w-4" />
                Find a Doctor
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">appointments scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Appointment</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {new Date(upcomingAppointments[0].start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">with {upcomingAppointments[0].practitioner_name}</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">None</div>
                    <p className="text-xs text-muted-foreground">No upcoming appointments</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pastAppointments.filter((a) => a.status === "confirmed").length}
                </div>
                <p className="text-xs text-muted-foreground">completed appointments</p>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Section */}
          <PatientAppointments upcomingAppointments={upcomingAppointments} pastAppointments={pastAppointments} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
