import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IDepartmentCreationPayload } from "./department.interface";

const createDepartment = async (payload: IDepartmentCreationPayload) => {
	return await prisma.department.create({
		data: {
			name: payload.name,
			description: payload.description,
		},
	});
};

const getAllDepartments = async () => {
	return await prisma.department.findMany({
		where: {
			isActive: true,
			deletedAt: null,
		},
		omit: { deletedAt: true },
	});
};

const softDeleteDepartment = async (
	departmentId: string,
	adminInfo: RequestUser,
) => {
	const department = await prisma.department.findUnique({
		where: { id: departmentId },
	});

	if (!department) {
		throw new AppError(httpStatus.NOT_FOUND, "Department doesn't exist!");
	}

	if (department.deletedAt) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Department is already deleted!",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const deletedDepartment = await tx.department.update({
			where: { id: departmentId },
			data: {
				deletedAt: new Date(),
			},
		});

		const auditLog = await tx.auditLog.create({
			data: {
				action: "DELETE_DEPARTMENT",
				entity: "Department",
				entityId: department.id,
				userId: adminInfo.userId,
				details: {
					departmentName: department.name,
					deletedBy: adminInfo.userId,
				},
			},
		});

		return {
			department: deletedDepartment,
			auditLog,
		};
	});

	return result;
};

export const DepartmentService = {
	createDepartment,
	getAllDepartments,
	softDeleteDepartment,
};
