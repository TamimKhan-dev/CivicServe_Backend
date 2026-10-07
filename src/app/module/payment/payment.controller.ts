import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import { PaymentValidation } from "./payment.validation";

const createCeckoutSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const citizenInfo = req.authUser!;
		const param = PaymentValidation.RequestParamsZodSchema.parse(req.params);

		const result = await PaymentService.createCeckoutSession(
			citizenInfo,
			param.requestId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Payment Checkout Session Created SuccessFully!",
			data: result,
		});
	},
);

const handleWebhook = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const event = req.body as Buffer;
		const signature = req.headers["stripe-signature"]!;

		await PaymentService.handleWebhook(event, signature as string);

		sendResponse(res, {
			success: true,
			statusCode: 200,
			message: "Webhook triggered successfully",
			data: null,
		});
	},
);

const getPaymentInfo = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const citizen = req.authUser!;
		const params = PaymentValidation.SessionParamsZodSchema.parse(req.params);

		const result = await PaymentService.getPaymentInfo(
			citizen,
			params.sessionId,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Payment Details Fetched SuccessFully!",
			data: result,
		});
	},
);

export const PaymentController = {
	createCeckoutSession,
	getPaymentInfo,
	handleWebhook,
};
