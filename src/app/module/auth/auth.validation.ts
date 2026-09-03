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
    // .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
  phone: z.string().optional(),
});

export const AuthValidation = {
  UserRegistrationZodSchema,
};
