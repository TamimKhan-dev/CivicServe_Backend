import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./service.service";

const createService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await ServiceService.createService(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Service Created Successfully!",
      data: result,
    });
});

const getAllServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ServiceService.getAllServices();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Fetched All Services Successfully!",
      data: result,
    });
});

export const ServiceController = {
    createService,
    getAllServices,
};