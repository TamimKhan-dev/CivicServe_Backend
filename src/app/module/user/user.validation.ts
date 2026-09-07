import z from "zod";

const UserParamsZodSchema = z.object({
	userId: z.string().min(1, "You must provide a userId!"),
});

export const UserValidation = {
	UserParamsZodSchema,
};
