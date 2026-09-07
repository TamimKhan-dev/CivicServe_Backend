import httpStatus from "http-status";
import { Role, StaffApplicationStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	IStaffApplicationPayload,
	IStaffApplicationStatusPayload,
} from "./staffApplication.interface";

const staffApplication = async (
	payload: IStaffApplicationPayload,
	userId: string,
) => {
	const { departmentId } = payload;

	const isDepartmentExist = await prisma.department.findUnique({
		where: { id: departmentId },
	});

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (user?.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "Your account has been Deleted!");
	}

	if (user?.status === "SUSPENDED") {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Your account has been Suspended!",
		);
	}

	if (!user?.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Your email is not verified. verify to send Application!",
		);
	}

	if (!isDepartmentExist) {
		throw new AppError(httpStatus.NOT_FOUND, "This Department doesn't Exist!");
	}

	const existingApplication = await prisma.staffApplication.findFirst({
		where: {
			userId: userId,
			status: "PENDING",
		},
	});

	if (existingApplication) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You already have a pending staff application!",
		);
	}

	const result = await prisma.staffApplication.create({
		data: {
			reason: payload.reason,
			departmentId,
			userId,
		},
		select: {
			id: true,
			reason: true,
			createdAt: true,
			status: true,
			userId: true,
			department: true,
		},
	});

	return result;
};

const reviewStaffApplication = async (
	adminInfo: RequestUser,
	payload: IStaffApplicationStatusPayload,
	applicationId: string,
) => {
	const staffApplication = await prisma.staffApplication.findUnique({
		where: { id: applicationId },
	});

	if (!staffApplication) {
		throw new AppError(httpStatus.NOT_FOUND, "This application doesn't Exist!");
	}

	if (staffApplication.status !== StaffApplicationStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This application is already ${staffApplication.status.toLowerCase()}!`,
		);
	}

	if (payload.status === StaffApplicationStatus.APPROVED) {
		const isApplicantExist = await prisma.user.findUnique({
			where: { id: staffApplication.userId },
		});

		if (!isApplicantExist) {
			throw new AppError(httpStatus.NOT_FOUND, "Can't found the Applicant!");
		}

		if (isApplicantExist.deletedAt) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Applicants account is Deleted!",
			);
		}

		if (isApplicantExist.status === "SUSPENDED") {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Applicants account is Suspended!",
			);
		}

		if (!isApplicantExist.emailVerified) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Applicants email is not verified!",
			);
		}
	}

	if (payload.status === StaffApplicationStatus.REJECTED) {
		return await prisma.$transaction(async (tx) => {
			const application = await tx.staffApplication.update({
				where: { id: applicationId },
				data: {
					status: StaffApplicationStatus.REJECTED,
					reviewedBy: adminInfo.userId,
					reviewedAt: new Date(),
					rejectionReason: payload.rejectionReason,
				},
			});

			await tx.auditLog.create({
				data: {
					action: "REJECT_STAFF_APPLICATION",
					entity: "StaffApplication",
					entityId: staffApplication.id,
					userId: adminInfo.userId,
					details: {
						applicantId: staffApplication.userId,
						departmentId: staffApplication.departmentId,
						status: "REJECTED",
						rejectionReason: payload.rejectionReason,
					},
				},
			});

			return application;
		});
	}

	const result = await prisma.$transaction(async (tx) => {
		const application = await tx.staffApplication.update({
			where: { id: applicationId },
			data: {
				status: StaffApplicationStatus.APPROVED,
				reviewedBy: adminInfo.userId,
				reviewedAt: new Date(),
			},
		});

		await tx.user.update({
			where: { id: staffApplication.userId },
			data: {
				role: Role.STAFF,
				departmentId: staffApplication.departmentId,
			},
		});

		await tx.auditLog.create({
			data: {
				action: "APPROVE_STAFF_APPLICATION",
				entity: "StaffApplication",
				entityId: staffApplication.id,
				userId: adminInfo.userId,
				details: {
					applicantId: staffApplication.userId,
					departmentId: staffApplication.departmentId,
					status: "APPROVED",
				},
			},
		});

		return application;
	});

	return result;
};

export const StaffApplicationService = {
	reviewStaffApplication,
	staffApplication,
};
