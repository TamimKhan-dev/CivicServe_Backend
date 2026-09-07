import z from "zod";

const RequestParamsZodSchema = z.object({
	requestId: z.string().min(1, "You must provide a requestId!"),
});

export const PaymentValidation = {
	RequestParamsZodSchema,
};
