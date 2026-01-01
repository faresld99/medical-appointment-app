import { z } from "zod"

export const signUpSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(["patient", "practitioner"]),
    // Practitioner fields (optional)
    specialty: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    appointmentDuration: z.number().optional().nullable(),
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

export const practitionerProfileSchema = z.object({
    specialty: z.string().min(2, "Specialty is required"),
    location: z.string().min(2, "Location is required"),
    bio: z.string().optional(),
    appointmentDuration: z.number().min(15).max(120),
})

export const availabilitySchema = z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
})

export const appointmentSchema = z.object({
    practitionerId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: z.string().optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PractitionerProfileInput = z.infer<typeof practitionerProfileSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
