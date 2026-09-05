import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllStaffs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.getAllStaffs();

    sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Staffs Details Fetched Successfully!",
		data: result,
	});
});

export const UserController = {
    getAllStaffs,
};