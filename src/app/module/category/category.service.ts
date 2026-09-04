import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { ICreateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload) => {
    const { departmentId } = payload;

    const isDepartmentExist = await prisma.department.findUnique({
        where: {
            id: departmentId
        }
    });

    if (!isDepartmentExist) {
        throw new AppError(httpStatus.NOT_FOUND, "This Department doesn't Exist!");
    };

    if (!isDepartmentExist.isActive || isDepartmentExist.deletedAt) {
        throw new AppError(httpStatus.NOT_FOUND, "Please provide a valid DepartmentId!");
    };

    return await prisma.category.create({
        data: {
            name: payload.name,
            description: payload.description,
            departmentId: payload.departmentId
        }
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
        }
    });
};

export const CategoryService = {
    createCategory,
    getAllCategories,
};