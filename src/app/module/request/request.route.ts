import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { RequestController } from "./request.controller";
import { RequestValidation } from "./request.validation";

const router = Router();

router.post(
	"/create-request",
	auth(Role.CITIZEN),
	validateRequest(RequestValidation.RequestCreationZodSchema),
	RequestController.createRequest,
);

router.get("/my-requests", auth(Role.CITIZEN), RequestController.getMyRequests);

export const RequestRoutes = router;
