import z from "zod";

const StaffApplicationZodSchema = z.object({
  reason: z
    .string("Not a String!")
    .min(20, "Reason must be at least 20 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  departmentId: z.string("Not a String!"),
});

export const StaffApplicationValidation = {
  StaffApplicationZodSchema,
};
