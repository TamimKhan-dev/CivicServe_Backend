import httpStatus from "http-status";
import {
	type RequestStatus,
	RequestType,
} from "../../../generated/prisma/enums";
import type { RequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { ICreateRequestPayload, IRequestQuery } from "./request.interface";

const createRequest = async (
	payload: ICreateRequestPayload,
	userInfo: RequestUser,
) => {
	const { departmentId, categoryId, serviceId } = payload;

	const user = await prisma.user.findUnique({ where: { id: userInfo.userId } });

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	if (user.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "Your account is Deleted!");
	}

	if (!user.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You must verify your email to send a Request!",
		);
	}

	if (user.status === "SUSPENDED") {
		throw new AppError(httpStatus.BAD_REQUEST, "Your account is Suspended!");
	}

	const [department, category, service] = await Promise.all([
		prisma.department.findUnique({ where: { id: departmentId } }),
		prisma.category.findUnique({ where: { id: categoryId } }),
		serviceId ? prisma.service.findUnique({ where: { id: serviceId } }) : null,
	]);

	if (department) {
		if (department.deletedAt) {
			throw new AppError(httpStatus.NOT_FOUND, "Deparment doesn't Exist!");
		}

		if (!department.isActive) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"This Department isn't available at this moment!",
			);
		}
	} else {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"You must provide a valid DepartmentId!",
		);
	}

	if (category) {
		if (category.deletedAt) {
			throw new AppError(httpStatus.NOT_FOUND, "Category doesn't Exist!");
		}

		if (!category.isActive) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"This Category isn't available at this moment!",
			);
		}

		if (category.departmentId !== department.id) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"This category doesn't belong to the selected department!",
			);
		}
	} else {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"You must provide a valid CategoryId!",
		);
	}

	if (payload.type === RequestType.COMPLAINT_REQUEST && serviceId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Complaint requests cannot have a service!",
		);
	}

	if (payload.type === RequestType.SERVICE_REQUEST) {
		if (service) {
			if (service.deletedAt) {
				throw new AppError(httpStatus.NOT_FOUND, "Service doesn't Exist!");
			}

			if (!service.isActive) {
				throw new AppError(
					httpStatus.NOT_FOUND,
					"This Service isn't available at this moment!",
				);
			}

			if (service.departmentId !== department.id) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"This service doesn't belong to the selected department!",
				);
			}
		} else {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"You must provide a valid ServiceId!",
			);
		}
	}

	return await prisma.request.create({
		data: {
			userId: userInfo.userId,
			categoryId,
			departmentId,
			description: payload.description,
			location: payload.location,
			title: payload.title,
			type: payload.type,
		},
	});
};

const getMyRequests = async (userInfo: RequestUser, query: IRequestQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const andConditions: RequestWhereInput[] = [
		{
			userId: userInfo.userId,
		},
	];

	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					title: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					location: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	if (query.status) {
		andConditions.push({
			status: query.status as RequestStatus,
		});
	}

	if (query.type) {
		andConditions.push({
			type: query.type as RequestType,
		});
	}

	if (query.departmentId) {
		andConditions.push({
			departmentId: query.departmentId,
		});
	}

	if (query.categoryId) {
		andConditions.push({
			categoryId: query.categoryId,
		});
	}

	if (query.serviceId) {
		andConditions.push({
			serviceId: query.serviceId,
		});
	}

	const requests = await prisma.request.findMany({
		where: {
			AND: andConditions,
		},

		take: limit,
		skip,

		orderBy: {
			[sortBy]: sortOrder,
		},

		include: {
			department: {
				select: {
					id: true,
					name: true,
				},
			},

			category: {
				select: {
					id: true,
					name: true,
				},
			},

			service: {
				select: {
					id: true,
					name: true,
					fee: true,
				},
			},
		},
	});

	const totalRequestCount = await prisma.request.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		requests: requests,
		meta: {
			page,
			limit,
			total: totalRequestCount,
			totalPages: Math.ceil(totalRequestCount / limit),
		},
	};
};

export const RequestService = {
	createRequest,
	getMyRequests,
};
