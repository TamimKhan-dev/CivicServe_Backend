import z from "zod";

const UserParamsZodSchema = z.object({
	userId: z.string().min(1, "You must provide a userId!"),
});

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ProfileUpdateZodSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.optional(),
	phone: z
		.string()
		.trim()
		.regex(/^[+\d\s()-]{7,20}$/, "Enter a valid phone number")
		.optional(),
	image: z
		.object({
			mimetype: z
				.string()
				.refine((t) => IMAGE_TYPES.includes(t), "Only JPG, PNG or WebP"),
			size: z.number().max(MAX_SIZE, "Image must be under 2MB"),
		})
		.passthrough()
		.optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateZodSchema>;

export const UserValidation = {
	ProfileUpdateZodSchema,
	UserParamsZodSchema,
};
