import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../../utils/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { Prisma } from "../../../generated/prisma/client";
import type { IUpdatedUser } from "./user.interface";

const getAllStaffs = async () => {
	return await prisma.user.findMany({
		where: {
			role: "STAFF",
			status: "ACTIVE",
			deletedAt: null,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			profileImage: true,
		},
	});
};

const softDeleteUser = async (adminInfo: RequestUser, userId: string) => {
	if (adminInfo.userId === userId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You cannot delete your own account!",
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
	}

	if (user.role === Role.ADMIN) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You cannot delete another admin!",
		);
	}

	if (user.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "User is already deleted!");
	}

	const result = await prisma.$transaction(async (tx) => {
		const deletedUser = await tx.user.update({
			where: { id: userId },
			data: {
				deletedAt: new Date(),
			},
		});

		const auditLog = await tx.auditLog.create({
			data: {
				action: "DELETE_USER",
				entity: "User",
				entityId: user.id,
				userId: adminInfo.userId,
				details: {
					deletedUserId: user.id,
					deletedUserRole: user.role,
					deletedBy: adminInfo.userId,
				},
			},
		});

		return {
			user: deletedUser,
			auditLog,
		};
	});

	return result;
};

const updateUserProfile = async (
	userId: string,
	payload: {
		name?: string;
		phone?: string;
		file?: Express.Multer.File;
	},
) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user || user.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const data: Prisma.UserUpdateInput = {};
	if (payload.name) data.name = payload.name;
	if (payload.phone) data.phone = payload.phone;

	let uploaded: UploadApiResponse | undefined;
	if (payload.file) {
		uploaded = await uploadToCloudinary(payload.file.buffer, "profiles");
		data.profileImage = uploaded.secure_url;
		data.profileImageId = uploaded.public_id;
	}

	let updatedUser: IUpdatedUser;
	try {
		updatedUser = await prisma.user.update({
			where: { id: userId },
			data,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				profileImage: true,
				departmentId: true,
			},
		});
	} catch (error) {
		if (uploaded) await deleteFromCloudinary(uploaded.public_id);
		throw error;
	}

	if (uploaded && user.profileImageId) {
		await deleteFromCloudinary(user.profileImageId);
	}

	return updatedUser;
};

export const UserService = {
	getAllStaffs,
	softDeleteUser,
	updateUserProfile,
};
