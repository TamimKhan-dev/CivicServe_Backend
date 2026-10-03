import type { Role } from "../../../generated/prisma/enums";

export interface UserRegistrationPayload {
	name: string;
	email: string;
	password: string;
	phone?: string;
}

export interface UserEmailVerifyPayload {
	email: string;
	otp: number;
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}
