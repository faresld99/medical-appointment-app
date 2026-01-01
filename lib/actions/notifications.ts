"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type Notification = {
    id: string
    user_id: string
    type: "booking_request" | "booking_confirmed" | "booking_cancelled"
    title: string
    message: string
    appointment_id: string | null
    is_read: boolean
    created_at: string
}

export async function createNotification({
                                             userId,
                                             type,
                                             title,
                                             message,
                                             appointmentId,
                                         }: {
    userId: string
    type: Notification["type"]
    title: string
    message: string
    appointmentId?: string
}) {
    await sql`
    INSERT INTO notifications (user_id, type, title, message, appointment_id)
    VALUES (${userId}, ${type}, ${title}, ${message}, ${appointmentId || null})
  `
}

export async function getUnreadNotifications(): Promise<Notification[]> {
    const session = await getSession()
    if (!session) return []

    const notifications = await sql`
    SELECT * FROM notifications
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT 50
  `

    return notifications as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await getSession()
    if (!session) return

    await sql`
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ${notificationId} AND user_id = ${session.user.id}
  `

    revalidatePath("/")
}

export async function markAllNotificationsAsRead() {
    const session = await getSession()
    if (!session) return

    await sql`
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = ${session.user.id} AND is_read = FALSE
  `

    revalidatePath("/")
}

export async function getUnreadCount(): Promise<number> {
    const session = await getSession()
    if (!session) return 0

    const result = await sql`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ${session.user.id} AND is_read = FALSE
  `

    return Number(result[0]?.count || 0)
}
