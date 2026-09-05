import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ServiceController } from "./service.controller";
import { ServiceValidation } from "./service.validation";

const router = Router();

router.post(
	"/create-service",
	auth(Role.ADMIN),
	validateRequest(ServiceValidation.ServiceCreationZodSchema),
	ServiceController.createService,
);

router.get("/all-services", ServiceController.getAllServices);

export const ServiceRoutes = router;
