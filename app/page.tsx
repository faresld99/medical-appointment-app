import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Shield, Search, UserCheck, CalendarCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/50 to-background px-4 py-20 md:py-32">
          <div className="container mx-auto">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Book Medical Appointments <span className="text-primary">Online</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
                Find trusted healthcare professionals and book appointments instantly. Your health journey starts with a
                simple click.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/doctors">
                    <Search className="mr-2 h-5 w-5" />
                    Find a Doctor
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                  <Link href="/signup">Join as Practitioner</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-20">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground">Book your appointment in three simple steps</p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Search</h3>
                <p className="mt-2 text-muted-foreground">Find doctors by specialty, location, or availability</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Choose</h3>
                <p className="mt-2 text-muted-foreground">Review profiles and select the right practitioner for you</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Book</h3>
                <p className="mt-2 text-muted-foreground">Pick a time slot and confirm your appointment instantly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/30 px-4 py-20">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Why Choose MedBook?</h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <Calendar className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Easy Scheduling</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Book appointments 24/7 from anywhere. No more phone calls or waiting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <Clock className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Save Time</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    See real-time availability and book instantly without back-and-forth.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <Shield className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Secure & Private</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your health data is protected with enterprise-grade security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto">
            <Card className="border-0 bg-primary text-primary-foreground">
              <CardContent className="flex flex-col items-center p-6 sm:p-12 text-center">
                <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Ready to Get Started?</h2>
                <p className="mt-4 max-w-xl text-primary-foreground/80 text-sm sm:text-base">
                  Join thousands of patients who have simplified their healthcare journey with MedBook.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                    <Link href="/signup">Create Free Account</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/doctors">Browse Doctors</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
