import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DoctorSearch } from "@/components/doctors/doctor-search"
import { DoctorList } from "@/components/doctors/doctor-list"
import { DoctorListSkeleton } from "@/components/doctors/doctor-list-skeleton"

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; location?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Find a Doctor</h1>
            <p className="mt-2 text-muted-foreground">Search our network of healthcare professionals</p>
          </div>

          <DoctorSearch initialFilters={params} />

          <div className="mt-8">
            <Suspense fallback={<DoctorListSkeleton />}>
              <DoctorList filters={params} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
