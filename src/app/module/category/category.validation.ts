import z from "zod";

const CategoryCreationZodSchema = z.object({
	name: z
		.string()
		.min(3, "Department name must be at least 3 characters")
		.max(100, "Department name cannot exceed 100 characters"),

	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description cannot exceed 500 characters"),
	departmentId: z.string("Not a String"),
});

const CategoryParamsZodSchema = z.object({
	categoryId: z.string().min(1, "You must provide a categoryId!"),
});

export const CategoryValidation = {
	CategoryCreationZodSchema,
	CategoryParamsZodSchema,
};
