import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DepartmentService } from "./department.service";

const createDepartment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await DepartmentService.createDepartment(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Department Created Successfully!",
      data: result,
    });
});

const getAllDepartments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DepartmentService.getAllDepartments();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Fetched All Departments Successfully!",
      data: result,
    });
});

export const DepartmentController = {
    createDepartment,
    getAllDepartments,
};