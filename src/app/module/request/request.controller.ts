import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RequestService } from "./request.service";

const createRequest = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const citizenInfo = req.authUser!;
		const payload = req.body;

		const result = await RequestService.createRequest(payload, citizenInfo);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Request Sent Successfully!",
			data: result,
		});
	},
);

export const RequestController = {
	createRequest,
};
