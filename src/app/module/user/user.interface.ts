import type { Role } from "../../../generated/prisma/enums";

export interface IUpdatedUser {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	role: Role;
	profileImage: string | null;
	departmentId: string | null;
}
