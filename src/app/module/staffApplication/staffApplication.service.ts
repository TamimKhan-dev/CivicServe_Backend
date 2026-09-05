import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IStaffApplicationPayload } from "./staffApplication.interface";

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

export const StaffApplicationService = {
	staffApplication,
};
