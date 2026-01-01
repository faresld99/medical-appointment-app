import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: string
  name: string
  email: string
  password_hash: string
  role: "patient" | "practitioner"
  created_at: Date
}

export type Practitioner = {
  id: string
  user_id: string
  specialty: string
  location: string
  bio: string | null
  appointment_duration: number
  created_at: Date
}

export type PractitionerWithUser = Practitioner & {
  user_name: string
  user_email: string
}

export type AvailabilitySlot = {
  id: string
  practitioner_id: string
  start_time: Date
  end_time: Date
  created_at: Date
}

export type Appointment = {
  id: string
  patient_id: string
  practitioner_id: string
  start_time: Date
  end_time: Date
  status: "pending" | "confirmed" | "cancelled"
  notes: string | null
  created_at: Date
}

export type AppointmentWithDetails = Appointment & {
  patient_name: string
  patient_email: string
  practitioner_name: string
  specialty: string
  location: string
}

export type Session = {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}
