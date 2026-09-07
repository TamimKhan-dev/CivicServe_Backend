import httpStatus from "http-status";
import {
	PaymentStatus,
	RequestStatus,
	RequestType,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import type { RequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	ICreateRequestPayload,
	IRequestQuery,
	IUpdateRequestStatus,
} from "./request.interface";

const createRequest = async (
	payload: ICreateRequestPayload,
	userInfo: RequestUser,
) => {
	const { departmentId, categoryId, serviceId } = payload;

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

	const result = await prisma.$transaction(async (tx) => {
		const request = await tx.request.create({
			data: {
				userId: userInfo.userId,
				categoryId,
				departmentId,
				description: payload.description,
				location: payload.location,
				title: payload.title,
				type: payload.type,
				serviceId: payload.serviceId,
			},
		});

		if (service && request.type === RequestType.SERVICE_REQUEST) {
			await tx.payment.create({
				data: {
					amount: service.fee,
					userId: request.userId,
					requestId: request.id,
				},
			});
		}

		return request;
	});

	return result;
};

const getMyRequests = async (userInfo: RequestUser, query: IRequestQuery) => {
	const limit = query.limit ?? 10;
	const page = query.page ?? 1;
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

const getSingleRequest = async (userInfo: RequestUser, requestId: string) => {
	const { userId } = userInfo;

	return await prisma.request.findUnique({
		where: {
			id: requestId,
			userId,
		},
	});
};

const getAllRequests = async (userInfo: RequestUser, query: IRequestQuery) => {
	const limit = query.limit ?? 10;
	const page = query.page ?? 1;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const andConditions: RequestWhereInput[] = [];

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

	if (userInfo.role === Role.STAFF) {
		andConditions.push({
			assignedStaffId: userInfo.userId,
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

const assignStaff = async (
	requestId: string,
	staffId: string,
	adminInfo: RequestUser,
) => {
	const [request, staff] = await Promise.all([
		prisma.request.findUnique({
			where: { id: requestId },
		}),
		prisma.user.findUnique({
			where: {
				id: staffId,
				role: Role.STAFF,
				deletedAt: null,
				status: UserStatus.ACTIVE,
				emailVerified: true,
			},
		}),
	]);

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "No Request Found with this Id!");
	}

	if (!staff) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"No Active Staff Found With This Id!",
		);
	}

	if (staff.departmentId !== request.departmentId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This staff doesn't belong to the request's department!",
		);
	}

	if (request.assignedStaffId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This request is already assigned to a staff!",
		);
	}

	if (request.type === RequestType.SERVICE_REQUEST) {
		const payment = await prisma.payment.findUnique({
			where: { requestId },
		});

		if (!payment || payment.status !== PaymentStatus.PAID) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Service request must be paid before assigning a staff!",
			);
		}
	}

	return prisma.request.update({
		where: {
			id: requestId,
		},
		data: {
			assignedStaffId: staff.id,
			status: RequestStatus.ASSIGNED,
		},
	});
};

const staffUpdateRequestStatus = async (
	staffInfo: RequestUser,
	payload: IUpdateRequestStatus,
	requestId: string,
) => {
	const { userId: staffId } = staffInfo;

	const request = await prisma.request.findUnique({
		where: { id: requestId },
	});

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "Request doesn't Exist!");
	}

	if (request.assignedStaffId !== staffId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not assigned to this request!",
		);
	}

	if (
		request.status === RequestStatus.RESOLVED ||
		request.status === RequestStatus.REJECTED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Request is already ${request.status}`,
		);
	}

	if (
		request.status === RequestStatus.ASSIGNED &&
		payload.status !== RequestStatus.IN_PROGRESS
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"An assigned request can only be moved to IN_PROGRESS!",
		);
	}

	if (
		request.status === RequestStatus.IN_PROGRESS &&
		payload.status !== RequestStatus.RESOLVED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"An in-progress request can only be moved to RESOLVED!",
		);
	}

	return await prisma.request.update({
		where: {
			id: requestId,
		},
		data: {
			status: payload.status,
		},
		omit: { deletedAt: true },
	});
};

export const RequestService = {
	assignStaff,
	createRequest,
	getMyRequests,
	getAllRequests,
	getSingleRequest,
	staffUpdateRequestStatus,
};
