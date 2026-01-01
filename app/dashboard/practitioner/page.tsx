import { requirePractitioner } from "@/lib/auth"
import { getPractitionerByUserId } from "@/lib/queries/practitioners"
import { getPractitionerAppointments, getPractitionerAvailability } from "@/lib/queries/appointments"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PractitionerStats } from "@/components/dashboard/practitioner-stats"
import { PractitionerAppointments } from "@/components/dashboard/practitioner-appointments"
import { AvailabilityManager } from "@/components/dashboard/availability-manager"
import { redirect } from "next/navigation"

export default async function PractitionerDashboardPage() {
  const user = await requirePractitioner()
  const practitioner = await getPractitionerByUserId(user.id)

  if (!practitioner) {
    redirect("/")
  }

  const [appointments, availability] = await Promise.all([
    getPractitionerAppointments(practitioner.id),
    getPractitionerAvailability(practitioner.id),
  ])

  const now = new Date()
  const upcomingAppointments = appointments.filter((a) => new Date(a.start_time) > now && a.status !== "cancelled")
  const pendingAppointments = appointments.filter((a) => a.status === "pending" && new Date(a.start_time) > now)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. {user.name.split(" ").pop()}</h1>
            <p className="mt-1 text-muted-foreground">Manage your schedule and patient appointments</p>
          </div>

          <PractitionerStats
            totalUpcoming={upcomingAppointments.length}
            pendingCount={pendingAppointments.length}
            totalPatients={new Set(appointments.filter((a) => a.status === "confirmed").map((a) => a.patient_id)).size}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <PractitionerAppointments appointments={appointments} />
            </div>
            <div className="order-1 lg:order-2">
              <AvailabilityManager practitionerId={practitioner.id} availability={availability} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
