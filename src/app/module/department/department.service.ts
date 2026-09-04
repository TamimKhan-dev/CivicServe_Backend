import { prisma } from "../../lib/prisma";
import type { IAdminInfo, IDepartmentCreationPayload } from "./department.interface";

const createDepartment = async (payload: IDepartmentCreationPayload, adminInfo: IAdminInfo) => {
    return await prisma.department.create({
        data: {
            name: payload.name,
            description: payload.description,
        }
    });
};

const getAllDepartments = async () => {
    return await prisma.department.findMany({
        where: {
            isActive: true,
            deletedAt: null,
        }, 
        omit: { deletedAt: true }
    });
};

export const DepartmentService = {
    createDepartment,
    getAllDepartments,
};