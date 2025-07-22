import { z } from "zod"

// ✅ Login schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
})

// ✅ Register schema (frontend-only confirmPassword)
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(2, "Username must be at least 2 characters")
      .max(30, "Username must be less than 30 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// ✅ Profile schema — name emas, **username** bo'lishi kerak!
export const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters").max(50, "Username must be less than 50 characters"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  theme: z.enum(["light", "dark", "system"]),
  soundEnabled: z.boolean(),
})

// ✅ Types
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
