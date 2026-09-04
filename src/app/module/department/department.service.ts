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

export const DepartmentService = {
    createDepartment,
};