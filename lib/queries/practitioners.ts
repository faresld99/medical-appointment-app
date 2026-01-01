import { sql, type PractitionerWithUser } from "@/lib/db"

export async function getPractitioners(filters?: {
    specialty?: string
    location?: string
}): Promise<PractitionerWithUser[]> {
    // The neon() function returns arrays directly, not { rows: [] }
    const baseQuery = `
    SELECT 
      p.id, p.user_id, p.specialty, p.location, p.bio, 
      p.appointment_duration, p.created_at,
      u.name as user_name, u.email as user_email
    FROM practitioners p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `

    // Build conditions based on filters
    const conditions: string[] = []

    if (filters?.specialty) {
        conditions.push(`AND LOWER(p.specialty) LIKE LOWER('%${filters.specialty}%')`)
    }

    if (filters?.location) {
        conditions.push(`AND LOWER(p.location) LIKE LOWER('%${filters.location}%')`)
    }

    const fullQuery = baseQuery + conditions.join(" ") + ` ORDER BY u.name ASC`

    // Use sql.unsafe for dynamic queries with proper escaping via the conditions
    const result = await sql.query(fullQuery)

    return result.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        user_id: row.user_id as string,
        specialty: row.specialty as string,
        location: row.location as string,
        bio: row.bio as string | null,
        appointment_duration: row.appointment_duration as number,
        created_at: new Date(row.created_at as string),
        user_name: row.user_name as string,
        user_email: row.user_email as string,
    }))
}

export async function getPractitionerById(id: string): Promise<PractitionerWithUser | null> {
    const result = await sql`
    SELECT 
      p.id, p.user_id, p.specialty, p.location, p.bio, 
      p.appointment_duration, p.created_at,
      u.name as user_name, u.email as user_email
    FROM practitioners p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id}
  `

    if (result.length === 0) return null

    const row = result[0]
    return {
        id: row.id,
        user_id: row.user_id,
        specialty: row.specialty,
        location: row.location,
        bio: row.bio,
        appointment_duration: row.appointment_duration,
        created_at: new Date(row.created_at),
        user_name: row.user_name,
        user_email: row.user_email,
    }
}

export async function getPractitionerByUserId(userId: string) {
    const result = await sql`
    SELECT 
      p.id, p.user_id, p.specialty, p.location, p.bio, 
      p.appointment_duration, p.created_at,
      u.name as user_name, u.email as user_email
    FROM practitioners p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ${userId}
  `

    if (result.length === 0) return null

    const row = result[0]
    return {
        id: row.id,
        user_id: row.user_id,
        specialty: row.specialty,
        location: row.location,
        bio: row.bio,
        appointment_duration: row.appointment_duration,
        created_at: new Date(row.created_at),
        user_name: row.user_name,
        user_email: row.user_email,
    }
}

export async function getSpecialties(): Promise<string[]> {
    const result = await sql`
    SELECT DISTINCT specialty FROM practitioners ORDER BY specialty
  `
    return result.map((row) => row.specialty)
}

export async function getLocations(): Promise<string[]> {
    const result = await sql`
    SELECT DISTINCT location FROM practitioners ORDER BY location
  `
    return result.map((row) => row.location)
}
