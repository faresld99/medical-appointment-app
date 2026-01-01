import Link from "next/link"
import { SignUpForm } from "@/components/auth/signup-form"
import { Stethoscope } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-[28rem]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MedBook</span>
          </div>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-10">
            <SignUpForm />
          </div>
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent to-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h3 className="text-2xl font-bold text-foreground">Join the MedBook Community</h3>
            <p className="mt-4 text-muted-foreground">
              Whether you&apos;re a patient looking for care or a practitioner ready to help, we&apos;re here to connect
              you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
