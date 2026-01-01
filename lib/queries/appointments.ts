import { sql, type AppointmentWithDetails, type AvailabilitySlot } from "@/lib/db"

export async function getPatientAppointments(patientId: string): Promise<AppointmentWithDetails[]> {
  const result = await sql`
    SELECT 
      a.id, a.patient_id, a.practitioner_id, a.start_time, a.end_time, 
      a.status, a.notes, a.created_at,
      u_patient.name as patient_name, u_patient.email as patient_email,
      u_pract.name as practitioner_name, 
      p.specialty, p.location
    FROM appointments a
    JOIN users u_patient ON a.patient_id = u_patient.id
    JOIN practitioners p ON a.practitioner_id = p.id
    JOIN users u_pract ON p.user_id = u_pract.id
    WHERE a.patient_id = ${patientId}
    ORDER BY a.start_time DESC
  `

  return result.map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    practitioner_id: row.practitioner_id,
    start_time: new Date(row.start_time),
    end_time: new Date(row.end_time),
    status: row.status as "pending" | "confirmed" | "cancelled",
    notes: row.notes,
    created_at: new Date(row.created_at),
    patient_name: row.patient_name,
    patient_email: row.patient_email,
    practitioner_name: row.practitioner_name,
    specialty: row.specialty,
    location: row.location,
  }))
}

export async function getPractitionerAppointments(practitionerId: string): Promise<AppointmentWithDetails[]> {
  const result = await sql`
    SELECT 
      a.id, a.patient_id, a.practitioner_id, a.start_time, a.end_time, 
      a.status, a.notes, a.created_at,
      u_patient.name as patient_name, u_patient.email as patient_email,
      u_pract.name as practitioner_name, 
      p.specialty, p.location
    FROM appointments a
    JOIN users u_patient ON a.patient_id = u_patient.id
    JOIN practitioners p ON a.practitioner_id = p.id
    JOIN users u_pract ON p.user_id = u_pract.id
    WHERE a.practitioner_id = ${practitionerId}
    ORDER BY a.start_time DESC
  `

  return result.map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    practitioner_id: row.practitioner_id,
    start_time: new Date(row.start_time),
    end_time: new Date(row.end_time),
    status: row.status as "pending" | "confirmed" | "cancelled",
    notes: row.notes,
    created_at: new Date(row.created_at),
    patient_name: row.patient_name,
    patient_email: row.patient_email,
    practitioner_name: row.practitioner_name,
    specialty: row.specialty,
    location: row.location,
  }))
}

export async function getPractitionerAvailability(practitionerId: string): Promise<AvailabilitySlot[]> {
  const result = await sql`
    SELECT id, practitioner_id, start_time, end_time, created_at
    FROM availability_slots
    WHERE practitioner_id = ${practitionerId}
    AND end_time > NOW()
    ORDER BY start_time ASC
  `

  return result.map((row) => ({
    id: row.id,
    practitioner_id: row.practitioner_id,
    start_time: new Date(row.start_time),
    end_time: new Date(row.end_time),
    created_at: new Date(row.created_at),
  }))
}

export async function getBookedSlots(practitionerId: string): Promise<{ start_time: Date; end_time: Date }[]> {
  const result = await sql`
    SELECT start_time, end_time
    FROM appointments
    WHERE practitioner_id = ${practitionerId}
    AND status != 'cancelled'
    AND end_time > NOW()
  `

  return result.map((row) => ({
    start_time: new Date(row.start_time),
    end_time: new Date(row.end_time),
  }))
}
