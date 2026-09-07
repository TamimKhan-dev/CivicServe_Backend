import httpStatus from "http-status";
import { PaymentStatus, RequestType } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { handleCheckoutCompleted } from "./payment.utils";

const createCeckoutSession = async (
	citizenInfo: RequestUser,
	requestId: string,
) => {
	const request = await prisma.request.findUnique({
		where: { id: requestId },
	});

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "Unable to found request!");
	}

	if (request.userId !== citizenInfo.userId) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"This request doesn't belong to you!",
		);
	}

	if (request.type !== RequestType.SERVICE_REQUEST) {
		throw new AppError(httpStatus.BAD_REQUEST, "This a complaint request!");
	}

	const payment = await prisma.payment.findUnique({
		where: {
			requestId,
			userId: citizenInfo.userId,
		},
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Can't found Payment!");
	}

	if (
		payment.status !== PaymentStatus.PENDING &&
		payment.status !== PaymentStatus.CANCELLED &&
		payment.status !== PaymentStatus.FAILED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This payment is already ${payment.status.toLowerCase()}!`,
		);
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "payment",

		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: `CivicServe Service Request - ${request.title}`,
					},
					unit_amount: Math.round(Number(payment.amount) * 100),
				},
				quantity: 1,
			},
		],

		metadata: {
			paymentId: payment.id,
			requestId: request.id,
			userId: citizenInfo.userId,
		},

		success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${config.frontend_url}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
	});

	return {
		paymentUrl: session.url,
	};
};

const handleWebhook = async (payload: Buffer, signature: string) => {
	const endpointSecret = config.stripe_webhook_secret;
	const event = stripe.webhooks.constructEvent(
		payload,
		signature,
		endpointSecret as string,
	);

	switch (event.type) {
		case "checkout.session.completed":
			await handleCheckoutCompleted(event.data.object);
			break;
		default:
			console.log(`No events matched. Unhandled event type ${event.type}.`);
			break;
	}
};

export const PaymentService = {
	createCeckoutSession,
	handleWebhook,
};
