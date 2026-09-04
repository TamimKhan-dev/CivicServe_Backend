import type { Role } from "../../../generated/prisma/enums";

export interface IDepartmentCreationPayload {
  name: string;
  description: string;
}

export interface IAdminInfo {
  email: string;
  name: string;
  userId: string;
  role: Role;
}
