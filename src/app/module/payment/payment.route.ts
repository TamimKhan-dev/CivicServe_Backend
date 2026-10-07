import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
	"/checkout/:requestId",
	auth(Role.CITIZEN),
	PaymentController.createCeckoutSession,
);

router.post("/webhook", PaymentController.handleWebhook);

router.get(
	"/session/:sessionId",
	auth(Role.CITIZEN),
	PaymentController.getPaymentInfo,
);

export const PaymentRoutes = router;
