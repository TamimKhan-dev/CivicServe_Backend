import z from "zod";

const StaffApplicationZodSchema = z.object({
  reason: z
    .string()
    .min(20, "Reason must be at least 20 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  departmentId: z.number(),
});

export const StaffApplicationValidation = {
  StaffApplicationZodSchema,
};
