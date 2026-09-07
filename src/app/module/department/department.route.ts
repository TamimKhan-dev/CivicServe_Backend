import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DepartmentController } from "./department.controller";
import { DepartmentValidation } from "./department.validation";

const router = Router();

router.post(
	"/create-department",
	auth(Role.ADMIN),
	validateRequest(DepartmentValidation.DepartmentCreationZodSchema),
	DepartmentController.createDepartment,
);

router.get("/all-departments", DepartmentController.getAllDepartments);

router.delete(
	"/:departmentId",
	auth(Role.ADMIN),
	DepartmentController.softDeleteDepartment,
);

export const DepartmentRoutes = router;
