import z from "zod";
import { RequestStatus, RequestType } from "../../../generated/prisma/enums";

const RequestCreationZodSchema = z
	.object({
		title: z
			.string()
			.min(5, "Title must be at least 5 characters")
			.max(255, "Title cannot exceed 255 characters"),

		description: z
			.string()
			.min(10, "Description must be at least 10 characters")
			.max(2000, "Description cannot exceed 2000 characters"),

		type: z.enum(["COMPLAINT_REQUEST", "SERVICE_REQUEST"], {
			message:
				"Please provide a valid request type(COMPLAINT_REQUEST || SERVICE_REQUEST)",
		}),

		location: z
			.string()
			.min(3, "Location must be at least 3 characters")
			.max(200, "Location cannot exceed 200 characters"),

		departmentId: z.string().min(1, "Department ID is required"),

		categoryId: z.string().min(1, "Category ID is required"),

		serviceId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.type === "SERVICE_REQUEST" && !data.serviceId) {
			ctx.addIssue({
				code: "custom",
				path: ["serviceId"],
				message: "Service ID is required for service requests",
			});
		}
	});

const RequestQueryZodSchema = z.object({
	searchTerm: z.string().optional(),
	page: z.coerce.number().int().min(1, "Page must be at least 1").optional(),
	limit: z.coerce
		.number()
		.int()
		.min(1, "Limit must be at least 1")
		.max(100, "Limit cannot exceed 100")
		.optional(),

	sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	status: z.enum(RequestStatus).optional(),
	type: z.enum(RequestType).optional(),
	departmentId: z.string().optional(),
	categoryId: z.string().optional(),
	serviceId: z.string().optional(),
});

const RequestParamsZodSchema = z.object({
	requestId: z.string().min(1, "You must provide a requestId!"),
});

const AssignStaffZodSchema = z.object({
	staffId: z.string().min(1, "Staff ID is required!"),
});

export const RequestValidation = {
	AssignStaffZodSchema,
	RequestQueryZodSchema,
	RequestParamsZodSchema,
	RequestCreationZodSchema,
};
