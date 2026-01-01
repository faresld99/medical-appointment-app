import { cookies } from "next/headers"
import { sql, type User } from "./db"
import { redirect } from "next/navigation"

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const result = await sql`
    INSERT INTO sessions (user_id, expires_at)
    VALUES (${userId}, ${expiresAt.toISOString()})
    RETURNING id
  `

  const sessionId = result[0].id

  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getSession(): Promise<{ user: User; sessionId: string } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) return null

  const result = await sql`
    SELECT 
      u.id, u.name, u.email, u.password_hash, u.role, u.created_at,
      s.id as session_id, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `

  if (result.length === 0) return null

  const row = result[0]
  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role as "patient" | "practitioner",
      created_at: new Date(row.created_at),
    },
    sessionId: row.session_id,
  }
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session.user
}

export async function requirePatient(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "patient") {
    redirect("/dashboard/practitioner")
  }
  return user
}

export async function requirePractitioner(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "practitioner") {
    redirect("/dashboard/patient")
  }
  return user
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
  }

  cookieStore.delete("session_id")
}
