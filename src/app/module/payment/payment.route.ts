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

export const PaymentRoutes = router;
