import z from "zod";

const UserRegistrationZodSchema = z.object({
  name: z
    .string("Not A String!!!!!")
    .min(3, "Name must atleast 3 characters long!!!")
    .max(10),
  email: z.email("Not email!!"),
  password: z
    .string()
    .min(5, "Password Must Minimum 5 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
    .regex(/[0-9]/, "Password must contain atleast 1 Number"),
  phone: z.string().optional(),
});

const UserCredentialLoginZodSchema = z.object({
  email: z.email("Not email!!"),
  password: z
    .string()
    .min(5, "Password Must Minimum 5 Characters Long.")
    .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
    .regex(/[0-9]/, "Password must contain atleast 1 Number"),
});

const UserEmailVerifyZodSchema = z.object({
	email: z.email("Not email!!"),
	otp: z.string().length(6),
});

export const AuthValidation = {
  UserRegistrationZodSchema,
  UserEmailVerifyZodSchema,
  UserCredentialLoginZodSchema
};
