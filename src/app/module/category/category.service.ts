import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { ICreateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload) => {
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

	return await prisma.category.create({
		data: {
			name: payload.name,
			description: payload.description,
			departmentId: payload.departmentId,
		},
	});
};

const getAllCategories = async () => {
	return await prisma.category.findMany({
		where: {
			isActive: true,
			deletedAt: null,
		},
		omit: {
			deletedAt: true,
		},
	});
};

const softDeleteCategory = async (
	adminInfo: RequestUser,
	categoryId: string,
) => {
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
	});

	if (!category) {
		throw new AppError(httpStatus.NOT_FOUND, "Category doesn't exist!");
	}

	if (category.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "Category is already deleted!");
	}

	const result = await prisma.$transaction(async (tx) => {
		const deletedCategory = await tx.category.update({
			where: { id: categoryId },
			data: {
				deletedAt: new Date(),
			},
		});

		const auditLog = await tx.auditLog.create({
			data: {
				action: "DELETE_CATEGORY",
				entity: "Category",
				entityId: category.id,
				userId: adminInfo.userId,
				details: {
					categoryName: category.name,
					departmentId: category.departmentId,
					deletedBy: adminInfo.userId,
				},
			},
		});

		return {
			category: deletedCategory,
			auditLog,
		};
	});

	return result;
};

export const CategoryService = {
	createCategory,
	getAllCategories,
	softDeleteCategory,
};
