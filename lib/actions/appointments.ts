"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { appointmentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export type AppointmentState = {
    error?: string
    success?: boolean
}

export async function bookAppointment(prevState: AppointmentState, formData: FormData): Promise<AppointmentState> {
    const session = await getSession()
    if (!session) {
        return { error: "You must be logged in to book an appointment" }
    }

    if (session.user.role !== "patient") {
        return { error: "Only patients can book appointments" }
    }

    const rawData = {
        practitionerId: formData.get("practitionerId") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        notes: formData.get("notes") as string,
    }

    const parsed = appointmentSchema.safeParse(rawData)
    if (!parsed.success) {
        return { error: parsed.error.errors[0].message }
    }

    const { practitionerId, startTime, endTime, notes } = parsed.data

    // Check for overlapping appointments
    const overlapping = await sql`
        SELECT id FROM appointments
        WHERE practitioner_id = ${practitionerId}
          AND status != 'cancelled'
          AND (
            (start_time <= ${startTime} AND end_time > ${startTime})
           OR (start_time < ${endTime} AND end_time >= ${endTime})
           OR (start_time >= ${startTime} AND end_time <= ${endTime})
            )
    `

    if (overlapping.length > 0) {
        return { error: "This time slot is no longer available" }
    }

    // Verify slot is within practitioner availability
    const availabilityCheck = await sql`
        SELECT id FROM availability_slots
        WHERE practitioner_id = ${practitionerId}
          AND start_time <= ${startTime}
          AND end_time >= ${endTime}
    `

    if (availabilityCheck.length === 0) {
        return { error: "Selected time is not within practitioner's availability" }
    }

    // Create appointment
    const appointment = await sql`
        INSERT INTO appointments (patient_id, practitioner_id, start_time, end_time, status, notes)
        VALUES (${session.user.id}, ${practitionerId}, ${startTime}, ${endTime}, 'pending', ${notes || null})
            RETURNING id
    `

    const practitioner = await sql`
        SELECT p.user_id, u.name as patient_name
        FROM practitioners p, users u
        WHERE p.id = ${practitionerId} AND u.id = ${session.user.id}
    `

    if (practitioner.length > 0) {
        const appointmentDate = new Date(startTime).toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

        await createNotification({
            userId: practitioner[0].user_id as string,
            type: "booking_request",
            title: "New appointment request",
            message: `${practitioner[0].patient_name} requests an appointment on ${appointmentDate}`,
            appointmentId: appointment[0].id as string,
        })
    }

    revalidatePath("/dashboard/patient")
    revalidatePath("/dashboard/practitioner")
    revalidatePath(`/doctors/${practitionerId}`)

    return { success: true }
}

export async function cancelAppointment(appointmentId: string): Promise<AppointmentState> {
    const session = await getSession()
    if (!session) {
        return { error: "You must be logged in" }
    }

    // Verify ownership
    const appointment = await sql`
        SELECT a.id, a.patient_id, a.practitioner_id, a.start_time,
               u.name as patient_name, pu.name as practitioner_name,
               p.user_id as practitioner_user_id
        FROM appointments a
                 JOIN users u ON a.patient_id = u.id
                 JOIN practitioners p ON a.practitioner_id = p.id
                 JOIN users pu ON p.user_id = pu.id
        WHERE a.id = ${appointmentId}
    `

    if (appointment.length === 0) {
        return { error: "Appointment not found" }
    }

    const appt = appointment[0]
    const isPractitioner = appt.practitioner_user_id === session.user.id
    const isPatient = appt.patient_id === session.user.id

    if (!isPractitioner && !isPatient) {
        return { error: "Unauthorized" }
    }

    await sql`
        UPDATE appointments SET status = 'cancelled' WHERE id = ${appointmentId}
    `

    const appointmentDate = new Date(appt.start_time as string).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    if (isPractitioner) {
        // Notify patient that doctor cancelled
        await createNotification({
            userId: appt.patient_id as string,
            type: "booking_cancelled",
            title: "Appointment cancelled",
            message: `Dr. ${appt.practitioner_name} has cancelled your appointment on ${appointmentDate}`,
            appointmentId,
        })
    } else {
        // Notify doctor that patient cancelled
        await createNotification({
            userId: appt.practitioner_user_id as string,
            type: "booking_cancelled",
            title: "Appointment cancelled",
            message: `${appt.patient_name} has cancelled the appointment on ${appointmentDate}`,
            appointmentId,
        })
    }

    revalidatePath("/dashboard/patient")
    revalidatePath("/dashboard/practitioner")

    return { success: true }
}

export async function confirmAppointment(appointmentId: string): Promise<AppointmentState> {
    const session = await getSession()
    if (!session) {
        return { error: "You must be logged in" }
    }

    // Verify practitioner ownership and get appointment details
    const appointment = await sql`
        SELECT a.id, a.patient_id, a.start_time, p.user_id as practitioner_user_id,
               pu.name as practitioner_name
        FROM appointments a
                 JOIN practitioners p ON a.practitioner_id = p.id
                 JOIN users pu ON p.user_id = pu.id
        WHERE a.id = ${appointmentId}
    `

    if (appointment.length === 0) {
        return { error: "Appointment not found" }
    }

    if (appointment[0].practitioner_user_id !== session.user.id) {
        return { error: "Unauthorized" }
    }

    await sql`
        UPDATE appointments SET status = 'confirmed' WHERE id = ${appointmentId}
    `

    const appt = appointment[0]
    const appointmentDate = new Date(appt.start_time as string).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    await createNotification({
        userId: appt.patient_id as string,
        type: "booking_confirmed",
        title: "Appointment confirmed",
        message: `Dr. ${appt.practitioner_name} has confirmed your appointment on ${appointmentDate}`,
        appointmentId,
    })

    revalidatePath("/dashboard/practitioner")
    revalidatePath("/dashboard/patient")

    return { success: true }
}