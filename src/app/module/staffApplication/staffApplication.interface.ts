import type { StaffApplicationStatus } from "../../../generated/prisma/enums";

export interface IStaffApplicationPayload {
	reason: string;
	departmentId: string;
}

export interface IStaffApplicationStatusPayload {
	status: StaffApplicationStatus;
	rejectionReason?: string;
}
