import z from "zod";

const ServiceCreationZodSchema = z.object({
  name: z
    .string()
    .min(3, "Service name must be at least 3 characters")
    .max(100, "Service name cannot exceed 100 characters"),

  description: z
    .string()
    .min(10, "Service description must be at least 10 characters")
    .max(500, "Service description cannot exceed 500 characters"),

  fee: z
    .number()
    .min(0, "Fee cannot be negative"),

  slaHours: z
    .number()
    .int("SLA hours must be a whole number")
    .positive("SLA hours must be greater than 0"),

  departmentId: z
    .string()
    .min(1, "Department ID is required"),
});

export const ServiceValidation = {
    ServiceCreationZodSchema,
};