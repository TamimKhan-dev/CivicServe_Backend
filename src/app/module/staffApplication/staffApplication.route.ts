import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { StaffApplicationController } from "./staffApplication.controller";
import { StaffApplicationValidation } from "./staffApplication.validation";

const router = Router();

router.post(
	"/",
	auth(Role.CITIZEN),
	validateRequest(StaffApplicationValidation.StaffApplicationZodSchema),
	StaffApplicationController.staffApplication,
);

router.patch(
	"/:applicationId/status",
	auth(Role.ADMIN),
	validateRequest(StaffApplicationValidation.StaffApplicationStatusZodSchema),
	StaffApplicationController.reviewStaffApplication,
);

export const StaffApplicationRoutes = router;
