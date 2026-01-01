import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getPractitionerById } from "@/lib/queries/practitioners"
import { getPractitionerAvailability, getBookedSlots } from "@/lib/queries/appointments"
import { getSession } from "@/lib/auth"
import { DoctorProfile } from "@/components/doctors/doctor-profile"
import { BookingCalendar } from "@/components/doctors/booking-calendar"

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const practitioner = await getPractitionerById(id)

  if (!practitioner) {
    notFound()
  }

  const [availability, bookedSlots, session] = await Promise.all([
    getPractitionerAvailability(id),
    getBookedSlots(id),
    getSession(),
  ])

  const isPatient = session?.user.role === "patient"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <DoctorProfile practitioner={practitioner} />
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <BookingCalendar
                practitioner={practitioner}
                availability={availability}
                bookedSlots={bookedSlots}
                isLoggedIn={!!session}
                isPatient={isPatient}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
