import z from "zod";

const RequestParamsZodSchema = z.object({
	requestId: z.string().min(1, "You must provide a requestId!"),
});

const SessionParamsZodSchema = z.object({
	sessionId: z.string().min(1, "You must provide a sessionId!"),
});

export const PaymentValidation = {
	RequestParamsZodSchema,
	SessionParamsZodSchema,
};
