import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const adminStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await StatsService.adminStats();

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Admin Stats Fetched Successfully!",
			data: result,
		});
	},
);

const citizenStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userInfo = req.authUser!;

		const result = await StatsService.citizenStats(userInfo);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Citizen Stats Fetched Successfully!",
			data: result,
		});
	},
);

const staffStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const staffInfo = req.authUser!;

		const result = await StatsService.staffStats(staffInfo);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Staff Stats Fetched Successfully!",
			data: result,
		});
	},
);

export const StatsController = {
	citizenStats,
	staffStats,
	adminStats,
};
