import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { CategoryValidation } from "./category.validation";

const createCategory = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = req.body;

		const result = await CategoryService.createCategory(payload);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Category Created Successfully!",
			data: result,
		});
	},
);

const getAllCategories = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await CategoryService.getAllCategories();

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Fetched All Categories Successfully!",
			data: result,
		});
	},
);

const softDeleteCategory = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const adminInfo = req.authUser!;
		const params = CategoryValidation.CategoryParamsZodSchema.parse(req.params);

		const result = await CategoryService.softDeleteCategory(
			adminInfo,
			params.categoryId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Category Deleted Successfully!",
			data: result,
		});
	},
);

export const CategoryController = {
	createCategory,
	getAllCategories,
	softDeleteCategory,
};
