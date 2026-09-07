import z from "zod";

const DepartmentCreationZodSchema = z.object({
	name: z
		.string()
		.min(3, "Department name must be at least 3 characters")
		.max(100, "Department name cannot exceed 100 characters"),

	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description cannot exceed 500 characters"),
});

const DepartmentParamsZodSchema = z.object({
	departmentId: z.string().min(1, "You must provide a departmentId!"),
});

export const DepartmentValidation = {
	DepartmentCreationZodSchema,
	DepartmentParamsZodSchema,
};
