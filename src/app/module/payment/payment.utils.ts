import httpStatus from "http-status";
import type Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const handleCheckoutCompleted = async (
	session: Stripe.Checkout.Session,
) => {
	const paymentId = session.metadata?.paymentId;

	if (!paymentId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Payment ID not found in Stripe session metadata!",
		);
	}

	if (!session.payment_intent) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment intent not found!");
	}

	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
	}

	if (payment.status === PaymentStatus.PAID) {
		return;
	}

	await prisma.payment.update({
		where: { id: paymentId },
		data: {
			status: PaymentStatus.PAID,
			transactionId: session.payment_intent as string,
			paidAt: new Date(),
		},
	});
};
