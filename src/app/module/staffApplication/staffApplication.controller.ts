import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StaffApplicationService } from "./staffApplication.service";
import { StaffApplicationValidation } from "./staffApplication.validation";

const staffApplication = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body;
		const user = req.authUser!;

		const result = await StaffApplicationService.staffApplication(
			payload,
			user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Application is under Review!",
			data: result,
		});
	},
);

const reviewStaffApplication = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const adminInfo = req.authUser!;
		const payload = req.body;
		const param =
			StaffApplicationValidation.StaffApplicationParamsZodSchema.parse(
				req.params,
			);

		const result = await StaffApplicationService.reviewStaffApplication(
			adminInfo,
			payload,
			param.applicationId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Application status updated Successfully!",
			data: result,
		});
	},
);

export const StaffApplicationController = {
	reviewStaffApplication,
	staffApplication,
};
