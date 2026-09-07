import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./service.service";
import { ServiceValidation } from "./service.validation";

const createService = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body;

		const result = await ServiceService.createService(payload);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Service Created Successfully!",
			data: result,
		});
	},
);

const getAllServices = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await ServiceService.getAllServices();

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Fetched All Services Successfully!",
			data: result,
		});
	},
);

const softDeleteService = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const adminInfo = req.authUser!;
		const params = ServiceValidation.ServiceParamsZodSchema.parse(req.params);

		const result = await ServiceService.softDeleteService(
			adminInfo,
			params.serviceId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Service Deleted Successfully!",
			data: result,
		});
	},
);

export const ServiceController = {
	createService,
	getAllServices,
	softDeleteService,
};
