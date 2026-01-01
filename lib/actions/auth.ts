"use server"

import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createSession, logout as authLogout } from "@/lib/auth"
import { signUpSchema, loginSchema } from "@/lib/validations"
import { redirect } from "next/navigation"

export type AuthState = {
  error?: string
  success?: boolean
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
    specialty: formData.get("specialty") as string,
    location: formData.get("location") as string,
    bio: formData.get("bio") as string,
    appointmentDuration: formData.get("appointmentDuration")
      ? Number.parseInt(formData.get("appointmentDuration") as string)
      : 30,
  }

  const parsed = signUpSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { name, email, password, role, specialty, location, bio, appointmentDuration } = parsed.data

  // Check if email already exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing.length > 0) {
    return { error: "Email already registered" }
  }

  // Validate practitioner fields
  if (role === "practitioner") {
    if (!specialty || !location) {
      return { error: "Specialty and location are required for practitioners" }
    }
  }

  const passwordHash = await hashPassword(password)

  // Create user
  const userResult = await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${name}, ${email}, ${passwordHash}, ${role})
    RETURNING id
  `
  const userId = userResult[0].id

  // Create practitioner profile if applicable
  if (role === "practitioner") {
    await sql`
      INSERT INTO practitioners (user_id, specialty, location, bio, appointment_duration)
      VALUES (${userId}, ${specialty}, ${location}, ${bio || null}, ${appointmentDuration || 30})
    `
  }

  await createSession(userId)

  redirect(role === "practitioner" ? "/dashboard/practitioner" : "/dashboard/patient")
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { email, password } = parsed.data

  const result = await sql`
    SELECT id, password_hash, role FROM users WHERE email = ${email}
  `

  if (result.length === 0) {
    return { error: "Invalid email or password" }
  }

  const user = result[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user.id)

  redirect(user.role === "practitioner" ? "/dashboard/practitioner" : "/dashboard/patient")
}

export async function logoutAction(): Promise<void> {
  await authLogout()
  redirect("/")
}
