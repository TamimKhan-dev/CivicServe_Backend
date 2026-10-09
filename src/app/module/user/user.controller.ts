import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { UserValidation } from "./user.validation";
import { AppError } from "../../utils/AppError";

const getAllStaffs = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await UserService.getAllStaffs();

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Staffs Details Fetched Successfully!",
			data: result,
		});
	},
);

const softDeleteUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const adminInfo = req.authUser!;
		const params = UserValidation.UserParamsZodSchema.parse(req.params);

		const result = await UserService.softDeleteUser(adminInfo, params.userId);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "User Deleted Successfully!",
			data: result,
		});
	},
);

const updateUserProfile = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.params;
		const { name, phone } = req.body;

		if (!userId) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"User id is missing inside params!",
			);
		}

		const result = await UserService.updateUserProfile(userId as string, {
			name,
			phone,
			file: req.file,
		});

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Profile updated successfully",
			data: result,
		});
	},
);

export const UserController = {
	getAllStaffs,
	softDeleteUser,
	updateUserProfile,
};
