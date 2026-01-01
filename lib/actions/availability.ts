"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { availabilitySchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { addDays, startOfDay, setHours, setMinutes, getDay, addWeeks } from "date-fns"

export type AvailabilityState = {
    error?: string
    success?: boolean
}

type DaySchedule = {
    enabled: boolean
    startTime: string
    endTime: string
}

type WeeklySchedule = Record<string, DaySchedule>

type WeeklyAvailabilityInput = {
    schedule: WeeklySchedule
    weeksAhead: number
}

const DAY_MAP: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
}

export async function addWeeklyAvailability(input: WeeklyAvailabilityInput): Promise<AvailabilityState> {
    const session = await getSession()
    if (!session || session.user.role !== "practitioner") {
        return { error: "Non autorisé" }
    }

    // Get practitioner ID
    const practitioner = await sql`
    SELECT id FROM practitioners WHERE user_id = ${session.user.id}
  `

    if (practitioner.length === 0) {
        return { error: "Profil praticien non trouvé" }
    }

    const practitionerId = practitioner[0].id
    const { schedule, weeksAhead } = input

    // Start from tomorrow to avoid same-day issues
    const startDate = startOfDay(addDays(new Date(), 1))
    const endDate = addWeeks(startDate, weeksAhead)

    // Generate slots for each enabled day
    const slotsToInsert: { startTime: Date; endTime: Date }[] = []

    let currentDate = startDate
    while (currentDate < endDate) {
        const dayOfWeek = getDay(currentDate)

        // Find the matching day in schedule
        const dayEntry = Object.entries(DAY_MAP).find(([_, idx]) => idx === dayOfWeek)
        if (dayEntry) {
            const dayKey = dayEntry[0]
            const daySchedule = schedule[dayKey]

            if (daySchedule && daySchedule.enabled) {
                const [startHour, startMin] = daySchedule.startTime.split(":").map(Number)
                const [endHour, endMin] = daySchedule.endTime.split(":").map(Number)

                const slotStart = setMinutes(setHours(currentDate, startHour), startMin)
                const slotEnd = setMinutes(setHours(currentDate, endHour), endMin)

                slotsToInsert.push({ startTime: slotStart, endTime: slotEnd })
            }
        }

        currentDate = addDays(currentDate, 1)
    }

    if (slotsToInsert.length === 0) {
        return { error: "Aucun créneau à générer. Activez au moins un jour." }
    }

    // Delete existing future availability first (to avoid conflicts)
    await sql`
    DELETE FROM availability_slots 
    WHERE practitioner_id = ${practitionerId}
    AND start_time >= ${startDate.toISOString()}
  `

    // Insert all new slots
    for (const slot of slotsToInsert) {
        await sql`
      INSERT INTO availability_slots (practitioner_id, start_time, end_time)
      VALUES (${practitionerId}, ${slot.startTime.toISOString()}, ${slot.endTime.toISOString()})
    `
    }

    revalidatePath("/dashboard/practitioner")

    return { success: true }
}

export async function addAvailability(prevState: AvailabilityState, formData: FormData): Promise<AvailabilityState> {
    const session = await getSession()
    if (!session || session.user.role !== "practitioner") {
        return { error: "Non autorisé" }
    }

    const rawData = {
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
    }

    const parsed = availabilitySchema.safeParse(rawData)
    if (!parsed.success) {
        return { error: parsed.error.errors[0].message }
    }

    const { startTime, endTime } = parsed.data

    // Get practitioner ID
    const practitioner = await sql`
        SELECT id FROM practitioners WHERE user_id = ${session.user.id}
    `

    if (practitioner.length === 0) {
        return { error: "Profil praticien non trouvé" }
    }

    const practitionerId = practitioner[0].id

    // Check for overlapping availability
    const overlapping = await sql`
        SELECT id FROM availability_slots
        WHERE practitioner_id = ${practitionerId}
          AND (
            (start_time <= ${startTime} AND end_time > ${startTime})
                OR (start_time < ${endTime} AND end_time >= ${endTime})
                OR (start_time >= ${startTime} AND end_time <= ${endTime})
            )
    `

    if (overlapping.length > 0) {
        return { error: "Ce créneau chevauche une disponibilité existante" }
    }

    await sql`
        INSERT INTO availability_slots (practitioner_id, start_time, end_time)
        VALUES (${practitionerId}, ${startTime}, ${endTime})
    `

    revalidatePath("/dashboard/practitioner")

    return { success: true }
}

export async function removeAvailability(slotId: string): Promise<AvailabilityState> {
    const session = await getSession()
    if (!session || session.user.role !== "practitioner") {
        return { error: "Non autorisé" }
    }

    // Verify ownership
    const slot = await sql`
        SELECT a.id
        FROM availability_slots a
                 JOIN practitioners p ON a.practitioner_id = p.id
        WHERE a.id = ${slotId} AND p.user_id = ${session.user.id}
    `

    if (slot.length === 0) {
        return { error: "Créneau non trouvé ou non autorisé" }
    }

    await sql`DELETE FROM availability_slots WHERE id = ${slotId}`

    revalidatePath("/dashboard/practitioner")

    return { success: true }
}
