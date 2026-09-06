import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RequestService } from "./request.service";
import { RequestValidation } from "./request.validation";

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

const getMyRequests = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const citizenInfo = req.authUser!;
		const query = RequestValidation.RequestQueryZodSchema.parse(req.query);

		const result = await RequestService.getMyRequests(citizenInfo, query);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Requests Fetched Successfully!",
			data: result,
		});
	},
);

const getSingleRequest = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userInfo = req.authUser!;
		const { requestId } = RequestValidation.RequestParamsZodSchema.parse(
			req.params,
		);

		const result = await RequestService.getSingleRequest(userInfo, requestId);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Request Fetched Successfully!",
			data: result,
		});
	},
);

const getAllRequests = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userInfo = req.authUser!;
		const query = RequestValidation.RequestQueryZodSchema.parse(req.query);

		const result = await RequestService.getAllRequests(userInfo, query);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Requests Fetched Successfully!",
			data: result,
		});
	},
);

const assignStaff = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const adminInfo = req.authUser!;
		const { staffId } = req.body;
		const { requestId } = RequestValidation.RequestParamsZodSchema.parse(
			req.params,
		);

		const result = await RequestService.assignStaff(
			requestId,
			staffId,
			adminInfo,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Assigned Staff Successfully!",
			data: result,
		});
	},
);

export const RequestController = {
	assignStaff,
	createRequest,
	getMyRequests,
	getAllRequests,
	getSingleRequest,
};
