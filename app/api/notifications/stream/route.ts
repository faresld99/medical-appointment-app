import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return new Response("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    const encoder = new TextEncoder()
    let lastCheckTime = new Date().toISOString()

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`))

            const checkForNotifications = async () => {
                try {
                    // Check for new notifications since last check
                    const newNotifications = await sql`
            SELECT * FROM notifications
            WHERE user_id = ${userId}
            AND created_at > ${lastCheckTime}
            ORDER BY created_at DESC
          `

                    if (newNotifications.length > 0) {
                        lastCheckTime = new Date().toISOString()

                        for (const notification of newNotifications) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ type: "notification", data: notification })}\n\n`),
                            )
                        }
                    }

                    // Send heartbeat to keep connection alive
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`))
                } catch (error) {
                    console.error("Error checking notifications:", error)
                }
            }

            // Check immediately and then every 3 seconds
            await checkForNotifications()
            const interval = setInterval(checkForNotifications, 3000)

            // Cleanup on close
            const cleanup = () => {
                clearInterval(interval)
                controller.close()
            }

            // Handle client disconnect
            setTimeout(cleanup, 30 * 60 * 1000) // 30 minutes max connection
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    })
}
