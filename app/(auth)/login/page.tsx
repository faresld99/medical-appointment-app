import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Stethoscope } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MedBook</span>
          </div>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent to-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h3 className="text-2xl font-bold text-foreground">Your Health, Your Schedule</h3>
            <p className="mt-4 text-muted-foreground">
              Access your appointments, manage your health journey, and connect with healthcare professionals all in one
              place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
