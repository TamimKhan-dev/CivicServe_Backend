import z from "zod";

const StaffApplicationZodSchema = z.object({
	reason: z
		.string("Not a String!")
		.min(20, "Reason must be at least 20 characters")
		.max(500, "Reason cannot exceed 500 characters"),
	departmentId: z.string("Not a String!"),
});

const StaffApplicationParamsZodSchema = z.object({
	applicationId: z.string().min(1, "You must provide an applicationId!"),
});

const StaffApplicationStatusZodSchema = z
	.object({
		status: z.enum(["APPROVED", "REJECTED"], {
			error: "Please provide a valid application status!",
		}),

		rejectionReason: z
			.string()
			.max(500, "Rejection reason cannot exceed 500 characters!")
			.optional(),
	})
	.refine(
		(data) =>
			data.status !== "REJECTED" ||
			(data.rejectionReason && data.rejectionReason.trim().length > 0),
		{
			message: "Rejection reason is required when rejecting an application!",
			path: ["rejectionReason"],
		},
	);

export const StaffApplicationValidation = {
	StaffApplicationZodSchema,
	StaffApplicationStatusZodSchema,
	StaffApplicationParamsZodSchema,
};
