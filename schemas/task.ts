import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      return new Date(date) > new Date()
    }, "Due date must be in the future"),
})

export const updateTaskSchema = taskSchema.partial()

export type TaskFormData = z.infer<typeof taskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>
