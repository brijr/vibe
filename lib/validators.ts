import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  content: z.string().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  aiModel: z
    .enum([
      "claude-sonnet-4-5-20250929",
      "claude-opus-4-5-20251101",
      "claude-haiku-4-5-20251001",
    ])
    .optional(),
  features: z
    .object({
      aiAnalysis: z.boolean().optional(),
      bulkUpload: z.boolean().optional(),
    })
    .optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type OrganizationSettingsInput = z.infer<
  typeof organizationSettingsSchema
>;
