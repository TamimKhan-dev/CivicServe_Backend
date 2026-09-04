import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StaffApplicationService } from "./staffApplication.service";

const staffApplication = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.authUser!;

    const result = await StaffApplicationService.staffApplication(payload, user.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Application is under Review!",
      data: result,
    });
  },
);

export const StaffApplicationController = {
  staffApplication,
};
