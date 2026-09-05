import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
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

export const ServiceService = {
	createService,
	getAllServices,
};
