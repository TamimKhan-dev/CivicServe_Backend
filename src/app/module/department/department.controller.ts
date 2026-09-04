import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DepartmentService } from "./department.service";

const createDepartment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const adminInfo = req.authUser!;

    const result = await DepartmentService.createDepartment(payload, adminInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Department Created Successfully!",
      data: result,
    });
});

export const DepartmentController = {
    createDepartment,
};