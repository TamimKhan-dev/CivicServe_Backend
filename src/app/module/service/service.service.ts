import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { ICreateServicePayload } from "./service.interface";

const createService = async (payload: ICreateServicePayload) => {
	const { departmentId } = payload;

	const isDepartmentExist = await prisma.department.findUnique({
		where: {
			id: departmentId,
		},
	});

	if (!isDepartmentExist) {
		throw new AppError(httpStatus.NOT_FOUND, "This Department doesn't Exist!");
	}

	if (!isDepartmentExist.isActive || isDepartmentExist.deletedAt) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Please provide a valid DepartmentId!",
		);
	}

	return await prisma.service.create({
		data: {
			name: payload.name,
			description: payload.description,
			fee: payload.fee,
			slaHours: payload.slaHours,
			departmentId,
		},
	});
};

const getAllServices = async () => {
	return await prisma.service.findMany({
		where: {
			isActive: true,
			deletedAt: null,
		},
		omit: {
			deletedAt: true,
		},
	});
};

const softDeleteService = async (adminInfo: RequestUser, serviceId: string) => {
	const service = await prisma.service.findUnique({
		where: { id: serviceId },
	});

	if (!service) {
		throw new AppError(httpStatus.NOT_FOUND, "Service doesn't exist!");
	}

	if (service.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "Service is already deleted!");
	}

	const result = await prisma.$transaction(async (tx) => {
		const deletedService = await tx.service.update({
			where: { id: serviceId },
			data: {
				deletedAt: new Date(),
			},
		});

		const auditLog = await tx.auditLog.create({
			data: {
				action: "DELETE_SERVICE",
				entity: "Service",
				entityId: service.id,
				userId: adminInfo.userId,
				details: {
					serviceName: service.name,
					departmentId: service.departmentId,
					deletedBy: adminInfo.userId,
				},
			},
		});

		return {
			service: deletedService,
			auditLog,
		};
	});

	return result;
};

export const ServiceService = {
	createService,
	getAllServices,
	softDeleteService,
};
